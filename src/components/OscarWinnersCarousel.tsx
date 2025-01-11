import { useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const oscarWinners = [
  {
    name: "12 Years a Slave Oscar Winner",
    image: "/lovable-uploads/12 Years a Slave Oscar Win.jpeg"
  },
  {
    name: "2025 Oscars Overview",
    image: "/lovable-uploads/2025 Oscars Overview.jpeg"
  },
  {
    name: "Black Oscar Winners List",
    image: "/lovable-uploads/Black Oscar Winners List - Essence.jpeg"
  },
  {
    name: "Christoph Waltz Best Supporting Actor",
    image: "/lovable-uploads/Christoph Waltz Best Supporting Actor.jpeg"
  },
  {
    name: "Denzel Washington Glory Quote",
    image: "/lovable-uploads/Denzel Washington Glory Quote.jpeg"
  },
  {
    name: "Halle Berry Oscar Reflection",
    image: "/lovable-uploads/Halle Berry Oscar Reflection.jpeg"
  },
  {
    name: "Jack Nicholson",
    image: "/lovable-uploads/Jack Nicholson.jpeg"
  },
  {
    name: "Jennifer Hudson Best Supporting",
    image: "/lovable-uploads/Jennifer Hudson Best Supporting.jpeg"
  },
  {
    name: "Kate Winslet Oscar Holding",
    image: "/lovable-uploads/Kate Winslet Oscar Holding.jpeg"
  },
  {
    name: "Mahershala Ali",
    image: "/lovable-uploads/Mahershala Ali (1).jpeg"
  },
  {
    name: "Meryl Streep Cult Roles",
    image: "/lovable-uploads/Meryl Streep Cult Roles.jpeg"
  },
  {
    name: "Monique from Pinterest",
    image: "/lovable-uploads/Monique from Pinterest.jpeg"
  },
  {
    name: "Morgan Freeman Best Supporting Winner",
    image: "/lovable-uploads/Morgan Freeman Best Supporting Winner.jpeg"
  },
  {
    name: "Oscar Acceptance Speech Highlights",
    image: "/lovable-uploads/Oscar Acceptance Speech Highlights.jpeg"
  },
  {
    name: "Oscar Statue Facts",
    image: "/lovable-uploads/Oscar Statue Facts.jpeg"
  },
  {
    name: "Oscars 2013 Winners",
    image: "/lovable-uploads/Oscars 2013 Winners.jpeg"
  },
  {
    name: "Oscars 2014 Male Perspective",
    image: "/lovable-uploads/Oscars 2014 Male Perspective.jpeg"
  },
  {
    name: "Oscars Glamour Golden Age",
    image: "/lovable-uploads/Oscars Glamour Golden Age.jpeg"
  },
  {
    name: "Pinterest Image",
    image: "/lovable-uploads/Pinterest Image (1).jpeg"
  },
  {
    name: "Robert De Niro Best Actor Oscar",
    image: "/lovable-uploads/Robert De Niro Best Actor Oscar.jpeg"
  },
  {
    name: "Tom Hanks Oscars Best Actor",
    image: "/lovable-uploads/Tom Hanks Oscars Best Actor.jpeg"
  },
  {
    name: "TOM LEONARD Marlon Brando Biography",
    image: "/lovable-uploads/TOM LEONARD Marlon Brando Biography.jpeg"
  },
  {
    name: "Pinterest Image Additional",
    image: "/lovable-uploads/Pinterest Image.jpeg"
  }
];

export const OscarWinnersCarousel = () => {
  const plugin = Autoplay({ delay: 2000, stopOnInteraction: false });
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [plugin]
  );

  useEffect(() => {
    // Log to verify image paths
    oscarWinners.forEach(winner => {
      console.log(`Loading image: ${winner.image}`);
    });

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
            Legendary Oscar Winners
          </h2>
          <p className="text-xl text-gray-300">
            Celebrating cinematic excellence through the years
          </p>
        </motion.div>

        <Carousel
          ref={emblaRef}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {oscarWinners.map((winner, index) => (
              <CarouselItem 
                key={index} 
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="relative h-[400px] overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img
                      src={winner.image}
                      alt={winner.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      onLoad={() => console.log(`Image loaded: ${winner.image}`)}
                      onError={(e) => console.error(`Error loading image: ${winner.image}`, e)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-20">
                      <h3 className="text-sm font-semibold truncate">{winner.name}</h3>
                    </div>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};