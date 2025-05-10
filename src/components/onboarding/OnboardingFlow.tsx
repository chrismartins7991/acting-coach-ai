
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
import { CoachPreferenceStep } from "./steps/CoachPreferenceStep";
import { OnboardingUploadStep } from "./steps/OnboardingUploadStep";

type OnboardingStep = 
  | "welcome"
  | "signup"
  | "experience"
  | "assessment"
  | "calculation"
  | "results"
  | "goals"
  | "coach-preference"
  | "coach-selection"
  | "upload";

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
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});

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
    console.info(`Updating progress: current=${currentStep}, next=${nextStep}`);
    
    if (currentStep === "welcome" && nextStep === "signup") {
      console.info("Moving from welcome to signup step");
      setCurrentStep("signup");
      return;
    }

    if (!user && nextStep !== "signup") {
      console.info("No user detected, redirecting to signup step");
      setCurrentStep("signup");
      return;
    }

    // Handle the special case when skipping signup
    if (currentStep === "signup" && nextStep === "experience" && !user) {
      console.info("User skipped signup, proceeding to experience step without saving progress");
      setCurrentStep("experience");
      return;
    }

    if (user && nextStep !== "welcome" && nextStep !== "signup") {
      try {
        console.info("Updating user onboarding progress in database");
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

    console.info(`Setting current step to: ${nextStep}`);
    setCurrentStep(nextStep);
  };

  const handleAssessmentComplete = (answers: Record<string, string>) => {
    setAssessmentAnswers(answers);
    updateProgress("calculation");
  };

  const skipCoachSelection = async () => {
    // Set a default coach (Stanislavski) when user skips selection
    if (user) {
      try {
        await supabase
          .from('user_coach_preferences')
          .upsert({
            user_id: user.id,
            selected_coach: "stanislavski",
            emotion_in_voice: true,
            voice_expressiveness: true,
            physical_presence: true,
            face_expressions: true,
            clearness_of_diction: true,
          }, {
            onConflict: 'user_id'
          });
          
        // Now redirect to upload step instead of upload page
        updateProgress("upload");
      } catch (error) {
        console.error('Error setting default coach:', error);
        toast({
          title: "Error",
          description: "Failed to set default coach",
          variant: "destructive",
        });
      }
    } else {
      // If no user, redirect to signup
      setCurrentStep("signup");
    }
  };

  const handleCoachSelectionComplete = () => {
    // Now redirect to upload step instead of upload page
    updateProgress("upload");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent border-theater-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderStep = () => {
    console.info(`Rendering step: ${currentStep}`);
    switch (currentStep) {
      case "welcome":
        return <WelcomeScreen onNext={() => updateProgress("signup")} />;
      case "signup":
        return <SignupStep onNext={() => updateProgress("experience")} />;
      case "experience":
        return <ExperienceScreen onNext={() => updateProgress("assessment")} />;
      case "assessment":
        return <AssessmentQuiz onNext={handleAssessmentComplete} />;
      case "calculation":
        return <CalculationScreen onNext={() => updateProgress("results")} />;
      case "results":
        return <ResultsScreen onNext={() => updateProgress("goals")} assessmentAnswers={assessmentAnswers} />;
      case "goals":
        return <GoalSettingScreen onNext={() => updateProgress("coach-preference")} />;
      case "coach-preference":
        return <CoachPreferenceStep 
                 onNext={() => updateProgress("coach-selection")}
                 onSkip={skipCoachSelection}
               />;
      case "coach-selection":
        return <CoachSelection onComplete={handleCoachSelectionComplete} />;
      case "upload":
        return <OnboardingUploadStep onBack={() => updateProgress("coach-preference")} />;
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
