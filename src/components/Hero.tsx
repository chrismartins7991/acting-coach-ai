import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { SparklesCore } from "./ui/sparkles";

interface HeroProps {
  onLoginSuccess: () => void;
}

export const Hero = ({ onLoginSuccess }: HeroProps) => {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-theater-purple via-black to-theater-red">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/67fe6e0d-76fa-4723-8927-0f8ecb2f2409.png')] opacity-10 bg-center bg-contain bg-no-repeat translate-y-[10vh]" />
      
      {/* Login button positioned in upper right */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          onClick={onLoginSuccess}
          size="lg"
          variant="outline"
          className="bg-black/30 hover:bg-white/20 text-white border-white/50 hover:border-white"
        >
          Login
        </Button>
      </div>

      <div className="relative w-full flex items-center justify-center min-h-screen px-4 py-12 sm:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 sm:mb-8"
          >
            Your AI Acting Coach
          </motion.h1>
          
          {/* Lighting line effect */}
          <div className="relative w-full h-[60px] mb-6">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-theater-gold to-transparent h-[2px] w-1/2 blur-sm" />
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-theater-gold to-transparent h-px w-1/2" />
            
            {/* Subtle particles below title */}
            <SparklesCore
              background="transparent"
              minSize={0.2}
              maxSize={0.6}
              particleDensity={40}
              className="w-full h-full"
              particleColor="#FFD700"
            />
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl leading-7 sm:leading-8 text-gray-300 mb-8 sm:mb-12 px-4"
          >
            Master your craft with personalized feedback based on Stanislavski, Brecht, Lee Strasberg and Chekhov methods.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            {/* Start Free Trial button with beam effect wrapper */}
            <div className="relative group">
              {/* Beam effect container */}
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-theater-gold to-transparent rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-500 animate-pulse"></div>
              
              <Button 
                onClick={onLoginSuccess}
                size="lg"
                className="relative bg-theater-gold hover:bg-theater-gold/90 text-theater-purple font-semibold"
              >
                Start Free Trial
              </Button>
            </div>
            
            <Button 
              variant="link" 
              className="text-white hover:text-theater-gold"
            >
              Learn more →
            </Button>
          </motion.div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
};