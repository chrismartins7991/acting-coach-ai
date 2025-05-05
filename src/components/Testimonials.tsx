
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { TestimonialCard } from "./testimonials/TestimonialCard";
import { testimonials } from "./testimonials/testimonialsData";

export const Testimonials = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-black/80">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-white text-center mb-16"
        >
          {t('testimonials.title')}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id} 
              quote={testimonial.text}
              author={testimonial.name}
              role={testimonial.role}
              image={testimonial.image}
              rating={testimonial.rating}
              delay={index * 0.1} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};
