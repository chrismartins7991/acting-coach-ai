
import { useState } from "react";
import { TopMenu } from "@/components/TopMenu";
import { SelfTapeStudio } from "@/components/self-tape/SelfTapeStudio";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavBar } from "@/components/dashboard/MobileNavBar";

const SelfTapeStudioPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TopMenu />
        
        <div className={`container mx-auto px-4 ${isMobile ? 'pt-20 pb-24' : 'pt-28 pb-8'} relative z-10`}>
          <motion.h1 
            className="text-2xl md:text-3xl font-bold text-white mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Self-Tape Studio
          </motion.h1>
          
          <SelfTapeStudio />
        </div>
        
        {/* Fixed bottom menu - only visible on mobile */}
        {isMobile && <MobileNavBar />}
      </motion.div>
    </AnimatePresence>
  );
};

export default SelfTapeStudioPage;
