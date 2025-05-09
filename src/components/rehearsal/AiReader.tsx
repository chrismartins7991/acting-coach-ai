
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Play, Square, Volume2, Mic } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface AiReaderProps {
  script: string;
}

type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export const AiReader = ({ script }: AiReaderProps) => {
  const [voice, setVoice] = useState<Voice>("nova");
  const [volume, setVolume] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const { generateSpeech, stopSpeech, isLoading, audio } = useTextToSpeech();
  const { toast } = useToast();

  const voiceOptions: { value: Voice; label: string; description: string }[] = [
    { value: "alloy", label: "Alloy", description: "Versatile, balanced voice" },
    { value: "echo", label: "Echo", description: "Deep, resonant male voice" },
    { value: "fable", label: "Fable", description: "Warm, friendly narrator voice" },
    { value: "onyx", label: "Onyx", description: "Authoritative, deep voice" },
    { value: "nova", label: "Nova", description: "Expressive female voice" },
    { value: "shimmer", label: "Shimmer", description: "Clear, youthful voice" }
  ];

  const handlePlay = async () => {
    if (!script) {
      toast({
        title: "No script found",
        description: "Please enter or upload a script first.",
        variant: "destructive",
      });
      return;
    }

    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const audioEl = await generateSpeech(script, voice);
    
    if (audioEl) {
      audioEl.volume = volume / 100;
      
      audioEl.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      audioEl.addEventListener('error', () => {
        setIsPlaying(false);
        toast({
          title: "Playback Error",
          description: "There was an error playing the audio.",
          variant: "destructive",
        });
      });
      
      audioEl.play();
    } else {
      setIsPlaying(false);
    }
  };

  const handleVoiceChange = (value: string) => {
    setVoice(value as Voice);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (audio) {
      audio.volume = value[0] / 100;
    }
  };

  return (
    <Card className="bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-theater-gold" /> 
          AI Reader
        </CardTitle>
        <CardDescription>
          Let the AI read your script with natural expression
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="h-4 w-4 text-white/70" />
            <span className="text-sm text-white/70">Volume</span>
          </div>
          <Slider
            value={[volume]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/70 block">Voice</label>
          <Select value={voice} onValueChange={handleVoiceChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {voiceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full mt-4"
          variant={isPlaying ? "destructive" : "default"}
          disabled={isLoading || !script}
          onClick={handlePlay}
        >
          {isPlaying ? (
            <>
              <Square className="mr-2 h-4 w-4" /> Stop
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> {isLoading ? "Loading..." : "Read Script"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
