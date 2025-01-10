import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { WhyUseSection } from "@/components/WhyUseSection";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SparklesCore } from "@/components/ui/sparkles";

const Index = () => {
  const navigate = useNavigate();

  const handleLoginTransition = () => {
    const element = document.getElementById('landing-container');
    if (element) {
      element.classList.add('transitioning');
    }
    
    setTimeout(() => {
      navigate('/dashboard', { state: { fromLanding: true } });
    }, 1000);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.main 
        id="landing-container"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="min-h-screen w-full bg-gradient-to-b from-black to-theater-purple/90 relative overflow-hidden"
      >
        <div className="relative z-10">
          <Hero onLoginSuccess={handleLoginTransition} />
          <WhyUseSection />
          <Features />
        </div>
        
        <motion.div 
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <SparklesCore
            background="transparent"
            minSize={0.2}
            maxSize={0.8}
            particleDensity={70}
            className="w-full h-full"
            particleColor="#FFD700"
          />
        </motion.div>
      </motion.main>
    </AnimatePresence>
  );
};

export default Index;