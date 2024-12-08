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
    <div className="py-24 bg-black sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-theater-gold">Master Your Craft</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to elevate your acting
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <feature.icon className="h-5 w-5 flex-none text-theater-gold" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
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