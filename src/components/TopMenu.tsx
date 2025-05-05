
import { useIsMobile } from "@/hooks/use-mobile";
import { SubscriptionBadge } from "./subscription/SubscriptionBadge";
import { Link } from "react-router-dom";
import { Activity, Award, Clock, User, LayoutDashboard } from "lucide-react";

export const TopMenu = () => {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Subscription badge stays fixed on top left */}
      <div className="fixed top-4 left-4 z-50">
        <SubscriptionBadge />
      </div>

      {/* Desktop menu - only visible on larger screens */}
      {!isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-neutral-950 py-4 border-b border-neutral-900 z-40">
          <div className="container mx-auto max-w-md">
            <div className="flex justify-around">
              <Link to="/dashboard" className="flex flex-col items-center space-y-2">
                <div className="bg-neutral-900 rounded-full p-4">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-white">Dashboard</span>
              </Link>
              
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
      )}
    </>
  );
};
