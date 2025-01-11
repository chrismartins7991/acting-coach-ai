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
    image: "/lovable-uploads/12-years-a-slave-oscar-win.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "2025 Oscars Overview",
    image: "/lovable-uploads/2025-oscars-overview.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Black Oscar Winners List",
    image: "/lovable-uploads/black-oscar-winners-list-essence.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Christoph Waltz Best Supporting Actor",
    image: "/lovable-uploads/christoph-waltz-best-supporting-actor.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Denzel Washington Glory Quote",
    image: "/lovable-uploads/denzel-washington-glory-quote.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Halle Berry Oscar Reflection",
    image: "/lovable-uploads/halle-berry-oscar-reflection.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Jack Nicholson",
    image: "/lovable-uploads/jack-nicholson.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Jennifer Hudson Best Supporting",
    image: "/lovable-uploads/jennifer-hudson-best-supporting.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Kate Winslet Oscar Holding",
    image: "/lovable-uploads/kate-winslet-oscar-holding.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Mahershala Ali",
    image: "/lovable-uploads/mahershala-ali-1.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Meryl Streep Cult Roles",
    image: "/lovable-uploads/meryl-streep-cult-roles.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Monique from Pinterest",
    image: "/lovable-uploads/monique-from-pinterest.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Morgan Freeman Best Supporting Winner",
    image: "/lovable-uploads/morgan-freeman-best-supporting-winner.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Oscar Acceptance Speech Highlights",
    image: "/lovable-uploads/oscar-acceptance-speech-highlights.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Oscar Statue Facts",
    image: "/lovable-uploads/oscar-statue-facts.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Oscars 2013 Winners",
    image: "/lovable-uploads/oscars-2013-winners.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Oscars 2014 Male Perspective",
    image: "/lovable-uploads/oscars-2014-male-perspective.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Oscars Glamour Golden Age",
    image: "/lovable-uploads/oscars-glamour-golden-age.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Pinterest Image",
    image: "/lovable-uploads/pinterest-image-1.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Robert De Niro Best Actor Oscar",
    image: "/lovable-uploads/robert-de-niro-best-actor-oscar.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Tom Hanks Oscars Best Actor",
    image: "/lovable-uploads/tom-hanks-oscars-best-actor.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "TOM LEONARD Marlon Brando Biography",
    image: "/lovable-uploads/tom-leonard-marlon-brando-biography.jpeg",
    fallbackImage: "https://placehold.co/400x600?text=Image+Not+Found"
  },
  {
    name: "Pinterest Image Additional",
    image: "/lovable-uploads/pinterest-image.jpeg",
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