import { SparklesCore } from "@/components/ui/sparkles";
import { motion } from "framer-motion";

interface BackgroundEffectsProps {
  fromLanding?: boolean;
}

export const BackgroundEffects = ({ fromLanding }: BackgroundEffectsProps) => {
  return (
    <>
      {fromLanding && (
        <motion.div 
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 3 }}
        >
          <SparklesCore
            background="transparent"
            minSize={0.2}
            maxSize={0.8}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFD700"
          />
        </motion.div>
      )}

      <div className="absolute top-0 left-0 w-full h-64 opacity-50 pointer-events-none">
        <SparklesCore
          background="transparent"
          minSize={0.2}
          maxSize={0.8}
          particleDensity={70}
          className="w-full h-full"
          particleColor="#FFD700"
        />
      </div>

      <motion.div 
        className="absolute right-0 top-1/4 w-64 h-96 opacity-40 pointer-events-none"
      >
        <SparklesCore
          background="transparent"
          minSize={0.1}
          maxSize={0.6}
          particleDensity={50}
          className="w-full h-full"
          particleColor="#FFD700"
        />
      </motion.div>

      <motion.div 
        className="absolute left-0 bottom-0 w-96 h-64 opacity-30 pointer-events-none"
      >
        <SparklesCore
          background="transparent"
          minSize={0.2}
          maxSize={0.7}
          particleDensity={60}
          className="w-full h-full"
          particleColor="#FFD700"
        />
      </motion.div>
    </>
  );
};