
import React from 'react';

interface SkillProgressBarProps {
  name: string;
  progress: number;
  color: string;
}

export const SkillProgressBar: React.FC<SkillProgressBarProps> = ({
  name,
  progress,
  color
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs md:text-sm font-medium text-white">{name}</span>
        <span className="text-xs md:text-sm font-medium text-white">{progress}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 md:h-3">
        <div
          className={`${color} h-2 md:h-3 rounded-full`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};
