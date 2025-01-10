import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { extractFramesFromVideo } from "./frameExtractor";
import { useToast } from "@/hooks/use-toast";

export const useVideoUpload = (userId: string, onAnalysisComplete: (analysis: any) => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log("Starting video upload and analysis...");

      // Extract frames and audio
      console.log("Extracting frames and audio from video on client side...");
      const { frames, audioBlob } = await extractFramesFromVideo(file);
      
      if (!frames || frames.length < 3) {
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

      // Convert audio blob to base64
      const audioBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(audioBlob!);
      });

      console.log("Starting AI analysis...");

      // Call the analyze-performance edge function with frames and audio
      const { data: analysis, error: analysisError } = await supabase.functions
        .invoke('analyze-performance', {
          body: { 
            videoUrl: publicUrl,
            frames: frames,
            audio: audioBase64
          }
        });

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        throw analysisError;
      }

      if (!analysis) {
        throw new Error('No analysis results received');
      }

      onAnalysisComplete(analysis);
      toast({
        title: "Analysis Complete",
        description: "Your video has been analyzed successfully!"
      });

    } catch (error: any) {
      console.error("Error processing video:", error);
      
      // Show error toast
      toast({
        title: "Error Processing Video",
        description: error.message || "Failed to process video. Please try again.",
        variant: "destructive"
      });

      // Retry logic for specific errors
      if (retryCount < 3 && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('network') ||
        error.message.includes('timeout')
      )) {
        setRetryCount(prev => prev + 1);
        console.log(`Retrying upload (attempt ${retryCount + 1}/3)...`);
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