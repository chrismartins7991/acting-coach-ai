
import { WelcomeScreen } from "./steps/WelcomeScreen";
import { ExperienceScreen } from "./steps/ExperienceScreen";
import { AssessmentQuiz } from "./steps/AssessmentQuiz";
import { CalculationScreen } from "./steps/CalculationScreen";
import { ResultsScreen } from "./steps/ResultsScreen";
import { GoalSettingScreen } from "./steps/GoalSettingScreen";
import { CoachSelection } from "./CoachSelection";
import { SignupStep } from "./steps/SignupStep";
import { CoachPreferenceStep } from "./steps/CoachPreferenceStep";
import { OnboardingUploadStep } from "./steps/OnboardingUploadStep";
import { OnboardingStep } from "@/hooks/useOnboardingProgress";

interface StepRendererProps {
  currentStep: OnboardingStep;
  onNext: (nextStep: OnboardingStep) => void;
  onAssessmentComplete: (answers: Record<string, string>) => void;
  assessmentAnswers: Record<string, string>;
  skipCoachSelection: () => void;
  handleCoachSelectionComplete: () => void;
}

export const StepRenderer = ({
  currentStep,
  onNext,
  onAssessmentComplete,
  assessmentAnswers,
  skipCoachSelection,
  handleCoachSelectionComplete
}: StepRendererProps) => {
  console.info(`Rendering step: ${currentStep}`);
  
  switch (currentStep) {
    case "welcome":
      return <WelcomeScreen onNext={() => onNext("signup")} />;
    case "signup":
      return <SignupStep onNext={() => onNext("experience")} />;
    case "experience":
      return <ExperienceScreen onNext={() => onNext("assessment")} />;
    case "assessment":
      return <AssessmentQuiz onNext={onAssessmentComplete} />;
    case "calculation":
      return <CalculationScreen onNext={() => onNext("results")} />;
    case "results":
      return <ResultsScreen onNext={() => onNext("goals")} assessmentAnswers={assessmentAnswers} />;
    case "goals":
      return <GoalSettingScreen onNext={() => onNext("coach-preference")} />;
    case "coach-preference":
      return <CoachPreferenceStep 
              onNext={() => onNext("coach-selection")}
              onSkip={skipCoachSelection}
            />;
    case "coach-selection":
      return <CoachSelection onComplete={handleCoachSelectionComplete} />;
    case "upload":
      return <OnboardingUploadStep onBack={() => onNext("coach-preference")} />;
    default:
      return <WelcomeScreen onNext={() => onNext("signup")} />;
  }
};
