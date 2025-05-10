
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface GoalSettingScreenProps {
  onNext: () => void;
}

export const GoalSettingScreen = ({ onNext }: GoalSettingScreenProps) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goals = [
    { 
      id: "technique", 
      label: "Master advanced acting techniques", 
      description: "Learn and apply sophisticated methods with our AI Acting Coach",
      feature: "AI Acting Coach" 
    },
    { 
      id: "auditions", 
      label: "Book more auditions", 
      description: "Perfect your self-tapes with our professional-grade Studio",
      feature: "Self-Tape Studio" 
    },
    { 
      id: "voice", 
      label: "Enhance voice control and projection", 
      description: "Practice with our AI Reader for personalized feedback on delivery",
      feature: "Rehearsal Room - AI Reader" 
    },
    { 
      id: "memorization", 
      label: "Memorize scripts faster", 
      description: "Use our Line Memorization Tools with progressive learning techniques",
      feature: "Rehearsal Room - Line Memorization" 
    },
    { 
      id: "character", 
      label: "Create more authentic characters", 
      description: "Get methodology-based guidance from your chosen AI Coach",
      feature: "AI Acting Coach" 
    },
    { 
      id: "cold_reading", 
      label: "Improve cold reading skills", 
      description: "Practice with our specialized Cold Reading tools at your own pace",
      feature: "Rehearsal Room - Cold Reading" 
    },
  ];

  const handleGoalToggle = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) 
        ? prev.filter(g => g !== id)
        : [...prev, id]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-black to-theater-purple p-6 sm:p-8"
    >
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Set Your Acting Goals</h2>
          <p className="text-base sm:text-lg text-gray-300">
            Select what you want to achieve with AI Acting Coach's personalized tools
          </p>
        </div>

        <div className="bg-black/30 p-4 sm:p-8 rounded-lg border border-theater-gold">
          <div className="grid grid-cols-1 gap-4">
            {goals.map(({ id, label, description, feature }, index) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleGoalToggle(id)}
                  className={`w-full text-left flex items-center p-3 sm:p-4 rounded-lg hover:bg-white/5 transition-colors
                    ${selectedGoals.includes(id) ? 'bg-white/10' : ''}`}
                >
                  <div className={`w-6 h-6 flex-shrink-0 border-2 rounded mr-3 flex items-center justify-center
                    ${selectedGoals.includes(id) 
                      ? 'border-theater-gold bg-theater-gold' 
                      : 'border-white/30'}`}
                  >
                    {selectedGoals.includes(id) && (
                      <Check className="w-4 h-4 text-black" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-base sm:text-lg font-medium">{label}</h3>
                    <p className="text-gray-400 text-sm mb-1">{description}</p>
                    <span className="inline-block px-2 py-0.5 bg-theater-gold/20 text-theater-gold text-xs rounded-full">
                      {feature}
                    </span>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={onNext}
            disabled={selectedGoals.length === 0}
            className="w-full sm:w-auto bg-theater-gold hover:bg-theater-gold/90 text-black font-bold px-6 sm:px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Choose Your Coach
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
