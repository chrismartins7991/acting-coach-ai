
import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlanCard } from "./pricing/PlanCard";
import { plans } from "@/data/plans";

interface PaymentWallProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const PaymentWall = ({ isOpen }: PaymentWallProps) => {
  const [loading, setLoading] = useState(false);
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

      console.log("Creating checkout for:", { priceId, userId: user.id });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId,
          userId: user.id,
          returnUrl: `${window.location.origin}/last-results`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        toast({
          title: "Error",
          description: "Failed to start checkout process. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        console.error('No checkout URL returned');
        toast({
          title: "Error",
          description: "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
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
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-6xl bg-black/80 border-theater-gold" onPointerDownOutside={(e) => e.preventDefault()}>
        <div className="text-center space-y-6">
          <h2 className="text-2xl md:text-3xl text-white font-bold">
            Unlock Your Performance Analysis
          </h2>
          <p className="text-lg text-gray-300">
            Choose a plan to view your detailed acting analysis and feedback
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                loading={loading}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

