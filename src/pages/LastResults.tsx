
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TopMenu } from "@/components/TopMenu";
import { PerformanceAnalysis } from "@/components/PerformanceAnalysis";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LastResults = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        console.log("Fetching last results for user:", user?.id);
        const { data, error } = await supabase
          .from('performance_results')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching results:", error);
          throw error;
        }

        console.log("Fetched results:", data);

        if (data) {
          // Parse and validate the analysis data
          if (data.analysis && typeof data.analysis === 'object' && 'overallScore' in data.analysis) {
            console.log("Setting analysis data:", data.analysis);
            setAnalysis(data.analysis as unknown as Analysis);
          } else {
            console.log("Invalid analysis data:", data.analysis);
          }
          
          // Parse and validate the voice analysis data
          if (data.voice_analysis && typeof data.voice_analysis === 'object' && 'overallScore' in data.voice_analysis) {
            console.log("Setting voice analysis data:", data.voice_analysis);
            setVoiceAnalysis(data.voice_analysis as unknown as VoiceAnalysis);
          } else {
            console.log("Invalid voice analysis data:", data.voice_analysis);
          }
        }

        // Show success message if redirected from payment
        const success = searchParams.get('success');
        if (success === 'true') {
          toast({
            title: "Payment Successful",
            description: "Thank you for your subscription. Here are your performance results.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        toast({
          title: "Error",
          description: "Failed to load your performance results.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchLastResults();
    }
  }, [user, toast, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red">
      <TopMenu />
      <div className="container mx-auto px-4 py-8 pt-32 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/upload')}
            className="text-white hover:text-theater-gold hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Button>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            Performance Results
          </h1>
        </div>

        {isLoading ? (
          <div className="text-white">Loading results...</div>
        ) : analysis || voiceAnalysis ? (
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <PerformanceAnalysis
              analysis={analysis}
              voiceAnalysis={voiceAnalysis}
              isLoading={false}
            />
          </div>
        ) : (
          <div className="text-white text-center py-12">
            No performance results found. Try uploading a new video.
          </div>
        )}
      </div>
    </div>
  );
};

export default LastResults;
