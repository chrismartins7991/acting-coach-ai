import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { differenceInDays, format, parseISO } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { Json } from "@/integrations/supabase/types";

interface PerformanceData {
  date: string;
  day: number;
  score: number;
  actualDate: string;
}

interface DatabasePerformanceResult {
  id: string;
  created_at: string;
  analysis: Json;
  voice_analysis: Json;
  user_id: string;
}

interface AnalysisJson {
  overallScore?: number;
  voice_feedback?: {
    overallScore?: number;
  };
  ai_feedback?: {
    overallScore?: number;
  };
}

export const PerformanceChart = () => {
  const [performances, setPerformances] = useState<PerformanceData[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isSubscribed } = useSubscription();

  const extractScore = (analysis: Json | null, voiceAnalysis: Json | null): number => {
    if (!analysis && !voiceAnalysis) return 0;

    if (analysis && typeof analysis === 'object' && !Array.isArray(analysis)) {
      const typedAnalysis = analysis as AnalysisJson;
      
      // Direct overall score
      if ('overallScore' in analysis) {
        return Number(analysis.overallScore) || 0;
      }
      
      // Nested in voice_feedback
      if (typedAnalysis.voice_feedback?.overallScore !== undefined) {
        return Number(typedAnalysis.voice_feedback.overallScore) || 0;
      }
      
      // Nested in ai_feedback
      if (typedAnalysis.ai_feedback?.overallScore !== undefined) {
        return Number(typedAnalysis.ai_feedback.overallScore) || 0;
      }
    }

    // Try voice analysis
    if (voiceAnalysis && typeof voiceAnalysis === 'object' && !Array.isArray(voiceAnalysis) && 'overallScore' in voiceAnalysis) {
      return Number(voiceAnalysis.overallScore) || 0;
    }

    return 0;
  };

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!user) {
        console.log("No authenticated user found");
        return;
      }

      try {
        console.log("Fetching performance data...");

        // First get user subscription start date from user_usage
        const { data: userData, error: userError } = await supabase
          .from('user_usage')
          .select('created_at, subscription_tier')
          .eq('user_id', user.id)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
          return;
        }

        const userStartDate = parseISO(userData.created_at);
        console.log("User start date:", userStartDate);

        // Fetch all performance data
        const [performanceResults, performanceAnalysis] = await Promise.all([
          // Get performance_results
          supabase
            .from('performance_results')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true }),
          
          // Get performances with analysis
          supabase
            .from('performances')
            .select(`
              id,
              created_at,
              performance_analysis (
                overall_score,
                ai_feedback,
                voice_feedback
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
        ]);

        console.log("Performance results:", performanceResults.data);
        console.log("Performance analysis:", performanceAnalysis.data);

        // Combine and process performance data
        let allPerformances: any[] = [];

        // Add performance results data
        if (performanceResults.data) {
          const resultsData = performanceResults.data.map(result => {
            const performanceDate = parseISO(result.created_at);
            const daysSinceStart = differenceInDays(performanceDate, userStartDate) + 1;
            const score = extractScore(result.analysis, result.voice_analysis);
            
            console.log(`Processing result from ${result.created_at}, score: ${score}`);
            
            return {
              date: `Day ${daysSinceStart}`,
              day: daysSinceStart,
              score,
              actualDate: format(performanceDate, 'MMM d, yyyy')
            };
          });
          allPerformances = [...allPerformances, ...resultsData];
        }

        // Add performance analysis data
        if (performanceAnalysis.data) {
          const analysisData = performanceAnalysis.data.map(perf => {
            const performanceDate = parseISO(perf.created_at);
            const daysSinceStart = differenceInDays(performanceDate, userStartDate) + 1;
            const score = perf.performance_analysis?.[0]?.overall_score || 0;
            
            console.log(`Processing analysis from ${perf.created_at}, score: ${score}`);
            
            return {
              date: `Day ${daysSinceStart}`,
              day: daysSinceStart,
              score,
              actualDate: format(performanceDate, 'MMM d, yyyy')
            };
          });
          allPerformances = [...allPerformances, ...analysisData];
        }

        // Filter valid scores and sort by day
        const validPerformances = allPerformances
          .filter(p => p.score > 0)
          .sort((a, b) => a.day - b.day);

        console.log("Final processed performances:", validPerformances);
        setPerformances(validPerformances);

        // Get total points
        const { data: usageData } = await supabase
          .from('user_usage')
          .select('performance_count')
          .eq('user_id', user.id)
          .single();

        setTotalPoints(usageData?.performance_count || 0);

      } catch (error) {
        console.error("Error fetching performance data:", error);
        toast({
          title: "Error",
          description: "Failed to load performance data",
          variant: "destructive",
        });
      }
    };

    if (isSubscribed && user) {
      fetchPerformanceData();
    }
  }, [user, toast, isSubscribed]);

  const chartConfig = {
    score: {
      label: "Score",
      theme: {
        light: "#FFD700",
        dark: "#FFD700"
      }
    }
  };

  return (
    <Card className="relative z-0 p-8 bg-black/30 backdrop-blur-sm border-white/10 overflow-hidden mb-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Performance Progress</h2>
          <div className="bg-theater-gold/20 px-4 py-2 rounded-full">
            <span className="text-theater-gold font-semibold">{totalPoints} Points</span>
          </div>
        </div>
        
        <div className="h-[400px] mt-6">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={performances}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#ffffff20" 
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff60"
                  tick={{ fill: '#ffffff60' }}
                  tickLine={{ stroke: '#ffffff40' }}
                  axisLine={{ stroke: '#ffffff40' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#ffffff60"
                  tick={{ fill: '#ffffff60' }}
                  tickLine={{ stroke: '#ffffff40' }}
                  axisLine={{ stroke: '#ffffff40' }}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <ChartTooltipContent>
                        <div className="text-sm font-medium space-y-1">
                          <p className="text-theater-gold">Score: {payload[0].value}%</p>
                          <p className="text-white/80">{payload[0].payload.date}</p>
                          <p className="text-white/60 text-xs">{payload[0].payload.actualDate}</p>
                        </div>
                      </ChartTooltipContent>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#FFD700"
                  strokeWidth={2}
                  dot={{
                    r: 6,
                    fill: '#FFD700',
                    stroke: '#FFFFFF',
                    strokeWidth: 2
                  }}
                  activeDot={{
                    r: 8,
                    fill: '#FFD700',
                    stroke: '#FFFFFF',
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </Card>
  );
};
