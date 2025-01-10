import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { SparklesCore } from "./ui/sparkles";
import { FollowerPointerCard } from "./ui/following-pointer";

interface HeroProps {
  onLoginSuccess: () => void;
}

export const Hero = ({ onLoginSuccess }: HeroProps) => {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-theater-purple via-black to-theater-red">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/67fe6e0d-76fa-4723-8927-0f8ecb2f2409.png')] opacity-10 bg-center bg-cover" />
      
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
          
          {/* Lighting line effect with focused sparkles */}
          <div className="relative w-full h-[200px]">
            {/* Primary lighting line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-theater-gold to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-theater-gold to-transparent h-px w-3/4" />
            
            {/* Secondary lighting line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-theater-gold/50 to-transparent h-[3px] w-1/2 blur-md" />
            
            {/* Sparkles container with mask */}
            <div className="w-full h-full relative">
              <SparklesCore
                background="transparent"
                minSize={0.2}
                maxSize={0.6}
                particleDensity={20}
                className="w-full h-full"
                particleColor="#FFD700"
              />
              {/* Mask for downward particle flow */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]" />
            </div>
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
            {/* Start Free Trial button with enhanced hover effects */}
            <FollowerPointerCard>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-theater-gold opacity-30 blur group-hover:opacity-70 transition duration-500 group-hover:duration-200 animate-pulse"></div>
                <Button 
                  onClick={onLoginSuccess}
                  size="lg"
                  className="relative bg-black/50 hover:bg-black/80 text-theater-gold font-semibold border border-theater-gold/50 hover:border-theater-gold transition-all duration-300"
                >
                  Start Free Trial
                </Button>
              </div>
            </FollowerPointerCard>
            
            <Button 
              variant="link" 
              className="text-white hover:text-theater-gold"
            >
              Learn more →
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};