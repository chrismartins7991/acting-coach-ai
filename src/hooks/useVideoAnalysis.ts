import { supabase } from "@/lib/supabase";
import { useState } from "react";

interface AnalyzeVideoParams {
  videoUrl: string;
  title: string;
  userId: string;
}

export const useVideoAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeVideo = async ({ videoUrl, title, userId }: AnalyzeVideoParams) => {
    setIsAnalyzing(true);
    console.log("Starting video analysis...");

    try {
      // Call the analyze-performance edge function using Supabase client
      const { data: analysis, error } = await supabase.functions.invoke('analyze-performance', {
        body: { videoUrl }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Failed to analyze video: ${error.message}`);
      }

      if (!analysis) {
        throw new Error('No analysis results received');
      }

      console.log("Analysis received:", analysis);

      // Save the performance and analysis to the database
      const { data, error: dbError } = await supabase
        .from('performances')
        .insert({
          user_id: userId,
          title,
          video_url: videoUrl,
          ai_feedback: analysis,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      console.log("Performance saved to database:", data);
      return data;

    } catch (error: any) {
      console.error("Error in video analysis:", error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeVideo,
    isAnalyzing,
  };
};