
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingProgress, OnboardingStep } from "@/hooks/useOnboardingProgress";
import { useCoachPreference } from "@/hooks/useCoachPreference";
import { StepRenderer } from "./StepRenderer";

interface OnboardingFlowProps {
  onComplete?: () => void;
  startStep?: OnboardingStep;
}

export const OnboardingFlow = ({ onComplete, startStep = "welcome" }: OnboardingFlowProps) => {
  const navigate = useNavigate();
  const {
    currentStep,
    isLoading,
    assessmentAnswers,
    setAssessmentAnswers,
    updateProgress
  } = useOnboardingProgress(startStep);
  
  const {
    skipCoachSelection,
    handleCoachSelectionComplete
  } = useCoachPreference(updateProgress);

  const handleAssessmentComplete = (answers: Record<string, string>) => {
    setAssessmentAnswers(answers);
    updateProgress("calculation");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent border-theater-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple">
      <StepRenderer
        currentStep={currentStep}
        onNext={updateProgress}
        onAssessmentComplete={handleAssessmentComplete}
        assessmentAnswers={assessmentAnswers}
        skipCoachSelection={skipCoachSelection}
        handleCoachSelectionComplete={handleCoachSelectionComplete}
      />
    </div>
  );
};
