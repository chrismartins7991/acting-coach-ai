
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  stripe_price_id: string;
  description: string | null;
  price: number;
}

interface PaymentWallProps {
  onComplete?: () => void;
}

export const PaymentWall = ({ onComplete }: PaymentWallProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        return;
      }

      setPlans(data);
    };

    fetchPlans();
  }, []);

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

      if (data.url) {
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
      <Card className="w-full max-w-4xl bg-black/80 border-theater-gold">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl text-white">Unlock Your Performance Analysis</CardTitle>
          <CardDescription className="text-lg text-gray-300">
            Choose a plan to view your detailed acting analysis and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="bg-black/50 border-theater-gold/50 hover:border-theater-gold transition-all">
                <CardHeader>
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-300">
                    €{plan.price.toFixed(2)}
                    {plan.stripe_price_id === 'price_1QomppGW0eRF7KXG97pARyLc' && (
                      <span className="block text-theater-gold">Trial Offer!</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">{plan.description}</p>
                  <Button
                    onClick={() => handleSubscribe(plan.stripe_price_id)}
                    disabled={loading}
                    className="w-full bg-theater-gold hover:bg-theater-gold/80 text-black"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Subscribe'
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
