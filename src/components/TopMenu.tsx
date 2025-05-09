
import { useIsMobile } from "@/hooks/use-mobile";
import { SubscriptionBadge } from "./subscription/SubscriptionBadge";
import { Link } from "react-router-dom";
import { Award, Book, User, LayoutDashboard, Clapperboard } from "lucide-react";

export const TopMenu = () => {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Subscription badge stays fixed on top left */}
      <div className="fixed top-2 md:top-4 left-2 md:left-4 z-50">
        <SubscriptionBadge />
      </div>

      {/* Desktop menu - only visible on larger screens */}
      {!isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-neutral-950 py-2 border-b border-neutral-900 z-40">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-around">
              <Link to="/dashboard" className="flex flex-col items-center space-y-1">
                <div className="bg-neutral-900 rounded-full p-3">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs text-white">Dashboard</span>
              </Link>
              
              <Link to="/upload" className="flex flex-col items-center space-y-1">
                <div className="bg-neutral-900 rounded-full p-3">
                  <Clapperboard className="h-5 w-5 text-white" />
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
                  <Book className="h-5 w-5 text-white" />
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
    </>
  );
};
