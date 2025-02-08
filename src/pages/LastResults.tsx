
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TopMenu } from "@/components/TopMenu";
import { PerformanceAnalysis } from "@/components/PerformanceAnalysis";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

const LastResults = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }

        console.log("Fetching last results for user:", user.id);
        const { data: preferences, error: preferencesError } = await supabase
          .from('user_coach_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (preferencesError) {
          console.error("Error fetching preferences:", preferencesError);
          if (preferencesError.code === 'PGRST116') {
            throw new Error('Please complete the coach selection process first.');
          }
          throw preferencesError;
        }

        const { data, error } = await supabase
          .from('performance_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching results:", error);
          if (error.code === 'PGRST116') {
            throw new Error('No performance results found. Try uploading a new video.');
          }
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
            title: "Analysis Complete",
            description: "Your performance has been analyzed. Here are your results!",
            variant: "default",
          });
        }
      } catch (error: any) {
        console.error("Error fetching results:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: error.message || "Failed to load your performance results.",
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
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-theater-gold" />
            <p className="text-white mt-4">Loading your results...</p>
          </div>
        ) : error ? (
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <div className="text-white text-center py-12">
              <p className="text-lg mb-4">{error}</p>
              <Button
                onClick={() => navigate('/upload')}
                className="bg-theater-gold hover:bg-theater-gold/80 text-black"
              >
                Upload a Video
              </Button>
            </div>
          </div>
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
            <p className="text-lg mb-4">No performance results found.</p>
            <Button
              onClick={() => navigate('/upload')}
              className="bg-theater-gold hover:bg-theater-gold/80 text-black"
            >
              Upload a Video
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LastResults;
