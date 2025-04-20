import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Book, Clock, Timer, Upload, Search, Play, Square } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const ColdReadingMode = () => {
  const { toast } = useToast();
  const [category, setCategory] = useState("drama");
  const [complexity, setComplexity] = useState(50);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [currentScript, setCurrentScript] = useState("");
  
  const handleStartPractice = () => {
    // Mock script generation
    const dramaScripts = [
      "MARGARET: I don't understand why you can't just tell me the truth. After all we've been through.\n\nJAMES: The truth isn't always what people want to hear, Margaret. Sometimes it's better left unsaid.\n\nMARGARET: That's just an excuse people use when they're afraid. And I never thought you were a coward.",
      "DAVID: All my life I've waited for something like this. A chance to prove myself.\n\nKATE: And what about us? What about the promises you made?\n\nDAVID: This isn't about you and me. This is bigger than that.\n\nKATE: Nothing is bigger than us. Nothing.",
    ];
    
    const comedyScripts = [
      "JERRY: Wait, so you're telling me you broke up with her because she ate her peas one at a time?\n\nGEORGE: It was disturbing! Who does that? It's like she was savoring each individual pea. I couldn't take it anymore.\n\nJERRY: You need professional help. And I mean that in the most caring way possible.",
      "ALEX: I told my boss I needed a mental health day and he asked if I could reschedule my breakdown for next week because we're short-staffed.\n\nSAM: What did you say?\n\nALEX: I told him my anxiety was feeling very disrespected right now.",
    ];
    
    const selectedScript = category === "drama" ? 
      dramaScripts[Math.floor(Math.random() * dramaScripts.length)] : 
      comedyScripts[Math.floor(Math.random() * comedyScripts.length)];
    
    setCurrentScript(selectedScript);
    setPracticeStarted(true);
    
    toast({
      title: "Cold reading started",
      description: `You have ${timerSeconds} seconds to prepare before performing.`,
    });
    
    // Start countdown timer
    setTimeout(() => {
      if (practiceStarted) {
        toast({
          title: "Time's up!",
          description: "Now perform the scene without looking at the script.",
        });
      }
    }, timerSeconds * 1000);
  };
  
  const handleStopPractice = () => {
    setPracticeStarted(false);
    setCurrentScript("");
    
    toast({
      title: "Practice ended",
      description: "Cold reading practice has been stopped.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-white/80">
          Cold reading simulates real audition scenarios where you have minimal time to prepare.
          You'll be given a random script excerpt with a short preparation time.
        </p>
      </div>
      
      {!practiceStarted ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Script Category</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={category === "drama" ? "default" : "outline"}
                  onClick={() => setCategory("drama")}
                  className={category === "drama" ? "bg-theater-gold hover:bg-theater-gold/90 text-black" : ""}
                >
                  Drama
                </Button>
                <Button 
                  variant={category === "comedy" ? "default" : "outline"}
                  onClick={() => setCategory("comedy")}
                  className={category === "comedy" ? "bg-theater-gold hover:bg-theater-gold/90 text-black" : ""}
                >
                  Comedy
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Script Complexity: {complexity}%</Label>
              <Slider
                value={[complexity]}
                min={10}
                max={100}
                step={10}
                onValueChange={(values) => setComplexity(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Preparation Time: {timerSeconds} seconds</Label>
              <Slider
                value={[timerSeconds]}
                min={15}
                max={120}
                step={15}
                onValueChange={(values) => setTimerSeconds(values[0])}
              />
            </div>
            
            <Button 
              onClick={handleStartPractice}
              className="w-full bg-theater-gold hover:bg-theater-gold/90 text-black"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Cold Reading
            </Button>
          </div>
          
          <div className="bg-black/20 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-2">Audition Tips</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li className="flex items-start">
                <Search className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>Scan the entire text quickly to understand context before diving in</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>Focus on key emotional moments rather than memorizing every word</span>
              </li>
              <li className="flex items-start">
                <Book className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>Identify character relationships and objectives immediately</span>
              </li>
              <li className="flex items-start">
                <Timer className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>Use preparation time to make strong character choices</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <Timer className="h-4 w-4 mr-1" />
              <span id="countdown">{timerSeconds}</span>s
            </div>
            
            <div className="p-6 bg-black/30 rounded-lg border border-white/10 min-h-[300px]">
              <pre className="text-white/90 whitespace-pre-wrap font-sans text-base">
                {currentScript}
              </pre>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleStopPractice}
              variant="destructive"
            >
              <Square className="mr-2 h-4 w-4" />
              End Practice
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
