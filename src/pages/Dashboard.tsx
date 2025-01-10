import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, History } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TopMenu } from "@/components/TopMenu";
import { useState } from "react";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";
import { PerformanceAnalysis } from "@/components/PerformanceAnalysis";
import { VideoUpload } from "@/components/VideoUpload";
import { FeatureCard } from "@/components/FeatureCard";
import { Chat } from "@/components/Chat";
import { SparklesCore } from "@/components/ui/sparkles";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAnalyzing } = useVideoAnalysis();
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  if (!user) {
    return <Navigate to="/" replace />;
  }

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
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red relative overflow-hidden">
      {/* Top sparkles */}
      <div className="absolute top-0 left-0 w-full h-64 opacity-50 pointer-events-none">
        <SparklesCore
          background="transparent"
          minSize={0.2}
          maxSize={0.8}
          particleDensity={70}
          className="w-full h-full"
          particleColor="#FFD700"
        />
      </div>

      {/* Right side sparkles */}
      <div className="absolute right-0 top-1/4 w-64 h-96 opacity-40 pointer-events-none">
        <SparklesCore
          background="transparent"
          minSize={0.1}
          maxSize={0.6}
          particleDensity={50}
          className="w-full h-full"
          particleColor="#FFD700"
        />
      </div>

      {/* Bottom left sparkles */}
      <div className="absolute left-0 bottom-0 w-96 h-64 opacity-30 pointer-events-none">
        <SparklesCore
          background="transparent"
          minSize={0.2}
          maxSize={0.7}
          particleDensity={60}
          className="w-full h-full"
          particleColor="#FFD700"
        />
      </div>

      <TopMenu />
      
      <div className="container mx-auto px-4 py-8 pt-32 max-w-7xl relative z-10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-8">
          Welcome to Your Acting Studio
        </h1>

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