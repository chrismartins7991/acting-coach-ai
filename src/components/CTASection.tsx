import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Check, X, Home, Video, Target, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection = ({ onGetStarted }: CTASectionProps) => {
  const { t } = useTranslation();

  const whyUseReasons = [
    {
      icon: Video,
      title: "Professional Self-Tape Studio",
      description: "Record auditions with framing guides, lighting tips, and built-in teleprompter. Compare takes side-by-side."
    },
    {
      icon: BookOpen,
      title: "Advanced Rehearsal Room",
      description: "Practice with AI scene partners, memorization tools, and cold reading simulations."
    },
    {
      icon: Target,
      title: "Targeted Skill Improvement",
      description: "Get personalized AI feedback based on professional acting methods."
    }
  ];

  const plans = [
    {
      name: 'Trial',
      price: '1',
      period: 'trial',
      description: 'Perfect for trying out AI acting tools',
      features: [
        { name: 'Basic Self-Tape Recording', included: true },
        { name: 'Simple Framing Guide', included: true },
        { name: 'Basic Script Reading', included: true },
        { name: 'Limited AI Scene Partner', included: true },
        { name: 'Teleprompter Features', included: false },
        { name: 'Take Comparison Tools', included: false },
        { name: 'Cold Reading Practice', included: false },
        { name: 'Memorization Tools', included: false },
        { name: 'Custom Export Templates', included: false },
        { name: 'Advanced AI Reader Options', included: false }
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '7.99',
      period: 'month',
      description: 'Enhanced access to studio features',
      features: [
        { name: 'Professional Self-Tape Studio', included: true },
        { name: 'Advanced Framing Guides', included: true },
        { name: 'Take Comparison Tools', included: true },
        { name: 'Full Script Reading Features', included: true },
        { name: 'Teleprompter with Controls', included: true },
        { name: 'Basic Export Templates', included: true },
        { name: 'Cold Reading Practice', included: true },
        { name: 'Basic Memorization Tools', included: false },
        { name: 'Custom Export Templates', included: false },
        { name: 'Advanced AI Reader Options', included: false }
      ],
      buttonText: 'Start Pro Trial',
      popular: false
    },
    {
      name: 'Actor',
      price: '9.22',
      originalPrice: '12.90',
      period: 'month',
      description: 'Full access to all studio features',
      features: [
        { name: 'Professional Self-Tape Studio', included: true },
        { name: 'Advanced Framing & Lighting', included: true },
        { name: 'Advanced Take Comparison', included: true },
        { name: 'Full Rehearsal Room Access', included: true },
        { name: 'Advanced Teleprompter', included: true },
        { name: 'Custom Export Templates', included: true },
        { name: 'Advanced Cold Reading', included: true },
        { name: 'Full Memorization Tools', included: true },
        { name: 'Multi-Language AI Readers', included: true },
        { name: 'Priority Support', included: true }
      ],
      buttonText: 'Become an Actor',
      popular: true
    },
    {
      name: 'Lifetime Access',
      price: '199',
      period: 'one-time',
      description: 'All Actor plan features forever',
      features: [
        { name: 'AI Performance Analysis', included: true },
        { name: 'Unlimited Scene Analyses', included: true },
        { name: 'Advanced Emotion Accuracy Score', included: true },
        { name: 'Detailed Body Language Analysis', included: true },
        { name: 'AI Professor Pick (Strasberg, Chekhov, etc)', included: true },
        { name: 'Performance Tracking Over Time', included: true },
        { name: 'Detailed Feedback Reports', included: true },
        { name: 'Professional Actor Comparisons', included: true },
        { name: 'Digital Certified Actor Badge (NFT)', included: true },
        { name: 'History of Performance Analyses', included: true }
      ],
      buttonText: 'Get Lifetime Access',
      popular: false
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/iconic-movie-frames/There_Will_Be_Blood_Daniel_Day_Lewis.jpeg')] opacity-10 bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Why Use Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            Why use AI Acting Coach?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {whyUseReasons.map((reason, index) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-theater-gold/20"
              >
                <reason.icon className="w-12 h-12 text-theater-gold mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{reason.title}</h3>
                <p className="text-gray-300">{reason.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-300 mb-12 text-center">
            Your Personal Acting Coach, Powered by AI
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <span className="text-4xl font-bold text-theater-gold">€{plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                    {plan.originalPrice && (
                      <span className="ml-2 text-2xl text-white relative inline-block">
                        <span className="absolute top-1/2 left-0 w-full h-[2px] bg-[#ff0000] transform -rotate-12"></span>
                        €{plan.originalPrice}
                      </span>
                    )}
                    {plan.originalPrice && (
                      <div className="mt-1 text-sm text-[#ff0000] font-semibold">
                        40% Early Bird Discount!
                      </div>
                    )}
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
