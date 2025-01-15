import { Camera, Brain, Trophy, Star, Mic2, Users, Zap, GraduationCap, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      name: "Instant Scene Analysis",
      description: "Upload your performance and get detailed feedback in seconds",
      icon: Camera,
    },
    {
      name: "Emotion Recognition",
      description: "Get scored on emotional authenticity and range with advanced AI analysis",
      icon: Brain,
    },
    {
      name: "Body Language Analysis",
      description: "Detailed feedback on your physical performance and stage presence",
      icon: Users,
    },
    {
      name: "AI Professor Pick",
      description: "Learn from Strasberg, Chekhov, Stanislavski, and Brecht methods",
      icon: GraduationCap,
    },
    {
      name: "Digital Certified Actor Badge",
      description: "Earn a limited NFT badge to showcase your acting achievements",
      icon: Award,
    },
    {
      name: "Performance Tracking",
      description: "Monitor your growth with detailed performance metrics over time",
      icon: Trophy,
    },
    {
      name: "Quick Improvements",
      description: "Receive actionable tips to enhance your performance instantly",
      icon: Zap,
    },
  ];

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
            Advanced Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Everything you need to perfect your performance
          </motion.p>
        </div>
        <div className="mx-auto mt-8 sm:mt-16 lg:mt-20">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 px-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-theater-gold/20 hover:scale-105 transition-transform duration-200"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <feature.icon className="h-6 w-6 flex-none text-theater-gold" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
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