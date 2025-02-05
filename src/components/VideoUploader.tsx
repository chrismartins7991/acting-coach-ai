
import { Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UploadProgress } from "./video/UploadProgress";
import { PerformanceAnalysis } from "./PerformanceAnalysis";
import { useVideoProcessing } from "@/hooks/useVideoProcessing";
import { PaymentWall } from "./PaymentWall";
import { useSubscription } from "@/hooks/useSubscription";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from "./ui/use-toast";

interface VideoUploaderProps {
  onAnalysisComplete?: () => void;
}

const VideoUploader = ({ onAnalysisComplete }: VideoUploaderProps) => {
  const { user } = useAuth();
  const { subscriptionTier } = useSubscription();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    processVideo,
    isProcessing,
    processingStep,
    uploadProgress,
    analysis,
    voiceAnalysis,
    shouldShowPaymentWall,
    setShouldShowPaymentWall
  } = useVideoProcessing(user?.id);

  // Handle successful payment return
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      setShouldShowPaymentWall(false);
      
      const tierMessages = {
        pro: "Your Pro subscription has been activated. You now have access to advanced analysis features.",
        annual: "Your Lifetime Access has been activated. You now have unlimited access to all features.",
        free: "Your trial access has been activated."
      };

      toast({
        title: "Payment successful",
        description: tierMessages[subscriptionTier] || "Your subscription has been activated. You can now view your analysis.",
        variant: "default",
      });

      // Navigate to LastResults page if we have analysis
      if (analysis || voiceAnalysis) {
        console.log("Redirecting to last-results with analysis");
        navigate('/last-results?success=true');
      }
    }
  }, [searchParams, setShouldShowPaymentWall, toast, subscriptionTier, analysis, voiceAnalysis, navigate]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await processVideo(file);
      onAnalysisComplete?.();
    } catch (error) {
      console.error("Error processing video:", error);
      toast({
        title: "Error",
        description: "There was an error processing your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If payment was successful and we have analysis, don't show payment wall
  const showPaymentWall = shouldShowPaymentWall && searchParams.get('success') !== 'true';

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
                <p className="text-white/80">
                  {subscriptionTier === 'free' 
                    ? "Upload a video file (max 50MB) for trial analysis" 
                    : "Upload a video file (max 50MB) for professional analysis"}
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {(!showPaymentWall && (analysis || voiceAnalysis)) && (
        <PerformanceAnalysis 
          analysis={analysis} 
          voiceAnalysis={voiceAnalysis}
          isLoading={isProcessing}
        />
      )}

      <PaymentWall 
        isOpen={showPaymentWall}
        onComplete={() => {
          setShouldShowPaymentWall(false);
          if (analysis || voiceAnalysis) {
            navigate('/last-results');
          }
        }}
      />
    </div>
  );
};

export default VideoUploader;
