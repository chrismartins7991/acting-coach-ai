import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { extractAudioFromVideo } from "@/utils/videoAnalysis/audioExtractor";
import { extractFramesFromVideo } from "@/utils/videoAnalysis/frameExtractor";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const useVideoProcessing = (userId?: string) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);

  const processVideo = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a video file smaller than 50MB. Try compressing your video or uploading a shorter clip.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStep("Starting video upload...");
      console.log("Starting video upload...");

      setProcessingStep("Extracting video frames...");
      const frames = await extractFramesFromVideo(file);
      console.log("Extracted frames:", frames.length);
      
      if (!frames || frames.length === 0) {
        throw new Error("Failed to extract frames from video");
      }

      setProcessingStep("Uploading video to storage...");
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(7);
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${randomString}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      if (uploadError) {
        clearInterval(progressInterval);
        console.error("Upload error:", uploadError);
        throw new Error('Error uploading video: ' + uploadError.message);
      }

      if (!uploadData) {
        clearInterval(progressInterval);
        throw new Error('No upload data received');
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("Video uploaded successfully, getting public URL...");

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath, {
          download: false,
        });

      setProcessingStep("Analyzing performance...");
      console.log("Starting video and voice analysis...");

      const audioData = await extractAudioFromVideo(file);

      const [videoAnalysisResponse, voiceAnalysisResponse] = await Promise.all([
        supabase.functions.invoke('analyze-performance', {
          body: { 
            videoUrl: publicUrl,
            frames: frames
          }
        }),
        supabase.functions.invoke('analyze-voice', {
          body: { audioData }
        })
      ]);

      if (videoAnalysisResponse.error || voiceAnalysisResponse.error) {
        throw new Error('Error analyzing video or voice');
      }

      const videoAnalysis = videoAnalysisResponse.data as Analysis;
      const voiceAnalysis = voiceAnalysisResponse.data as VoiceAnalysis;

      console.log("Combining analyses through acting methodologies...");
      const { data: combinedAnalysis, error: combinedError } = await supabase.functions.invoke(
        'combine-analysis',
        {
          body: {
            videoAnalysis,
            voiceAnalysis,
          }
        }
      );

      if (combinedError) {
        console.error("Error combining analyses:", combinedError);
        throw new Error('Error combining analyses');
      }

      const finalAnalysis = {
        ...videoAnalysis,
        methodologicalAnalysis: combinedAnalysis
      };

      setAnalysis(finalAnalysis);
      setVoiceAnalysis(voiceAnalysis);

      if (userId) {
        const { error: dbError } = await supabase
          .from('performances')
          .insert({
            user_id: userId,
            title: file.name,
            video_url: publicUrl,
            ai_feedback: finalAnalysis,
            voice_feedback: voiceAnalysis
          });

        if (dbError) {
          console.error("Database error:", dbError);
          throw new Error('Error saving analysis to database');
        }
      }
      
      toast({
        title: "Analysis Complete",
        description: "Your video has been analyzed through multiple acting methodologies!",
      });

    } catch (error: any) {
      console.error("Error processing video:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
      setUploadProgress(0);
    }
  };

  return {
    processVideo,
    isProcessing,
    processingStep,
    uploadProgress,
    analysis,
    voiceAnalysis,
  };
};