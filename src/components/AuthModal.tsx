import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

export const AuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Add console logs to track auth state changes and errors
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    
    if (event === 'SIGNED_IN') {
      setIsOpen(false);
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
    } else if (event === 'SIGNED_OUT') {
      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });
    } else if (event === 'USER_UPDATED') {
      toast({
        title: "Email confirmed",
        description: "Your email has been confirmed.",
      });
    }
  });

  const handleAuthError = (error: Error) => {
    console.error('Auth error:', error);
    
    if (error.message.includes('user_already_exists')) {
      toast({
        title: "Account exists",
        description: "This email is already registered. Please try signing in instead.",
        variant: "destructive",
      });
    } else if (error.message.includes('invalid_credentials')) {
      toast({
        title: "Invalid credentials",
        description: "Please check your email and password and try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg"
          className="bg-theater-gold hover:bg-theater-gold/90 text-theater-purple font-semibold"
        >
          Start Free Trial
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to Acting Coach AI</DialogTitle>
        </DialogHeader>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
          providers={['google']}
          redirectTo={`${window.location.origin}/auth/callback`}
          onlyThirdPartyProviders={false}
          onError={handleAuthError}
        />
      </DialogContent>
    </Dialog>
  );
};