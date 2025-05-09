
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { TopMenu } from "@/components/TopMenu";
import { PerformanceAnalysis } from "@/components/PerformanceAnalysis";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Json } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";

interface Performance {
  id: string;
  title: string;
  created_at: string;
  ai_feedback?: Analysis;
  voice_feedback?: VoiceAnalysis;
  overall_score?: number;
}

const History = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoachPreference = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('user_coach_preferences')
          .select('selected_coach')
          .eq('user_id', user.id)
          .single();
          
        if (data?.selected_coach) {
          setSelectedCoach(data.selected_coach);
        }
      } catch (error) {
        console.error("Error fetching coach preference:", error);
      }
    };
    
    fetchCoachPreference();
  }, [user]);

  useEffect(() => {
    const fetchAllPerformances = async () => {
      if (!user) return;

      try {
        // Fetch performances with analysis
        const { data: performanceData, error: performanceError } = await supabase
          .from('performances')
          .select(`
            id,
            title,
            created_at,
            performance_analysis (
              ai_feedback,
              voice_feedback,
              overall_score
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (performanceError) throw performanceError;

        // Fetch additional results from performance_results
        const { data: resultData, error: resultError } = await supabase
          .from('performance_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (resultError) throw resultError;

        // Transform performance data with proper type casting
        const transformedPerformances = (performanceData || []).map(perf => ({
          id: perf.id,
          title: perf.title || 'Untitled Performance',
          created_at: perf.created_at,
          ai_feedback: perf.performance_analysis?.[0]?.ai_feedback as unknown as Analysis | undefined,
          voice_feedback: perf.performance_analysis?.[0]?.voice_feedback as unknown as VoiceAnalysis | undefined,
          overall_score: perf.performance_analysis?.[0]?.overall_score
        }));

        // Transform result data with proper type casting
        const transformedResults = (resultData || []).map(result => ({
          id: result.id,
          title: 'Performance Analysis',
          created_at: result.created_at,
          ai_feedback: result.analysis as unknown as Analysis | undefined,
          voice_feedback: result.voice_analysis as unknown as VoiceAnalysis | undefined,
          overall_score: calculateOverallScore(result.analysis as Json, result.voice_analysis as Json)
        }));

        // Combine and sort all results
        const allPerformances = [...transformedPerformances, ...transformedResults]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setPerformances(allPerformances);
      } catch (error: any) {
        console.error("Error fetching performances:", error);
        toast({
          title: "Error",
          description: "Failed to load performance history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllPerformances();
  }, [user, toast]);

  const calculateOverallScore = (aiAnalysis: Json | null, voiceAnalysis: Json | null): number => {
    const aiScore = aiAnalysis && typeof aiAnalysis === 'object' && 'overallScore' in aiAnalysis 
      ? Number(aiAnalysis.overallScore) 
      : undefined;
    
    const voiceScore = voiceAnalysis && typeof voiceAnalysis === 'object' && 'overallScore' in voiceAnalysis 
      ? Number(voiceAnalysis.overallScore) 
      : undefined;

    if (aiScore !== undefined && voiceScore !== undefined) {
      return Math.round((aiScore + voiceScore) / 2);
    }
    
    return aiScore ?? voiceScore ?? 0;
  };

  const getOverallScore = (performance: Performance) => {
    if (performance.overall_score !== undefined) {
      return performance.overall_score;
    }
    
    const aiScore = performance.ai_feedback?.overallScore;
    const voiceScore = performance.voice_feedback?.overallScore;
    
    if (aiScore !== undefined && voiceScore !== undefined) {
      return Math.round((aiScore + voiceScore) / 2);
    }
    
    return aiScore ?? voiceScore ?? 0;
  };

  const handleShareResults = () => {
    toast({
      title: "Feature coming soon",
      description: "Sharing results will be available in a future update.",
    });
  };

  const handleDownloadResults = () => {
    if (!selectedPerformance) return;
    
    const analysisData = JSON.stringify({
      analysis: selectedPerformance.ai_feedback,
      voiceAnalysis: selectedPerformance.voice_feedback,
      date: selectedPerformance.created_at,
      coach: selectedCoach
    }, null, 2);
    
    const blob = new Blob([analysisData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-analysis-${new Date(selectedPerformance.created_at).toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Analysis Downloaded",
      description: "Your performance analysis has been downloaded as a JSON file.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red">
        <TopMenu />
        <div className="container mx-auto px-4 py-8 pt-32 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red">
      <TopMenu />
      <div className="container mx-auto px-4 py-8 pt-32 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          {selectedPerformance ? (
            <Button
              variant="ghost"
              onClick={() => setSelectedPerformance(null)}
              className="text-white hover:text-theater-gold hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
          ) : (
            <Link to="/dashboard" className="text-white hover:text-theater-gold">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            {selectedPerformance ? selectedPerformance.title : "Performance History"}
          </h1>
          {selectedCoach && !selectedPerformance && (
            <div className="ml-auto">
              <span className="bg-theater-gold/20 text-theater-gold px-3 py-1 rounded-full text-sm border border-theater-gold/50">
                {selectedCoach} Method
              </span>
            </div>
          )}
        </div>
        
        {selectedPerformance ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10"
                onClick={handleShareResults}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10"
                onClick={handleDownloadResults}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <PerformanceAnalysis 
                analysis={selectedPerformance.ai_feedback || null}
                voiceAnalysis={selectedPerformance.voice_feedback || null}
                methodology={selectedCoach}
              />
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {performances.length > 0 ? (
              performances.map((performance) => (
                <motion.div
                  key={performance.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card
                    className="cursor-pointer hover:scale-105 transition-transform duration-200 bg-black/30 backdrop-blur-sm border-white/10"
                    onClick={() => setSelectedPerformance(performance)}
                  >
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Database className="h-4 w-4 mr-2 text-theater-gold" />
                        {performance.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/60">
                        {format(new Date(performance.created_at), "PPpp")}
                      </p>
                      <div className="mt-4">
                        <div className="text-lg font-semibold text-theater-gold">
                          Score: {getOverallScore(performance)}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-white/60 p-12 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10">
                <Database className="h-12 w-12 mx-auto mb-4 text-white/30" />
                <h3 className="text-white text-lg font-medium mb-2">No Performance History</h3>
                <p className="mb-6">Upload your first performance to get started with AI-powered analysis.</p>
                <Link to="/upload">
                  <Button className="bg-theater-gold hover:bg-theater-gold/80 text-black">
                    Upload Performance
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
