import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection = ({ onGetStarted }: CTASectionProps) => {
  const { t } = useTranslation();

  const plans = [
    {
      name: 'Free',
      price: '0',
      period: 'forever',
      description: 'Perfect for trying out AI acting analysis',
      features: [
        { name: 'AI Performance Analysis', included: true },
        { name: '2 Scene Analyses per Month', included: true },
        { name: 'Basic Emotion Accuracy Score', included: true },
        { name: 'Basic Body Language Analysis', included: true },
        { name: 'AI Professor Pick (Strasberg, Chekhov, etc)', included: false },
        { name: 'Detailed Feedback Reports', included: false },
        { name: 'Professional Actor Comparisons', included: false },
        { name: 'Performance Tracking Over Time', included: false }
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '7.99',
      period: 'month',
      description: 'Full access to all AI coaching features',
      features: [
        { name: 'AI Performance Analysis', included: true },
        { name: 'Unlimited Scene Analyses', included: true },
        { name: 'Advanced Emotion Accuracy Score', included: true },
        { name: 'Detailed Body Language Analysis', included: true },
        { name: 'AI Professor Pick (Strasberg, Chekhov, etc)', included: true },
        { name: 'Detailed Feedback Reports', included: true },
        { name: 'Professional Actor Comparisons', included: true },
        { name: 'Performance Tracking Over Time', included: true }
      ],
      buttonText: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Annual',
      price: '59.99',
      period: 'year',
      description: 'Save 25% with annual billing',
      features: [
        { name: 'AI Performance Analysis', included: true },
        { name: 'Unlimited Scene Analyses', included: true },
        { name: 'Advanced Emotion Accuracy Score', included: true },
        { name: 'Detailed Body Language Analysis', included: true },
        { name: 'AI Professor Pick (Strasberg, Chekhov, etc)', included: true },
        { name: 'Detailed Feedback Reports', included: true },
        { name: 'Professional Actor Comparisons', included: true },
        { name: 'Performance Tracking Over Time', included: true }
      ],
      buttonText: 'Save with Annual',
      popular: false
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/iconic-movie-frames/There_Will_Be_Blood_Daniel_Day_Lewis.jpeg')] opacity-10 bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-300 mb-12 text-center">
            Your Personal Acting Coach, Powered by AI
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative bg-black/30 backdrop-blur-sm border-white/10 ${
                  plan.popular ? 'border-theater-gold shadow-lg shadow-theater-gold/20' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-theater-gold text-theater-purple px-3 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-300">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-theater-gold">${plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-center gap-2">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-theater-gold" />
                        ) : (
                          <X className="h-5 w-5 text-gray-500" />
                        )}
                        <span className={feature.included ? 'text-gray-200' : 'text-gray-500'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={onGetStarted}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-theater-gold hover:bg-theater-gold/90 text-theater-purple' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};