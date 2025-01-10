import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SparklesCore } from "@/components/ui/sparkles";

const Index = () => {
  const navigate = useNavigate();

  const handleLoginTransition = () => {
    // Navigate immediately but keep the transition animation
    navigate('/dashboard', { state: { fromLanding: true } });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.main 
        id="landing-container"
        initial={{ opacity: 1 }}
        exit={{ 
          opacity: 0,
          transition: { duration: 2.5 }
        }}
        className="min-h-screen w-full bg-gradient-to-b from-black to-theater-purple/90 relative overflow-hidden"
      >
        <div className="relative z-10">
          <Hero onLoginSuccess={handleLoginTransition} />
          <Features />
        </div>
        
        {/* Enhanced transition particles with immediate start */}
        <motion.div 
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: [1, 1, 0.8],
            scale: [1, 1.2, 1.5],
            transition: { 
              duration: 5,
              times: [0, 0.7, 1],
              ease: "easeInOut"
            }
          }}
        >
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={200}
            className="w-full h-full"
            particleColor="#FFD700"
          />
        </motion.div>

        {/* Add global lighting beam effect */}
        <motion.div
          className="fixed inset-0 pointer-events-none z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: [0, 1, 0],
            transition: {
              duration: 5,
              times: [0, 0.5, 1],
              ease: "easeInOut"
            }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-theater-gold/20 to-transparent animate-pulse" />
        </motion.div>
      </motion.main>
    </AnimatePresence>
  );
};

export default Index;
