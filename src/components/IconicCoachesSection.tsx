import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const IconicCoachesSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);

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

  useEffect(() => {
    if (emblaApi) {
      console.log('Carousel initialized');
      coaches.forEach(coach => {
        console.log(`Loading image for ${coach.name}:`, coach.image);
      });
    }
  }, [emblaApi]);

  const handleImageError = (name: string, src: string) => {
    console.error(`Error loading image for ${name}. Image source:`, src);
  };

  const handleCoachClick = () => {
    navigate('/signup');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-theater-purple to-black overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-white text-center mb-4"
        >
          Get feedback and Learn from the most iconic perspectives in History
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl text-theater-gold text-center mb-16"
        >
          Pick your favorite Acting Coach
        </motion.p>
        
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {coaches.map((coach, index) => (
              <motion.div
                key={coach.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative group flex-[0_0_100%] min-w-0 md:flex-[0_0_33.33%] px-4 cursor-pointer"
                onClick={handleCoachClick}
              >
                <div className="relative h-[500px] mb-6 overflow-hidden rounded-lg bg-theater-red shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 z-10" />
                  <img
                    src={coach.image}
                    alt={coach.name}
                    onError={() => handleImageError(coach.name, coach.image)}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-2xl font-semibold text-white mb-2">{coach.name}</h3>
                    <p className="text-gray-300 mb-2">{coach.description}</p>
                    <span className="inline-block bg-theater-gold/20 text-theater-gold px-3 py-1 rounded-full text-sm">
                      {coach.contribution}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};