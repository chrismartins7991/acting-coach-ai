import { useVideoUpload } from "@/utils/videoAnalysis/useVideoUpload";
import { UploadButton } from "./video/UploadButton";
import { useToast } from "./ui/use-toast";

interface VideoUploadProps {
  onAnalysisComplete: (analysis: any) => void;
  isAnalyzing: boolean;
}

export const VideoUpload = ({ onAnalysisComplete, isAnalyzing }: VideoUploadProps) => {
  const { toast } = useToast();
  const { handleFileUpload, isUploading, retryCount } = useVideoUpload("demo-user", onAnalysisComplete);

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

    handleFileUpload(file);
  };

  return (
    <UploadButton
      isDisabled={isUploading || isAnalyzing}
      isProcessing={isUploading || isAnalyzing}
      retryCount={retryCount}
      onFileSelect={handleFileSelect}
    />
  );
};