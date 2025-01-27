import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface VideoProcessingHook {
  analyzeVideo: (videoUrl: string, performanceId: string) => Promise<any>;
  isAnalyzing: boolean;
}

export const useVideoProcessing = (): VideoProcessingHook => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeVideo = async (videoUrl: string, performanceId: string) => {
    try {
      setIsAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke('analyze-video', {
        body: { videoUrl, performanceId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error analyzing video:', error);
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