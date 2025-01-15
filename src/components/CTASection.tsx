import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { SparklesCore } from "./ui/sparkles";
import { useTranslation } from "react-i18next";
import { Card } from "./ui/card";
import { Check } from "lucide-react";

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection = ({ onGetStarted }: CTASectionProps) => {
  const { t } = useTranslation();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "2 scene analyses per month",
        "Basic performance metrics",
        "General improvement tips",
      ]
    },
    {
      name: "Pro",
      price: "$7.99",
      period: "per month",
      features: [
        "Unlimited scene analyses",
        "Advanced performance metrics",
        "Detailed feedback & recommendations",
        "Compare with pro performances",
        "Priority processing"
      ]
    },
    {
      name: "Annual",
      price: "$59.99",
      period: "per year",
      features: [
        "Everything in Pro plan",
        "Save 25% vs monthly",
        "Exclusive masterclass content",
        "Early access to new features"
      ]
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/iconic-movie-frames/The_Godfather_Marlon_Brando_aiactingcoach.jpeg')] opacity-10 bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-300 mb-12 text-center">
            Start with our free tier or unlock unlimited potential with our pro plans
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={plan.name} className="bg-black/30 backdrop-blur-sm border-white/10 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-theater-gold">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <Check className="w-5 h-5 text-theater-gold mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={onGetStarted}
                  variant={index === 1 ? "default" : "outline"}
                  className={index === 1 ? "w-full bg-theater-gold hover:bg-theater-gold/90 text-theater-purple" : "w-full"}
                >
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};