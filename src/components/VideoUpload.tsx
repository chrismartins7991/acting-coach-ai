
import { useVideoUpload } from "@/utils/videoAnalysis/useVideoUpload";
import { UploadButton } from "./video/UploadButton";
import { useToast } from "./ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface VideoUploadProps {
  onAnalysisComplete: (analysis: any) => void;
  isAnalyzing: boolean;
}

export const VideoUpload = ({ onAnalysisComplete, isAnalyzing }: VideoUploadProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { handleFileUpload, isUploading, retryCount } = useVideoUpload(
    user?.id || "demo-user",
    onAnalysisComplete
  );

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File too large",
        description: "Please upload a video file smaller than 100MB",
        variant: "destructive",
      });
      return;
    }

    try {
      await handleFileUpload(file);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process video",
        variant: "destructive",
      });
    }
  };

  return (
    <UploadButton
      isDisabled={isUploading || isAnalyzing || !user}
      isProcessing={isUploading || isAnalyzing}
      retryCount={retryCount}
      onFileSelect={handleFileSelect}
    />
  );
};
