import React, { useState, useEffect, useRef } from 'react';
import { User, Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { Card } from './ui/card';
import { ChatHistory } from './ChatHistory';
import { useChat } from '@/hooks/useChat';
import { useToast } from './ui/use-toast';
import { coaches } from './onboarding/coachData';
import { AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { messages, sendMessage, isLoading, currentConversationId, loadConversation } = useChat();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [selectedCoachIndex, setSelectedCoachIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    await sendMessage(input);
    setInput('');
  };

  useEffect(() => {
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

  const navigateCoach = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (selectedCoachIndex + 1) % coaches.length 
      : (selectedCoachIndex - 1 + coaches.length) % coaches.length;
    
    setSelectedCoachIndex(newIndex);
    const coach = coaches[newIndex];
    setSelectedCoach(coach.type);
    
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentCoach = coaches[selectedCoachIndex];

  const handleEnterCoachingSession = () => {
    toast({
      title: "Coaching Session",
      description: `Starting a session with ${currentCoach.name}`,
    });
  };

  return (
    <div className="flex flex-col bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg h-[calc(100vh-160px)] max-w-4xl mx-auto">
      <div className="p-4 border-b border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">AI Acting Coach</h2>
            {selectedCoach && (
              <span className="text-sm text-white/60">
                Using the {currentCoach.name.split(' ').pop()} method
              </span>
            )}
          </div>
        </div>

        <Card className="p-3 bg-black/20 border-white/10 h-full">
          <ScrollArea className={isMobile ? "h-auto" : "h-[calc(100vh-420px)]"}>
            <div className="flex flex-col gap-2">
              <div className="text-center mb-3">
                <h3 className="text-base text-white mb-1">Welcome to AI Acting Coach</h3>
                <p className="text-xs text-white/60 mb-2">
                  Ask questions about acting techniques, get feedback on your performance, or request exercises based on your selected coach's methodology.
                </p>
              </div>
              
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
                  <Avatar className="h-36 w-36 sm:h-40 sm:w-40 border-2 border-theater-gold">
                    {currentCoach?.gifImage ? (
                      <img 
                        src={currentCoach.gifImage} 
                        alt={currentCoach.name} 
                        className="object-cover h-full w-full" 
                      />
                    ) : (
                      <AvatarImage 
                        src={currentCoach?.image} 
                        alt={currentCoach?.name} 
                        className="object-cover" 
                      />
                    )}
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
          <></>
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
                  <Avatar className={`h-14 w-14 ${message.role === 'user' ? 'bg-theater-gold' : 'bg-theater-purple'}`}>
                    {message.role === 'user' ? (
                      <User className="h-8 w-8" />
                    ) : (
                      currentCoach?.gifImage ? (
                        <img 
                          src={currentCoach.gifImage} 
                          alt={currentCoach.name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <AvatarImage src={currentCoach?.image} alt={currentCoach?.name} />
                      )
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
        <Button 
          onClick={handleEnterCoachingSession}
          className={`bg-theater-gold hover:bg-theater-gold/80 text-black w-full ${isMobile ? 'py-2 text-base' : 'py-6 text-lg'} font-medium`}
        >
          Enter the Coaching Session
        </Button>
      </div>
    </div>
  );
};
