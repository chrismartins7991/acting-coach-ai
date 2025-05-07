
import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CoachPreferenceStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export const CoachPreferenceStep = ({ onNext, onSkip }: CoachPreferenceStepProps) => {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-theater-gold/20 shadow-lg"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your Path
          </h1>
          <p className="text-lg text-gray-300">
            Would you like to select a specific acting coach for your performance analysis?
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mt-12">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-lg border border-theater-gold/30 bg-black/30 text-center"
          >
            <h3 className="text-xl font-semibold text-white mb-3">
              Yes, I'll Choose a Coach
            </h3>
            <p className="text-gray-300 mb-4">
              Select from iconic coaches like Stanislavski, Strasberg, or Meisner to guide your feedback
            </p>
            <Button
              onClick={onNext}
              className="w-full bg-theater-gold hover:bg-theater-gold/80 text-black"
            >
              Choose My Coach
            </Button>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-lg border border-white/20 bg-black/30 text-center"
          >
            <h3 className="text-xl font-semibold text-white mb-3">
              No, Use Default Coach
            </h3>
            <p className="text-gray-300 mb-4">
              Skip coach selection and use our default methodology for your feedback
            </p>
            <Button
              onClick={onSkip}
              variant="outline"
              className="w-full border-white/30 hover:bg-white/10 text-white"
            >
              Use Default Coach
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
