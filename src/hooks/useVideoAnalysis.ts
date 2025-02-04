import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useVideoAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeVideo = async (videoUrl: string, performanceId: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-video", {
        body: { videoUrl, performanceId }
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: "Your video has been analyzed successfully!"
      });

      return data;
    } catch (error) {
      console.error("Error analyzing video:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your video. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeVideo,
    isAnalyzing
  };
};
