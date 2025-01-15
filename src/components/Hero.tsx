import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { SparklesCore } from "./ui/sparkles";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-theater-purple">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/iconic-movie-frames/The_Godfather_Marlon_Brando_aiactingcoach.jpeg')] opacity-10 bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Scene Perfect
          </h1>
          
          <p className="text-2xl md:text-3xl text-theater-gold font-semibold mb-4">
            Your Personal Acting Coach, Powered by AI
          </p>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Upload your acting scene and receive instant, professional-level feedback. 
            Perfect your performance with AI-powered analysis of emotions, body language, and vocal delivery.
          </p>

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
              className="bg-theater-gold hover:bg-theater-gold/90 text-theater-purple font-semibold text-lg px-8 py-6"
            >
              Start Your Free Analysis
            </Button>
          </div>

          <p className="mt-6 text-sm text-gray-400">
            No sign-up required - Get 2 scene analyses per month for free
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              {
                title: "Emotion Analysis",
                description: "Get scored on emotional authenticity"
              },
              {
                title: "Body Language",
                description: "Detailed physical presence feedback"
              },
              {
                title: "Vocal Delivery",
                description: "Voice modulation and clarity analysis"
              },
              {
                title: "Pro Comparison",
                description: "Compare with professional actors"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
                className="p-6 rounded-lg bg-black/30 backdrop-blur-sm border border-theater-gold/20"
              >
                <h3 className="text-xl font-semibold text-theater-gold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};