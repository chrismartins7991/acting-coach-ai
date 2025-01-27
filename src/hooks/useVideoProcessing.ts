import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";

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

      setProcessingStep('Analyzing performance...');
      console.log("Video uploaded, starting analysis...");

      // Call analyze-video function
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-video', {
          body: { videoUrl: publicUrl }
        });

      if (analysisError) {
        throw analysisError;
      }

      setAnalysis(analysisData.analysis);
      setVoiceAnalysis(analysisData.voiceAnalysis);

      // Save to database if we have a user ID
      if (userId) {
        const { error: dbError } = await supabase
          .from('performances')
          .insert({
            user_id: userId,
            title: file.name,
            video_url: publicUrl,
            ai_feedback: analysisData.analysis,
            voice_feedback: analysisData.voiceAnalysis
          });

        if (dbError) {
          console.error("Database error:", dbError);
          throw new Error('Error saving analysis to database');
        }
      }

      toast({
        title: "Analysis Complete",
        description: "Your video has been analyzed successfully!",
      });

    } catch (error: any) {
      console.error("Error in video processing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process video",
        variant: "destructive",
      });
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