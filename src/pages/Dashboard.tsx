import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, FileVideo, History, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { TopMenu } from "@/components/TopMenu";
import { useState } from "react";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";
import { PerformanceAnalysis } from "@/components/PerformanceAnalysis";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const { analyzeVideo, isAnalyzing } = useVideoAnalysis();
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setCurrentAnalysis(null);
      console.log("Starting video upload...");

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log("Uploading file to path:", filePath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("Video uploaded successfully, getting public URL...");
      
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      console.log("Public URL generated:", publicUrl);
      console.log("Starting AI analysis...");
      
      const analysis = await analyzeVideo({
        videoUrl: publicUrl,
        title: file.name,
        userId: user.id
      });

      setCurrentAnalysis(analysis.ai_feedback);

      toast({
        title: "Analysis Complete",
        description: "Your performance has been analyzed successfully!",
      });

    } catch (error) {
      console.error("Error processing video:", error);
      toast({
        title: "Error",
        description: "There was an error processing your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "Come back soon!",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red">
      <TopMenu />
      
      <div className="container mx-auto px-4 py-8 pt-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome to Your Acting Studio</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-white hover:text-theater-gold"
          >
            Logout
          </Button>
        </div>

        {currentAnalysis ? (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Performance Analysis</h2>
              <Button
                variant="outline"
                onClick={() => setCurrentAnalysis(null)}
                className="text-white hover:text-theater-gold"
              >
                Upload Another Video
              </Button>
            </div>
            <PerformanceAnalysis analysis={currentAnalysis} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group cursor-pointer"
            >
              <label className={`block p-6 rounded-lg bg-gradient-to-br from-theater-purple to-theater-gold transform transition-all duration-300 group-hover:scale-105 shadow-xl ${isUploading || isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading || isAnalyzing}
                />
                <div className="text-center">
                  <Upload className="w-12 h-12 text-white mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold text-white mb-2">Upload Video</h3>
                  <p className="text-white/80">Upload an existing video for analysis</p>
                  {(isUploading || isAnalyzing) && (
                    <p className="text-white/80 mt-2">
                      {isUploading ? 'Uploading...' : 'Analyzing...'}
                    </p>
                  )}
                </div>
              </label>
            </motion.div>

            {[
              {
                title: "Record Performance",
                description: "Use your camera to record a new performance",
                icon: Camera,
                color: "from-theater-purple to-theater-gold",
              },
              {
                title: "View History",
                description: "Review your past performances and feedback",
                icon: History,
                color: "from-theater-purple to-theater-gold",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className={`p-6 rounded-lg bg-gradient-to-br ${feature.color} transform transition-all duration-300 group-hover:scale-105 shadow-xl`}>
                  <feature.icon className="w-12 h-12 text-white mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/80">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;