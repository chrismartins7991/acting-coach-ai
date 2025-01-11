import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface LearningProcessStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
  isLast: boolean;
}

export const LearningProcessStep = ({ icon: Icon, title, description, index, isLast }: LearningProcessStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className="relative"
    >
      <div className="bg-black/30 rounded-lg p-6 backdrop-blur-sm border border-white/10 h-full">
        <div className="mb-4">
          <Icon className="w-12 h-12 text-theater-gold" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
          <div className="w-8 h-px bg-theater-gold" />
        </div>
      )}
    </motion.div>
  );
};