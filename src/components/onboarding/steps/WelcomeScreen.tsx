
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onNext: () => void;
}

export const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8"
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
        AI ACTING COACH
      </h1>
      <h2 className="text-lg sm:text-xl md:text-2xl text-theater-gold">
        Your Personal Path to Stardom
      </h2>
      <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto">
        Powered by advanced AI that understands the art of performance
      </p>
      
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto my-8 sm:my-12">
        <div className="absolute inset-0 bg-theater-gold/20 rounded-full animate-ping" />
        <div className="relative z-10 w-full h-full bg-theater-gold/30 rounded-full flex items-center justify-center">
          <span className="text-4xl sm:text-5xl">🎭</span>
        </div>
      </div>

      <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4">
        Join thousands of actors who've transformed their careers with personalized AI coaching
      </p>

      <Button 
        onClick={onNext}
        className="w-full sm:w-auto bg-theater-gold hover:bg-theater-gold/90 text-black font-bold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6"
      >
        Discover Your Acting Potential
      </Button>
    </motion.div>
  );
};
