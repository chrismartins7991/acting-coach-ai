
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface CalculationScreenProps {
  onNext: () => void;
}

export const CalculationScreen = ({ onNext }: CalculationScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentLabelIndex, setCurrentLabelIndex] = useState(0);

  const calculationLabels = [
    'Analyzing acting style...',
    'Evaluating performance tendencies...',
    'Calculating strengths and areas for growth...',
    'Preparing personalized recommendations...',
  ];

  useEffect(() => {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Change the label every 750ms
    const labelInterval = setInterval(() => {
      setCurrentLabelIndex(prevIndex => (prevIndex + 1) % calculationLabels.length);
    }, 750);

    // Navigate to results after 3 seconds
    const timer = setTimeout(() => {
      onNext();
    }, 3000);

    // Clean up
    return () => {
      clearInterval(progressInterval);
      clearInterval(labelInterval);
      clearTimeout(timer);
    };
  }, [onNext]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple flex items-center justify-center p-6">
      <motion.div 
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
          Analyzing Your Responses
        </h2>
        
        <div className="flex justify-center mb-8">
          <div className="relative w-20 h-20">
            <motion.div 
              className="absolute inset-0 border-4 border-theater-gold border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5, 
                ease: "linear" 
              }}
            />
          </div>
        </div>
        
        <p className="text-gray-300 mb-4 h-6">
          {calculationLabels[currentLabelIndex]}
        </p>
        
        <div className="w-full mb-6">
          <Progress value={progress} className="h-2 bg-neutral-800" 
            indicatorClassName="bg-theater-gold" />
        </div>
      </motion.div>
    </div>
  );
};
