
import React, { useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../ui/avatar';
import { AvatarImage } from '../ui/avatar';
import { coaches } from '../onboarding/coachData';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MessageListProps {
  messages: Message[];
  selectedCoachIndex: number;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedCoachIndex
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentCoach = coaches[selectedCoachIndex];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return <></>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
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
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
