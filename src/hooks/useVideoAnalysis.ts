import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useVideoAnalysis = () => {
  return useMutation({
    mutationFn: async ({ videoUrl, title }: { videoUrl: string; title: string }) => {
      // First, analyze the video using our Edge Function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-performance',
        {
          body: { videoUrl },
        }
      );

      if (analysisError) throw analysisError;

      // Then, save the performance and feedback to our database
      const { data: performanceData, error: performanceError } = await supabase
        .from('performances')
        .insert({
          title,
          video_url: videoUrl,
          ai_feedback: analysisData,
        })
        .select()
        .single();

      if (performanceError) throw performanceError;

      return performanceData;
    },
  });
};