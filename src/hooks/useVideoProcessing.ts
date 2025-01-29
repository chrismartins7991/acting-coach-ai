import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { extractFramesFromVideo } from '@/utils/videoAnalysis/frameExtractor';

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
      setProcessingStep('Uploading video...');
      console.log("Starting video processing...");

      // Upload to storage
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

      setProcessingStep('Extracting frames...');
      console.log("Video uploaded, extracting frames...");

      // Extract frames
      const frames = await extractFramesFromVideo(file);
      console.log(`Extracted ${frames.length} frames from video`);

      setProcessingStep('Analyzing performance...');
      console.log("Starting performance analysis...");

      // Get user's coach preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_coach_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError) {
        throw new Error('Error fetching user preferences: ' + preferencesError.message);
      }

      console.log("User preferences:", preferences);

      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

      // Call analyze-performance function
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-performance', {
          body: { 
            frames: frames.map(frame => frame.frameData),
            videoUrl: publicUrl,
            userId,
            coachPreferences: preferences
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        throw analysisError;
      }

      console.log("Analysis completed:", analysisData);
      setAnalysis(analysisData);

      // Save to database
      const { error: dbError } = await supabase
        .from('performances')
        .insert({
          user_id: userId,
          title: file.name,
          video_url: publicUrl,
          ai_feedback: analysisData
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