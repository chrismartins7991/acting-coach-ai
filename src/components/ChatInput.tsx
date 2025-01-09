import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Mic, Send } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const ChatInput = ({ 
  onSendMessage, 
  isLoading, 
  isRecording, 
  onToggleRecording 
}: ChatInputProps) => {
  const [input, setInput] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const message = input.trim();
    setInput('');
    await onSendMessage(message);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-theater-purple/20">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your acting coach..."
          disabled={isLoading || isRecording}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={onToggleRecording}
          disabled={isLoading}
          variant="outline"
          className={`${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'text-theater-gold hover:text-theater-gold/90'
          }`}
        >
          <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || isRecording}
          className="bg-theater-gold hover:bg-theater-gold/90 text-theater-purple"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};