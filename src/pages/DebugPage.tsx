import { useState } from "react";
import { VideoUpload } from "@/components/VideoUpload";
import { Card } from "@/components/ui/card";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";

export const DebugPage = () => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);

  const handleAnalysisComplete = (data: { analysis: Analysis | null; voiceAnalysis: VoiceAnalysis | null }) => {
    console.log("Debug: Received analysis data:", data);
    setAnalysis(data.analysis);
    setVoiceAnalysis(data.voiceAnalysis);
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-white">Debug: Raw Analysis Data</h1>
        
        <div className="mb-8">
          <VideoUpload 
            onAnalysisComplete={handleAnalysisComplete}
            isAnalyzing={false}
          />
        </div>

        {(analysis || voiceAnalysis) && (
          <div className="space-y-6">
            <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Video Analysis Raw Data:</h2>
              <pre className="text-white/80 overflow-auto max-h-[400px] p-4 bg-black/50 rounded">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            </Card>

            <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Voice Analysis Raw Data:</h2>
              <pre className="text-white/80 overflow-auto max-h-[400px] p-4 bg-black/50 rounded">
                {JSON.stringify(voiceAnalysis, null, 2)}
              </pre>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPage;