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
    image: "/lovable-uploads/oscars-actors-images/12-Years-a-Slave-Oscar-Win.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "2025 Oscars Overview",
    image: "/lovable-uploads/oscars-actors-images/2025-Oscars-Overview.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Black Oscar Winners List",
    image: "/lovable-uploads/oscars-actors-images/Black-Oscar-Winners-List---Essence.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Christoph Waltz Best Supporting Actor",
    image: "/lovable-uploads/oscars-actors-images/Christoph-Waltz-Best-Supporting-Actor.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Denzel Washington Glory Quote",
    image: "/lovable-uploads/oscars-actors-images/Denzel-Washington-Glory-Quote.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Halle Berry Oscar Reflection",
    image: "/lovable-uploads/oscars-actors-images/Halle-Berry-Oscar-Reflection.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Jack Nicholson",
    image: "/lovable-uploads/oscars-actors-images/Jack-Nicholson.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Jennifer Hudson Best Supporting",
    image: "/lovable-uploads/oscars-actors-images/Jennifer-Hudson-Best-Supporting.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Kate Winslet Oscar Holding",
    image: "/lovable-uploads/oscars-actors-images/Kate-Winslet-Oscar-Holding.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Mahershala Ali",
    image: "/lovable-uploads/oscars-actors-images/Mahershala-Ali-(1).jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  }
];

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
      duration: 1000, // Moving the transition duration here
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
                      onError={(e) => {
                        console.error(`Error loading image: ${winner.image}`);
                        e.currentTarget.src = winner.fallbackImage;
                      }}
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
