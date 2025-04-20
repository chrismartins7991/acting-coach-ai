
import { useEffect, useRef, useState } from "react";

interface TeleprompterProps {
  text: string;
  speed: number;
  opacity: number;
  isRecording: boolean;
}

export const Teleprompter = ({ text, speed, opacity, isRecording }: TeleprompterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(!isRecording);
  
  // Calculate actual scroll speed based on user setting
  const scrollSpeed = speed / 10; // Adjust as needed
  
  useEffect(() => {
    if (!text || isPaused || !containerRef.current) return;
    
    const interval = setInterval(() => {
      if (containerRef.current) {
        setScrollPosition(prev => {
          const newPosition = prev + scrollSpeed;
          const maxScroll = containerRef.current!.scrollHeight - containerRef.current!.clientHeight;
          
          // Reset when we reach the bottom
          if (newPosition >= maxScroll) {
            return 0;
          }
          
          return newPosition;
        });
        
        containerRef.current.scrollTop = scrollPosition;
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [text, scrollSpeed, isPaused, scrollPosition]);
  
  // Start/pause scrolling based on recording state
  useEffect(() => {
    setIsPaused(!isRecording);
  }, [isRecording]);
  
  return (
    <div 
      className="absolute inset-x-0 bottom-16 mx-auto w-3/4 max-h-1/3 overflow-hidden rounded-md" 
      style={{ backgroundColor: `rgba(0, 0, 0, ${opacity / 100})` }}
    >
      <div 
        ref={containerRef}
        className="h-full max-h-40 overflow-hidden p-4 text-white text-lg font-medium"
        style={{ 
          whiteSpace: 'pre-line',
          overflowY: 'hidden' // Hide scrollbar
        }}
      >
        {text}
      </div>
    </div>
  );
};
