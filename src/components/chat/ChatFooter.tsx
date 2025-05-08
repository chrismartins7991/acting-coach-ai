
import React from 'react';
import { Button } from '../ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatFooterProps {
  handleEnterCoachingSession: () => void;
}

export const ChatFooter: React.FC<ChatFooterProps> = ({ handleEnterCoachingSession }) => {
  const isMobile = useIsMobile();

  return (
    <div className="p-4 border-t border-white/10">
      <Button 
        onClick={handleEnterCoachingSession}
        className={`bg-theater-gold hover:bg-theater-gold/80 text-black w-full ${isMobile ? 'py-2 text-base' : 'py-6 text-lg'} font-medium`}
      >
        Enter the Coaching Session
      </Button>
    </div>
  );
};
