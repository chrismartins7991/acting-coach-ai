
import { useSubscription } from "@/hooks/useSubscription";
import { Loader2 } from "lucide-react";

export const SubscriptionBadge = () => {
  const { plan, isLoading, subscriptionTier } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-theater-gold/80" />
      </div>
    );
  }

  // Map subscription tier to display name
  const getPlanDisplayName = () => {
    switch (subscriptionTier) {
      case 'trial':
        return 'Trial';
      case 'pro':
        return 'Pro';
      case 'actor':
      case 'lifetime':
        return 'Actor';
      default:
        return 'Trial'; // Default to Trial if no valid tier is found
    }
  };

  return (
    <div className="px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
      <span className="text-xs text-theater-gold">{getPlanDisplayName()} Plan</span>
    </div>
  );
};
