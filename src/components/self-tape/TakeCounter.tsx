
interface TakeCounterProps {
  currentTake: number;
}

export const TakeCounter = ({ currentTake }: TakeCounterProps) => {
  return (
    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
      Take {currentTake}
    </div>
  );
};
