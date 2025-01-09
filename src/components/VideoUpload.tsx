import { useVideoUpload } from "@/utils/videoAnalysis/useVideoUpload";
import { UploadButton } from "./video/UploadButton";

interface VideoUploadProps {
  userId: string;
  onAnalysisComplete: (analysis: any) => void;
  isAnalyzing: boolean;
}

export const VideoUpload = ({ userId, onAnalysisComplete, isAnalyzing }: VideoUploadProps) => {
  const { handleFileUpload, isUploading, retryCount } = useVideoUpload(userId, onAnalysisComplete);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
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