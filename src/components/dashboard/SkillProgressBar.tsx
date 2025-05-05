
import { Progress } from "@/components/ui/progress";

interface SkillProgressBarProps {
  name: string;
  progress: number;
  color?: string;
}

export const SkillProgressBar = ({ name, progress, color = "bg-theater-gold" }: SkillProgressBarProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-white">{name}</span>
        <span className="text-white">{progress}%</span>
      </div>
      <Progress 
        value={progress} 
        className={`h-2 bg-neutral-800`} 
      />
    </div>
  );
};
