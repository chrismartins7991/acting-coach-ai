
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useVideoProcessing } from "@/hooks/useVideoProcessing";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { UploadProgress } from "@/components/video/UploadProgress";
import { PaymentWall } from "@/components/PaymentWall";

interface OnboardingUploadStepProps {
  onBack: () => void;
}

export const OnboardingUploadStep = ({ onBack }: OnboardingUploadStepProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPaymentWall, setShowPaymentWall] = useState(false);
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

    // File size check
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File too large. Please upload a video under 100MB.`);
      return;
    }
    
    setUploadError(null);
    try {
      await processVideo(file);
      // Once processing is complete, show the payment wall
      setShowPaymentWall(true);
    } catch (error) {
      console.error("Error processing video:", error);
      setUploadError(error instanceof Error ? error.message : "There was an error processing your video. Please try again.");
    }
  };

  const handlePaymentComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple p-6 sm:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Upload Your First Performance
          </h1>
          <p className="text-lg text-gray-300">
            Let your coach analyze your performance and provide personalized feedback
          </p>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-theater-gold/20 shadow-lg">
          {!isProcessing && !showPaymentWall ? (
            <div className="relative">
              <label 
                className="block p-8 rounded-lg border-2 border-dashed border-white/20 bg-black/20 cursor-pointer transition-all hover:bg-black/40"
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="w-12 h-12 text-white mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold text-white mb-2">Upload Video</h3>
                  <p className="text-white/80">
                    Upload a video file (max 100MB) for analysis
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    Supported formats: MP4, MOV, AVI, WMV
                  </p>
                </div>
              </label>
            </div>
          ) : isProcessing ? (
            <div className="p-8 rounded-lg border-2 border-dashed border-white/20 bg-black/20">
              <UploadProgress 
                processingStep={processingStep}
                uploadProgress={uploadProgress}
              />
            </div>
          ) : null}
          
          {uploadError && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-500 text-sm">{uploadError}</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              Back
            </Button>
          </div>
        </div>
        
        {/* Blurred Analysis Preview when Payment Wall is shown */}
        {showPaymentWall && (analysis || voiceAnalysis) && (
          <div className="relative mt-8 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <h3 className="text-2xl font-bold mb-2">Unlock Your Analysis</h3>
                <p className="text-lg">Subscribe to view your detailed performance feedback</p>
              </div>
            </div>
            <div className="filter blur-sm">
              {/* Simple placeholder for the analysis UI */}
              <div className="bg-black/40 p-8 rounded-xl border border-theater-gold/20">
                <div className="h-60 bg-gray-800/50 rounded-lg mb-4"></div>
                <div className="h-24 bg-gray-800/50 rounded-lg mb-4"></div>
                <div className="h-40 bg-gray-800/50 rounded-lg"></div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      
      <PaymentWall 
        isOpen={showPaymentWall}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
};
