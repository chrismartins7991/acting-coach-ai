import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, History } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TopMenu } from "@/components/TopMenu";
import { useState } from "react";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";
import { PerformanceAnalysis } from "@/components/PerformanceAnalysis";
import { VideoUpload } from "@/components/VideoUpload";
import { FeatureCard } from "@/components/FeatureCard";
import { SparklesCore } from "@/components/ui/sparkles";
import { motion, AnimatePresence } from "framer-motion";
import { PerformanceChart } from "@/components/PerformanceChart";
import { useAuth } from "@/contexts/AuthContext";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAnalyzing } = useVideoAnalysis();
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    analysis: Analysis | null;
    voiceAnalysis: VoiceAnalysis | null;
  } | null>(null);
  const fromLanding = location.state?.fromLanding;
  const { user } = useAuth();

  const handleViewHistory = () => {
    navigate('/history');
  };

  const features = [
    {
      title: "Record Performance",
      description: "Use your camera to record a new performance",
      icon: Camera,
      color: "from-theater-purple to-theater-gold",
      onClick: () => console.log("Record performance clicked"),
    },
    {
      title: "View History",
      description: "Review your past performances and feedback",
      icon: History,
      color: "from-theater-purple to-theater-gold",
      onClick: handleViewHistory,
    },
  ];

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
        {/* Transition particles */}
        {fromLanding && (
          <motion.div 
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 3 }}
          >
            <SparklesCore
              background="transparent"
              minSize={0.2}
              maxSize={0.8}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#FFD700"
            />
          </motion.div>
        )}

        {/* Background particles */}
        <div className="absolute top-0 left-0 w-full h-64 opacity-50 pointer-events-none">
          <SparklesCore
            background="transparent"
            minSize={0.2}
            maxSize={0.8}
            particleDensity={70}
            className="w-full h-full"
            particleColor="#FFD700"
          />
        </div>

        <motion.div 
          variants={itemVariants}
          className="absolute right-0 top-1/4 w-64 h-96 opacity-40 pointer-events-none"
        >
          <SparklesCore
            background="transparent"
            minSize={0.1}
            maxSize={0.6}
            particleDensity={50}
            className="w-full h-full"
            particleColor="#FFD700"
          />
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="absolute left-0 bottom-0 w-96 h-64 opacity-30 pointer-events-none"
        >
          <SparklesCore
            background="transparent"
            minSize={0.2}
            maxSize={0.7}
            particleDensity={60}
            className="w-full h-full"
            particleColor="#FFD700"
          />
        </motion.div>

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
              <motion.div 
                className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10"
                variants={itemVariants}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <h2 className="text-xl md:text-2xl font-bold text-white">Performance Analysis</h2>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentAnalysis(null)}
                    className="text-white hover:text-theater-gold border-white/20 hover:bg-white/10"
                  >
                    Upload Another Video
                  </Button>
                </div>
                <PerformanceAnalysis 
                  analysis={currentAnalysis.analysis} 
                  voiceAnalysis={currentAnalysis.voiceAnalysis}
                />
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <VideoUpload
                    onAnalysisComplete={setCurrentAnalysis}
                    isAnalyzing={isAnalyzing}
                  />
                </motion.div>
                {features.map((feature, index) => (
                  <motion.div 
                    key={feature.title}
                    variants={itemVariants}
                  >
                    <FeatureCard
                      {...feature}
                      delay={index * 0.1}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Dashboard;