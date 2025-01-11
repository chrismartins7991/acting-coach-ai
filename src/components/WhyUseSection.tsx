import { motion } from "framer-motion";

export const WhyUseSection = () => {
  const features = [
    {
      title: "Method Acting",
      description: "Master emotional memory techniques used by legends like Daniel Day-Lewis",
      image: "/lovable-uploads/iconic-movie-frames/There_Will_Be_Blood_Daniel_Day_Lewis.jpeg",
      alt: "Daniel Day-Lewis in There Will Be Blood"
    },
    {
      title: "Character Development",
      description: "Learn character immersion like Marlon Brando",
      image: "/lovable-uploads/iconic-movie-frames/The_Godfather_Marlon_Brando_aiactingcoach.jpeg",
      alt: "Marlon Brando in The Godfather"
    },
    {
      title: "Scene Analysis",
      description: "Study scene breakdown techniques from Meryl Streep",
      image: "/lovable-uploads/iconic-movie-frames/Meryl-Streep-65-Characters.jpeg",
      alt: "Meryl Streep's iconic performances"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-black to-theater-purple">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-white text-center mb-16"
        >
          Train Using Legendary Methods
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="relative h-64 mb-6 overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                <img
                  src={feature.image}
                  alt={feature.alt}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};