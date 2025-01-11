import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "This AI coach transformed my monologue delivery completely. The feedback was spot-on!",
    author: "Sarah Mitchell",
    role: "Theater Actor",
    image: "/lovable-uploads/iconic-movie-frames/Emma-Stone-The-Favourite.jpeg"
  },
  {
    quote: "The detailed analysis of my facial expressions helped me nail my last audition.",
    author: "Michael Chen",
    role: "Film Student",
    image: "/lovable-uploads/iconic-movie-frames/Joker-Pin.jpeg"
  },
  {
    quote: "Finally, professional-level coaching available 24/7. This is revolutionary!",
    author: "David Rodriguez",
    role: "Aspiring Actor",
    image: "/lovable-uploads/iconic-movie-frames/There_Will_Be_Blood_Daniel_Day_Lewis.jpeg"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-20 bg-black/80">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-white text-center mb-16"
        >
          What Our Users Say
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-theater-purple/20 backdrop-blur-sm rounded-lg p-6 border border-white/10"
            >
              <div className="mb-6 h-48 overflow-hidden rounded-lg">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                />
              </div>
              <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
              <div className="text-theater-gold font-semibold">{testimonial.author}</div>
              <div className="text-gray-400 text-sm">{testimonial.role}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};