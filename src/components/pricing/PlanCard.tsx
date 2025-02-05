
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/card";
import { cn } from "@/lib/utils";
import { Plan } from "@/data/plans";

interface PlanCardProps {
  plan: Plan;
  loading: boolean;
  onSubscribe: (priceId: string) => void;
}

export const PlanCard = ({ plan, loading, onSubscribe }: PlanCardProps) => {
  return (
    <Card 
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
          onClick={() => onSubscribe(plan.stripe_price_id)}
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
  );
};
