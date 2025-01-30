import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { extractFramesFromVideo } from '@/utils/videoAnalysis/frameExtractor';
import { extractAudioFromVideo } from '@/utils/videoAnalysis/audioExtractor';

export interface VideoProcessingHook {
  processVideo: (file: File) => Promise<void>;
  isProcessing: boolean;
  processingStep: string;
  uploadProgress: number;
  analysis: Analysis | null;
  voiceAnalysis: VoiceAnalysis | null;
}

export const useVideoProcessing = (userId?: string): VideoProcessingHook => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const { toast } = useToast();

  const processVideo = async (file: File) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      setIsProcessing(true);
      setProcessingStep('Extracting frames and audio...');
      console.log("Starting video processing...");

      // Extract frames
      const frames = await extractFramesFromVideo(file);
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

      // Get user's coach preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_coach_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError) {
        throw new Error('Error fetching user preferences: ' + preferencesError.message);
      }

      setProcessingStep('Analyzing performance...');
      console.log("Starting performance and voice analysis...");

      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

      // Parallel processing of visual and audio analysis
      const [visualAnalysis, audioAnalysis] = await Promise.all([
        // Visual analysis
        supabase.functions.invoke('analyze-performance', {
          body: { 
            frames: frames.map(frame => frame.frameData),
            videoUrl: publicUrl,
            userId,
            coachPreferences: preferences
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }),
        // Voice analysis
        supabase.functions.invoke('analyze-voice', {
          body: { 
            audioData,
            userId,
            coachPreferences: preferences
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
      ]);

      if (visualAnalysis.error) {
        console.error("Visual analysis error:", visualAnalysis.error);
        throw visualAnalysis.error;
      }

      if (audioAnalysis.error) {
        console.error("Audio analysis error:", audioAnalysis.error);
        throw audioAnalysis.error;
      }

      console.log("Analysis completed:", { visualAnalysis, audioAnalysis });
      setAnalysis(visualAnalysis.data);
      setVoiceAnalysis(audioAnalysis.data);

      // Save to database
      const { error: dbError } = await supabase
        .from('performances')
        .insert({
          user_id: userId,
          title: file.name,
          video_url: publicUrl,
          ai_feedback: visualAnalysis.data,
          voice_feedback: audioAnalysis.data
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error('Error saving analysis to database');
      }

      toast({
        title: "Analysis Complete",
        description: "Your performance has been analyzed successfully!",
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
  };
};
