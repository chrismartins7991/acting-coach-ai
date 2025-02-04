
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
      setProcessingStep('Extracting frames and audio...');
      console.log("Starting video processing...");

      // Get user's coach preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_coach_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError) {
        throw new Error('Error fetching user preferences: ' + preferencesError.message);
      }

      // Extract frames
      const frames = await extractFramesFromVideo(file);
      if (frames.length < 3) {
        throw new Error('Failed to extract enough frames from video');
      }
      console.log(`Extracted ${frames.length} frames from video`);

      // Extract audio
      const audioData = await extractAudioFromVideo(file);
      console.log("Audio extraction completed");

      // Upload to storage
      setProcessingStep('Uploading video...');
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${timestamp}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error('Error uploading video: ' + uploadError.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      // Check subscription tier before proceeding with analysis
      if (subscriptionTier === 'free') {
        setShouldShowPaymentWall(true);
        setIsProcessing(false);
        return;
      }

      setProcessingStep('Analyzing performance...');
      console.log("Starting performance and voice analysis...");

      // Parallel processing of visual and audio analysis
      const [visualAnalysisResult, audioAnalysisResult] = await Promise.allSettled([
        // Visual analysis with preferences
        supabase.functions.invoke('analyze-performance', {
          body: { 
            frames: frames.map(frame => frame.frameData),
            videoUrl: publicUrl,
            userId,
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
        }),
        // Voice analysis
        supabase.functions.invoke('analyze-voice', {
          body: { 
            audioData,
            userId,
            coachPreferences: preferences
          }
        })
      ]);

      // Handle visual analysis result
      if (visualAnalysisResult.status === 'rejected') {
        console.error("Visual analysis error:", visualAnalysisResult.reason);
        toast({
          title: "Analysis Warning",
          description: "Visual analysis encountered an issue, but we'll continue processing.",
          variant: "default"
        });
      } else if (visualAnalysisResult.value.error) {
        console.error("Visual analysis error:", visualAnalysisResult.value.error);
        toast({
          title: "Analysis Warning",
          description: "Visual analysis encountered an issue, but we'll continue processing.",
          variant: "default"
        });
      } else {
        setAnalysis(visualAnalysisResult.value.data);
      }

      // Handle audio analysis result
      if (audioAnalysisResult.status === 'rejected') {
        console.error("Audio analysis error:", audioAnalysisResult.reason);
        toast({
          title: "Analysis Warning",
          description: "Voice analysis encountered an issue, but we'll continue processing.",
          variant: "default"
        });
      } else if (audioAnalysisResult.value.error) {
        console.error("Audio analysis error:", audioAnalysisResult.value.error);
        toast({
          title: "Analysis Warning",
          description: "Voice analysis encountered an issue, but we'll continue processing.",
          variant: "default"
        });
      } else {
        setVoiceAnalysis(audioAnalysisResult.value.data);
      }

      // Save to database only if we have at least one type of analysis
      if (visualAnalysisResult.status === 'fulfilled' || audioAnalysisResult.status === 'fulfilled') {
        const { error: dbError } = await supabase
          .from('performances')
          .insert({
            user_id: userId,
            title: file.name,
            video_url: publicUrl,
            selected_coach: preferences.selected_coach,
            performance_analysis: {
              ai_feedback: visualAnalysisResult.status === 'fulfilled' ? visualAnalysisResult.value.data : null,
              voice_feedback: audioAnalysisResult.status === 'fulfilled' ? audioAnalysisResult.value.data : null
            }
          });

        if (dbError) {
          console.error("Database error:", dbError);
          toast({
            title: "Warning",
            description: "Could not save analysis to history, but results are available.",
            variant: "default"
          });
        }
      }

      toast({
        title: "Analysis Complete",
        description: "Your performance has been analyzed!",
        variant: "default"
      });

    } catch (error: any) {
      console.error("Error in video processing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process video",
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

