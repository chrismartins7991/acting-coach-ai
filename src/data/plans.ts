
export type Feature = {
  name: string;
  included: boolean;
};

export type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  period: string;
  stripe_price_id: string;
  features: Feature[];
  popular?: boolean;
};

export const plans: Plan[] = [
  {
    id: 'trial',
    name: 'Trial',
    description: 'Perfect for trying out AI acting analysis',
    price: 1,
    period: 'trial',
    stripe_price_id: 'price_1OxX4tGW0eRF7KXGeWbaSQsn',
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
    stripe_price_id: 'price_1OxX5AGW0eRF7KXGmHZKEcXj',
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
    stripe_price_id: 'price_1OxX5SGW0eRF7KXGqLVgzuK3',
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
    stripe_price_id: 'price_1OxX5kGW0eRF7KXGXvEFGxUY',
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
