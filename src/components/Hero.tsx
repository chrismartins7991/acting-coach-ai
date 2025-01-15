import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { SparklesCore } from "./ui/sparkles";
import { MouseSparkles } from "./ui/mouse-sparkles";
import { LanguageToggle } from "./LanguageToggle";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-theater-purple via-black to-theater-red">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/67fe6e0d-76fa-4723-8927-0f8ecb2f2409.png')] opacity-10 bg-center bg-contain bg-no-repeat" />
      
      {/* Language controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
        <LanguageToggle />
        <Button 
          onClick={handleDashboardClick}
          size="lg"
          variant="outline"
          className="bg-black/30 hover:bg-white/20 text-white border-white/50 hover:border-white"
        >
          {t('hero.dashboard')}
        </Button>
      </div>

      <div className="relative w-full flex items-center justify-center h-full px-4 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-2"
          >
            {t('hero.title')}
          </motion.h1>
          
          {/* Lighting line effect */}
          <div className="relative w-full h-[40px] mb-6">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-theater-gold to-transparent h-[2px] w-1/2 blur-sm" />
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-theater-gold to-transparent h-px w-1/2" />
            
            <div className="absolute left-1/2 -translate-x-1/2 w-[300px] h-[40px]">
              <SparklesCore
                background="transparent"
                minSize={0.2}
                maxSize={0.4}
                particleDensity={100}
                className="w-full h-full"
                particleColor="#FFD700"
              />
            </div>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl leading-7 sm:leading-8 text-gray-300 mb-8 sm:mb-12 px-4"
          >
            {t('hero.subtitle')}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-theater-gold to-transparent rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-500 animate-pulse"></div>
              
              <div className="relative">
                <div className="absolute inset-0">
                  <MouseSparkles color="#FFD700" />
                </div>
                <Button 
                  onClick={handleDashboardClick}
                  size="lg"
                  className="relative bg-theater-gold hover:bg-theater-gold/90 text-theater-purple font-semibold"
                >
                  {t('hero.startTrial')}
                </Button>
              </div>
            </div>
            
            <Button 
              variant="link" 
              className="text-white hover:text-theater-gold"
            >
              {t('hero.learnMore')} →
            </Button>
          </motion.div>

          <p className="mt-4 text-sm text-gray-400">
            {t('hero.trialInfo')}
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
};