
import { useState, useEffect } from "react";
import { type CarouselApi } from "@/components/ui/carousel";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { CoachCarousel } from "./CoachCarousel";
import { PreferencesForm } from "./PreferencesForm";
import { coaches } from "./coachData";

interface CoachSelectionProps {
  onComplete: () => void;
}

export const CoachSelection = ({ onComplete }: CoachSelectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    emotionInVoice: false,
    voiceExpressiveness: false,
    physicalPresence: false,
    faceExpressions: false,
    clearnessOfDiction: false,
  });

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCenterIndex(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_coach_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setSelectedCoach(data.selected_coach);
          setPreferences({
            emotionInVoice: data.emotion_in_voice,
            voiceExpressiveness: data.voice_expressiveness,
            physicalPresence: data.physical_presence,
            faceExpressions: data.face_expressions,
            clearnessOfDiction: data.clearness_of_diction,
          });
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleSelect = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to select a coach",
        variant: "destructive",
      });
      return;
    }

    const coach = coaches[centerIndex];
    setSelectedCoach(coach.type);
    setShowPreferences(true);
  };

  const handlePreferenceToggle = (preference: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  const handleSavePreferences = async () => {
    if (!user || !selectedCoach) return;

    try {
      const { error } = await supabase
        .from('user_coach_preferences')
        .upsert({
          user_id: user.id,
          selected_coach: selectedCoach as "stanislavski" | "strasberg" | "brecht" | "chekhov" | "meisner",
          emotion_in_voice: preferences.emotionInVoice,
          voice_expressiveness: preferences.voiceExpressiveness,
          physical_presence: preferences.physicalPresence,
          face_expressions: preferences.faceExpressions,
          clearness_of_diction: preferences.clearnessOfDiction,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your coach and analysis preferences have been saved",
      });
      
      // Call onComplete to trigger navigation to upload page
      onComplete();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="text-center space-y-4 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Choose Your Acting Coach</h1>
        <p className="text-base sm:text-lg text-gray-300">Select an iconic coach to analyze your performance</p>
      </div>

      {!showPreferences ? (
        <div className="px-2 sm:px-8 md:px-12">
          <CoachCarousel 
            onCoachSelect={handleSelect}
            centerIndex={centerIndex}
            setApi={setApi}
          />
        </div>
      ) : (
        <div className="px-4 sm:px-6">
          <PreferencesForm
            preferences={preferences}
            onTogglePreference={handlePreferenceToggle}
            onSave={handleSavePreferences}
          />
        </div>
      )}
    </>
  );
};
