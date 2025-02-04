```typescript
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
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface Performance {
  id: string;
  title: string;
  created_at: string;
  ai_feedback: Analysis;
  voice_feedback: VoiceAnalysis;
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
          {selectedPerformance && (
            <Button
              variant="ghost"
              onClick={() => setSelectedPerformance(null)}
              className="text-white hover:text-theater-gold hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
          )}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            {selectedPerformance ? selectedPerformance.title : "Performance History"}
          </h1>
        </div>
        
        {selectedPerformance ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10"
          >
            <PerformanceAnalysis 
              analysis={selectedPerformance.ai_feedback}
              voiceAnalysis={selectedPerformance.voice_feedback}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {performances.map((performance) => (
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
                    <CardTitle className="text-white">{performance.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/60">
                      {format(new Date(performance.created_at), "PPpp")}
                    </p>
                    <div className="mt-4">
                      <div className="text-lg font-semibold text-theater-gold">
                        Score: {performance.ai_feedback.overallScore}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
```
