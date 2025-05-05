
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TopMenu } from "@/components/TopMenu";
import { PerformanceAnalysis } from "@/components/PerformanceAnalysis";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const LastResults = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);

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

        // Store the selected coach for display
        if (preferences?.selected_coach) {
          setSelectedCoach(preferences.selected_coach);
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

  const handleShareResults = () => {
    toast({
      title: "Feature coming soon",
      description: "Sharing results will be available in a future update.",
    });
  };

  const handleDownloadResults = () => {
    if (!analysis) return;
    
    const analysisData = JSON.stringify({
      analysis,
      voiceAnalysis,
      date: new Date().toISOString(),
      coach: selectedCoach
    }, null, 2);
    
    const blob = new Blob([analysisData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-analysis-${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Analysis Downloaded",
      description: "Your performance analysis has been downloaded as a JSON file.",
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <TopMenu />
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 pt-24 sm:pt-32 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/upload')}
            className="text-white hover:text-theater-gold hover:bg-white/10 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            Performance Results
          </h1>
          
          {selectedCoach && (
            <div className="ml-auto hidden sm:block">
              <span className="bg-theater-gold/20 text-theater-gold px-3 py-1 rounded-full text-sm border border-theater-gold/50">
                {selectedCoach} Method
              </span>
            </div>
          )}
        </div>
        
        {selectedCoach && (
          <div className="mb-4 sm:hidden">
            <span className="bg-theater-gold/20 text-theater-gold px-3 py-1 rounded-full text-sm border border-theater-gold/50">
              {selectedCoach} Method
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Loader2 className="h-8 w-8 animate-spin text-theater-gold" />
            <p className="text-white mt-4">Loading your results...</p>
          </div>
        ) : error ? (
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/10">
            <div className="text-white text-center py-8 sm:py-12">
              <p className="text-base sm:text-lg mb-4">{error}</p>
              <Button
                onClick={() => navigate('/upload')}
                className="bg-theater-gold hover:bg-theater-gold/80 text-black"
              >
                Upload a Video
              </Button>
            </div>
          </div>
        ) : analysis || voiceAnalysis ? (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
            
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 sm:p-6 border border-white/10">
              <PerformanceAnalysis
                analysis={analysis}
                voiceAnalysis={voiceAnalysis}
                isLoading={false}
                methodology={selectedCoach}
              />
            </div>
          </motion.div>
        ) : (
          <div className="text-white text-center py-8 sm:py-12">
            <p className="text-base sm:text-lg mb-4">No performance results found.</p>
            <Button
              onClick={() => navigate('/upload')}
              className="bg-theater-gold hover:bg-theater-gold/80 text-black"
            >
              Upload a Video
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LastResults;
