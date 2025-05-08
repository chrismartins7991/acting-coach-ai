
import { Activity, Award, Calendar, Clock, Film, Users } from "lucide-react";

interface StatItemProps {
  value: number;
  label: string;
  icon: React.ReactNode;
}

const StatItem = ({ value, label, icon }: StatItemProps) => (
  <div className="bg-neutral-900 rounded-lg p-3 md:p-4 flex flex-col items-center justify-center text-center">
    <div className="hidden md:block">{icon}</div>
    <span className="text-xl md:text-3xl font-bold">{value}</span>
    <span className="text-gray-400 text-xs md:text-sm">{label}</span>
  </div>
);

export const StatsSection = () => {
  // Stats data
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
    },
    { 
      value: 5, 
      label: "Rehearsals", 
      icon: <Calendar className="h-6 w-6 text-blue-400" /> 
    },
    { 
      value: 8, 
      label: "Selftapes", 
      icon: <Film className="h-6 w-6 text-green-400" /> 
    },
    { 
      value: 4, 
      label: "Coaching", 
      icon: <Calendar className="h-6 w-6 text-orange-400" /> 
    },
    { 
      value: 6, 
      label: "Actor Friends", 
      icon: <Users className="h-6 w-6 text-pink-400" /> 
    }
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-6">
      {stats.map((stat, index) => (
        <StatItem key={index} {...stat} />
      ))}
    </div>
  );
};
