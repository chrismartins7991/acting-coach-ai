import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useToast } from "./ui/use-toast";
import { Mic, Send } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: userMessage },
      });

      if (error) throw error;

      // Add assistant's reply to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        // TODO: Implement voice recording logic
        toast({
          title: "Recording started",
          description: "Speak your message...",
        });
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast({
          title: "Error",
          description: "Could not access microphone. Please check your permissions.",
          variant: "destructive",
        });
      }
    } else {
      setIsRecording(false);
      // TODO: Implement stop recording and send logic
      toast({
        title: "Recording stopped",
        description: "Processing your message...",
      });
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-background/95 backdrop-blur-md rounded-lg border border-theater-purple/20 shadow-lg">
      <div className="p-4 border-b border-theater-purple/20">
        <h2 className="text-xl font-semibold text-theater-gold">Chat with Your Acting Coach</h2>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-theater-purple text-white ml-4'
                    : 'bg-theater-gold/10 text-theater-gold mr-4'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-4 border-t border-theater-purple/20">
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
            onClick={toggleRecording}
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
    </div>
  );
};