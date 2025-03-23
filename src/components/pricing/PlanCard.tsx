
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../ui/card";
import { cn } from "@/lib/utils";
import { Plan } from "@/data/plans";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlanCardProps {
  plan: Plan;
  loading: boolean;
  onSubscribe: (priceId: string) => void;
}

export const PlanCard = ({ plan, loading, onSubscribe }: PlanCardProps) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card 
        className={cn(
          "h-full flex flex-col bg-black/50 border-theater-gold/50 hover:border-theater-gold transition-all duration-300",
          "hover:shadow-lg hover:shadow-theater-gold/20 backdrop-blur-sm",
          plan.popular && "border-theater-gold shadow-lg shadow-theater-gold/20"
        )}
      >
        {plan.popular && (
          <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-theater-gold text-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
              Most Popular
            </span>
          </div>
        )}
        
        <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
          <CardTitle className="text-base sm:text-lg font-bold text-white">{plan.name}</CardTitle>
          <div className="mt-1 sm:mt-2">
            <span className="text-xl sm:text-2xl font-bold text-theater-gold">€{plan.price}</span>
            <span className="text-xs sm:text-sm text-gray-400">/{plan.period}</span>
            {plan.originalPrice && (
              <div className="mt-1">
                <span className="line-through text-gray-400 text-xs sm:text-sm">€{plan.originalPrice}</span>
                <span className="ml-1 sm:ml-2 text-[#ff0000] font-semibold text-xs sm:text-sm">40% OFF!</span>
              </div>
            )}
          </div>
          <CardDescription className="text-gray-300 mt-1 sm:mt-2 text-xs sm:text-sm">
            {plan.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3 flex-grow flex flex-col">
          <ul className="space-y-2 sm:space-y-3 flex-grow">
            {plan.features.map((feature) => (
              <li key={feature.name} className="flex items-start gap-1 sm:gap-2">
                {feature.included ? (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-theater-gold flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                )}
                <span className={cn(
                  "text-xs sm:text-sm",
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
              "w-full mt-3 sm:mt-4 py-1 sm:py-2 px-2 sm:px-4 h-auto min-h-9 text-xs sm:text-sm transition-all duration-300",
              plan.popular 
                ? 'bg-theater-gold hover:bg-theater-gold/90 text-black'
                : 'bg-white/10 hover:bg-white/20 text-white'
            )}
          >
            {loading ? (
              <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              `Get ${plan.name}`
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
