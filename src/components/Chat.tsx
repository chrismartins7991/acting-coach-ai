
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useChat } from '@/hooks/useChat';
import { useToast } from './ui/use-toast';
import { coaches } from './onboarding/coachData';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from './chat/ChatHeader';
import { MessageList } from './chat/MessageList';
import { ChatFooter } from './chat/ChatFooter';

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { messages, sendMessage, isLoading, currentConversationId, loadConversation } = useChat();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [selectedCoachIndex, setSelectedCoachIndex] = useState(0);
  const navigate = useNavigate();
  
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

  const handleEnterCoachingSession = () => {
    toast({
      title: "Coaching Session",
      description: `Starting a session with ${coaches[selectedCoachIndex].name}`,
    });
  };

  return (
    <div className="flex flex-col bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg h-[calc(100vh-160px)] max-w-4xl mx-auto">
      <ChatHeader
        selectedCoach={selectedCoach}
        selectedCoachIndex={selectedCoachIndex}
        navigateCoach={navigateCoach}
      />
      
      <MessageList
        messages={messages}
        selectedCoachIndex={selectedCoachIndex}
      />
      
      <ChatFooter
        handleEnterCoachingSession={handleEnterCoachingSession}
      />
    </div>
  );
};
