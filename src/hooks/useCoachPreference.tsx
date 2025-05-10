
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OnboardingStep } from "./useOnboardingProgress";

export const useCoachPreference = (updateProgress: (nextStep: OnboardingStep) => Promise<void>) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const skipCoachSelection = async () => {
    // Set a default coach (Stanislavski) when user skips selection
    if (user) {
      try {
        await supabase
          .from('user_coach_preferences')
          .upsert({
            user_id: user.id,
            selected_coach: "stanislavski",
            emotion_in_voice: true,
            voice_expressiveness: true,
            physical_presence: true,
            face_expressions: true,
            clearness_of_diction: true,
          }, {
            onConflict: 'user_id'
          });
          
        // Now redirect to upload step instead of upload page
        updateProgress("upload");
      } catch (error) {
        console.error('Error setting default coach:', error);
        toast({
          title: "Error",
          description: "Failed to set default coach",
          variant: "destructive",
        });
      }
    } else {
      // If no user, redirect to signup
      updateProgress("signup");
    }
  };

  const handleCoachSelectionComplete = () => {
    // Now redirect to upload step instead of upload page
    updateProgress("upload");
  };
  
  return {
    skipCoachSelection,
    handleCoachSelectionComplete
  };
};
