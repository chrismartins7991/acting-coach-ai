import { motion } from "framer-motion";
import { Camera, Mic, MessageSquare, Award } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Record Your Scene",
    description: "Upload a video of your performance using any device"
  },
  {
    icon: Mic,
    title: "Get AI Feedback",
    description: "Receive instant analysis based on professional acting methods"
  },
  {
    icon: MessageSquare,
    title: "Interactive Coaching",
    description: "Chat with our AI to understand areas of improvement"
  },
  {
    icon: Award,
    title: "Track Progress",
    description: "Monitor your improvement over time with detailed metrics"
  }
];

export const LearningProcess = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-black to-theater-purple">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-white text-center mb-16"
        >
          How It Works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-black/30 rounded-lg p-6 backdrop-blur-sm border border-white/10 h-full">
                <div className="mb-4">
                  <step.icon className="w-12 h-12 text-theater-gold" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-px bg-theater-gold" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};