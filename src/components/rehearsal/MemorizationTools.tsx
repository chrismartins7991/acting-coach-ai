
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Brain } from "lucide-react";
import { RehearsalFeatureWrapper } from "./RehearsalFeatureWrapper";

interface MemorizationToolsProps {
  script: string;
}

export const MemorizationTools = ({ script }: MemorizationToolsProps) => {
  const [memorizationMode, setMemorizationMode] = useState<string>("progressive");
  const [isActive, setIsActive] = useState<boolean>(false);
  
  const handleStartMemorization = () => {
    setIsActive(true);
    // Implementation of memorization functionality would go here
    console.log("Memorization started with mode:", memorizationMode);
  };

  const handleStopMemorization = () => {
    setIsActive(false);
    // Implementation to stop memorization would go here
    console.log("Memorization stopped");
  };

  return (
    <Card className="bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-theater-gold" />
          Line Memorization Tools
        </CardTitle>
        <CardDescription>
          Different techniques to help memorize your lines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={memorizationMode} onValueChange={setMemorizationMode}>
          <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5">
            <RadioGroupItem value="progressive" id="progressive" className="mt-1" />
            <div className="grid gap-1.5">
              <Label htmlFor="progressive" className="font-medium text-white">Progressive Memorization</Label>
              <p className="text-xs text-white/70">
                Gradually replace words with blanks as you practice
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5">
            <RadioGroupItem value="cue-line" id="cue-line" className="mt-1" />
            <div className="grid gap-1.5">
              <Label htmlFor="cue-line" className="font-medium text-white">Cue Line Practice</Label>
              <p className="text-xs text-white/70">
                Practice with cue lines highlighted to prompt your memory
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5">
            <RadioGroupItem value="first-letter" id="first-letter" className="mt-1" />
            <div className="grid gap-1.5">
              <Label htmlFor="first-letter" className="font-medium text-white">First Letter Method</Label>
              <p className="text-xs text-white/70">
                Shows only the first letter of each word as a memory trigger
              </p>
            </div>
          </div>
        </RadioGroup>

        <RehearsalFeatureWrapper
          onInteraction={isActive ? handleStopMemorization : handleStartMemorization}
        >
          {(handleInteraction) => (
            <Button 
              className="w-full mt-4"
              variant={isActive ? "destructive" : "default"}
              disabled={!script}
              onClick={handleInteraction}
            >
              {isActive ? "End Practice" : "Start Memorizing"}
            </Button>
          )}
        </RehearsalFeatureWrapper>
      </CardContent>
    </Card>
  );
};
