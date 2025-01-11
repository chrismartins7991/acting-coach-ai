import { motion } from "framer-motion";
import { TestimonialCard } from "./TestimonialCard";
import { testimonials } from "./testimonialsData";

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
            <TestimonialCard key={index} {...testimonial} delay={index * 0.2} />
          ))}
        </div>
      </div>
    </section>
  );
};