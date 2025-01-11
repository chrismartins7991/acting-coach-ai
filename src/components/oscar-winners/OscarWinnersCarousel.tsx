import { useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { OscarWinnerCard } from "./OscarWinnerCard";
import { oscarWinners } from "./oscarWinnersData";

export const OscarWinnersCarousel = () => {
  const plugin = Autoplay({ 
    delay: 3000, 
    stopOnInteraction: true,
    rootNode: (emblaRoot) => emblaRoot.parentElement
  });
  
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      align: "center",
      slidesToScroll: 1,
      duration: 1000,
      skipSnaps: false,
      dragFree: true
    },
    [plugin]
  );

  useEffect(() => {
    return () => {
      plugin.stop();
    };
  }, [plugin]);

  return (
    <section className="py-20 bg-gradient-to-br from-black to-theater-purple overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            You Could Be Next
          </h2>
          <p className="text-xl text-gray-300">
            From aspiring actor to award winner - start your journey today
          </p>
        </motion.div>

        <Carousel
          ref={emblaRef}
          className="w-full"
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {oscarWinners.map((winner, index) => (
              <CarouselItem 
                key={index} 
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <OscarWinnerCard {...winner} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};