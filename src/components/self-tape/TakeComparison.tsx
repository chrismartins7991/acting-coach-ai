import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface TakeComparisonProps {
  takes: string[];
}

export const TakeComparison = ({ takes }: TakeComparisonProps) => {
  const [selectedTakes, setSelectedTakes] = useState<string[]>(takes.length >= 2 ? [takes[takes.length - 2], takes[takes.length - 1]] : []);
  
  const handleSelectTake = (takeUrl: string) => {
    setSelectedTakes(prev => {
      // If already selected, remove it
      if (prev.includes(takeUrl)) {
        return prev.filter(url => url !== takeUrl);
      }
      
      // If we already have 2 takes selected, replace the oldest one
      if (prev.length >= 2) {
        return [...prev.slice(1), takeUrl];
      }
      
      // Otherwise add it
      return [...prev, takeUrl];
    });
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Take Comparison</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedTakes.map((takeUrl, index) => (
          <div key={index} className="relative">
            <video 
              src={takeUrl} 
              controls 
              className="w-full rounded-lg"
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              Take {takes.indexOf(takeUrl) + 1}
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white/80">All Takes</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {takes.map((takeUrl, index) => (
            <div 
              key={index} 
              className={`relative cursor-pointer rounded-md overflow-hidden transition-all ${
                selectedTakes.includes(takeUrl) ? 'ring-2 ring-theater-gold' : ''
              }`}
              onClick={() => handleSelectTake(takeUrl)}
            >
              <video
                src={takeUrl}
                className="w-full h-24 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                Take {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
