
import { useLocation } from "react-router-dom";
import { TopMenu } from "@/components/TopMenu";
import { useVideoProcessing } from "@/hooks/useVideoProcessing";
import { useState } from "react";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { PerformanceSection } from "@/components/dashboard/PerformanceSection";
import { BackgroundEffects } from "@/components/dashboard/BackgroundEffects";
import { SkillProgressBar } from "@/components/dashboard/SkillProgressBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatsSection } from "@/components/dashboard/StatsSection";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PerformancesList } from "@/components/dashboard/PerformancesList";
import { MobileNavBar } from "@/components/dashboard/MobileNavBar";
import { PerformanceChart } from "@/components/PerformanceChart";

const Dashboard = () => {
  const location = useLocation();
  const { isProcessing: isAnalyzing } = useVideoProcessing();
  const isMobile = useIsMobile();
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    analysis: Analysis | null;
    voiceAnalysis: VoiceAnalysis | null;
  } | null>(null);
  const fromLanding = location.state?.fromLanding;

  const handleAnalysisComplete = (data: { analysis: Analysis; voiceAnalysis: VoiceAnalysis }) => {
    console.log("Analysis complete in Dashboard, setting state:", data);
    setCurrentAnalysis(data);
  };

  // Mock data for skills
  const skills = [
    { name: "Voice", progress: 65, color: "bg-purple-500" },
    { name: "Physical", progress: 42, color: "bg-red-500" },
    { name: "Emotion", progress: 78, color: "bg-yellow-500" },
    { name: "Character", progress: 53, color: "bg-green-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red text-white overflow-hidden">
      <TopMenu />
      
      <div className={`container mx-auto px-4 ${isMobile ? 'pt-20' : 'pt-28'} h-[calc(100vh-80px)]`}>
        <ScrollArea className="h-full pr-4">
          <DashboardHeader />
          
          <StatsSection />
          
          {/* Performance Chart - Add before skills section */}
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-bold mb-3">Performance Progress</h2>
            <PerformanceChart />
          </div>
          
          {/* Skill Progress - Below the stats */}
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-bold mb-3">Skill Progress</h2>
            <div className="bg-neutral-900 rounded-lg p-3 md:p-4 space-y-3">
              {skills.map((skill) => (
                <SkillProgressBar 
                  key={skill.name} 
                  name={skill.name} 
                  progress={skill.progress} 
                  color={skill.color}
                />
              ))}
            </div>
          </div>
          
          {currentAnalysis ? (
            <PerformanceSection
              currentAnalysis={currentAnalysis}
              isAnalyzing={isAnalyzing}
              onReset={() => setCurrentAnalysis(null)}
            />
          ) : (
            <PerformancesList performances={[
              {
                id: 1,
                title: "Macbeth Monologue",
                date: "May 15, 2025",
                score: 72,
                image: "https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg"
              },
              {
                id: 2,
                title: "Romeo & Juliet Scene",
                date: "May 10, 2025",
                score: 68,
                image: "https://images.pexels.com/photos/3214958/pexels-photo-3214958.jpeg"
              }
            ]} />
          )}
        </ScrollArea>
      </div>

      {/* Fixed bottom menu - only visible on mobile */}
      {isMobile && <MobileNavBar />}
    </div>
  );
};

export default Dashboard;
