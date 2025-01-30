import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { SparklesCore } from "./ui/sparkles";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";

export const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-theater-purple via-black to-theater-red">
      <div className="absolute inset-0 w-full h-full bg-black/50" />
      
      {/* Logo - positioned with margin to prevent overlap */}
      <div className={`absolute z-20 ${isMobile ? 'top-24 left-1/2 -translate-x-1/2' : 'top-4 left-4'}`}>
        <img 
          src="/AI Acting Coach Logo-nobackground.png" 
          alt="AI Acting Coach Logo" 
          className={`object-contain ${isMobile ? 'w-[90vw] max-w-[500px] h-auto' : 'w-16 h-16'}`}
          loading="eager"
          fetchPriority="high"
        />
      </div>

      {/* Login Button in top right */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={() => navigate('/login')}
          variant="outline"
          className="text-black bg-white border-white/20 hover:bg-white/90 px-4 py-1 text-sm"
        >
          Login
        </Button>
      </div>
      
      <div className={`container mx-auto px-4 relative z-10 ${isMobile ? 'mt-72 pt-12' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-8xl font-bold text-white mb-4 tracking-tight">
            Your AI Acting Coach
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
            Master your craft with personalized feedback based on Stanislavski, Brecht, Lee Strasberg and Chekhov methods.
          </p>

          <div className="flex items-center justify-center gap-6">
            <div className="relative">
              <div className="absolute inset-0">
                <SparklesCore
                  background="transparent"
                  minSize={0.4}
                  maxSize={1}
                  particleDensity={100}
                  className="w-full h-full"
                  particleColor="#FFD700"
                />
              </div>
              
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-semibold text-base px-6 py-5 relative z-10 transition-all duration-300 hover:scale-105"
              >
                Analyse my Performance
              </Button>
            </div>

            {/* "Start the Trial" button - hidden on mobile */}
            {!isMobile && (
              <Button
                onClick={handleGetStarted}
                variant="link"
                className="text-[#6B1525] hover:text-theater-gold text-lg font-medium"
              >
                Start the Trial
              </Button>
            )}
          </div>

          <p className="mt-4 text-sm text-gray-400">
            This app was made by actors, for actors • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};