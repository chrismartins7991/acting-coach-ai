
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SignupStepProps {
  onNext: () => void;
}

export const SignupStep = ({ onNext }: SignupStepProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email: email,
          }
        }
      });

      if (error) {
        setError(error.message);
        return;
      }

      toast({
        title: "Account created successfully!",
        description: "Let's continue with your onboarding.",
      });
      
      onNext();
    } catch (error: any) {
      console.error("Sign up error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto space-y-6 px-4 sm:px-6"
    >
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Create Your Account</h2>
        <p className="text-base sm:text-lg text-gray-300">Join our community of aspiring actors</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/50 border-theater-gold text-white"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black/50 border-theater-gold text-white"
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-theater-gold hover:bg-theater-gold/90 text-black font-bold"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Sign Up & Continue"}
        </Button>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={onNext}
            className="text-gray-400 hover:text-white hover:bg-black/30"
          >
            Skip for now
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
