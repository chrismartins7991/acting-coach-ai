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

  // Add console logs to track auth state changes
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
        />
      </DialogContent>
    </Dialog>
  );
};