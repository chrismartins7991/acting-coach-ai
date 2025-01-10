import { LucideIcon } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { SparklesCore } from "@/components/ui/sparkles";
import { useState } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  delay?: number;
  onClick?: () => void;
}

export const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  delay = 0,
  onClick 
}: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      <div className={`p-6 rounded-lg bg-gradient-to-br ${color} transform transition-all duration-300 group-hover:scale-105 shadow-xl relative overflow-hidden`}>
        {isHovered && (
          <motion.div 
            className="absolute pointer-events-none"
            style={{ x, y }}
          >
            <div className="w-32 h-32 -translate-x-1/2 -translate-y-1/2">
              <SparklesCore
                background="transparent"
                minSize={0.1}
                maxSize={0.3}
                particleDensity={30}
                className="w-full h-full"
                particleColor="#FFD700"
              />
            </div>
          </motion.div>
        )}
        <div className="relative z-10">
          <Icon className="w-12 h-12 text-white mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-white/80">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};