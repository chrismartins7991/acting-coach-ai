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
      // Call the analyze-performance edge function
      const response = await fetch('/api/analyze-performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze video');
      }

      const analysis = await response.json();
      console.log("Analysis received:", analysis);

      // Save the performance and analysis to the database
      const { data, error } = await supabase
        .from('performances')
        .insert({
          user_id: userId,
          title,
          video_url: videoUrl,
          ai_feedback: analysis,
        })
        .select()
        .single();

      if (error) throw error;

      console.log("Performance saved to database:", data);
      return data;

    } catch (error) {
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