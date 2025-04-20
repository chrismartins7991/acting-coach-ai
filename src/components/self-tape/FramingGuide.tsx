
export const FramingGuide = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Rule of thirds grid */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
        <div className="border-r border-white/20 col-span-1 h-full"></div>
        <div className="border-r border-white/20 col-span-1 h-full"></div>
        <div className="border-b border-white/20 row-span-1 w-full"></div>
        <div className="border-b border-white/20 row-span-1 w-full"></div>
      </div>
      
      {/* Center frame for closeup shots */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 border-2 border-dashed border-white/40 rounded-md"></div>
      
      {/* Head positioning guide */}
      <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 w-1/4 h-[15%] border border-yellow-400/30 rounded-full flex items-center justify-center">
        <span className="text-xs text-yellow-400/70">Head position</span>
      </div>
    </div>
  );
};
