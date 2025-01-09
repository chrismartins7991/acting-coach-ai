import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";

export const useVideoUpload = (userId: string, onAnalysisComplete: (analysis: any) => void) => {
  const { toast } = useToast();
  const { analyzeVideo } = useVideoAnalysis();
  const [retryCount, setRetryCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a video file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      console.log("Starting video upload...");

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      console.log("Uploading file to path:", filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("Video uploaded successfully, getting public URL...");
      
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      console.log("Public URL generated:", publicUrl);
      console.log("Starting AI analysis...");
      
      const analysis = await analyzeVideo({
        videoUrl: publicUrl,
        title: file.name,
        userId: userId
      });

      setRetryCount(0);
      onAnalysisComplete(analysis.ai_feedback);

      toast({
        title: "Analysis Complete",
        description: "Your performance has been analyzed successfully!",
      });

    } catch (error: any) {
      console.error("Error processing video:", error);
      
      if (error.message.includes("Network error") && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        toast({
          title: "Connection Error",
          description: "Retrying analysis... Please wait.",
          variant: "destructive",
        });
        setTimeout(() => handleFileUpload(file), 2000);
        return;
      }

      toast({
        title: "Error",
        description: error.message || "There was an error processing your video. Please try again.",
        variant: "destructive",
      });
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