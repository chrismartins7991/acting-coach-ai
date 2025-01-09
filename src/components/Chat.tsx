import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useToast } from "./ui/use-toast";
import { Mic, Send } from "lucide-react";
import { ChatHistory } from "./ChatHistory";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  const loadConversation = async (conversationId: string) => {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })));
  };

  const createNewConversation = async (firstMessage: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : ''),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data.id;
  };

  const saveMessage = async (message: Message, conversationId: string) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
      });

    if (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Create new conversation if needed
    if (!currentConversationId) {
      const newConversationId = await createNewConversation(userMessage);
      if (!newConversationId) {
        setIsLoading(false);
        return;
      }
      setCurrentConversationId(newConversationId);
    }

    // Add and save user message
    const newUserMessage = { role: 'user' as const, content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    await saveMessage(newUserMessage, currentConversationId!);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: userMessage },
      });

      if (error) throw error;

      // Add and save assistant's reply
      const assistantMessage = { role: 'assistant' as const, content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);
      await saveMessage(assistantMessage, currentConversationId!);
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

        // Send the transcribed message directly without setting it to input
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
    <div className="flex gap-4">
      <ChatHistory
        onSelectConversation={setCurrentConversationId}
        currentConversationId={currentConversationId}
      />
      
      <div className="flex flex-col h-[600px] flex-1 bg-background/95 backdrop-blur-md rounded-lg border border-theater-purple/20 shadow-lg">
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
    </div>
  );
};