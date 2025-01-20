import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PerformanceAnalysis } from "./PerformanceAnalysis";
import { supabase } from "@/lib/supabase";
import { extractAudioFromVideo } from "@/utils/videoAnalysis/audioExtractor";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { useAuth } from "@/contexts/AuthContext";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const VideoUploader = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a video file smaller than 100MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log("Starting video upload...");

      // Upload video to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Error uploading video: ' + uploadError.message);
      }

      if (!uploadData) {
        throw new Error('No upload data received');
      }

      console.log("Video uploaded successfully, getting public URL...");

      // Get the public URL of the uploaded video
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      console.log("Starting video and voice analysis...");

      // Extract audio from video
      const audioData = await extractAudioFromVideo(file);

      // Parallel processing of video and voice analysis
      const [videoAnalysisResponse, voiceAnalysisResponse] = await Promise.all([
        // Analyze video performance
        supabase.functions.invoke('analyze-performance', {
          body: { videoUrl: publicUrl }
        }),
        // Analyze voice performance
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

      // Ensure the responses match the expected types
      const videoAnalysis = videoAnalysisResponse.data as Analysis;
      const voiceAnalysis = voiceAnalysisResponse.data as VoiceAnalysis;

      console.log("Setting analysis states:", { videoAnalysis, voiceAnalysis });

      setAnalysis(videoAnalysis);
      setVoiceAnalysis(voiceAnalysis);

      // Save the performance and analysis to the database
      if (user) {
        const { error: dbError } = await supabase
          .from('performances')
          .insert({
            user_id: user.id,
            title: file.name,
            video_url: publicUrl,
            ai_feedback: videoAnalysis,
            voice_feedback: voiceAnalysis
          });

        if (dbError) {
          console.error("Database error:", dbError);
          throw new Error('Error saving analysis to database');
        }
      }
      
      toast({
        title: "Analysis Complete",
        description: "Your video has been analyzed successfully!",
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
            <Upload className="w-12 h-12 text-white mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">Upload Video</h3>
            <p className="text-white/80">Upload a video file (max 100MB) for analysis</p>
            {isProcessing && (
              <p className="text-white/80 mt-2">Processing video...</p>
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