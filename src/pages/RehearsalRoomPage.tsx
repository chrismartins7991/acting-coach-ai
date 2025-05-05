
import { RehearsalRoom } from "@/components/rehearsal/RehearsalRoom";
import { TopMenu } from "@/components/TopMenu";

const RehearsalRoomPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple">
      {/* Top Menu for Navigation */}
      <TopMenu />
      
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
