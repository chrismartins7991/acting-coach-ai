
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, User, Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { ChatHistory } from './ChatHistory';
import { useChat } from '@/hooks/useChat';
import { useToast } from './ui/use-toast';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { coaches } from './onboarding/coachData';
import { AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { messages, sendMessage, isLoading, currentConversationId, loadConversation } = useChat();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [selectedCoachIndex, setSelectedCoachIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    await sendMessage(input);
    setInput('');
  };

  const handleProcessVoiceMessage = async (text: string) => {
    if (!text.trim()) {
      toast({
        title: "No speech detected",
        description: "Please try speaking more clearly.",
        variant: "destructive",
      });
      return;
    }
    
    // Set the transcribed text in the input field so the user can see it
    setInput(text);
    
    // Send the transcribed message after a brief delay so the user can see what was transcribed
    setTimeout(async () => {
      await sendMessage(text);
      setInput('');
    }, 1000);
  };
  
  const { isRecording, toggleRecording } = useVoiceRecording(handleProcessVoiceMessage);

  useEffect(() => {
    // Fetch the user's selected coach preference
    const getCoachPreference = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('user_coach_preferences')
          .select('selected_coach')
          .eq('user_id', user.id)
          .single();
          
        if (data?.selected_coach) {
          setSelectedCoach(data.selected_coach);
          
          // Find the index of the selected coach in the coaches array
          const index = coaches.findIndex(coach => coach.type === data.selected_coach);
          if (index !== -1) {
            setSelectedCoachIndex(index);
          }
        }
      } catch (error) {
        console.error("Error fetching coach preference:", error);
      }
    };
    
    getCoachPreference();
  }, [user]);

  // Navigate through coaches
  const navigateCoach = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (selectedCoachIndex + 1) % coaches.length 
      : (selectedCoachIndex - 1 + coaches.length) % coaches.length;
    
    setSelectedCoachIndex(newIndex);
    const coach = coaches[newIndex];
    setSelectedCoach(coach.type);
    
    // If logged in, save preference
    if (user) {
      supabase
        .from('user_coach_preferences')
        .upsert({ 
          user_id: user.id, 
          selected_coach: coach.type 
        })
        .then(({ error }) => {
          if (error) {
            console.error("Error saving coach preference:", error);
          } else {
            toast({
              title: `Coach Selected: ${coach.name}`,
              description: `You're now chatting with ${coach.name}'s methodology in mind.`,
            });
          }
        });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentCoach = coaches[selectedCoachIndex];

  return (
    <div className="flex flex-col bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg h-[calc(100vh-160px)] max-w-4xl mx-auto">
      <div className="p-4 border-b border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">AI Acting Coach</h2>
            {selectedCoach && (
              <span className="text-sm text-white/60">
                Using the {currentCoach.name} method
              </span>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className={isRecording ? 
              "bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/50" : 
              "bg-white/10 hover:bg-white/20 text-white border-white/20"}
            onClick={toggleRecording}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Voice Input
              </>
            )}
          </Button>
        </div>

        <Card className="p-3 bg-black/20 border-white/10">
          <ScrollArea className="h-24">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-white/60 mb-2">Select your acting coach:</p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigateCoach('prev')}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Avatar className="h-16 w-16 border-2 border-theater-gold">
                    <AvatarImage 
                      src={currentCoach?.image} 
                      alt={currentCoach?.name} 
                      className="object-cover" 
                    />
                  </Avatar>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigateCoach('next')}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="text-center mt-1">
                <p className="text-sm text-theater-gold font-medium">{currentCoach?.name}</p>
                <p className="text-xs text-white/60">{currentCoach?.contribution}</p>
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/60">
            <Bot className="h-12 w-12 mb-4 text-theater-gold/60" />
            <h3 className="text-lg font-medium text-white mb-2">Welcome to AI Acting Coach</h3>
            <p className="text-center max-w-md">
              Ask questions about acting techniques, get feedback on your performance, or request exercises based on your selected coach's methodology.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <AnimatePresence key={index} mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] gap-3`}>
                  <Avatar className={`h-8 w-8 ${message.role === 'user' ? 'bg-theater-gold' : 'bg-theater-purple'}`}>
                    {message.role === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <>
                        <AvatarImage src={currentCoach?.image} alt={currentCoach?.name} />
                        <Bot className="h-5 w-5" />
                      </>
                    )}
                  </Avatar>
                  <div 
                    className={`p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-theater-gold/20 text-white' 
                        : 'bg-black/40 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Textarea
            className="bg-black/20 border-white/20 placeholder-white/40 text-white"
            placeholder="Ask your AI acting coach a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={1}
          />
          <Button 
            className="bg-theater-gold hover:bg-theater-gold/80 text-black"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isRecording && (
          <div className="mt-2 p-2 bg-red-500/20 rounded text-center text-sm text-red-400 animate-pulse">
            Recording... Speak clearly into your microphone
          </div>
        )}
      </div>
    </div>
  );
};
