import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { SparklesCore } from "@/components/ui/sparkles";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginTransition = () => {
    // Start the transition animation with longer duration
    const element = document.getElementById('landing-container');
    if (element) {
      element.classList.add('transitioning');
    }
    
    // Navigate to dashboard after longer animation
    setTimeout(() => {
      navigate('/dashboard', { state: { fromLanding: true } });
    }, 5000); // Extended to 5 seconds
  };

  return (
    <AnimatePresence mode="wait">
      <motion.main 
        id="landing-container"
        initial={{ opacity: 1 }}
        exit={{ 
          opacity: 0,
          transition: { duration: 2.5 } // Slower fade out
        }}
        className="min-h-screen w-full bg-gradient-to-b from-black to-theater-purple/90 relative overflow-hidden"
      >
        <div className="relative z-10">
          <Hero onLoginSuccess={handleLoginTransition} />
          <Features />
        </div>
        
        {/* Enhanced transition particles */}
        <motion.div 
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: [1, 1, 0.8],
            scale: [1, 1.2, 1.5],
            transition: { 
              duration: 5,
              times: [0, 0.7, 1]
            }
          }}
        >
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFD700"
          />
        </motion.div>
      </motion.main>
    </AnimatePresence>
  );
};

export default Index;