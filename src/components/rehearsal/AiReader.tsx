import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Play, Square, Mic } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AiReaderProps {
  script: string;
}

export const AiReader = ({ script }: AiReaderProps) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [voice, setVoice] = useState("female-neutral");
  const [speed, setSpeed] = useState(1);
  const [accent, setAccent] = useState("american");
  const [highlightActiveChar, setHighlightActiveChar] = useState(true);
  const [useEmotionalTone, setUseEmotionalTone] = useState(true);
  
  const handlePlay = () => {
    if (!script) {
      toast({
        title: "No script available",
        description: "Please add a script first before using the AI reader.",
        variant: "destructive",
      });
      return;
    }
    
    setIsPlaying(true);
    toast({
      title: "AI Reader activated",
      description: "The AI reader is now reading your script.",
    });
    
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };
  
  const handleStop = () => {
    setIsPlaying(false);
    toast({
      title: "AI Reader stopped",
      description: "The AI reader has stopped.",
    });
  };
  
  const voices = [
    { id: "female-neutral", name: "Female (Neutral)" },
    { id: "male-neutral", name: "Male (Neutral)" },
    { id: "female-dramatic", name: "Female (Dramatic)" },
    { id: "male-dramatic", name: "Male (Dramatic)" },
    { id: "female-youthful", name: "Female (Youthful)" },
    { id: "male-youthful", name: "Male (Youthful)" },
  ];
  
  const accents = [
    { id: "american", name: "American" },
    { id: "british", name: "British" },
    { id: "australian", name: "Australian" },
    { id: "irish", name: "Irish" },
    { id: "scottish", name: "Scottish" },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="voice" className="text-white mb-1 block">Voice</Label>
          <select 
            id="voice" 
            className="w-full p-2 bg-black/50 text-white border border-white/20 rounded-md"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
          >
            {voices.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="accent" className="text-white mb-1 block">Accent</Label>
          <select 
            id="accent" 
            className="w-full p-2 bg-black/50 text-white border border-white/20 rounded-md"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
          >
            {accents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="speed" className="text-white mb-1 block">Reading Speed</Label>
        <input 
          type="range" 
          id="speed"
          min="0.5"
          max="2"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-white/70 mt-1">
          <span>Slow</span>
          <span>{speed}x</span>
          <span>Fast</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="highlight-active"
            checked={highlightActiveChar}
            onCheckedChange={setHighlightActiveChar}
          />
          <Label htmlFor="highlight-active">Highlight active character</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="emotional-tone"
            checked={useEmotionalTone}
            onCheckedChange={setUseEmotionalTone}
          />
          <Label htmlFor="emotional-tone">Use emotional tone based on context</Label>
        </div>
      </div>
      
      <div className="flex space-x-3">
        {!isPlaying ? (
          <Button onClick={handlePlay} className="bg-theater-gold hover:bg-theater-gold/90 text-black flex-1">
            <Play className="mr-2 h-4 w-4" />
            Start Reading
          </Button>
        ) : (
          <Button onClick={handleStop} variant="destructive" className="flex-1">
            <Square className="mr-2 h-4 w-4" />
            Stop Reading
          </Button>
        )}
        
        <Button variant="outline" className="flex-1">
          <Mic className="mr-2 h-4 w-4" />
          Practice with AI
        </Button>
      </div>
    </div>
  );
};
