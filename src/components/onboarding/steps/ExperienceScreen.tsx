
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface ExperienceLevel {
  id: string;
  label: string;
  description: string;
}

const experienceLevels: ExperienceLevel[] = [
  {
    id: "beginner",
    label: "Beginner",
    description: "I'm new to acting or have only done a few projects"
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "I have some experience with acting in various settings"
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "I have significant professional or academic acting experience"
  },
  {
    id: "professional",
    label: "Professional",
    description: "I act professionally and want to refine my technique"
  }
];

interface ExperienceScreenProps {
  onNext: () => void;
}

export const ExperienceScreen = ({ onNext }: ExperienceScreenProps) => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedLevel) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple p-6 sm:p-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">What's your acting experience?</h2>
          <p className="text-gray-300">This helps us tailor our coaching to match your current skill level.</p>
        </div>
        
        <div className="space-y-3 mb-8">
          {experienceLevels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => setSelectedLevel(level.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all
                  ${selectedLevel === level.id 
                    ? "border-theater-gold bg-neutral-800" 
                    : "border-neutral-800 bg-neutral-900 hover:bg-neutral-800"
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{level.label}</h3>
                    <p className="text-sm text-gray-400">{level.description}</p>
                  </div>
                  {selectedLevel === level.id && (
                    <div className="bg-theater-gold rounded-full p-1">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={handleNext}
            disabled={!selectedLevel}
            className="bg-theater-gold hover:bg-theater-gold/90 text-black font-bold px-8 py-3 w-full"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
