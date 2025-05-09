
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type VoiceOptions = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export const useTextToSpeech = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const generateSpeech = async (text: string, voice: VoiceOptions = "nova") => {
    if (!text) return;
    
    try {
      setIsLoading(true);
      
      const shortenedText = text.slice(0, 4000); // OpenAI has a limit
      if (text.length > 4000) {
        toast({
          title: "Text too long",
          description: "Only the first 4000 characters will be spoken",
          variant: "warning",
        });
      }

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: shortenedText, voice }
      });

      if (error) throw error;

      if (data?.audioContent) {
        // Convert base64 to blob
        const byteCharacters = atob(data.audioContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mp3' });
        
        // Create audio element and play
        const audioUrl = URL.createObjectURL(blob);
        const audioElement = new Audio(audioUrl);
        
        setAudio(audioElement);
        return audioElement;
      }
    } catch (error: any) {
      console.error("Error generating speech:", error);
      toast({
        title: "Speech Generation Failed",
        description: error.message || "Could not generate speech. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const stopSpeech = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  return {
    generateSpeech,
    stopSpeech,
    isLoading,
    audio
  };
};
