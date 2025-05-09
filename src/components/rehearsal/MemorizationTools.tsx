
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { BookOpen, Eye, EyeOff, CheckCircle2, XCircle, Brain } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MemorizationToolsProps {
  script: string;
}

interface CharacterLine {
  character: string;
  line: string;
}

export const MemorizationTools = ({ script }: MemorizationToolsProps) => {
  const [lines, setLines] = useState<CharacterLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showLine, setShowLine] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<"standard" | "progressive">("standard");
  const { toast } = useToast();

  // Parse script into character lines
  useEffect(() => {
    if (script && !isGenerating && lines.length === 0) {
      parseScript();
    }
  }, [script]);

  const parseScript = async () => {
    if (!script) {
      toast({
        title: "No script found",
        description: "Please enter or upload a script first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Try to intelligently parse character lines using AI
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          message: `Parse this script into a JSON array of objects with 'character' and 'line' properties for each dialogue line. Only include lines that have clear character names. Just return the JSON, no explanation:\n\n${script.slice(0, 4000)}`,
          coachType: "meisner"
        }
      });

      if (error) throw error;

      if (data?.reply) {
        try {
          // Find JSON in the response
          const jsonMatch = data.reply.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedLines = JSON.parse(jsonMatch[0]);
            
            if (Array.isArray(parsedLines) && parsedLines.length > 0) {
              setLines(parsedLines);
              toast({
                title: "Script Parsed",
                description: `Found ${parsedLines.length} lines with character dialogue.`,
              });
              return;
            }
          }
        } catch (jsonError) {
          console.error("Error parsing JSON from AI response:", jsonError);
        }
      }

      // Fallback to basic parsing if AI parsing fails
      fallbackParsing();
    } catch (error) {
      console.error("Error parsing script with AI:", error);
      fallbackParsing();
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackParsing = () => {
    // Basic parsing logic
    const parsedLines: CharacterLine[] = [];
    const lines = script.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for patterns like "CHARACTER: Line of dialogue"
      const colonMatch = line.match(/^([A-Z][A-Z\s]+):(.+)/);
      if (colonMatch) {
        parsedLines.push({
          character: colonMatch[1].trim(),
          line: colonMatch[2].trim()
        });
        continue;
      }
      
      // Look for character names in ALL CAPS followed by dialogue
      if (line.match(/^[A-Z][A-Z\s]+$/) && i + 1 < lines.length) {
        const character = line;
        const nextLine = lines[i + 1].trim();
        
        if (nextLine && !nextLine.match(/^[A-Z][A-Z\s]+$/)) {
          parsedLines.push({
            character,
            line: nextLine
          });
          i++; // Skip the next line as we've already processed it
        }
      }
    }
    
    if (parsedLines.length > 0) {
      setLines(parsedLines);
      toast({
        title: "Script Parsed",
        description: `Found ${parsedLines.length} lines with character dialogue using basic parsing.`,
      });
    } else {
      toast({
        title: "Parsing Failed",
        description: "Couldn't identify character lines. Please check script formatting.",
        variant: "destructive",
      });
    }
  };

  const checkLineAccuracy = () => {
    if (!userInput || !lines[currentLineIndex]) return 0;
    
    const actualLine = lines[currentLineIndex].line.toLowerCase().replace(/[^\w\s]/g, '');
    const userLine = userInput.toLowerCase().replace(/[^\w\s]/g, '');
    
    // Simple word comparison
    const actualWords = actualLine.split(/\s+/);
    const userWords = userLine.split(/\s+/);
    
    let correctWords = 0;
    for (let i = 0; i < userWords.length; i++) {
      if (i < actualWords.length && userWords[i] === actualWords[i]) {
        correctWords++;
      }
    }
    
    return Math.round((correctWords / actualWords.length) * 100);
  };

  const handleNextLine = () => {
    if (currentLineIndex < lines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
      setShowLine(mode === "standard");
      setUserInput("");
    } else {
      toast({
        title: "End of Script",
        description: "You've reached the end of the available lines.",
      });
    }
  };

  const handlePrevLine = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex(prev => prev - 1);
      setShowLine(mode === "standard");
      setUserInput("");
    }
  };

  const accuracy = checkLineAccuracy();
  const currentLine = lines[currentLineIndex];

  return (
    <Card className="bg-black/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-theater-gold" />
          Line Memorization
        </CardTitle>
        <CardDescription>
          Practice memorizing your lines with active recall
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
            <p className="text-white/80">Analyzing script...</p>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <BookOpen className="h-12 w-12 text-white/30 mb-4" />
            <p className="text-white/70 mb-2">No lines detected</p>
            <p className="text-white/50 text-sm mb-4">Enter a script in the editor above to begin memorizing lines</p>
            {script && (
              <Button onClick={parseScript} variant="outline">
                Parse Script
              </Button>
            )}
          </div>
        ) : (
          <>
            <Tabs defaultValue="standard" value={mode} onValueChange={(val) => setMode(val as "standard" | "progressive")}>
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/30">
                <TabsTrigger value="standard">Standard Mode</TabsTrigger>
                <TabsTrigger value="progressive">Progressive Mode</TabsTrigger>
              </TabsList>
              
              <TabsContent value="standard">
                <p className="text-sm text-white/70 mb-4">
                  View lines as you practice memorizing them. Toggle visibility as needed.
                </p>
              </TabsContent>
              
              <TabsContent value="progressive">
                <p className="text-sm text-white/70 mb-4">
                  Test your memory by typing lines before revealing them.
                </p>
              </TabsContent>
            </Tabs>

            <div className="bg-black/20 p-4 mb-4 rounded-md">
              <div className="text-sm font-medium text-theater-gold mb-1">
                {currentLine?.character || "CHARACTER"}
              </div>
              
              {showLine ? (
                <p className="text-white text-lg leading-relaxed">
                  {currentLine?.line || "Line not available"}
                </p>
              ) : (
                <div className="h-24 flex items-center justify-center border border-dashed border-white/20 rounded bg-black/10">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowLine(true)}
                    className="text-white/50"
                  >
                    <Eye className="mr-2 h-4 w-4" /> Reveal Line
                  </Button>
                </div>
              )}
            </div>

            {mode === "progressive" && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="Type the line as you remember it..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    className="bg-black/30 border-white/10 text-white"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setShowLine(true)}
                    className="bg-black/30 border-white/10"
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>

                {inputFocused && userInput && (
                  <div className="mt-2 flex items-center">
                    <div className="h-2 flex-1 bg-black/40 rounded overflow-hidden">
                      <div
                        className={`h-full ${
                          accuracy > 80 ? 'bg-green-500' : accuracy > 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${accuracy}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-white/70">{accuracy}%</span>
                  </div>
                )}

                {showLine && userInput && (
                  <div className="mt-4">
                    {accuracy > 80 ? (
                      <div className="flex items-center text-green-400 text-sm">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Great job! Your recall was accurate.
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-300 text-sm">
                        <XCircle className="mr-2 h-4 w-4" /> Keep practicing - your recall needs improvement.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={handlePrevLine}
                disabled={currentLineIndex <= 0}
                className="bg-black/30 border-white/10"
              >
                Previous Line
              </Button>
              
              <div className="text-sm text-white/50">
                {currentLineIndex + 1} / {lines.length}
              </div>

              <Button
                onClick={handleNextLine}
                disabled={currentLineIndex >= lines.length - 1}
              >
                Next Line
              </Button>
            </div>

            <div className="mt-4 flex justify-center">
              <Toggle
                pressed={showLine}
                onPressedChange={setShowLine}
                variant="outline"
                className="bg-black/30 border-white/10 data-[state=on]:bg-white/10"
              >
                {showLine ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" /> Hide Lines
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" /> Show Lines
                  </>
                )}
              </Toggle>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
