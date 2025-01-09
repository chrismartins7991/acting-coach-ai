import { useState, useRef } from "react";
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudioAndSend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
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
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Processing your message...",
      });
    }
  };

  const processAudioAndSend = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Send to voice-to-text function
        const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke(
          'voice-to-text',
          {
            body: { audio: base64Audio },
          }
        );

        if (transcriptionError) throw transcriptionError;

        // Set the transcribed text as input
        setInput(transcriptionData.text);
        
        // Automatically send the transcribed message
        const { data: chatData, error: chatError } = await supabase.functions.invoke('chat', {
          body: { message: transcriptionData.text },
        });

        if (chatError) throw chatError;

        // Update messages
        setMessages(prev => [
          ...prev,
          { role: 'user', content: transcriptionData.text },
          { role: 'assistant', content: chatData.reply }
        ]);

      };
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Error",
        description: "Failed to process audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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