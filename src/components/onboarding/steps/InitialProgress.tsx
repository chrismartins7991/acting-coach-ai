
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface InitialProgressProps {
  onNext: () => void;
}

export const InitialProgress = ({ onNext }: InitialProgressProps) => {
  const [experience, setExperience] = useState<string>("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Your Acting Journey</h2>
        <p className="text-gray-300">Let's understand where you are in your acting career</p>
      </div>

      <div className="bg-black/30 p-8 rounded-lg border border-theater-gold space-y-6">
        <RadioGroup
          value={experience}
          onValueChange={setExperience}
          className="space-y-4"
        >
          {[
            { value: "beginner", label: "Just starting out (0-2 years)" },
            { value: "intermediate", label: "Some experience (2-5 years)" },
            { value: "advanced", label: "Experienced actor (5+ years)" },
            { value: "professional", label: "Professional actor" }
          ].map(({ value, label }) => (
            <div key={value} className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
              experience === value 
                ? 'bg-theater-gold/20 border border-theater-gold' 
                : 'hover:bg-white/5'
            }`}>
              <RadioGroupItem value={value} id={value} className="border-theater-gold" />
              <Label 
                htmlFor={value} 
                className={`text-lg ${
                  experience === value 
                    ? 'text-theater-gold font-semibold' 
                    : 'text-white'
                }`}
              >
                {label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          disabled={!experience}
          className="bg-theater-gold hover:bg-theater-gold/90 text-black font-bold px-8 py-3"
        >
          Continue to Assessment
        </Button>
      </div>
    </motion.div>
  );
};
