import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { extractFramesFromVideo } from "./frameExtractor";

export const useVideoUpload = (userId: string, onAnalysisComplete: (analysis: any) => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log("Starting video upload...");

      // Extract frames first
      const frames = await extractFramesFromVideo(file);
      
      if (frames.length < 3) {
        throw new Error("Failed to extract enough frames from video");
      }

      // Upload video to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Error uploading video: ' + uploadError.message);
      }

      console.log("Video uploaded successfully, getting public URL...");

      // Get the public URL of the uploaded video
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      console.log("Starting AI analysis...");

      // Call the analyze-performance edge function with frames
      const { data: analysis, error: analysisError } = await supabase.functions
        .invoke('analyze-performance', {
          body: { 
            videoUrl: publicUrl,
            frames: frames 
          }
        });

      if (analysisError) {
        throw analysisError;
      }

      onAnalysisComplete(analysis);

    } catch (error: any) {
      console.error("Error processing video:", error);
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        await handleFileUpload(file);
      } else {
        throw error;
      }
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleFileUpload,
    isUploading,
    retryCount
  };
};
