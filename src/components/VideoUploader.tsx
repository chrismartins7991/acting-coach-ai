import { Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UploadProgress } from "./video/UploadProgress";
import { PerformanceAnalysis } from "./PerformanceAnalysis";
import { useVideoProcessing } from "@/hooks/useVideoProcessing";

const VideoUploader = () => {
  const { user } = useAuth();
  const {
    processVideo,
    isProcessing,
    processingStep,
    uploadProgress,
    analysis,
    voiceAnalysis,
  } = useVideoProcessing(user?.id);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processVideo(file);
  };

  return (
    <div className="space-y-8">
      <div className="relative">
        <label 
          className={`block p-8 rounded-lg border-2 border-dashed border-white/20 bg-black/20 cursor-pointer transition-all hover:bg-black/40 ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isProcessing}
          />
          <div className="text-center">
            {isProcessing ? (
              <UploadProgress 
                processingStep={processingStep}
                uploadProgress={uploadProgress}
              />
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