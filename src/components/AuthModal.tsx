import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { useNavigate } from 'react-router-dom';

export const AuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('User is already logged in, redirecting to dashboard');
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  // Add console logs to track auth state changes and errors
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    
    if (event === 'SIGNED_IN') {
      setIsOpen(false);
      navigate('/dashboard');
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
    } else if (event === 'SIGNED_OUT') {
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });
    } else if (event === 'USER_UPDATED') {
      toast({
        title: "Email confirmed",
        description: "Your email has been confirmed.",
      });
    } else if (event === 'PASSWORD_RECOVERY') {
      toast({
        title: "Password reset requested",
        description: "Check your email for the password reset link.",
      });
    } else if (event === 'SIGNED_UP') {
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });
    } else if (event === 'USER_DELETED') {
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
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
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(var(--theater-gold))',
                  brandAccent: 'rgb(var(--theater-gold-hover))',
                }
              }
            }
          }}
          theme="dark"
          providers={['google']}
          redirectTo={`${window.location.origin}/auth/callback`}
          onlyThirdPartyProviders={false}
          localization={{
            variables: {
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign up',
                loading_button_label: 'Signing up ...',
                social_provider_text: 'Sign in with {{provider}}',
                link_text: 'Don\'t have an account? Sign up',
                confirmation_text: 'Check your email for the confirmation link'
              },
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
                email_input_placeholder: 'Your email address',
                password_input_placeholder: 'Your password',
                button_label: 'Sign in',
                loading_button_label: 'Signing in ...',
                social_provider_text: 'Sign in with {{provider}}',
                link_text: 'Already have an account? Sign in'
              }
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};