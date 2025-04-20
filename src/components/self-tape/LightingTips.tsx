
export const LightingTips = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-black/70 text-white p-2 rounded-md max-w-xs text-xs">
      <h4 className="font-semibold mb-1">Lighting Tips:</h4>
      <ul className="list-disc list-inside space-y-1">
        <li>Position main light slightly above eye level</li>
        <li>Add fill light to reduce shadows</li>
        <li>Keep background lighting separate</li>
        <li>Avoid harsh shadows on face</li>
      </ul>
    </div>
  );
};
