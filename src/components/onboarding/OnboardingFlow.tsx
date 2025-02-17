
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WelcomeScreen } from "./steps/WelcomeScreen";
import { InitialProgress } from "./steps/InitialProgress";
import { AssessmentQuiz } from "./steps/AssessmentQuiz";
import { ProgressCalculation } from "./steps/ProgressCalculation";
import { ResultsOverview } from "./steps/ResultsOverview";
import { GoalSetting } from "./steps/GoalSetting";
import { CoachSelection } from "../onboarding/CoachSelection";
import { SignupStep } from "./steps/SignupStep";

type OnboardingStep = 
  | "welcome"
  | "signup"
  | "initial-progress"
  | "assessment"
  | "calculation"
  | "results"
  | "goals"
  | "coach-selection";

interface OnboardingFlowProps {
  onComplete?: () => void;
  startStep?: OnboardingStep;
}

export const OnboardingFlow = ({ onComplete, startStep = "welcome" }: OnboardingFlowProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(startStep);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkOnboardingProgress = async () => {
      // Only check progress if user is authenticated and we're past the welcome/signup steps
      if (!user || currentStep === "welcome" || currentStep === "signup") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data: progress } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (progress) {
          // Only update if we're past signup
          if (progress.current_step !== "welcome" && progress.current_step !== "signup") {
            setCurrentStep(progress.current_step as OnboardingStep);
          }
        } else {
          await supabase
            .from('onboarding_progress')
            .insert([{ user_id: user.id, current_step: currentStep }]);
        }
      } catch (error) {
        console.error('Error checking onboarding progress:', error);
        toast({
          title: "Error",
          description: "Failed to load onboarding progress",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingProgress();
  }, [user, currentStep, toast]);

  const updateProgress = async (nextStep: OnboardingStep) => {
    // Special handling for welcome to signup transition
    if (currentStep === "welcome" && nextStep === "signup") {
      setCurrentStep("signup");
      return;
    }

    // Require authentication for steps after signup
    if (!user && nextStep !== "signup") {
      setCurrentStep("signup");
      return;
    }

    // Update progress in database for authenticated users
    if (user && nextStep !== "welcome" && nextStep !== "signup") {
      try {
        const { data: currentProgress } = await supabase
          .from('onboarding_progress')
          .select('completed_steps')
          .eq('user_id', user.id)
          .single();

        const completedSteps = Array.isArray(currentProgress?.completed_steps) 
          ? [...currentProgress.completed_steps, currentStep]
          : [currentStep];

        await supabase
          .from('onboarding_progress')
          .update({ 
            current_step: nextStep,
            completed_steps: completedSteps
          })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }

    setCurrentStep(nextStep);
  };

  const handleCoachSelectionComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeScreen onNext={() => updateProgress("signup")} />;
      case "signup":
        return <SignupStep onNext={() => updateProgress("initial-progress")} />;
      case "initial-progress":
        return <InitialProgress onNext={() => updateProgress("assessment")} />;
      case "assessment":
        return <AssessmentQuiz onNext={() => updateProgress("calculation")} />;
      case "calculation":
        return <ProgressCalculation onNext={() => updateProgress("results")} />;
      case "results":
        return <ResultsOverview onNext={() => updateProgress("goals")} />;
      case "goals":
        return <GoalSetting onNext={() => updateProgress("coach-selection")} />;
      case "coach-selection":
        return <CoachSelection onComplete={handleCoachSelectionComplete} />;
      default:
        return <WelcomeScreen onNext={() => updateProgress("signup")} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple p-8">
      <div className="max-w-4xl mx-auto">
        {renderStep()}
      </div>
    </div>
  );
};
