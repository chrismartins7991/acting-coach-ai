import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface PerformanceData {
  date: string;
  score: number;
}

export const PerformanceChart = () => {
  const [performances, setPerformances] = useState<PerformanceData[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      console.log("Fetching performance data...");
      const { data: performanceData, error: performanceError } = await supabase
        .from('performances')
        .select('created_at, ai_feedback')
        .order('created_at', { ascending: true });

      if (performanceError) {
        console.error("Error fetching performances:", performanceError);
        return;
      }

      const formattedData = performanceData
        .filter(p => p.ai_feedback && p.ai_feedback.overallScore)
        .map(p => ({
          date: format(new Date(p.created_at), 'MMM d'),
          score: p.ai_feedback.overallScore
        }));

      setPerformances(formattedData);
      console.log("Performance data:", formattedData);

      // Fetch total points
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('total_points')
        .single();

      if (pointsError) {
        console.error("Error fetching points:", pointsError);
        return;
      }

      if (pointsData) {
        setTotalPoints(pointsData.total_points);
        console.log("Total points:", pointsData.total_points);
      }
    };

    fetchPerformanceData();
  }, []);

  return (
    <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Performance Progress</h2>
          <div className="bg-theater-gold/20 px-4 py-2 rounded-full">
            <span className="text-theater-gold font-semibold">{totalPoints} Points</span>
          </div>
        </div>
        
        <div className="h-[300px] mt-4">
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performances}>
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