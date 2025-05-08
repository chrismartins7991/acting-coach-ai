
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { AvatarImage } from '../ui/avatar';
import { coaches } from '../onboarding/coachData';

interface CoachSelectorProps {
  selectedCoachIndex: number;
  navigateCoach: (direction: 'prev' | 'next') => void;
}

export const CoachSelector: React.FC<CoachSelectorProps> = ({
  selectedCoachIndex,
  navigateCoach
}) => {
  const currentCoach = coaches[selectedCoachIndex];

  return (
    <div>
      <p className="text-xs text-white/60 mb-2">Select your acting coach:</p>
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 relative px-10">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigateCoach('prev')}
          className="text-white/60 hover:text-white hover:bg-white/10 absolute left-0 z-10"
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
          className="text-white/60 hover:text-white hover:bg-white/10 absolute right-0 z-10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="text-center mt-1">
        <p className="text-sm text-theater-gold font-medium">{currentCoach?.name}</p>
        <p className="text-xs text-white/60">{currentCoach?.contribution}</p>
      </div>
    </div>
  );
};
