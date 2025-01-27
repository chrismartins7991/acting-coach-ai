import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { SparklesCore } from "./ui/sparkles";
import { useTranslation } from "react-i18next";
import { AuthModal } from "./AuthModal";

export const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-theater-purple via-black to-theater-red">
      <div className="absolute inset-0 w-full h-full bg-black/50" />
      
      {/* Logo */}
      <div className="absolute top-4 left-4 z-20">
        <img 
          src="/AI-ACTING-COACH-Favicon.ico" 
          alt="AI Acting Coach Logo" 
          className="w-12 h-12 object-contain"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Your AI Acting Coach
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed max-w-3xl mx-auto">
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
                className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-semibold text-lg px-8 py-6 relative z-10 transition-all duration-300 hover:scale-105"
              >
                Start Free Trial
              </Button>
            </div>

            <AuthModal
              buttonText="Sign In"
              variant="link"
              className="text-white hover:text-theater-gold text-lg font-medium"
            />
          </div>

          <p className="mt-6 text-sm text-gray-400">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};