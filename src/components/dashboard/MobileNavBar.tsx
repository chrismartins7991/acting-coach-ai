
import { Activity, Award, Clock, User, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

export const MobileNavBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-950 py-3 border-t border-neutral-900 z-40">
      <div className="container mx-auto max-w-md">
        <div className="flex justify-around">
          <Link to="/dashboard" className="flex flex-col items-center">
            <div className="bg-neutral-900 rounded-full p-3">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
          </Link>
          
          <Link to="/upload" className="flex flex-col items-center">
            <div className="bg-neutral-900 rounded-full p-3">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </Link>
          
          <Link to="/chat" className="flex flex-col items-center">
            <div className="bg-neutral-900 rounded-full p-3">
              <Award className="h-5 w-5 text-white" />
            </div>
          </Link>
          
          <Link to="/rehearsal-room" className="flex flex-col items-center">
            <div className="bg-neutral-900 rounded-full p-3">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </Link>
          
          <Link to="/profile" className="flex flex-col items-center">
            <div className="bg-neutral-900 rounded-full p-3">
              <User className="h-5 w-5 text-white" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
