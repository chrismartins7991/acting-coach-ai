import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, History } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { TopMenu } from "@/components/TopMenu";
import { useState } from "react";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";
import { PerformanceAnalysis } from "@/components/PerformanceAnalysis";
import { VideoUpload } from "@/components/VideoUpload";
import { FeatureCard } from "@/components/FeatureCard";
import { Chat } from "@/components/Chat";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAnalyzing } = useVideoAnalysis();
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  if (!user) {
    return <Navigate to="/" replace />;
  }

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

  const handleViewHistory = () => {
    navigate('/history');
  };

  const features = [
    {
      title: "Record Performance",
      description: "Use your camera to record a new performance",
      icon: Camera,
      color: "from-theater-purple to-theater-gold",
      onClick: () => console.log("Record performance clicked"),
    },
    {
      title: "View History",
      description: "Review your past performances and feedback",
      icon: History,
      color: "from-theater-purple to-theater-gold",
      onClick: handleViewHistory,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red">
      <TopMenu />
      
      <div className="container mx-auto px-4 py-8 pt-32 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            Welcome to Your Acting Studio
          </h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-white border-white/20 hover:text-theater-gold hover:bg-white/10 bg-black/30"
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-8">
            {currentAnalysis ? (
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <h2 className="text-xl md:text-2xl font-bold text-white">Performance Analysis</h2>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentAnalysis(null)}
                    className="text-white hover:text-theater-gold border-white/20 hover:bg-white/10"
                  >
                    Upload Another Video
                  </Button>
                </div>
                <PerformanceAnalysis analysis={currentAnalysis} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <VideoUpload
                  userId={user.id}
                  onAnalysisComplete={setCurrentAnalysis}
                  isAnalyzing={isAnalyzing}
                />
                {features.map((feature, index) => (
                  <FeatureCard
                    key={feature.title}
                    {...feature}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="h-full">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;