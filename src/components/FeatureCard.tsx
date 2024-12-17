import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export const FeatureCard = ({ title, description, icon: Icon, color, delay = 0 }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group cursor-pointer"
    >
      <div className={`p-6 rounded-lg bg-gradient-to-br ${color} transform transition-all duration-300 group-hover:scale-105 shadow-xl`}>
        <Icon className="w-12 h-12 text-white mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/80">{description}</p>
      </div>
    </motion.div>
  );
};