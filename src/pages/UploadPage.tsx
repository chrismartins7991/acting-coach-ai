
import { useState } from "react";
import { Button } from "@/components/ui/button";
import VideoUploader from "@/components/VideoUploader";
import { useSubscription } from "@/hooks/useSubscription";
import { PaymentWall } from "@/components/PaymentWall";
import { CoachSelection } from "@/components/onboarding/CoachSelection";

const UploadPage = () => {
  const { canUploadPerformance } = useSubscription();
  const [showUploader, setShowUploader] = useState(false);
  const [showPaymentWall, setShowPaymentWall] = useState(false);

  const handleModifySettings = () => {
    setShowUploader(false);
  };

  const handleVideoAnalysisComplete = () => {
    if (!canUploadPerformance()) {
      setShowPaymentWall(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {!showUploader ? (
          <CoachSelection onComplete={() => setShowUploader(true)} />
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Upload Your Performance</h2>
              <Button
                onClick={handleModifySettings}
                variant="outline"
                className="bg-theater-gold/10 hover:bg-theater-gold/20 text-theater-gold border-theater-gold"
              >
                Modify Coach & Preferences
              </Button>
            </div>
            {showPaymentWall ? (
              <PaymentWall onComplete={() => setShowPaymentWall(false)} />
            ) : (
              <VideoUploader onAnalysisComplete={handleVideoAnalysisComplete} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;

