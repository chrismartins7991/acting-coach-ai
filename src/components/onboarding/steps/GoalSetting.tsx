
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
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Set Your Acting Goals</h2>
        <p className="text-gray-300">Choose what you'd like to achieve with AI Acting Coach</p>
      </div>

      <div className="bg-black/30 p-8 rounded-lg border border-theater-gold">
        <div className="grid grid-cols-1 gap-4">
          {goals.map(({ id, label }) => (
            <div key={id} className="flex items-center space-x-3">
              <Checkbox
                id={id}
                checked={selectedGoals.includes(id)}
                onCheckedChange={() => handleGoalToggle(id)}
              />
              <Label htmlFor={id} className="text-white">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          disabled={selectedGoals.length === 0}
          className="bg-theater-gold hover:bg-theater-gold/90 text-black font-bold px-8 py-3"
        >
          Choose Your Coach
        </Button>
      </div>
    </motion.div>
  );
};
