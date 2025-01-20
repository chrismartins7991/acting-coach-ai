import { VideoUpload } from "@/components/VideoUpload";
import { FeatureCard } from "@/components/FeatureCard";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { Camera, History } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturesGridProps {
  onAnalysisComplete: (data: { analysis: Analysis; voiceAnalysis: VoiceAnalysis }) => void;
  isAnalyzing: boolean;
  onViewHistory: () => void;
}

export const FeaturesGrid = ({ 
  onAnalysisComplete, 
  isAnalyzing, 
  onViewHistory 
}: FeaturesGridProps) => {
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
      onClick: onViewHistory,
    },
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 gap-6"
    >
      <motion.div>
        <VideoUpload
          onAnalysisComplete={onAnalysisComplete}
          isAnalyzing={isAnalyzing}
        />
      </motion.div>
      {features.map((feature, index) => (
        <motion.div key={feature.title}>
          <FeatureCard {...feature} delay={index * 0.1} />
        </motion.div>
      ))}
    </motion.div>
  );
};