import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type SubscriptionTier = 'free' | 'pro' | 'annual';

interface UserUsage {
  performance_count: number;
  is_subscribed: boolean;
  subscription_tier: SubscriptionTier;
  subscription_expiry: string | null;
}

export const useSubscription = () => {
  const { data: usage, isLoading, error } = useQuery({
    queryKey: ['user-usage'],
    queryFn: async () => {
      console.log("Fetching user usage and subscription info...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching user usage:", error);
        throw error;
      }

      console.log("User usage data:", data);
      return data as UserUsage;
    }
  });

  const canUploadPerformance = () => {
    if (!usage) return false;
    
    if (usage.subscription_tier === 'free') {
      return usage.performance_count < 2;
    }
    
    if (usage.subscription_tier === 'pro' || usage.subscription_tier === 'annual') {
      return usage.subscription_expiry ? new Date(usage.subscription_expiry) > new Date() : false;
    }

    return false;
  };

  return {
    usage,
    isLoading,
    error,
    canUploadPerformance,
    isSubscribed: usage?.is_subscribed || false,
    subscriptionTier: usage?.subscription_tier || 'free',
  };
};