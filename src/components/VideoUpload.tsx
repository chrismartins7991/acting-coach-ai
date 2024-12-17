import { useState } from "react";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";

// Maximum file size in bytes (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

interface VideoUploadProps {
  userId: string;
  onAnalysisComplete: (analysis: any) => void;
  isUploading: boolean;
  isAnalyzing: boolean;
}

export const VideoUpload = ({ userId, onAnalysisComplete, isUploading, isAnalyzing }: VideoUploadProps) => {
  const { toast } = useToast();
  const { analyzeVideo } = useVideoAnalysis();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a video file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Starting video upload...");

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      console.log("Uploading file to path:", filePath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        if (uploadError.message.includes("Payload too large")) {
          throw new Error("File size exceeds the maximum limit. Please upload a smaller video file (max 50MB).");
        }
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

      onAnalysisComplete(analysis.ai_feedback);

      toast({
        title: "Analysis Complete",
        description: "Your performance has been analyzed successfully!",
      });

    } catch (error) {
      console.error("Error processing video:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error processing your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer"
    >
      <label className={`block p-6 rounded-lg bg-gradient-to-br from-theater-purple to-theater-gold transform transition-all duration-300 group-hover:scale-105 shadow-xl ${isUploading || isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isUploading || isAnalyzing}
        />
        <div className="text-center">
          <Upload className="w-12 h-12 text-white mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-white mb-2">Upload Video</h3>
          <p className="text-white/80">Upload a video file (max 50MB) for analysis</p>
          {(isUploading || isAnalyzing) && (
            <p className="text-white/80 mt-2">
              {isUploading ? 'Uploading...' : 'Analyzing...'}
            </p>
          )}
        </div>
      </label>
    </motion.div>
  );
};