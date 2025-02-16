
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WelcomeScreen } from "./steps/WelcomeScreen";
import { CoachSelection } from "../onboarding/CoachSelection";

type OnboardingStep = 
  | "welcome"
  | "initial-progress"
  | "assessment"
  | "calculation"
  | "results"
  | "goals"
  | "coach-selection";

export const OnboardingFlow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingProgress = async () => {
      if (!user) return;

      try {
        const { data: progress } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (progress) {
          setCurrentStep(progress.current_step as OnboardingStep);
        } else {
          // Create initial progress record
          await supabase
            .from('onboarding_progress')
            .insert([{ user_id: user.id }]);
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
  }, [user, toast]);

  const updateProgress = async (nextStep: OnboardingStep) => {
    if (!user) return;

    try {
      // Get current completed steps
      const { data: currentProgress } = await supabase
        .from('onboarding_progress')
        .select('completed_steps')
        .eq('user_id', user.id)
        .single();

      // Update with new step
      const completedSteps = currentProgress?.completed_steps || [];
      completedSteps.push(currentStep);

      await supabase
        .from('onboarding_progress')
        .update({ 
          current_step: nextStep,
          completed_steps: completedSteps
        })
        .eq('user_id', user.id);

      setCurrentStep(nextStep);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const handleComplete = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const renderStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeScreen onNext={() => updateProgress("initial-progress")} />;
      case "coach-selection":
        return <CoachSelection onComplete={handleComplete} />;
      default:
        return <WelcomeScreen onNext={() => updateProgress("initial-progress")} />;
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

