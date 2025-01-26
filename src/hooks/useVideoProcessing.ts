import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { useVideoUpload } from "./useVideoUpload";
import { useVideoAnalysis } from "./useVideoAnalysis";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const useVideoProcessing = (userId?: string) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);

  const { uploadVideoToStorage, uploadProgress, setUploadProgress } = useVideoUpload();
  const { analyzeVideo, processingStep } = useVideoAnalysis();

  const processVideo = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a video file smaller than 50MB. Try compressing your video or uploading a shorter clip.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log("Starting video upload...");

      const { publicUrl } = await uploadVideoToStorage(file);
      
      const { videoAnalysis, voiceAnalysis: voiceAnalysisResult } = await analyzeVideo(file, publicUrl);

      setAnalysis(videoAnalysis);
      setVoiceAnalysis(voiceAnalysisResult);

      if (userId) {
        const { error: dbError } = await supabase
          .from('performances')
          .insert({
            user_id: userId,
            title: file.name,
            video_url: publicUrl,
            ai_feedback: videoAnalysis,
            voice_feedback: voiceAnalysisResult
          });

        if (dbError) {
          console.error("Database error:", dbError);
          throw new Error('Error saving analysis to database');
        }
      }
      
      toast({
        title: "Analysis Complete",
        description: "Your video has been analyzed through multiple acting methodologies!",
      });

    } catch (error: any) {
      console.error("Error processing video:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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