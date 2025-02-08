
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

interface PerformanceData {
  date: string;
  score: number;
}

export const PerformanceChart = () => {
  const [performances, setPerformances] = useState<PerformanceData[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isSubscribed } = useSubscription();

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!user) {
        console.log("No authenticated user found");
        return;
      }

      try {
        console.log("Fetching performance data...");
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
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (performanceError) {
          console.error("Error fetching performances:", performanceError);
          toast({
            title: "Error",
            description: "Failed to load performance data",
            variant: "destructive",
          });
          return;
        }

        const formattedData = (performanceData || [])
          .filter(p => p.performance_analysis?.[0]?.overall_score !== null)
          .map(p => ({
            date: format(new Date(p.created_at), 'MMM d'),
            score: p.performance_analysis?.[0]?.overall_score || 0
          }));

        setPerformances(formattedData);
        console.log("Performance data:", formattedData);

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
    <Card className="relative z-0 p-6 bg-black/30 backdrop-blur-sm border-white/10 overflow-hidden">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Performance Progress</h2>
          <div className="bg-theater-gold/20 px-4 py-2 rounded-full">
            <span className="text-theater-gold font-semibold">{totalPoints} Points</span>
          </div>
        </div>
        
        <div className="h-[300px] mt-4 relative">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={performances}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff60"
                  tick={{ fill: '#ffffff60' }}
                />
                <YAxis 
                  stroke="#ffffff60"
                  tick={{ fill: '#ffffff60' }}
                  domain={[0, 100]}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <ChartTooltipContent>
                        <div className="text-sm">
                          <p>Score: {payload[0].value}</p>
                          <p>Date: {payload[0].payload.date}</p>
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
                  dot={{ fill: '#FFD700', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </Card>
  );
};
