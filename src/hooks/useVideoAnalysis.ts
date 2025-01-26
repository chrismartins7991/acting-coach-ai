import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { extractAudioFromVideo } from "@/utils/videoAnalysis/audioExtractor";
import { extractFramesFromVideo } from "@/utils/videoAnalysis/frameExtractor";

export const useVideoAnalysis = () => {
  const [processingStep, setProcessingStep] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeVideo = async (file: File, publicUrl: string) => {
    try {
      setIsAnalyzing(true);
      setProcessingStep("Extracting video frames...");
      const frames = await extractFramesFromVideo(file);
      console.log("Extracted frames:", frames.length);
      
      if (!frames || frames.length === 0) {
        throw new Error("Failed to extract frames from video");
      }

      setProcessingStep("Analyzing performance...");
      console.log("Starting video and voice analysis...");

      const audioData = await extractAudioFromVideo(file);

      const [videoAnalysisResponse, voiceAnalysisResponse] = await Promise.all([
        supabase.functions.invoke<{ data: Analysis }>('analyze-performance', {
          body: { 
            videoUrl: publicUrl,
            frames: frames
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        supabase.functions.invoke<{ data: VoiceAnalysis }>('analyze-voice', {
          body: { audioData },
          headers: {
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (videoAnalysisResponse.error || voiceAnalysisResponse.error) {
        throw new Error('Error analyzing video or voice');
      }

      const videoAnalysis = videoAnalysisResponse.data.data;
      const voiceAnalysis = voiceAnalysisResponse.data.data;

      console.log("Combining analyses through acting methodologies...");
      const { data: combinedAnalysis, error: combinedError } = await supabase.functions.invoke(
        'combine-analysis',
        {
          body: {
            videoAnalysis,
            voiceAnalysis,
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (combinedError) {
        console.error("Error combining analyses:", combinedError);
        throw new Error('Error combining analyses');
      }

      return {
        videoAnalysis: {
          ...videoAnalysis,
          methodologicalAnalysis: combinedAnalysis
        },
        voiceAnalysis
      };
    } catch (error) {
      console.error("Error in analyzeVideo:", error);
      throw error;
    } finally {
      setIsAnalyzing(false);
      setProcessingStep("");
    }
  };

  return {
    analyzeVideo,
    processingStep,
    isAnalyzing,
  };
};