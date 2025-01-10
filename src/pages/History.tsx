import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { TopMenu } from "@/components/TopMenu";
import { PerformanceAnalysis } from "@/components/PerformanceAnalysis";
import { Analysis } from "@/utils/videoAnalysis/types";
import { Skeleton } from "@/components/ui/skeleton";

interface Performance {
  id: string;
  title: string;
  created_at: string;
  ai_feedback: Analysis;
}

const History = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);

  useEffect(() => {
    const fetchPerformances = async () => {
      try {
        const { data, error } = await supabase
          .from("performances")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setPerformances(data || []);
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

    fetchPerformances();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red">
        <TopMenu />
        <div className="container mx-auto px-4 py-8 pt-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <div className="container mx-auto px-4 py-8 pt-32">
        <h1 className="text-3xl font-bold text-white mb-8">Performance History</h1>
        
        {selectedPerformance ? (
          <div className="mb-8">
            <button
              onClick={() => setSelectedPerformance(null)}
              className="mb-4 text-white hover:text-theater-gold"
            >
              ← Back to History
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">{selectedPerformance.title}</h2>
            <PerformanceAnalysis analysis={selectedPerformance.ai_feedback} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {performances.map((performance) => (
              <Card
                key={performance.id}
                className="cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedPerformance(performance)}
              >
                <CardHeader>
                  <CardTitle>{performance.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {format(new Date(performance.created_at), "PPpp")}
                  </p>
                  <div className="mt-4">
                    <div className="text-lg font-semibold">
                      Score: {performance.ai_feedback.overallScore}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;