
import { useEffect } from "react";
import { motion } from "framer-motion";

interface ProgressCalculationProps {
  onNext: () => void;
}

export const ProgressCalculation = ({ onNext }: ProgressCalculationProps) => {
  useEffect(() => {
    // Simulate calculation time
    const timer = setTimeout(onNext, 3000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto text-center space-y-8"
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="w-24 h-24 border-4 border-theater-gold border-t-transparent rounded-full animate-spin" />
        <h2 className="text-2xl font-bold text-white">Analyzing Your Profile</h2>
        <p className="text-gray-300">Creating your personalized acting journey...</p>
      </div>
    </motion.div>
  );
};
