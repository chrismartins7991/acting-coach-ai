
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Clock, Timer } from "lucide-react";

interface ColdReadingProps {
  script: string;
}

export const ColdReadingMode = ({ script }: ColdReadingProps) => {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(20); // seconds per paragraph
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (script) {
      // Split the script into manageable paragraphs
      const parts = script
        .split(/\n\s*\n/) // Split by empty lines
        .filter(part => part.trim().length > 0)
        .map(part => part.trim());
      setParagraphs(parts);
    }
  }, [script]);

  useEffect(() => {
    let timer: number;
    
    if (isCountingDown && countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      setIsActive(true);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCountingDown, countdown]);

  useEffect(() => {
    let interval: number;
    
    if (isActive && currentIndex < paragraphs.length - 1) {
      interval = window.setInterval(() => {
        setCurrentIndex(prev => {
          if (prev < paragraphs.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, autoScrollSpeed * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, currentIndex, paragraphs.length, autoScrollSpeed]);

  const handleStart = () => {
    if (paragraphs.length === 0) {
      toast({
        title: "No script found",
        description: "Please enter or upload a script first.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentIndex(0);
    setCountdown(3);
    setIsCountingDown(true);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsCountingDown(false);
  };

  const handleNext = () => {
    if (currentIndex < paragraphs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <Card className="bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-theater-gold" /> 
          Cold Reading Practice
        </CardTitle>
        <CardDescription>
          Practice cold reading with auto-scrolling text at your preferred pace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {paragraphs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <BookOpen className="h-12 w-12 text-white/30 mb-4" />
            <p className="text-white/70 mb-2">No script detected</p>
            <p className="text-white/50 text-sm">Enter or upload a script in the editor above to begin cold reading practice</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-white/70 flex items-center">
                  <Timer className="h-4 w-4 mr-1" /> Auto-Scroll Speed
                </div>
                <div className="text-sm font-medium text-white/80">
                  {autoScrollSpeed} seconds
                </div>
              </div>
              <Slider
                value={[autoScrollSpeed]}
                min={5}
                max={60}
                step={5}
                onValueChange={(values) => setAutoScrollSpeed(values[0])}
                disabled={isActive}
                className="w-full"
              />
            </div>

            {isCountingDown ? (
              <div className="bg-black/30 rounded-lg h-64 flex items-center justify-center">
                <div className="text-6xl font-bold text-white animate-pulse">
                  {countdown}
                </div>
              </div>
            ) : (
              <div className="bg-black/30 p-6 rounded-lg h-64 overflow-auto relative">
                {paragraphs[currentIndex] ? (
                  <div className="text-white text-lg leading-relaxed">
                    {paragraphs[currentIndex]}
                  </div>
                ) : (
                  <div className="text-center text-white/50 mt-8">
                    End of script
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex <= 0 || isCountingDown}
                  className="bg-black/30 border-white/10"
                >
                  Previous
                </Button>
                
                <div className="text-sm text-white/50">
                  {currentIndex + 1} / {paragraphs.length}
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentIndex >= paragraphs.length - 1 || isCountingDown}
                  className="bg-black/30 border-white/10"
                >
                  Next
                </Button>
              </div>
              
              <Button
                variant={isActive || isCountingDown ? "destructive" : "default"}
                onClick={isActive || isCountingDown ? handleStop : handleStart}
              >
                {isActive ? "Stop" : isCountingDown ? "Cancel" : "Start Auto-Scroll"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
