
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Book, Mic, FileVideo, Activity } from "lucide-react";

interface Activity {
  id: number;
  title: string;
  type: "selftape" | "rehearsal";
  subtype?: "memorization" | "aireader" | "coldreading";
  date: string;
  score?: number;
  duration?: string;
  image: string;
}

interface ActivityListProps {
  activities: Activity[];
}

export const ActivityList = ({ activities }: ActivityListProps) => {
  const navigate = useNavigate();

  const handleViewHistory = () => {
    navigate('/history');
  };

  // Function to get the appropriate icon based on activity type
  const getActivityIcon = (activity: Activity) => {
    if (activity.type === "selftape") {
      return <FileVideo className="h-5 w-5 text-theater-gold" />;
    } else if (activity.type === "rehearsal") {
      switch (activity.subtype) {
        case "memorization":
          return <Book className="h-5 w-5 text-theater-gold" />;
        case "aireader":
          return <Mic className="h-5 w-5 text-theater-gold" />;
        case "coldreading":
          return <Activity className="h-5 w-5 text-theater-gold" />;
        default:
          return <Book className="h-5 w-5 text-theater-gold" />;
      }
    }
    return <Activity className="h-5 w-5 text-theater-gold" />;
  };

  // Function to get activity details based on type
  const getActivityDetails = (activity: Activity) => {
    if (activity.type === "selftape") {
      return (
        <div className="flex justify-between items-center mt-1 md:mt-2">
          <span className="text-xs md:text-sm">Score:</span>
          <span 
            className={`text-base md:text-lg font-bold ${
              (activity.score || 0) >= 70 ? 'text-theater-gold' : 'text-white'
            }`}
          >
            {activity.score}
          </span>
        </div>
      );
    } else if (activity.type === "rehearsal") {
      return (
        <div className="flex justify-between items-center mt-1 md:mt-2">
          <span className="text-xs md:text-sm">Duration:</span>
          <span className="text-base md:text-lg font-bold text-theater-gold">{activity.duration}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold">Recent Activity</h2>
        <button 
          className="text-xs md:text-sm text-gray-400 flex items-center"
          onClick={handleViewHistory}
        >
          See All <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
        </button>
      </div>
      
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex space-x-3 min-w-min">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0 w-[280px]"
            >
              <div className="relative h-28 md:h-40">
                <img 
                  src={activity.image} 
                  alt={activity.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/70 rounded-full p-2">
                  {getActivityIcon(activity)}
                </div>
              </div>
              <div className="p-3 md:p-4">
                <h3 className="text-base md:text-lg font-bold">{activity.title}</h3>
                <div className="flex items-center">
                  <span className="text-gray-400 text-xs md:text-sm">{activity.date}</span>
                  <span className="mx-2 text-gray-600">•</span>
                  <span className="text-xs md:text-sm capitalize text-gray-300">{activity.type}</span>
                </div>
                {getActivityDetails(activity)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
