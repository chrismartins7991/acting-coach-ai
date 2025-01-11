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
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=1000&fit=crop",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "2025 Oscars Overview",
    image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&h=1000&fit=crop",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Black Oscar Winners List",
    image: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800&h=1000&fit=crop",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Christoph Waltz Best Supporting Actor",
    image: "https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?w=800&h=1000&fit=crop",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Denzel Washington Glory Quote",
    image: "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=800&h=1000&fit=crop",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Halle Berry Oscar Reflection",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Jack Nicholson",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Jennifer Hudson Best Supporting",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1000&fit=crop",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Kate Winslet Oscar Holding",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1000&fit=crop",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Mahershala Ali",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
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
