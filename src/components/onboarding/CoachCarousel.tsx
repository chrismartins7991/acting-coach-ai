
import { useState, useEffect } from "react";
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
import { coaches } from "./coachData";

interface CoachCarouselProps {
  onCoachSelect: () => void;
  centerIndex: number;
  setApi: (api: CarouselApi) => void;
}

export const CoachCarousel = ({ onCoachSelect, centerIndex, setApi }: CoachCarouselProps) => {
  return (
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
                  className={`relative h-full flex flex-col bg-black rounded-lg p-6 border transition-all duration-300
                    ${index === centerIndex 
                      ? 'border-theater-gold shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-105 z-10' 
                      : 'border-white/10'}`}
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
                  <span className="inline-block bg-theater-gold text-black px-3 py-1 rounded-full text-sm">
                    {coach.contribution}
                  </span>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute -left-4 top-1/2 -translate-y-1/2">
          <CarouselPrevious className="bg-theater-gold hover:bg-theater-gold/80 text-black" />
        </div>
        <div className="absolute -right-4 top-1/2 -translate-y-1/2">
          <CarouselNext className="bg-theater-gold hover:bg-theater-gold/80 text-black" />
        </div>
      </Carousel>

      <div className="flex justify-center mt-8">
        <Button
          onClick={onCoachSelect}
          className="bg-theater-gold hover:bg-theater-gold/80 text-black font-semibold px-8 py-2 rounded-full transform transition-all duration-300 hover:scale-105"
        >
          Select this Acting Coach
        </Button>
      </div>
    </div>
  );
};
