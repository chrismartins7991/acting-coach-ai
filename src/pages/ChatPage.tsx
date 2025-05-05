
import { Chat } from "@/components/Chat";
import { TopMenu } from "@/components/TopMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavBar } from "@/components/dashboard/MobileNavBar";

const ChatPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red">
      <TopMenu />
      
      <div className={`container mx-auto px-4 ${isMobile ? 'pt-20 pb-24' : 'pt-28 pb-8'}`}>
        <Chat />
      </div>
      
      {/* Fixed bottom menu - only visible on mobile */}
      {isMobile && <MobileNavBar />}
    </div>
  );
};

export default ChatPage;
