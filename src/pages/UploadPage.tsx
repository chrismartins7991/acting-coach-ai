
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import VideoUploader from "@/components/VideoUploader";
import { useSubscription } from "@/hooks/useSubscription";
import { PaymentWall } from "@/components/PaymentWall";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Book, Database } from "lucide-react";
import { TopMenu } from "@/components/TopMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavBar } from "@/components/dashboard/MobileNavBar";

const UploadPage = () => {
  const { canUploadPerformance, isSubscribed } = useSubscription();
  const [showUploader, setShowUploader] = useState(false);
  const [showPaymentWall, setShowPaymentWall] = useState(false);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Check if user has completed onboarding (has coach preferences)
        const { data: coachPreferences, error: coachError } = await supabase
          .from('user_coach_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Check if user is in onboarding flow (has progress record)
        const { data: onboardingProgress, error: progressError } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        // If user has onboarding progress but isn't subscribed, they are a new user
        // who should be in the onboarding flow
        if (onboardingProgress && !isSubscribed) {
          setIsNewUser(true);
          
          // Redirect to onboarding flow with upload step
          navigate('/welcome');
          return;
        }

        // If user has coach preferences, show the uploader
        if (coachPreferences) {
          setShowUploader(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, isSubscribed, navigate]);

  const handleModifySettings = () => {
    setShowUploader(false);
  };

  const handleVideoAnalysisComplete = () => {
    if (!canUploadPerformance()) {
      setShowPaymentWall(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowUploader(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theater-gold"></div>
      </div>
    );
  }

  // If user is a new onboarding user who hasn't subscribed yet,
  // redirect them to the onboarding flow (handled in useEffect)
  if (isNewUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theater-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple">
      {/* Top Menu for Navigation */}
      <TopMenu />
      
      <div className={`container mx-auto px-4 ${isMobile ? 'pt-20 pb-24' : 'pt-28 pb-8'}`}>
        {showUploader && (
          <div className="flex items-center space-x-4 mb-6">
            <Link to="/dashboard" className="text-white hover:text-theater-gold">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Upload Performance
            </h1>
          </div>
        )}

        {!showUploader ? (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Upload Your Performance</h2>
                <p className="text-white/60 text-sm mt-1">Get professional analysis based on your selected acting methodology</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="bg-theater-gold/10 hover:bg-theater-gold/20 text-theater-gold border-theater-gold"
                  onClick={handleModifySettings}
                >
                  Modify Coach & Preferences
                </Button>
                <Link to="/history">
                  <Button
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20 w-full sm:w-auto"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                </Link>
                <Link to="/rehearsal-room">
                  <Button
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20 w-full sm:w-auto"
                  >
                    <Book className="w-4 h-4 mr-2" />
                    Rehearsal Room
                  </Button>
                </Link>
              </div>
            </div>
            <PaymentWall 
              isOpen={showPaymentWall}
              onComplete={() => setShowPaymentWall(false)}
            />
            <VideoUploader onAnalysisComplete={handleVideoAnalysisComplete} />
          </div>
        )}
      </div>
      
      {/* Fixed bottom menu - only visible on mobile */}
      {isMobile && <MobileNavBar />}
    </div>
  );
};

export default UploadPage;
