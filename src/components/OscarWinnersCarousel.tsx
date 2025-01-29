import { useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useTranslation } from "react-i18next";
import { oscarWinners } from "./oscar-winners/oscarWinnersData";
import { OscarWinnerCard } from "./oscar-winners/OscarWinnerCard";

export const OscarWinnersCarousel = () => {
  const { t } = useTranslation();
  
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      align: "center",
      slidesToScroll: 1,
      duration: 800,
      skipSnaps: false,
      dragFree: false
    },
    [Autoplay({ 
      delay: 3000, 
      stopOnInteraction: false,
      playOnInit: true 
    })]
  );

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12 lg:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
            {t('oscarWinners.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-300">
            {t('oscarWinners.subtitle')}
          </p>
        </motion.div>

        <Carousel
          ref={emblaRef}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {oscarWinners.map((winner, index) => (
              <CarouselItem 
                key={index} 
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
              >
                <div className="transition-transform duration-300 hover:scale-105">
                  <OscarWinnerCard {...winner} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};