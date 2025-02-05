
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { extractFramesFromVideo } from '@/utils/videoAnalysis/frameExtractor';
import { extractAudioFromVideo } from '@/utils/videoAnalysis/audioExtractor';
import { useSubscription } from '@/hooks/useSubscription';

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
      console.log("Starting video processing...");

      // Fetch user's coach preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_coach_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError) {
        console.error("Error fetching preferences:", preferencesError);
        throw new Error('Failed to fetch user preferences. Please complete the onboarding process first.');
      }

      if (!preferences) {
        throw new Error('Please complete the coach selection process first.');
      }

      setProcessingStep('Extracting frames and audio...');

      // Extract frames and audio
      const frames = await extractFramesFromVideo(file);
      if (frames.length < 3) {
        throw new Error('Failed to extract enough frames from video');
      }
      console.log(`Extracted ${frames.length} frames from video`);

      // Upload video to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      setProcessingStep('Uploading video...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Error uploading video: ' + uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      // Check subscription tier
      if (subscriptionTier === 'free') {
        setShouldShowPaymentWall(true);
        setIsProcessing(false);
        return;
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

      console.log("Analysis completed:", analysisData);
      setAnalysis(analysisData);

      // Store results
      if (userId && (analysisData || voiceAnalysis)) {
        try {
          console.log("Storing analysis results");
          const { error: resultsError } = await supabase
            .from('performance_results')
            .insert({
              user_id: userId,
              analysis: analysisData as any,
              voice_analysis: voiceAnalysis as any
            });

          if (resultsError) {
            console.error("Error storing results:", resultsError);
            throw resultsError;
          }

          console.log("Results stored successfully");
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

