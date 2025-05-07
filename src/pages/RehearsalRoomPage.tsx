
import { RehearsalRoom } from "@/components/rehearsal/RehearsalRoom";
import { TopMenu } from "@/components/TopMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavBar } from "@/components/dashboard/MobileNavBar";

const RehearsalRoomPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple">
      {/* Top Menu for Navigation */}
      <TopMenu />
      
      <div className={`container mx-auto px-4 ${isMobile ? 'pt-16 pb-20' : 'pt-28 pb-8'}`}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-4">
          Rehearsal Room
        </h1>
        <RehearsalRoom />
      </div>
      
      {/* Fixed bottom menu - only visible on mobile */}
      {isMobile && <MobileNavBar />}
    </div>
  );
};

export default RehearsalRoomPage;
