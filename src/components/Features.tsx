import { Camera, Brain, Trophy, Star } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    name: "Record & Upload",
    description: "Easily record or upload your performances for instant analysis.",
    icon: Camera,
  },
  {
    name: "AI Analysis",
    description: "Get detailed feedback based on established acting methodologies.",
    icon: Brain,
  },
  {
    name: "Track Progress",
    description: "Monitor your growth with comprehensive performance metrics.",
    icon: Trophy,
  },
  {
    name: "Expert Methods",
    description: "Learn from Stanislavski, Brecht, and Chekhov techniques.",
    icon: Star,
  },
];

export const Features = () => {
  return (
    <div className="w-full py-12 sm:py-24 bg-gradient-to-br from-black to-theater-purple">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-base font-semibold leading-7 text-theater-gold"
          >
            Master Your Craft
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Everything you need to elevate your acting
          </motion.p>
        </div>
        <div className="mx-auto mt-8 sm:mt-16 lg:mt-20">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 px-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/10 hover:scale-105 transition-transform duration-200"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <feature.icon className="h-5 w-5 flex-none text-theater-gold" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-sm sm:text-base leading-7 text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};