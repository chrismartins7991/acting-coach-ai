
interface ProgressCircleProps {
  progress: number;
}

export const ProgressCircle = ({ progress }: ProgressCircleProps) => {
  return (
    <div className="relative h-16 w-16 md:h-20 md:w-20 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#333"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#FFD700"
          strokeWidth="10"
          strokeDasharray={2 * Math.PI * 40}
          strokeDashoffset={2 * Math.PI * 40 * (1 - progress / 100)}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className="absolute text-base md:text-lg font-bold">{progress}%</span>
      <span className="absolute -bottom-6 text-xs text-gray-400">Progress</span>
    </div>
  );
};
