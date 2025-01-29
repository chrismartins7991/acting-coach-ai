import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  const handleSelect = () => {
    const coach = coaches[centerIndex];
    setSelectedCoach(coach.name);
    console.log(`Selected coach: ${coach.name}`);
    // Future implementation: Navigate to next step
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Choose Your Acting Coach</h1>
          <p className="text-lg text-gray-300">Select an iconic coach to analyze your performance</p>
        </div>

        <div className="relative px-4 md:px-12">
          <Carousel 
            className="w-full max-w-5xl mx-auto"
            opts={{
              align: "center",
              loop: true,
            }}
            setApi={setApi}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {coaches.map((coach, index) => (
                <CarouselItem key={coach.name} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full relative group"
                  >
                    <Card 
                      className={`relative h-full flex flex-col bg-black/30 backdrop-blur-sm rounded-lg p-6 border transition-all duration-300
                        ${index === centerIndex 
                          ? 'border-theater-gold shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-105 z-10' 
                          : 'border-white/10 blur-[2px] opacity-50'} 
                        hover:border-theater-gold/50`}
                    >
                      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                        <img
                          src={coach.image}
                          alt={coach.name}
                          className="w-full h-full object-cover transform transition-transform duration-300"
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
            <CarouselPrevious className="flex absolute -left-4 md:-left-8 bg-theater-gold/20 text-theater-gold border-theater-gold/30 hover:bg-theater-gold/30" />
            <CarouselNext className="flex absolute -right-4 md:-right-8 bg-theater-gold/20 text-theater-gold border-theater-gold/30 hover:bg-theater-gold/30" />
          </Carousel>

          <div className="flex justify-center mt-8">
            <Button
              onClick={handleSelect}
              className="bg-theater-gold hover:bg-theater-gold/80 text-black font-semibold px-8 py-2 rounded-full transform transition-all duration-300 hover:scale-105"
            >
              Select this Acting Coach
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;