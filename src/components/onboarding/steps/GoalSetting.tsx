
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface GoalSettingProps {
  onNext: () => void;
}

export const GoalSetting = ({ onNext }: GoalSettingProps) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goals = [
    { id: "technique", label: "Master advanced acting techniques" },
    { id: "auditions", label: "Improve audition success rate" },
    { id: "voice", label: "Enhance voice control and projection" },
    { id: "movement", label: "Develop better physical presence" },
    { id: "character", label: "Deepen character development skills" },
    { id: "performance", label: "Boost overall performance quality" },
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
      className="max-w-2xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6"
    >
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Set Your Acting Goals</h2>
        <p className="text-base sm:text-lg text-gray-300">Choose what you'd like to achieve with AI Acting Coach</p>
      </div>

      <div className="bg-black/30 p-4 sm:p-8 rounded-lg border border-theater-gold">
        <div className="grid grid-cols-1 gap-4">
          {goals.map(({ id, label }) => (
            <div key={id} className="flex items-center space-x-3 p-3 sm:p-4 rounded-lg hover:bg-white/5">
              <Checkbox
                id={id}
                checked={selectedGoals.includes(id)}
                onCheckedChange={() => handleGoalToggle(id)}
                className="w-5 h-5 sm:w-6 sm:h-6"
              />
              <Label htmlFor={id} className="text-white text-base sm:text-lg cursor-pointer">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={onNext}
          disabled={selectedGoals.length === 0}
          className="w-full sm:w-auto bg-theater-gold hover:bg-theater-gold/90 text-black font-bold px-6 sm:px-8 py-3"
        >
          Choose Your Coach
        </Button>
      </div>
    </motion.div>
  );
};
