
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
    // Fetch existing preferences when component mounts
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
          onComplete();
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };

    fetchPreferences();
  }, [user, onComplete]);

  const navigate = useNavigate();

  const handleSelect = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to select a coach",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const coach = coaches[centerIndex];
    setSelectedCoach(coach.type);
    setShowPreferences(true);
    console.log(`Selected coach: ${coach.name}`);
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
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Choose Your Acting Coach</h1>
        <p className="text-lg text-gray-300">Select an iconic coach to analyze your performance</p>
      </div>

      {!showPreferences ? (
        <CoachCarousel 
          onCoachSelect={handleSelect}
          centerIndex={centerIndex}
          setApi={setApi}
        />
      ) : (
        <PreferencesForm
          preferences={preferences}
          onTogglePreference={handlePreferenceToggle}
          onSave={handleSavePreferences}
        />
      )}
    </>
  );
};
