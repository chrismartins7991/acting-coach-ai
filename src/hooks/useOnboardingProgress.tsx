
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type OnboardingStep = 
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

export const useOnboardingProgress = (startStep: OnboardingStep = "welcome") => {
  const { user } = useAuth();
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

  return {
    currentStep,
    isLoading,
    assessmentAnswers,
    setAssessmentAnswers,
    updateProgress
  };
};
