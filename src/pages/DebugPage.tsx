import { useState } from "react";
import VideoUploader from "@/components/VideoUploader";
import { Card } from "@/components/ui/card";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

const coaches = [
  {
    name: "Constantin Stanislavski",
    description: "Master of emotional memory and the 'magic if' technique",
    image: "/Acting-Methods-Iconic-Coaches/Stanislavski-Portrait-Enhanced.png",
    contribution: "Method Acting Foundation"
  },
  {
    name: "Lee Strasberg",
    description: "Pioneer of method acting in America",
    image: "/Acting-Methods-Iconic-Coaches/Strasberg-Portrait-Enhanced.png",
    contribution: "Psychological Realism"
  },
  {
    name: "Bertolt Brecht",
    description: "Pioneer of epic theater and alienation effect",
    image: "/Acting-Methods-Iconic-Coaches/Brecht-Portrait-Enhanced.png",
    contribution: "Epic Theater"
  },
  {
    name: "Michael Chekhov",
    description: "Master of psychological gesture technique",
    image: "/Acting-Methods-Iconic-Coaches/Chekhov-Portrait-Enhanced.png",
    contribution: "Psychological Gesture"
  },
  {
    name: "Sanford Meisner",
    description: "Developer of the Meisner technique",
    image: "/Acting-Methods-Iconic-Coaches/Meisner-Portrait-Enhanced.png",
    contribution: "Repetition Technique"
  }
];

const DebugPage = () => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);

  const handleAnalysisComplete = (videoAnalysis: Analysis | null, audioAnalysis: VoiceAnalysis | null) => {
    console.log("Debug: Received video analysis:", videoAnalysis);
    console.log("Debug: Received voice analysis:", audioAnalysis);
    setAnalysis(videoAnalysis);
    setVoiceAnalysis(audioAnalysis);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Choose Your Acting Coach</h1>
          <p className="text-lg text-gray-300">Select an iconic coach to analyze your performance</p>
        </div>

        <div className="relative px-4 md:px-12">
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent className="-ml-2 md:-ml-4">
              {coaches.map((coach, index) => (
                <CarouselItem key={coach.name} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <Card 
                      className={`relative group h-full flex flex-col bg-black/30 backdrop-blur-sm rounded-lg p-6 border 
                        ${selectedCoach === coach.name ? 'border-theater-gold' : 'border-white/10'} 
                        hover:border-theater-gold/50 transition-all duration-300`}
                      onClick={() => setSelectedCoach(coach.name)}
                    >
                      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                        <img
                          src={coach.image}
                          alt={coach.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{coach.name}</h3>
                      <p className="text-gray-300 mb-4 flex-grow">{coach.description}</p>
                      <span className="inline-block bg-theater-gold/20 text-theater-gold px-3 py-1 rounded-full text-sm">
                        {coach.contribution}
                      </span>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 bg-theater-gold/20 text-theater-gold border-theater-gold/30 hover:bg-theater-gold/30" />
            <CarouselNext className="hidden md:flex -right-12 bg-theater-gold/20 text-theater-gold border-theater-gold/30 hover:bg-theater-gold/30" />
          </Carousel>
        </div>

        <div className="mb-8">
          <VideoUploader />
        </div>

        {isProcessing && (
          <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
            <p className="text-white">Processing video...</p>
          </Card>
        )}

        {(analysis || voiceAnalysis) && (
          <div className="space-y-6">
            <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Video Analysis Raw Data:</h2>
              <pre className="text-white/80 overflow-auto max-h-[400px] p-4 bg-black/50 rounded">
                {JSON.stringify(analysis, null, 2)}
              </pre>
            </Card>

            <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Voice Analysis Raw Data:</h2>
              <pre className="text-white/80 overflow-auto max-h-[400px] p-4 bg-black/50 rounded">
                {JSON.stringify(voiceAnalysis, null, 2)}
              </pre>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPage;