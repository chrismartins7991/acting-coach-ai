import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { AuthChangeEvent, AuthError } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from './ui/alert';

interface AuthModalProps {
  buttonText: string;
  variant?: "primary" | "outline";
  className?: string;
}

export const AuthModal = ({ buttonText, variant = "primary", className }: AuthModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session check error:', sessionError);
        return;
      }
      if (session) {
        console.log('User is already logged in, redirecting to dashboard');
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  // Add console logs to track auth state changes and errors
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      console.log('Auth state changed:', event, session);
      
      // Clear error when modal is closed or on successful actions
      if (!isOpen || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setError(null);
      }

      switch (event) {
        case 'SIGNED_IN':
          setIsOpen(false);
          navigate('/dashboard');
          toast({
            title: "Welcome!",
            description: "You have successfully signed in.",
          });
          break;
        case 'SIGNED_OUT':
          navigate('/');
          toast({
            title: "Signed out",
            description: "You have been signed out.",
          });
          break;
        case 'USER_UPDATED':
          toast({
            title: "Email confirmed",
            description: "Your email has been confirmed.",
          });
          break;
        case 'PASSWORD_RECOVERY':
          toast({
            title: "Password reset requested",
            description: "Check your email for the password reset link.",
          });
          break;
        case 'TOKEN_REFRESHED':
          toast({
            title: "Account created",
            description: "Please check your email to confirm your account.",
          });
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, isOpen]);

  const handleError = (error: AuthError) => {
    console.error('Auth error:', error);
    let errorMessage = 'An error occurred during authentication.';
    
    if (error.message.includes('invalid_credentials')) {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Please verify your email address before signing in.';
    }
    
    setError(errorMessage);
  };

  const buttonStyle = variant === "primary" 
    ? "bg-theater-gold hover:bg-theater-gold/90 text-theater-purple font-semibold"
    : "border-2 border-white text-white hover:bg-white/10";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg"
          variant={variant === "primary" ? "default" : "outline"}
          className={cn(buttonStyle, className)}
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to Acting Coach AI</DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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