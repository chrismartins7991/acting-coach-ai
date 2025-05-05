
import { useAuth } from "@/contexts/AuthContext";
import { ProgressCircle } from "./ProgressCircle";

export const DashboardHeader = () => {
  const { user } = useAuth();
  const overallProgress = 68; // Mock data for the progress circle

  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <p className="text-gray-400 mb-1">Welcome back,</p>
        <h1 className="text-2xl md:text-3xl font-bold">{user?.user_metadata?.full_name || "Actor"}</h1>
      </div>
      
      <ProgressCircle progress={overallProgress} />
    </div>
  );
};
