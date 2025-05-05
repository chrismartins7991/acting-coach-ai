import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TopMenu } from "@/components/TopMenu";
import { useVideoProcessing } from "@/hooks/useVideoProcessing";
import { useState } from "react";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { PerformanceSection } from "@/components/dashboard/PerformanceSection";
import { ChevronRight, Activity, Award, Clock, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { BackgroundEffects } from "@/components/dashboard/BackgroundEffects";
import { SkillProgressBar } from "@/components/dashboard/SkillProgressBar";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isProcessing: isAnalyzing } = useVideoProcessing();
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    analysis: Analysis | null;
    voiceAnalysis: VoiceAnalysis | null;
  } | null>(null);
  const fromLanding = location.state?.fromLanding;

  const handleViewHistory = () => {
    navigate('/history');
  };

  const handleAnalysisComplete = (data: { analysis: Analysis; voiceAnalysis: VoiceAnalysis }) => {
    console.log("Analysis complete in Dashboard, setting state:", data);
    setCurrentAnalysis(data);
  };

  // Mock data for recent performances
  const recentPerformances = [
    {
      id: 1,
      title: "Macbeth Monologue",
      date: "May 15, 2025",
      score: 72,
      image: "https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg"
    },
    {
      id: 2,
      title: "Romeo & Juliet Scene",
      date: "May 10, 2025",
      score: 68,
      image: "https://images.pexels.com/photos/3214958/pexels-photo-3214958.jpeg"
    }
  ];

  // Mock data for skills
  const skills = [
    { name: "Voice", progress: 65, color: "bg-purple-500" },
    { name: "Physical", progress: 42, color: "bg-red-500" },
    { name: "Emotion", progress: 78, color: "bg-yellow-500" },
    { name: "Character", progress: 53, color: "bg-green-500" }
  ];

  // Stats
  const stats = [
    { 
      value: 7, 
      label: "Sessions", 
      icon: <Activity className="h-6 w-6 text-purple-400" /> 
    },
    { 
      value: 12, 
      label: "Hours", 
      icon: <Clock className="h-6 w-6 text-red-400" /> 
    },
    { 
      value: 3, 
      label: "Skills", 
      icon: <Award className="h-6 w-6 text-yellow-400" /> 
    }
  ];

  // For the progress circle in the top right
  const overallProgress = 68;

  return (
    <div className="min-h-screen bg-black text-white">
      <BackgroundEffects fromLanding={fromLanding} />
      <TopMenu />
      
      <div className="container mx-auto px-4 py-8 pt-20 pb-28 max-w-7xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-gray-400 mb-1">Welcome back,</p>
            <h1 className="text-3xl font-bold">{user?.user_metadata?.full_name || "Actor"}</h1>
          </div>
          
          <div className="relative h-20 w-20 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#333"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#FFD700"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - overallProgress / 100)}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="absolute text-lg font-bold">{overallProgress}%</span>
            <span className="absolute -bottom-6 text-xs text-gray-400">Progress</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-neutral-900 rounded-lg p-6 flex flex-col items-center justify-center text-center"
            >
              {stat.icon}
              <span className="text-3xl font-bold mt-2">{stat.value}</span>
              <span className="text-gray-400 text-sm">{stat.label}</span>
            </div>
          ))}
        </div>
        
        {currentAnalysis ? (
          <PerformanceSection
            currentAnalysis={currentAnalysis}
            isAnalyzing={isAnalyzing}
            onReset={() => setCurrentAnalysis(null)}
          />
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">Recent Performances</h2>
              <button 
                className="text-sm text-gray-400 flex items-center"
                onClick={handleViewHistory}
              >
                See All <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {recentPerformances.map((performance) => (
                <div 
                  key={performance.id} 
                  className="bg-neutral-900 rounded-lg overflow-hidden"
                >
                  <div className="relative h-48">
                    <img 
                      src={performance.image} 
                      alt={performance.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold">{performance.title}</h3>
                    <p className="text-gray-400 text-sm">{performance.date}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">Score:</span>
                      <span 
                        className={`text-lg font-bold ${
                          performance.score >= 70 ? 'text-theater-gold' : 'text-white'
                        }`}
                      >
                        {performance.score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Skill Progress</h2>
              <div className="bg-neutral-900 rounded-lg p-6 space-y-4">
                {skills.map((skill) => (
                  <SkillProgressBar 
                    key={skill.name} 
                    name={skill.name} 
                    progress={skill.progress} 
                    color={skill.color}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fixed bottom menu as shown in the image */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-950 py-4 border-t border-neutral-900">
        <div className="container mx-auto max-w-md">
          <div className="flex justify-around">
            <Link to="/upload" className="flex flex-col items-center space-y-2">
              <div className="bg-neutral-900 rounded-full p-4">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm text-white">Upload</span>
            </Link>
            
            <Link to="/chat" className="flex flex-col items-center space-y-2">
              <div className="bg-neutral-900 rounded-full p-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm text-white">Coach</span>
            </Link>
            
            <Link to="/rehearsal-room" className="flex flex-col items-center space-y-2">
              <div className="bg-neutral-900 rounded-full p-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm text-white">Rehearsal</span>
            </Link>
            
            <Link to="/dashboard/profile" className="flex flex-col items-center space-y-2">
              <div className="bg-neutral-900 rounded-full p-4">
                <User className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm text-white">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
