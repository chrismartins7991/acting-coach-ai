
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const RehearsalRoom = () => {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if the OpenAI API is configured
  useEffect(() => {
    const checkApiConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-api-config', {
          body: { checkKey: 'OPENAI_API_KEY' }
        });
        
        if (error || !data?.isConfigured) {
          setApiError('Rehearsal functionality requires OpenAI API key configuration.');
        }
      } catch (err) {
        console.error("Error checking API configuration:", err);
        // Silent fail - endpoint might not exist
      }
    };
    
    if (user) {
      checkApiConfig();
    }
  }, [user]);

  // Mock exercise data - in a real app, this would come from the backend
  useEffect(() => {
    // Simulate fetching exercises from backend
    const fetchExercises = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // This would be a real API call in production
        // const { data, error } = await supabase.functions.invoke('get-exercises', {
        //   body: { userId: user.id }
        // });
        
        // Mocked data for now
        setTimeout(() => {
          setExercises([
            {
              id: 1,
              category: "voice",
              title: "Vocal Warm-up",
              description: "Start with deep breathing exercises. Inhale deeply through your nose, filling your diaphragm, then exhale slowly through your mouth. Repeat 10 times.",
              duration: "10 minutes",
              level: "Beginner"
            },
            {
              id: 2,
              category: "voice",
              title: "Articulation Practice",
              description: "Practice tongue twisters slowly and then gradually increase speed. Example: 'Peter Piper picked a peck of pickled peppers.'",
              duration: "15 minutes",
              level: "Intermediate"
            },
            {
              id: 3,
              category: "physical",
              title: "Body Awareness",
              description: "Stand in a neutral position. Slowly scan your body from head to toe, noting any tension. Release tension in each area as you go.",
              duration: "5 minutes",
              level: "Beginner"
            },
            {
              id: 4,
              category: "physical",
              title: "Character Physicality",
              description: "Choose a character and explore how they would walk, stand, and gesture. Practice transitioning between different character physicalities.",
              duration: "20 minutes",
              level: "Advanced"
            },
            {
              id: 5,
              category: "emotional",
              title: "Emotional Memory",
              description: "Recall a personal memory with a strong emotional connection. Focus on the sensory details and allow the emotion to manifest physically.",
              duration: "15 minutes",
              level: "Intermediate"
            },
            {
              id: 6,
              category: "emotional",
              title: "Emotion Transitions",
              description: "Practice transitioning between contrasting emotions (joy to sadness, fear to anger) within a short monologue or scene.",
              duration: "25 minutes",
              level: "Advanced"
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        toast({
          title: "Error",
          description: "Failed to load exercises. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    if (!apiError) {
      fetchExercises();
    } else {
      setLoading(false);
    }
  }, [user, toast, apiError]);

  const renderExercises = (category: string) => {
    const filteredExercises = exercises.filter(ex => ex.category === category);
    
    if (filteredExercises.length === 0) {
      return (
        <div className="text-center py-8 text-white/60">
          No exercises available for this category yet.
        </div>
      );
    }
    
    return filteredExercises.map(exercise => (
      <Card key={exercise.id} className="mb-4 bg-black/40 border-white/10">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-white">{exercise.title}</h3>
            <span className="text-xs bg-theater-purple px-2 py-1 rounded-full text-white">
              {exercise.level}
            </span>
          </div>
          <p className="text-white/80 text-sm mb-3">{exercise.description}</p>
          <div className="text-xs text-white/60">Duration: {exercise.duration}</div>
        </CardContent>
      </Card>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-theater-gold" />
        <span className="ml-2 text-white">Loading exercises...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {apiError && (
        <Alert className="bg-yellow-500/10 border-yellow-500/50">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-500 ml-2">{apiError}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="voice" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6 bg-black/20">
          <TabsTrigger value="voice" className="text-white data-[state=active]:text-theater-gold data-[state=active]:bg-black/40">
            Voice
          </TabsTrigger>
          <TabsTrigger value="physical" className="text-white data-[state=active]:text-theater-gold data-[state=active]:bg-black/40">
            Physical
          </TabsTrigger>
          <TabsTrigger value="emotional" className="text-white data-[state=active]:text-theater-gold data-[state=active]:bg-black/40">
            Emotional
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="voice" className="mt-0">
          {renderExercises("voice")}
        </TabsContent>
        
        <TabsContent value="physical" className="mt-0">
          {renderExercises("physical")}
        </TabsContent>
        
        <TabsContent value="emotional" className="mt-0">
          {renderExercises("emotional")}
        </TabsContent>
      </Tabs>
    </div>
  );
};
