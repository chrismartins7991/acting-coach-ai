
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WelcomeScreen } from "./steps/WelcomeScreen";
import { ExperienceScreen } from "./steps/ExperienceScreen";
import { AssessmentQuiz } from "./steps/AssessmentQuiz";
import { CalculationScreen } from "./steps/CalculationScreen";
import { ResultsScreen } from "./steps/ResultsScreen";
import { GoalSettingScreen } from "./steps/GoalSettingScreen";
import { CoachSelection } from "../onboarding/CoachSelection";
import { SignupStep } from "./steps/SignupStep";

type OnboardingStep = 
  | "welcome"
  | "signup"
  | "experience"
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
    if (currentStep === "welcome" && nextStep === "signup") {
      setCurrentStep("signup");
      return;
    }

    if (!user && nextStep !== "signup") {
      setCurrentStep("signup");
      return;
    }

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
    navigate('/upload');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent border-theater-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeScreen onNext={() => updateProgress("signup")} />;
      case "signup":
        return <SignupStep onNext={() => updateProgress("experience")} />;
      case "experience":
        return <ExperienceScreen onNext={() => updateProgress("assessment")} />;
      case "assessment":
        return <AssessmentQuiz onNext={() => updateProgress("calculation")} />;
      case "calculation":
        return <CalculationScreen onNext={() => updateProgress("results")} />;
      case "results":
        return <ResultsScreen onNext={() => updateProgress("goals")} />;
      case "goals":
        return <GoalSettingScreen onNext={() => updateProgress("coach-selection")} />;
      case "coach-selection":
        return <CoachSelection onComplete={handleCoachSelectionComplete} />;
      default:
        return <WelcomeScreen onNext={() => updateProgress("signup")} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple">
      {renderStep()}
    </div>
  );
};
