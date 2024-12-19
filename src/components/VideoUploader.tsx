import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log("Uploading to path:", filePath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      console.log("Generated public URL:", publicUrl);

      // Call analysis function
      console.log("Calling analyze-performance function...");
      const { data, error } = await supabase.functions.invoke('analyze-performance', {
        body: { videoUrl: publicUrl }
      });

      if (error) {
        console.error("Analysis error:", error);
        throw error;
      }

      console.log("Analysis complete:", data);
      setAnalysis(data);
      
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

      {analysis && (
        <div className="bg-white/10 rounded-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;