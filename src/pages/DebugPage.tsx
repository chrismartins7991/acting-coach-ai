import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import VideoUploader from "@/components/VideoUploader";

const coaches = [
  {
    name: "Constantin Stanislavski",
    description: "Master of emotional memory and the 'magic if' technique",
    image: "/Acting-Methods-Iconic-Coaches/Stanislavski-Portrait-Enhanced.png",
    contribution: "Method Acting Foundation"
  },
  {
    name: "Lee Strasberg",
    description: "Pioneer of method acting in America",
    image: "/Acting-Methods-Iconic-Coaches/Strasberg-Portrait-Enhanced.png",
    contribution: "Psychological Realism"
  },
  {
    name: "Bertolt Brecht",
    description: "Pioneer of epic theater and alienation effect",
    image: "/Acting-Methods-Iconic-Coaches/Brecht-Portrait-Enhanced.png",
    contribution: "Epic Theater"
  },
  {
    name: "Michael Chekhov",
    description: "Master of psychological gesture technique",
    image: "/Acting-Methods-Iconic-Coaches/Chekhov-Portrait-Enhanced.png",
    contribution: "Psychological Gesture"
  },
  {
    name: "Sanford Meisner",
    description: "Developer of the Meisner technique",
    image: "/Acting-Methods-Iconic-Coaches/Meisner-Portrait-Enhanced.png",
    contribution: "Repetition Technique"
  }
];

const DebugPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [centerIndex, setCenterIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [showPreferences, setShowPreferences] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
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
          setShowUploader(true);
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
      navigate("/login");
      return;
    }

    const coach = coaches[centerIndex];
    setSelectedCoach(coach.name);
    setShowPreferences(true);
    console.log(`Selected coach: ${coach.name}`);
  };

  const handlePreferenceToggle = async (preference: keyof typeof preferences) => {
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
          selected_coach: selectedCoach,
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
      
      setShowUploader(true);
      setShowPreferences(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleModifySettings = () => {
    setShowUploader(false);
    setShowPreferences(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-theater-purple p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {!showUploader ? (
          <>
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white">Choose Your Acting Coach</h1>
              <p className="text-lg text-gray-300">Select an iconic coach to analyze your performance</p>
            </div>

            {!showPreferences ? (
              <div className="relative px-4 md:px-12">
                <Carousel 
                  className="w-full max-w-5xl mx-auto"
                  opts={{
                    align: "center",
                    loop: true,
                  }}
                  setApi={setApi}
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {coaches.map((coach, index) => (
                      <CarouselItem key={coach.name} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="h-full relative group"
                        >
                          <Card 
                            className={`relative h-full flex flex-col bg-black rounded-lg p-6 border transition-all duration-300
                              ${index === centerIndex 
                                ? 'border-theater-gold shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-105 z-10' 
                                : 'border-white/10'}`}
                          >
                            <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                              <img
                                src={coach.image}
                                alt={coach.name}
                                className="w-full h-full object-cover transform transition-transform duration-300"
                              />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{coach.name}</h3>
                            <p className="text-gray-300 mb-4 flex-grow">{coach.description}</p>
                            <span className="inline-block bg-theater-gold text-black px-3 py-1 rounded-full text-sm">
                              {coach.contribution}
                            </span>
                          </Card>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2">
                    <CarouselPrevious className="bg-theater-gold hover:bg-theater-gold/80 text-black" />
                  </div>
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                    <CarouselNext className="bg-theater-gold hover:bg-theater-gold/80 text-black" />
                  </div>
                </Carousel>

                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleSelect}
                    className="bg-theater-gold hover:bg-theater-gold/80 text-black font-semibold px-8 py-2 rounded-full transform transition-all duration-300 hover:scale-105"
                  >
                    Select this Acting Coach
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto bg-black/30 p-8 rounded-lg border border-theater-gold"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Analysis Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Emotion in Voice</span>
                    <Toggle 
                      pressed={preferences.emotionInVoice}
                      onPressedChange={() => handlePreferenceToggle('emotionInVoice')}
                      className="bg-purple-700 data-[state=on]:bg-theater-gold"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Voice Expressiveness</span>
                    <Toggle 
                      pressed={preferences.voiceExpressiveness}
                      onPressedChange={() => handlePreferenceToggle('voiceExpressiveness')}
                      className="bg-blue-700 data-[state=on]:bg-theater-gold"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Physical Presence</span>
                    <Toggle 
                      pressed={preferences.physicalPresence}
                      onPressedChange={() => handlePreferenceToggle('physicalPresence')}
                      className="bg-red-700 data-[state=on]:bg-theater-gold"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Face Expressions</span>
                    <Toggle 
                      pressed={preferences.faceExpressions}
                      onPressedChange={() => handlePreferenceToggle('faceExpressions')}
                      className="bg-green-700 data-[state=on]:bg-theater-gold"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Clearness of Diction</span>
                    <Toggle 
                      pressed={preferences.clearnessOfDiction}
                      onPressedChange={() => handlePreferenceToggle('clearnessOfDiction')}
                      className="bg-yellow-700 data-[state=on]:bg-theater-gold"
                    />
                  </div>
                </div>
                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={handleSavePreferences}
                    className="bg-theater-gold hover:bg-theater-gold/80 text-black font-semibold px-8 py-2 rounded-full transform transition-all duration-300 hover:scale-105"
                  >
                    Save Preferences & Continue
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Upload Your Performance</h2>
              <Button
                onClick={handleModifySettings}
                variant="outline"
                className="bg-theater-gold/10 hover:bg-theater-gold/20 text-theater-gold border-theater-gold"
              >
                Modify Coach & Preferences
              </Button>
            </div>
            <VideoUploader />
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPage;