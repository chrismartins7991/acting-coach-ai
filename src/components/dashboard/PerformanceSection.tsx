
import { Button } from "@/components/ui/button";
import { PerformanceAnalysis } from "@/components/PerformanceAnalysis";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/useSubscription";

interface PerformanceSectionProps {
  currentAnalysis: {
    analysis: Analysis | null;
    voiceAnalysis: VoiceAnalysis | null;
  };
  isAnalyzing: boolean;
  onReset: () => void;
}

export const PerformanceSection = ({ 
  currentAnalysis, 
  isAnalyzing,
  onReset 
}: PerformanceSectionProps) => {
  const { isSubscribed } = useSubscription();

  return (
    <motion.div 
      className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">Performance Analysis</h2>
        <div className="flex items-center gap-2">
          {isSubscribed && currentAnalysis.analysis && (
            <span className="text-sm text-theater-gold">
              Score: {currentAnalysis.analysis.overallScore}%
            </span>
          )}
          <Button
            variant="outline"
            onClick={onReset}
            className="text-white hover:text-theater-gold border-white/20 hover:bg-white/10"
          >
            Upload Another Video
          </Button>
        </div>
      </div>
      <PerformanceAnalysis 
        analysis={currentAnalysis.analysis}
        voiceAnalysis={currentAnalysis.voiceAnalysis}
        isLoading={isAnalyzing}
      />
    </motion.div>
  );
};
