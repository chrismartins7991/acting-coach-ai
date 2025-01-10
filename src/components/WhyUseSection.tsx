import { motion } from "framer-motion";

export const WhyUseSection = () => {
  const features = [
    {
      title: "Learn from the Masters",
      description: "Study techniques from legendary performances in cinema history",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop",
      alt: "Classic movie scene"
    },
    {
      title: "Real-time Feedback",
      description: "Get instant analysis of your performance using advanced AI",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop",
      alt: "Actor performing"
    },
    {
      title: "Personalized Growth",
      description: "Track your progress and receive tailored recommendations",
      image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&auto=format&fit=crop",
      alt: "Performance analysis"
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-white text-center mb-16"
        >
          Why Use Our AI Acting Coach?
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