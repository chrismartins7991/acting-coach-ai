
import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlanCard } from "./pricing/PlanCard";
import { plans } from "@/data/plans";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentWallProps {
  isOpen: boolean;
  onComplete?: () => void;
}

export const PaymentWall = ({ isOpen, onComplete }: PaymentWallProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
    <Dialog 
      open={isOpen} 
      onOpenChange={onComplete ? () => onComplete() : undefined}
    >
      <DialogContent 
        className="bg-black/95 border-theater-gold backdrop-blur-lg rounded-lg"
        style={{ 
          width: isMobile ? 'calc(100% - 32px)' : 'auto',
          maxWidth: isMobile ? '100%' : '95vw',
          maxHeight: '90vh',
          overflow: 'auto',
          margin: isMobile ? '16px' : 'auto',
        }}
        // Prevent closing by clicking outside
        onPointerDownOutside={(e) => {
          // Prevent closing by clicking outside
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing by pressing Escape
          e.preventDefault();
        }}
      >
        <div className="flex flex-col items-center justify-start p-2 sm:p-4 md:p-6">
          <div className="text-center space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-xl md:text-2xl text-white font-bold">
              Unlock Your Performance Analysis
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
              Choose a plan to view your detailed acting analysis and feedback
            </p>
          </div>
          
          <div className="w-full grid gap-3 sm:gap-5 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
