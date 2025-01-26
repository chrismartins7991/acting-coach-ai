import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PerformanceAnalysis } from "./PerformanceAnalysis";
import { supabase } from "@/lib/supabase";
import { extractAudioFromVideo } from "@/utils/videoAnalysis/audioExtractor";
import { extractFramesFromVideo } from "@/utils/videoAnalysis/frameExtractor";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "./ui/progress";

// Reduce max file size to 50MB to stay within Supabase limits
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const VideoUploader = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
          transform: {
            width: 1280,
            height: 720,
            quality: 80
          }
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

      console.log("Video analysis response:", videoAnalysisResponse);
      console.log("Voice analysis response:", voiceAnalysisResponse);

      if (videoAnalysisResponse.error) {
        throw new Error('Error analyzing video: ' + videoAnalysisResponse.error.message);
      }

      if (voiceAnalysisResponse.error) {
        throw new Error('Error analyzing voice: ' + voiceAnalysisResponse.error.message);
      }

      // Get initial analyses
      const videoAnalysis = videoAnalysisResponse.data as Analysis;
      const voiceAnalysis = voiceAnalysisResponse.data as VoiceAnalysis;

      // Combine analyses through acting methodologies perspective
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

      console.log("Combined analysis:", combinedAnalysis);

      // Update the analyses with the combined perspective
      setAnalysis({
        ...videoAnalysis,
        methodologicalAnalysis: combinedAnalysis
      });
      setVoiceAnalysis(voiceAnalysis);

      // Save the performance and analysis to the database
      if (user) {
        const { error: dbError } = await supabase
          .from('performances')
          .insert({
            user_id: user.id,
            title: file.name,
            video_url: publicUrl,
            ai_feedback: {
              ...videoAnalysis,
              methodologicalAnalysis: combinedAnalysis
            },
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

  return (
    <div className="space-y-8">
      <div className="relative">
        <label className={`block p-8 rounded-lg border-2 border-dashed border-white/20 bg-black/20 cursor-pointer transition-all hover:bg-black/40 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isProcessing}
          />
          <div className="text-center">
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-white animate-spin mx-auto" />
                <h3 className="text-xl font-semibold text-white">{processingStep}</h3>
                {uploadProgress > 0 && (
                  <div className="w-full max-w-xs mx-auto space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-white/60">{uploadProgress}% uploaded</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-white mb-4 mx-auto" />
                <h3 className="text-xl font-semibold text-white mb-2">Upload Video</h3>
                <p className="text-white/80">Upload a video file (max 50MB) for analysis</p>
              </>
            )}
          </div>
        </label>
      </div>

      {(analysis || voiceAnalysis) && (
        <PerformanceAnalysis 
          analysis={analysis} 
          voiceAnalysis={voiceAnalysis}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
};

export default VideoUploader;
