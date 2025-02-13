
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = 'trial' | 'pro' | 'actor' | 'lifetime';

interface UserUsage {
  performance_count: number;
  is_subscribed: boolean;
  subscription_tier: SubscriptionTier;
  subscription_expiry: string | null;
}

interface SubscriptionPlan {
  name: string;
  description: string | null;
  price: number;
}

export const useSubscription = () => {
  const { data: usage, isLoading: usageLoading, error: usageError } = useQuery({
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

  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ['subscription-plan', usage?.subscription_tier],
    enabled: !!usage?.subscription_tier,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', usage?.subscription_tier)
        .single();

      if (error) {
        console.error("Error fetching subscription plan:", error);
        return null;
      }

      return data as SubscriptionPlan;
    }
  });

  const canUploadPerformance = () => {
    if (!usage) return false;
    
    if (usage.subscription_tier === 'trial') {
      return usage.performance_count < 2;
    }
    
    if (usage.subscription_tier === 'pro' || usage.subscription_tier === 'actor' || usage.subscription_tier === 'lifetime') {
      return usage.subscription_expiry ? new Date(usage.subscription_expiry) > new Date() : false;
    }

    return false;
  };

  return {
    usage,
    plan,
    isLoading: usageLoading || planLoading,
    error: usageError,
    canUploadPerformance,
    isSubscribed: usage?.is_subscribed || false,
    subscriptionTier: usage?.subscription_tier || 'trial',
  };
};
