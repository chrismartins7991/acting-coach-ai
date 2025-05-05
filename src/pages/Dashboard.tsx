
import { useLocation } from "react-router-dom";
import { TopMenu } from "@/components/TopMenu";
import { useVideoProcessing } from "@/hooks/useVideoProcessing";
import { useState, useEffect } from "react";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { PerformanceSection } from "@/components/dashboard/PerformanceSection";
import { SkillProgressBar } from "@/components/dashboard/SkillProgressBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatsSection } from "@/components/dashboard/StatsSection";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PerformancesList } from "@/components/dashboard/PerformancesList";
import { MobileNavBar } from "@/components/dashboard/MobileNavBar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

const Dashboard = () => {
  const location = useLocation();
  const { isProcessing: isAnalyzing } = useVideoProcessing();
  const isMobile = useIsMobile();
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    analysis: Analysis | null;
    voiceAnalysis: VoiceAnalysis | null;
  } | null>(null);
  const fromLanding = location.state?.fromLanding;
  const { user } = useAuth();
  const { toast } = useToast();
  const [performances, setPerformances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPerformances = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Fetch the most recent performance results
        const { data: resultsData, error: resultsError } = await supabase
          .from('performance_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (resultsError) throw resultsError;
        
        if (resultsData && resultsData.length > 0) {
          // Convert the JSON data from Supabase to strongly typed objects
          const analysisData = resultsData[0].analysis as Json;
          const voiceAnalysisData = resultsData[0].voice_analysis as Json;
          
          setCurrentAnalysis({
            analysis: analysisData as unknown as Analysis,
            voiceAnalysis: voiceAnalysisData as unknown as VoiceAnalysis
          });
        } else {
          // If no results, fetch performances for the list view
          const { data: performanceData, error: performanceError } = await supabase
            .from('performances')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          if (performanceError) throw performanceError;
          
          if (performanceData) {
            const formattedPerformances = performanceData.map(perf => ({
              id: perf.id,
              title: perf.title,
              date: new Date(perf.created_at).toLocaleDateString(),
              score: Math.floor(Math.random() * 30) + 60, // Placeholder score if not available
              image: "https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg" // Placeholder image
            }));
            setPerformances(formattedPerformances);
          }
        }
      } catch (error) {
        console.error("Error fetching performances:", error);
        toast({
          title: "Error",
          description: "Failed to load your performance data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPerformances();
  }, [user, toast]);

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
      
      <div className={`container mx-auto px-4 ${isMobile ? 'pt-20 pb-24' : 'pt-28 pb-8'} h-[calc(100vh-80px)]`}>
        <ScrollArea className="h-full pr-4">
          <DashboardHeader />
          
          <StatsSection />
          
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
          
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-theater-gold" />
              <span className="ml-2 text-white">Loading your performances...</span>
            </div>
          ) : currentAnalysis ? (
            <PerformanceSection
              currentAnalysis={currentAnalysis}
              isAnalyzing={isAnalyzing}
              onReset={() => setCurrentAnalysis(null)}
            />
          ) : (
            <PerformancesList performances={performances.length > 0 ? performances : [
              {
                id: 1,
                title: "Record your first performance",
                date: "Get started today",
                score: 0,
                image: "https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg"
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
