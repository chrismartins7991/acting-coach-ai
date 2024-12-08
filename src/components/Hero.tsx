import { motion } from "framer-motion";
import { AuthModal } from "./AuthModal";
import { Button } from "./ui/button";

export const Hero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/67fe6e0d-76fa-4723-8927-0f8ecb2f2409.png')] opacity-10 bg-center bg-cover" />
      
      <div className="relative container mx-auto px-4 py-32 sm:py-48">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
          >
            Your AI Acting Coach
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-gray-300"
          >
            Master your craft with personalized feedback based on Stanislavski, Brecht, and Chekhov methods.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <AuthModal />
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