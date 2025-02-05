
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentWallProps {
  onComplete?: () => void;
}

const plans = [
  {
    id: 'trial',
    name: 'Trial',
    description: 'Perfect for trying out AI acting analysis',
    price: 1,
    period: 'trial',
    stripe_price_id: 'price_1QomppGW0eRF7KXG97pARyLc',
    features: [
      { name: 'AI Performance Analysis', included: true },
      { name: '1 Scene Analysis', included: true },
      { name: 'Basic Emotion Accuracy Score', included: true },
      { name: 'Basic Body Language Analysis', included: true },
      { name: 'AI Professor Pick (Strasberg, Chekhov, etc)', included: false },
      { name: 'Digital Certified Actor Badge (NFT)', included: false },
      { name: 'Performance Tracking Over Time', included: false },
      { name: 'Detailed Feedback Reports', included: false },
      { name: 'Professional Actor Comparisons', included: false },
      { name: 'History of Performance Analyses', included: false }
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Enhanced access to AI coaching features',
    price: 7.99,
    period: 'month',
    stripe_price_id: 'price_1QomqJGW0eRF7KXGemopTK8r',
    features: [
      { name: 'AI Performance Analysis', included: true },
      { name: '10 Scene Analyses per Month', included: true },
      { name: 'Advanced Emotion Accuracy Score', included: true },
      { name: 'Detailed Body Language Analysis', included: true },
      { name: 'Random AI Professor Method Based Analyses', included: true },
      { name: 'Performance Tracking Over Time', included: true },
      { name: 'Digital Certified Actor Badge (NFT)', included: false },
      { name: 'Professional Actor Comparisons', included: false },
      { name: 'Detailed Feedback Reports', included: false },
      { name: 'History of Performance Analyses', included: false }
    ]
  },
  {
    id: 'actor',
    name: 'Actor',
    description: 'Full access to all AI coaching features',
    price: 9.22,
    originalPrice: 12.90,
    period: 'month',
    stripe_price_id: 'price_1QomrGGW0eRF7KXGKkYlyt0m',
    features: [
      { name: 'AI Performance Analysis', included: true },
      { name: 'Unlimited Scene Analyses', included: true },
      { name: 'Advanced Emotion Accuracy Score', included: true },
      { name: 'Digital Certified Actor Badge (NFT)', included: true },
      { name: 'Detailed Body Language Analysis', included: true },
      { name: 'AI Professor Pick (Strasberg, Chekhov, etc)', included: true },
      { name: 'Performance Tracking Over Time', included: true },
      { name: 'Detailed Feedback Reports', included: true },
      { name: 'Professional Actor Comparisons', included: true },
      { name: 'History of Performance Analyses', included: true }
    ],
    popular: true
  },
  {
    id: 'lifetime',
    name: 'Lifetime Access',
    description: 'All Actor plan features forever',
    price: 199,
    period: 'one-time',
    stripe_price_id: 'price_1QomrhGW0eRF7KXGL1h0XbPR',
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
    ]
  }
];

export const PaymentWall = ({ onComplete }: PaymentWallProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to subscribe",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId,
          userId: user.id,
          returnUrl: window.location.href,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl bg-black/80 border-theater-gold">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl text-white">Unlock Your Performance Analysis</CardTitle>
          <CardDescription className="text-lg text-gray-300">
            Choose a plan to view your detailed acting analysis and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={cn(
                  "bg-black/50 border-theater-gold/50 hover:border-theater-gold transition-all",
                  plan.popular && "border-theater-gold shadow-lg shadow-theater-gold/20"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#FFD700] text-black px-3 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-theater-gold">€{plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                    {plan.originalPrice && (
                      <>
                        <div className="mt-1">
                          <span className="line-through text-gray-400">€{plan.originalPrice}</span>
                          <span className="ml-2 text-[#ff0000] font-semibold">40% OFF!</span>
                        </div>
                      </>
                    )}
                  </div>
                  <CardDescription className="text-gray-300 mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-start gap-2">
                        {feature.included ? (
                          <CheckCircle2 className="h-5 w-5 text-theater-gold flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={cn(
                          "text-sm",
                          feature.included ? 'text-gray-200' : 'text-gray-500'
                        )}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSubscribe(plan.stripe_price_id)}
                    disabled={loading}
                    className={cn(
                      "w-full mt-4",
                      plan.popular 
                        ? 'bg-[#FFD700] hover:bg-[#FFD700]/90 text-black'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    )}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      `Get ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
