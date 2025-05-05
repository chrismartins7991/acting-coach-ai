
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TopMenu } from "@/components/TopMenu";
import { useVideoProcessing } from "@/hooks/useVideoProcessing";
import { useState } from "react";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { PerformanceSection } from "@/components/dashboard/PerformanceSection";
import { ChevronRight, Activity, Award, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { BackgroundEffects } from "@/components/dashboard/BackgroundEffects";
import { SkillProgressBar } from "@/components/dashboard/SkillProgressBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isProcessing: isAnalyzing } = useVideoProcessing();
  const isMobile = useIsMobile();
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
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red text-white overflow-hidden">
      <TopMenu />
      
      <div className={`container mx-auto px-4 ${isMobile ? 'pt-20' : 'pt-28'} h-[calc(100vh-80px)]`}>
        <ScrollArea className="h-full pr-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-gray-400 mb-1">Welcome back,</p>
              <h1 className="text-2xl md:text-3xl font-bold">{user?.user_metadata?.full_name || "Actor"}</h1>
            </div>
            
            <div className="relative h-16 w-16 md:h-20 md:w-20 flex items-center justify-center">
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
              <span className="absolute text-base md:text-lg font-bold">{overallProgress}%</span>
              <span className="absolute -bottom-6 text-xs text-gray-400">Progress</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-neutral-900 rounded-lg p-3 md:p-4 flex flex-col items-center justify-center text-center"
              >
                <div className="hidden md:block">{stat.icon}</div>
                <span className="text-xl md:text-3xl font-bold">{stat.value}</span>
                <span className="text-gray-400 text-xs md:text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
          
          {/* Skill Progress - Moved here to appear right below the stats */}
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-bold mb-3">Skill Progress</h2>
            <div className="bg-neutral-900 rounded-lg p-3 md:p-4 space-y-3">
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
          
          {currentAnalysis ? (
            <PerformanceSection
              currentAnalysis={currentAnalysis}
              isAnalyzing={isAnalyzing}
              onReset={() => setCurrentAnalysis(null)}
            />
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg md:text-xl font-bold">Recent Performances</h2>
                <button 
                  className="text-xs md:text-sm text-gray-400 flex items-center"
                  onClick={handleViewHistory}
                >
                  See All <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                </button>
              </div>
              
              {/* Changed from grid to horizontal scrollable */}
              <div className="mb-6 overflow-x-auto pb-2">
                <div className="flex space-x-3 min-w-min">
                  {recentPerformances.map((performance) => (
                    <div 
                      key={performance.id} 
                      className="bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0 w-[280px]"
                    >
                      <div className="relative h-28 md:h-40">
                        <img 
                          src={performance.image} 
                          alt={performance.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="text-base md:text-lg font-bold">{performance.title}</h3>
                        <p className="text-gray-400 text-xs md:text-sm">{performance.date}</p>
                        <div className="flex justify-between items-center mt-1 md:mt-2">
                          <span className="text-xs md:text-sm">Score:</span>
                          <span 
                            className={`text-base md:text-lg font-bold ${
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
              </div>
            </>
          )}
        </ScrollArea>
      </div>

      {/* Fixed bottom menu - only visible on mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-950 py-3 border-t border-neutral-900">
          <div className="container mx-auto max-w-md">
            <div className="flex justify-around">
              <Link to="/upload" className="flex flex-col items-center space-y-1">
                <div className="bg-neutral-900 rounded-full p-3">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs text-white">Upload</span>
              </Link>
              
              <Link to="/chat" className="flex flex-col items-center space-y-1">
                <div className="bg-neutral-900 rounded-full p-3">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs text-white">Coach</span>
              </Link>
              
              <Link to="/rehearsal-room" className="flex flex-col items-center space-y-1">
                <div className="bg-neutral-900 rounded-full p-3">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs text-white">Rehearsal</span>
              </Link>
              
              <Link to="/profile" className="flex flex-col items-center space-y-1">
                <div className="bg-neutral-900 rounded-full p-3">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs text-white">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
