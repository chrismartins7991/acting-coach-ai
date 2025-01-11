import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { SparklesCore } from "./ui/sparkles";
import { useTranslation } from "react-i18next";

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection = ({ onGetStarted }: CTASectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/iconic-movie-frames/The_Godfather_Marlon_Brando_aiactingcoach.jpeg')] opacity-10 bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('cta.subtitle')}
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
              onClick={onGetStarted}
              size="lg"
              className="bg-theater-gold hover:bg-theater-gold/90 text-theater-purple font-semibold text-lg px-8 py-6"
            >
              {t('cta.button')}
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-gray-400">
            {t('cta.trialInfo')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};