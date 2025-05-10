
import { ReactNode, useState } from "react";
import { PaymentWall } from "@/components/PaymentWall";
import { useSubscription } from "@/hooks/useSubscription";

interface RehearsalFeatureWrapperProps {
  children: ReactNode;
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
      
      {/* Pass the handleInteraction function to children via cloning */}
      {children instanceof Function 
        ? children(handleInteraction) 
        : children}
    </>
  );
};
