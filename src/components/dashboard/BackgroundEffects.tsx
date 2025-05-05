
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BackgroundEffectsProps {
  fromLanding?: boolean;
}

export const BackgroundEffects = ({ fromLanding }: BackgroundEffectsProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  useEffect(() => {
    // Create particles only on initial render
    const particlesArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1
    }));
    
    setParticles(particlesArray);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-theater-gold/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent"
        initial={{ opacity: fromLanding ? 0 : 0.3 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
      />
      
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
};
