
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AssessmentQuizProps {
  onNext: () => void;
}

export const AssessmentQuiz = ({ onNext }: AssessmentQuizProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    {
      id: "practice",
      text: "How often do you practice acting?",
      options: [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "2-3 times per week" },
        { value: "monthly", label: "A few times per month" },
        { value: "rarely", label: "Rarely" }
      ]
    },
    {
      id: "style",
      text: "What's your preferred acting style?",
      options: [
        { value: "method", label: "Method Acting" },
        { value: "classical", label: "Classical" },
        { value: "improv", label: "Improvisational" },
        { value: "naturalistic", label: "Naturalistic" }
      ]
    },
    {
      id: "challenge",
      text: "What's your biggest challenge in acting?",
      options: [
        { value: "emotion", label: "Emotional expression" },
        { value: "voice", label: "Voice projection" },
        { value: "character", label: "Character development" },
        { value: "technique", label: "Technical skills" }
      ]
    },
    {
      id: "goals",
      text: "What's your primary acting goal?",
      options: [
        { value: "professional", label: "Professional career" },
        { value: "hobby", label: "Serious hobby" },
        { value: "social", label: "Social/Community theater" },
        { value: "skills", label: "Personal skill development" }
      ]
    }
  ];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isComplete = questions.every(q => answers[q.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6"
    >
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Quick Assessment</h2>
        <p className="text-base sm:text-lg text-gray-300">Help us understand your acting preferences</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="bg-black/30 p-4 sm:p-6 rounded-lg border border-theater-gold">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">{question.text}</h3>
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              className="space-y-2 sm:space-y-3"
            >
              {question.options.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    answers[question.id] === option.value
                      ? 'bg-theater-gold/20 border border-theater-gold'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <RadioGroupItem 
                    value={option.value} 
                    id={`${question.id}-${option.value}`}
                    className="border-theater-gold"
                  />
                  <Label
                    htmlFor={`${question.id}-${option.value}`}
                    className={`text-base sm:text-lg ${
                      answers[question.id] === option.value
                        ? 'text-theater-gold font-semibold'
                        : 'text-white'
                    }`}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onNext}
          disabled={!isComplete}
          className="w-full sm:w-auto bg-theater-gold hover:bg-theater-gold/90 text-black font-bold px-6 sm:px-8 py-3"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
};
