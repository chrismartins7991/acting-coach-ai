import { useNavigate, useLocation } from "react-router-dom";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";
import { motion, AnimatePresence } from "framer-motion";
import { PerformanceChart } from "@/components/PerformanceChart";
import { TopMenu } from "@/components/TopMenu";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { BackgroundEffects } from "@/components/dashboard/BackgroundEffects";
import { PerformanceSection } from "@/components/dashboard/PerformanceSection";
import { FeaturesGrid } from "@/components/dashboard/FeaturesGrid";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAnalyzing } = useVideoAnalysis();
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    analysis: Analysis | null;
    voiceAnalysis: VoiceAnalysis | null;
  } | null>(null);
  const fromLanding = location.state?.fromLanding;

  const handleViewHistory = () => {
    navigate('/history');
  };

  const handleAnalysisComplete = (data: { analysis: Analysis; voiceAnalysis: VoiceAnalysis }) => {
    console.log("Analysis complete in Dashboard, setting state:", data);
    setCurrentAnalysis(data);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 1,
        staggerChildren: 0.2 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 } 
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <BackgroundEffects fromLanding={fromLanding} />

        <motion.div variants={itemVariants}>
          <TopMenu />
        </motion.div>
        
        <motion.div 
          className="container mx-auto px-4 py-8 pt-32 max-w-7xl relative z-10"
          variants={containerVariants}
        >
          <motion.h1 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-8"
            variants={itemVariants}
          >
            Welcome to Your Acting Studio
          </motion.h1>

          <motion.div 
            className="space-y-8"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <PerformanceChart />
            </motion.div>

            {currentAnalysis ? (
              <PerformanceSection
                currentAnalysis={currentAnalysis}
                isAnalyzing={isAnalyzing}
                onReset={() => setCurrentAnalysis(null)}
              />
            ) : (
              <FeaturesGrid
                onAnalysisComplete={handleAnalysisComplete}
                isAnalyzing={isAnalyzing}
                onViewHistory={handleViewHistory}
              />
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Dashboard;