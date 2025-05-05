
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Performance {
  id: number;
  title: string;
  date: string;
  score: number;
  image: string;
}

interface PerformancesListProps {
  performances: Performance[];
}

export const PerformancesList = ({ performances }: PerformancesListProps) => {
  const navigate = useNavigate();

  const handleViewHistory = () => {
    navigate('/history');
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold">Recent Performances</h2>
        <button 
          className="text-xs md:text-sm text-gray-400 flex items-center"
          onClick={handleViewHistory}
        >
          See All <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
        </button>
      </div>
      
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex space-x-3 min-w-min">
          {performances.map((performance) => (
            <div 
              key={performance.id} 
              className="bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0 w-[280px]"
            >
              <div className="relative h-28 md:h-40">
                <img 
                  src={performance.image} 
                  alt={performance.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 md:p-4">
                <h3 className="text-base md:text-lg font-bold">{performance.title}</h3>
                <p className="text-gray-400 text-xs md:text-sm">{performance.date}</p>
                <div className="flex justify-between items-center mt-1 md:mt-2">
                  <span className="text-xs md:text-sm">Score:</span>
                  <span 
                    className={`text-base md:text-lg font-bold ${
                      performance.score >= 70 ? 'text-theater-gold' : 'text-white'
                    }`}
                  >
                    {performance.score}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
