
import { Chat } from "@/components/Chat";
import { TopMenu } from "@/components/TopMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Activity, Award, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";

const ChatPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red pt-24">
      <TopMenu />
      
      <div className="container mx-auto px-4 pb-24">
        <Chat />
      </div>
      
      {/* Fixed bottom menu - only visible on mobile */}
      {isMobile && (
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
      )}
    </div>
  );
};

export default ChatPage;
