
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  image: string;
  rating?: number;
  delay?: number;
}

export const TestimonialCard = ({ quote, author, role, image, rating = 5, delay = 0 }: TestimonialCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-theater-purple/20 backdrop-blur-sm rounded-lg p-6 border border-white/10 flex flex-col h-full"
    >
      <div className="mb-6 flex justify-center">
        <img
          src={image}
          alt={author}
          className="w-24 h-24 rounded-full object-cover border-2 border-theater-gold"
        />
      </div>
      
      {rating > 0 && (
        <div className="flex justify-center mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-theater-gold text-theater-gold" />
          ))}
        </div>
      )}
      
      <p className="text-gray-300 mb-4 italic flex-grow">"{quote}"</p>
      <div className="text-theater-gold font-semibold">{author}</div>
      <div className="text-gray-400 text-sm">{role}</div>
    </motion.div>
  );
};
