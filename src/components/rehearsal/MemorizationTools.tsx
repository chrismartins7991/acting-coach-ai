import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Eye, EyeOff, Play, Headphones } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MemorizationToolsProps {
  script: string;
}

export const MemorizationTools = ({ script }: MemorizationToolsProps) => {
  const { toast } = useToast();
  const [hidePercentage, setHidePercentage] = useState(50);
  const [hideAllButMine, setHideAllButMine] = useState(false);
  const [characterName, setCharacterName] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<"hide-lines" | "audio">("hide-lines");
  
  // Parse script to identify characters
  const characters = script ? [...new Set(
    script.split('\n')
      .filter(line => /^[A-Z]+:/.test(line))
      .map(line => line.split(':')[0])
  )] : [];
  
  const handleStartAudio = () => {
    if (!script) {
      toast({
        title: "No script available",
        description: "Please add a script first before using the audio tool.",
        variant: "destructive",
      });
      return;
    }
    
    setIsListening(true);
    toast({
      title: "Audio playback started",
      description: "You can now listen to the script. Your lines are muted.",
    });
    
    // Implementation for actual audio playback would go here
    // For now we just toggle the state after 3 seconds
    setTimeout(() => {
      setIsListening(false);
    }, 3000);
  };
  
  const handleStopAudio = () => {
    setIsListening(false);
    toast({
      title: "Audio playback stopped",
      description: "Audio playback has been stopped.",
    });
  };
  
  const applyHideLines = (text: string) => {
    if (!text) return "";
    
    const lines = text.split('\n');
    
    return lines.map(line => {
      // If we're in "hide all but mine" mode and this is my character's line
      if (hideAllButMine && characterName && line.startsWith(`${characterName}:`)) {
        return line; // Don't hide my character's lines
      }
      
      // For other lines or when not in "hide all but mine" mode
      // Calculate how many characters to hide based on hidePercentage
      const hideCount = Math.floor(line.length * (hidePercentage / 100));
      
      if (hideCount <= 0) return line;
      
      // Keep character names visible
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const name = line.substring(0, colonIndex + 1);
        const dialogue = line.substring(colonIndex + 1);
        
        const hideDialogueCount = Math.floor(dialogue.length * (hidePercentage / 100));
        
        if (hideDialogueCount <= 0) return line;
        
        const visiblePart = dialogue.substring(0, dialogue.length - hideDialogueCount);
        const hiddenPart = "█".repeat(hideDialogueCount);
        
        return `${name}${visiblePart}${hiddenPart}`;
      }
      
      // For lines without character names
      const visiblePart = line.substring(0, line.length - hideCount);
      const hiddenPart = "█".repeat(hideCount);
      
      return `${visiblePart}${hiddenPart}`;
    }).join('\n');
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(value) => setMode(value as "hide-lines" | "audio")}>
        <TabsList className="mb-4">
          <TabsTrigger value="hide-lines">Hide Lines</TabsTrigger>
          <TabsTrigger value="audio">Audio Playback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hide-lines" className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Hide text percentage: {hidePercentage}%</Label>
                  <Slider
                    value={[hidePercentage]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(values) => setHidePercentage(values[0])}
                  />
                </div>
                
                {characters.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Your character</Label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="hide-all-but-mine"
                          checked={hideAllButMine}
                          onChange={() => setHideAllButMine(!hideAllButMine)}
                          className="rounded"
                        />
                        <Label htmlFor="hide-all-but-mine" className="text-sm">Hide all but my lines</Label>
                      </div>
                    </div>
                    <select
                      className="w-full p-2 bg-black/50 text-white border border-white/20 rounded-md"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                    >
                      <option value="">Select your character</option>
                      {characters.map(char => (
                        <option key={char} value={char}>{char}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => setHidePercentage(prev => Math.min(prev + 10, 100))}
                    variant="outline"
                    className="flex-1"
                  >
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide More
                  </Button>
                  <Button 
                    onClick={() => setHidePercentage(prev => Math.max(prev - 10, 0))}
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Show More
                  </Button>
                </div>
              </div>
              
              <div className="bg-black/20 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Script Preview with Hidden Text</h4>
                <div className="max-h-60 overflow-y-auto p-4 bg-black/30 rounded-md border border-white/10">
                  <pre className="text-white/90 whitespace-pre-wrap font-sans text-sm">
                    {script ? applyHideLines(script) : "No script loaded. Please add a script on the Script tab."}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="audio" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Listen & Respond Method</Label>
                <p className="text-sm text-white/70">
                  Listen to your scene partner's lines and practice responding on cue. Your character's lines will be muted.
                </p>
              </div>
              
              {characters.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white">Your character</Label>
                  <select
                    className="w-full p-2 bg-black/50 text-white border border-white/20 rounded-md"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                  >
                    <option value="">Select your character</option>
                    {characters.map(char => (
                      <option key={char} value={char}>{char}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex space-x-3">
                {!isListening ? (
                  <Button 
                    onClick={handleStartAudio}
                    className="bg-theater-gold hover:bg-theater-gold/90 text-black flex-1"
                    disabled={!script || !characterName}
                  >
                    <Headphones className="mr-2 h-4 w-4" />
                    Start Audio Practice
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStopAudio}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Stop className="mr-2 h-4 w-4" />
                    Stop Audio
                  </Button>
                )}
              </div>
            </div>
            
            <div className="bg-black/20 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">How it works</h4>
              <ol className="list-decimal list-inside space-y-2 text-white/80 text-sm">
                <li>Select your character from the dropdown</li>
                <li>Click "Start Audio Practice" to begin</li>
                <li>Listen for your cues as other character lines are read aloud</li>
                <li>Your lines will be skipped, giving you time to say them</li>
                <li>Perfect for memorizing both lines and timing</li>
              </ol>
              
              <div className="mt-4 p-3 bg-black/30 rounded-md border border-white/10">
                <p className="text-white/70 text-xs italic">
                  Tip: Record yourself during practice to review your performance and identify areas for improvement.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
