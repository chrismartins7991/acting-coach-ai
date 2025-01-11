import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "This AI coach transformed my monologue delivery completely. The feedback was spot-on!",
    author: "Sarah Mitchell",
    role: "Theater Actor",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
  },
  {
    quote: "The detailed analysis of my facial expressions helped me nail my last audition.",
    author: "Michael Chen",
    role: "Film Student",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
  },
  {
    quote: "Finally, professional-level coaching available 24/7. This is revolutionary!",
    author: "David Rodriguez",
    role: "Aspiring Actor",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
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
              <div className="mb-6 flex justify-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-24 h-24 rounded-full object-cover border-2 border-theater-gold"
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