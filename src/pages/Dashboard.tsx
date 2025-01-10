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

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAnalyzing } = useVideoAnalysis();
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const fromLanding = location.state?.fromLanding;

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

  const temporaryUserId = "temp-user-id";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 5,
        staggerChildren: 1.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { duration: 2 }
    }
  };

  const lightBeamVariants = {
    initial: { scaleX: 0, opacity: 0 },
    animate: { 
      scaleX: 1, 
      opacity: [0, 1, 0.8, 0],
      transition: { 
        duration: 2,
        times: [0, 0.3, 0.6, 1]
      }
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
        {/* Immediate transition particles */}
        {fromLanding && (
          <motion.div 
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0.8, 0.4, 0],
              scale: [0.8, 1.2, 1, 0.9, 0.8],
            }}
            transition={{ 
              duration: 5,
              times: [0, 0.2, 0.4, 0.6, 1],
              delay: 0 // Immediate start
            }}
          >
            <SparklesCore
              background="transparent"
              minSize={0.2}
              maxSize={1}
              particleDensity={200}
              className="w-full h-full"
              particleColor="#FFD700"
            />
          </motion.div>
        )}

        {/* Component formation particles with lighting beams */}
        <motion.div variants={itemVariants}>
          <TopMenu />
        </motion.div>
        
        <motion.div 
          className="container mx-auto px-4 py-8 pt-32 max-w-7xl relative z-10"
          variants={containerVariants}
        >
          <motion.div 
            className="relative"
            variants={itemVariants}
          >
            <motion.h1 
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-8"
            >
              Welcome to Your Acting Studio
            </motion.h1>
            {/* Lighting beam effect */}
            <motion.div
              className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-theater-gold to-transparent origin-left"
              variants={lightBeamVariants}
              initial="initial"
              animate="animate"
            />
          </motion.div>

          <motion.div 
            className="space-y-8"
            variants={containerVariants}
          >
            {currentAnalysis ? (
              <motion.div 
                className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10 relative"
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
                <PerformanceAnalysis analysis={currentAnalysis} />
                {/* Component-specific particles */}
                <motion.div 
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SparklesCore
                    background="transparent"
                    minSize={0.1}
                    maxSize={0.4}
                    particleDensity={100}
                    className="w-full h-full"
                    particleColor="#FFD700"
                  />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                variants={containerVariants}
              >
                {[
                  <VideoUpload
                    key="upload"
                    userId={temporaryUserId}
                    onAnalysisComplete={setCurrentAnalysis}
                    isAnalyzing={isAnalyzing}
                  />,
                  ...features.map((feature, index) => (
                    <FeatureCard
                      key={feature.title}
                      {...feature}
                      delay={index * 1.2}
                    />
                  ))
                ].map((component, index) => (
                  <motion.div 
                    key={index}
                    className="relative"
                    variants={itemVariants}
                    custom={index}
                  >
                    {component}
                    {/* Component-specific lighting beam */}
                    <motion.div
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-theater-gold to-transparent origin-left"
                      variants={lightBeamVariants}
                      initial="initial"
                      animate="animate"
                      transition={{
                        delay: index * 0.8
                      }}
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