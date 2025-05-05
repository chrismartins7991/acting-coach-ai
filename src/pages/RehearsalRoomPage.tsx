
import { RehearsalRoom } from "@/components/rehearsal/RehearsalRoom";
import { TopMenu } from "@/components/TopMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenu } from "@/components/menu/MobileMenu";

const RehearsalRoomPage = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple">
      {/* Top Menu for Navigation */}
      <div className="fixed top-4 right-4 z-50">
        {isMobile ? (
          <MobileMenu />
        ) : (
          <div className="flex items-center gap-4">
            <TopMenu />
          </div>
        )}
      </div>
      
      <div className="p-6 sm:p-8 pt-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4">
            Rehearsal Room
          </h1>
          <RehearsalRoom />
        </div>
      </div>
    </div>
  );
};

export default RehearsalRoomPage;
