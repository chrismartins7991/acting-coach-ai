import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const IconicCoachesSection = () => {
  const { t } = useTranslation();

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

  return (
    <section className="py-20 bg-gradient-to-br from-theater-purple to-black overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-white text-center mb-16"
        >
          Get feedback and Learn from the most iconic perspectives in History
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coaches.map((coach, index) => (
            <motion.div
              key={coach.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="relative h-96 mb-6 overflow-hidden rounded-lg bg-theater-red">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                <img
                  src={coach.image}
                  alt={coach.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
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
    </section>
  );
};