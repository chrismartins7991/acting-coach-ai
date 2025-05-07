
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ScriptEditor = ({ value, onChange }: ScriptEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useIsMobile();
  
  // Helper function to parse and format script with character names
  const formatScript = () => {
    if (!value) return;
    
    // Basic script formatting logic
    // Detect character names (typically in ALL CAPS or followed by a colon)
    const formattedScript = value
      .split('\n')
      .map(line => {
        // If line starts with a name pattern (ALL CAPS and colon)
        if (/^[A-Z]{2,}:/.test(line)) {
          return line; // Already formatted
        }
        
        // Try to detect character names in ALL CAPS
        const nameMatch = line.match(/^([A-Z][A-Z\s]+)(\s*\(.*\))?$/);
        if (nameMatch) {
          return `${nameMatch[0]}:`;
        }
        
        return line;
      })
      .join('\n');
    
    onChange(formattedScript);
  };
  
  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type or paste your script here..."
          className={`${isMobile ? 'min-h-[200px]' : 'min-h-[400px]'} p-3 bg-black/50 text-white resize-y font-mono`}
        />
        
        {!value && !isFocused && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/50">
              <BookOpen className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} mx-auto mb-2`} />
              <p className={isMobile ? 'text-sm' : ''}>Type your script, upload a file, or paste from clipboard</p>
            </div>
          </div>
        )}
      </div>
      
      {value && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={formatScript} className={isMobile ? "text-xs px-2 py-1 h-8" : ""}>
            Format Script
          </Button>
        </div>
      )}
    </div>
  );
};
