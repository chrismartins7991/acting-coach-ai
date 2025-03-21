import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { extractFramesFromVideo } from '@/utils/videoAnalysis/frameExtractor';
import { extractAudioFromVideo } from '@/utils/videoAnalysis/audioExtractor';
import { useSubscription } from '@/hooks/useSubscription';
import { Json } from '@/integrations/supabase/types';

export interface VideoProcessingHook {
  processVideo: (file: File) => Promise<void>;
  isProcessing: boolean;
  processingStep: string;
  uploadProgress: number;
  analysis: Analysis | null;
  voiceAnalysis: VoiceAnalysis | null;
  shouldShowPaymentWall: boolean;
  setShouldShowPaymentWall: (show: boolean) => void;
}

export const useVideoProcessing = (userId?: string): VideoProcessingHook => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [shouldShowPaymentWall, setShouldShowPaymentWall] = useState(false);
  const { toast } = useToast();
  const { subscriptionTier } = useSubscription();

  const processVideo = async (file: File) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      setIsProcessing(true);
      setProcessingStep('Fetching user preferences...');
      console.log("Starting video processing for user:", userId);

      // Fetch user's coach preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_coach_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError) {
        console.error("Error fetching preferences:", preferencesError);
        if (preferencesError.code === 'PGRST116') {
          throw new Error('Please complete the coach selection process first.');
        }
        throw new Error('Failed to fetch user preferences. Please try again.');
      }

      if (!preferences) {
        throw new Error('Please complete the coach selection process first.');
      }

      console.log("Retrieved coach preferences:", preferences);

      setProcessingStep('Extracting frames and audio...');
      
      // Extract frames and audio in parallel
      const [frames, audioData] = await Promise.all([
        extractFramesFromVideo(file),
        extractAudioFromVideo(file)
      ]);

      if (!frames || frames.length < 3) {
        throw new Error('Failed to extract enough frames from video. Please try a different video.');
      }
      console.log(`Successfully extracted ${frames.length} frames from video`);

      // Upload video to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      setProcessingStep('Uploading video...');
      console.log("Starting video upload...");
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          upsert: false
        });

      if (uploadError) {
        console.error("Video upload error:", uploadError);
        throw new Error('Error uploading video: ' + uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      console.log("Video uploaded successfully, public URL:", publicUrl);

      // Process voice analysis if we have audio data
      let voiceAnalysisResult = null;
      if (audioData) {
        setProcessingStep('Analyzing voice...');
        console.log("Starting voice analysis...");
        
        const { data: voiceData, error: voiceError } = await supabase.functions
          .invoke('analyze-voice', {
            body: { 
              audioData,
              userId,
              coachPreferences: {
                selectedCoach: preferences.selected_coach,
                focusAreas: {
                  emotionInVoice: preferences.emotion_in_voice,
                  voiceExpressiveness: preferences.voice_expressiveness,
                  clearnessOfDiction: preferences.clearness_of_diction,
                }
              }
            }
          });

        if (voiceError) {
          console.error("Voice analysis error:", voiceError);
          // Don't throw here, continue with visual analysis
          toast({
            title: "Warning",
            description: "Voice analysis failed, but continuing with visual analysis",
            variant: "destructive",
          });
        } else {
          console.log("Voice analysis completed successfully");
          voiceAnalysisResult = voiceData;
          setVoiceAnalysis(voiceData);
        }
      }

      setProcessingStep('Analyzing performance...');
      console.log("Starting performance analysis with preferences:", preferences);

      // Call analyze-performance with coach preferences
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-performance', {
          body: { 
            videoUrl: publicUrl,
            frames,
            coachPreferences: {
              selectedCoach: preferences.selected_coach,
              focusAreas: {
                emotionInVoice: preferences.emotion_in_voice,
                voiceExpressiveness: preferences.voice_expressiveness,
                physicalPresence: preferences.physical_presence,
                faceExpressions: preferences.face_expressions,
                clearnessOfDiction: preferences.clearness_of_diction,
              }
            }
          }
        });

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        throw analysisError;
      }

      console.log("Analysis completed successfully:", analysisData);
      setAnalysis(analysisData);

      // Store results in performance_results
      if (userId && analysisData) {
        try {
          console.log("Storing analysis results");
          const { error: resultsError } = await supabase
            .from('performance_results')
            .insert({
              user_id: userId,
              analysis: analysisData as unknown as Json,
              voice_analysis: voiceAnalysisResult ? (voiceAnalysisResult as unknown as Json) : null
            });

          if (resultsError) {
            console.error("Error storing results:", resultsError);
            throw resultsError;
          }

          console.log("Results stored successfully");
          
          // Only show payment wall for trial tier users after analysis is complete and saved
          if (subscriptionTier === 'trial') {
            setTimeout(() => {
              setShouldShowPaymentWall(true);
            }, 1000);
          }
        } catch (error) {
          console.error("Error storing results:", error);
          toast({
            title: "Warning",
            description: "Your analysis is ready but couldn't be saved for later viewing.",
            variant: "destructive",
          });
        }
      }

    } catch (error: any) {
      console.error("Error processing video:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process video. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      setUploadProgress(0);
    }
  };

  return {
    processVideo,
    isProcessing,
    processingStep,
    uploadProgress,
    analysis,
    voiceAnalysis,
    shouldShowPaymentWall,
    setShouldShowPaymentWall
  };
};
