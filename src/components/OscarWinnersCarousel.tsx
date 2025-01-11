import { useEffect, useState } from "react";
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
    name: "Denzel Washington Glory Quote",
    image: "/lovable-uploads/Denzel Washington Glory Quote.jpeg"
  },
  {
    name: "Halle Berry Oscar Reflection",
    image: "/lovable-uploads/Halle Berry Oscar Reflection.jpeg"
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
    name: "Morgan Freeman Best Supporting Winner",
    image: "/lovable-uploads/Morgan Freeman Best Supporting Winner.jpeg"
  },
  {
    name: "Oscar Acceptance Speech Highlights",
    image: "/lovable-uploads/Oscar Acceptance Speech Highlights.jpeg"
  }
];

export const OscarWinnersCarousel = () => {
  const [api] = useEmblaCarousel(
    { 
      loop: true,
      slidesToScroll: 1,
      align: "start",
    }, 
    [Autoplay({ delay: 1500 })] // Reduced delay to 1.5 seconds
  );
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Log to verify image paths
    oscarWinners.forEach(winner => {
      console.log(`Loading image: ${winner.image}`);
    });
  }, []);

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
            Join the ranks of these legendary performers
          </p>
        </motion.div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-7xl mx-auto"
          ref={api}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {oscarWinners.map((winner, index) => (
              <CarouselItem 
                key={index} 
                className="pl-2 md:pl-4 md:basis-1/4 lg:basis-1/5" // Adjusted to show more items
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="relative h-[300px] overflow-hidden rounded-lg"> {/* Reduced height for better visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img
                      src={winner.image}
                      alt={winner.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      onLoad={() => console.log(`Image loaded: ${winner.image}`)}
                      onError={(e) => console.error(`Error loading image: ${winner.image}`, e)}
                    />
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