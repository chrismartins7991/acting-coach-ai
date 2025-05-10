
import { ReactNode, useState } from "react";
import { PaymentWall } from "@/components/PaymentWall";
import { useSubscription } from "@/hooks/useSubscription";

interface RehearsalFeatureWrapperProps {
  children: ReactNode | ((handleInteraction: () => void) => ReactNode);
  onInteraction: () => void;
}

export const RehearsalFeatureWrapper = ({ 
  children, 
  onInteraction 
}: RehearsalFeatureWrapperProps) => {
  const [showPaymentWall, setShowPaymentWall] = useState(false);
  const { subscriptionTier } = useSubscription();

  const handleInteraction = () => {
    if (subscriptionTier === 'trial') {
      setShowPaymentWall(true);
    } else {
      onInteraction();
    }
  };

  return (
    <>
      <PaymentWall 
        isOpen={showPaymentWall} 
        onComplete={() => setShowPaymentWall(false)} 
      />
      
      {typeof children === 'function' 
        ? children(handleInteraction) 
        : children}
    </>
  );
};
