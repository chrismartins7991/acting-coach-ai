import { motion } from "framer-motion";

interface OscarWinnerCardProps {
  image: string;
  name: string;
  fallbackImage: string;
}

export const OscarWinnerCard = ({ image, name, fallbackImage }: OscarWinnerCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative group"
    >
      <div className="relative h-[400px] overflow-hidden rounded-lg">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            console.error(`Error loading image: ${image}`);
            e.currentTarget.src = fallbackImage;
          }}
        />
      </div>
    </motion.div>
  );
};