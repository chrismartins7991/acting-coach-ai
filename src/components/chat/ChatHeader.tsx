
import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';
import { coaches } from '../onboarding/coachData';
import { useIsMobile } from '@/hooks/use-mobile';
import { CoachSelector } from './CoachSelector';

interface ChatHeaderProps {
  selectedCoach: string | null;
  selectedCoachIndex: number;
  navigateCoach: (direction: 'prev' | 'next') => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedCoach,
  selectedCoachIndex,
  navigateCoach
}) => {
  const isMobile = useIsMobile();
  const currentCoach = coaches[selectedCoachIndex];

  return (
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
            
            <CoachSelector 
              selectedCoachIndex={selectedCoachIndex}
              navigateCoach={navigateCoach}
            />
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
