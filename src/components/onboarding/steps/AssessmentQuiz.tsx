
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AssessmentQuizProps {
  onNext: () => void;
}

export const AssessmentQuiz = ({ onNext }: AssessmentQuizProps) => {
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);

  const challenges = [
    { id: "emotion", label: "Emotional expression" },
    { id: "voice", label: "Voice projection" },
    { id: "movement", label: "Physical movement" },
    { id: "character", label: "Character development" },
    { id: "technique", label: "Acting technique" },
    { id: "confidence", label: "Performance confidence" },
  ];

  const handleChallengeToggle = (id: string) => {
    setSelectedChallenges(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Quick Assessment</h2>
        <p className="text-gray-300">Select the areas you'd like to improve</p>
      </div>

      <div className="bg-black/30 p-8 rounded-lg border border-theater-gold">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map(({ id, label }) => (
            <div key={id} className="flex items-center space-x-3">
              <Checkbox
                id={id}
                checked={selectedChallenges.includes(id)}
                onCheckedChange={() => handleChallengeToggle(id)}
              />
              <Label htmlFor={id} className="text-white">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          disabled={selectedChallenges.length === 0}
          className="bg-theater-gold hover:bg-theater-gold/90 text-black font-bold px-8 py-3"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
};
