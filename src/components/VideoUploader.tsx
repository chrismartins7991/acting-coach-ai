import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PerformanceAnalysis } from "./PerformanceAnalysis";
import { supabase } from "@/lib/supabase";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const VideoUploader = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a video file smaller than 50MB.",
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

      console.log("Starting video analysis with Gemini...");

      // Call the analyze-video edge function
      const { data: analysisResult, error: analysisError } = await supabase.functions
        .invoke('analyze-video', {
          body: { videoUrl: publicUrl }
        });

      if (analysisError) {
        throw new Error('Error analyzing video: ' + analysisError.message);
      }

      if (!analysisResult) {
        throw new Error('No analysis results received');
      }

      console.log("Analysis received:", analysisResult);

      // Save the performance and analysis to the database
      const { error: dbError } = await supabase
        .from('performances')
        .insert({
          title: file.name,
          video_url: publicUrl,
          ai_feedback: analysisResult
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error('Error saving analysis to database');
      }

      setAnalysis(analysisResult);
      
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
            <p className="text-white/80">Upload a video file (max 50MB) for analysis</p>
            {isProcessing && (
              <p className="text-white/80 mt-2">Processing video...</p>
            )}
          </div>
        </label>
      </div>

      {isProcessing ? (
        <PerformanceAnalysis analysis={null} isLoading={true} />
      ) : (
        analysis && <PerformanceAnalysis analysis={analysis} />
      )}
    </div>
  );
};

export default VideoUploader;