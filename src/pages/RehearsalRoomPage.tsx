
import { useState } from "react";
import { RehearsalRoom } from "@/components/rehearsal/RehearsalRoom";
import { TopMenu } from "@/components/TopMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavBar } from "@/components/dashboard/MobileNavBar";
import { AlertCircle } from "lucide-react";

const RehearsalRoomPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple">
      {/* Top Menu for Navigation */}
      <TopMenu />
      
      <div className={`container mx-auto px-2 ${isMobile ? 'pt-12 pb-16' : 'pt-28 pb-8'}`}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
          Rehearsal Room
        </h1>
        
        <div className="bg-black/20 p-3 rounded-lg mb-6 text-white/80 text-sm flex items-start">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-theater-gold" />
          <span>
            Upload your script in TXT or PDF format. For best results with PDFs, use files with selectable text rather than scanned documents.
          </span>
        </div>
        
        <RehearsalRoom />
      </div>
      
      {/* Fixed bottom menu - only visible on mobile */}
      {isMobile && <MobileNavBar />}
    </div>
  );
};

export default RehearsalRoomPage;
