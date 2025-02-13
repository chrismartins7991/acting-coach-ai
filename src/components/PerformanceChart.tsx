
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

export const PerformanceChart = () => {
  const [performances, setPerformances] = useState<PerformanceData[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isSubscribed } = useSubscription();

  const extractScore = (analysis: Json | null, voiceAnalysis: Json | null): number => {
    if (!analysis && !voiceAnalysis) return 0;

    // Try to extract score from various possible locations
    if (analysis && typeof analysis === 'object') {
      // Direct overall score
      if ('overallScore' in analysis) {
        return Number(analysis.overallScore) || 0;
      }
      // Nested in voice_feedback
      if (analysis.voice_feedback && typeof analysis.voice_feedback === 'object' && 'overallScore' in analysis.voice_feedback) {
        return Number(analysis.voice_feedback.overallScore) || 0;
      }
      // Nested in ai_feedback
      if (analysis.ai_feedback && typeof analysis.ai_feedback === 'object' && 'overallScore' in analysis.ai_feedback) {
        return Number(analysis.ai_feedback.overallScore) || 0;
      }
    }

    // Try voice analysis
    if (voiceAnalysis && typeof voiceAnalysis === 'object' && 'overallScore' in voiceAnalysis) {
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

        // Get user subscription start date
        const { data: userData, error: userError } = await supabase
          .from('user_usage')
          .select('created_at')
          .eq('user_id', user.id)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
          return;
        }

        const userStartDate = parseISO(userData.created_at);
        
        // Fetch from performances and performance_analysis tables
        const { data: performanceData, error: performanceError } = await supabase
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
          .eq('user_id', user.id);

        if (performanceError) {
          console.error("Error fetching performances:", performanceError);
          toast({
            title: "Error",
            description: "Failed to load performance data",
            variant: "destructive",
          });
          return;
        }

        // Also fetch from performance_results table
        const { data: resultsData, error: resultsError } = await supabase
          .from('performance_results')
          .select('*')
          .eq('user_id', user.id);

        if (resultsError) {
          console.error("Error fetching performance results:", resultsError);
        }

        // Combine and format all performance data
        let allPerformances = [...(performanceData || [])].map(p => {
          const performanceDate = parseISO(p.created_at);
          const daysSinceStart = differenceInDays(performanceDate, userStartDate) + 1;
          
          return {
            date: `Day ${daysSinceStart}`,
            day: daysSinceStart,
            score: p.performance_analysis?.[0]?.overall_score || 0,
            actualDate: format(performanceDate, 'MMM d, yyyy'),
            timestamp: performanceDate.getTime()
          };
        });

        // Add scores from performance_results
        if (resultsData) {
          const resultsPerformances = (resultsData as DatabasePerformanceResult[]).map(r => {
            const performanceDate = parseISO(r.created_at);
            const daysSinceStart = differenceInDays(performanceDate, userStartDate) + 1;
            
            const score = extractScore(r.analysis, r.voice_analysis);

            return {
              date: `Day ${daysSinceStart}`,
              day: daysSinceStart,
              score,
              actualDate: format(performanceDate, 'MMM d, yyyy'),
              timestamp: performanceDate.getTime()
            };
          });
          allPerformances = [...allPerformances, ...resultsPerformances];
        }

        // Remove duplicates, filter out 0 scores, and sort by day
        const uniquePerformances = allPerformances
          .filter(p => p.score > 0)
          .sort((a, b) => a.day - b.day)
          .map(({ date, day, score, actualDate }) => ({
            date,
            day,
            score,
            actualDate
          }));

        console.log("Combined performance data:", uniquePerformances);
        setPerformances(uniquePerformances);

        const { data: usageData, error: usageError } = await supabase
          .from('user_usage')
          .select('performance_count')
          .eq('user_id', user.id)
          .single();

        if (usageError) {
          console.error("Error fetching usage:", usageError);
          toast({
            title: "Error",
            description: "Failed to load points data",
            variant: "destructive",
          });
          return;
        }

        setTotalPoints(usageData?.performance_count || 0);
        console.log("Performance count:", usageData?.performance_count || 0);
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    if (isSubscribed) {
      fetchPerformanceData();
    }
  }, [user, toast, isSubscribed]);

  const chartConfig = {
    score: {
      theme: {
        light: "#FFD700",
        dark: "#FFD700"
      }
    }
  };

  return (
    <Card className="relative z-0 p-8 bg-black/30 backdrop-blur-sm border-white/10 overflow-hidden">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Performance Progress</h2>
          <div className="bg-theater-gold/20 px-4 py-2 rounded-full">
            <span className="text-theater-gold font-semibold">{totalPoints} Points</span>
          </div>
        </div>
        
        <div className="h-[350px] mt-6 relative">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={performances}
                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#ffffff20" 
                  horizontal={true}
                  vertical={true}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff60"
                  tick={{ fill: '#ffffff60' }}
                  tickLine={{ stroke: '#ffffff40' }}
                  axisLine={{ stroke: '#ffffff40' }}
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
