
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen } from "lucide-react";
import { RehearsalFeatureWrapper } from "./RehearsalFeatureWrapper";

interface ColdReadingModeProps {
  script: string;
}

export const ColdReadingMode = ({ script }: ColdReadingModeProps) => {
  const [lineVisibility, setLineVisibility] = useState<number>(50);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<string>("word-by-word");

  const handleStartReading = () => {
    setIsActive(true);
    // Implementation of cold reading functionality would go here
    console.log("Cold reading started with settings:", { lineVisibility, scrollSpeed, displayMode });
  };

  const handleStopReading = () => {
    setIsActive(false);
    // Implementation to stop cold reading would go here
    console.log("Cold reading stopped");
  };

  return (
    <Card className="bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-theater-gold" />
          Cold Reading Practice
        </CardTitle>
        <CardDescription>
          Practice your cold reading skills with customizable text display
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-white/70 block">Line Visibility</label>
          <Slider
            value={[lineVisibility]}
            min={10}
            max={100}
            step={10}
            onValueChange={(values) => setLineVisibility(values[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/50">
            <span>Less (harder)</span>
            <span>More (easier)</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/70 block">Scroll Speed</label>
          <Slider
            value={[scrollSpeed]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={(values) => setScrollSpeed(values[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/50">
            <span>Slower</span>
            <span>Faster</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/70 block">Display Mode</label>
          <Select value={displayMode} onValueChange={setDisplayMode}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select display mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="word-by-word">Word by Word</SelectItem>
              <SelectItem value="line-by-line">Line by Line</SelectItem>
              <SelectItem value="paragraph">Paragraph Mode</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <RehearsalFeatureWrapper
          onInteraction={isActive ? handleStopReading : handleStartReading}
        >
          {(handleInteraction: () => void) => (
            <Button 
              className="w-full mt-4"
              variant={isActive ? "destructive" : "default"}
              disabled={!script}
              onClick={handleInteraction}
            >
              {isActive ? "Stop Reading" : "Start Cold Reading"}
            </Button>
          )}
        </RehearsalFeatureWrapper>
      </CardContent>
    </Card>
  );
};
