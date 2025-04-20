
import { Button } from "@/components/ui/button";
import { Download, Clipboard } from "lucide-react";

interface ExportOptionsProps {
  onExport: (platform: string) => void;
}

export const ExportOptions = ({ onExport }: ExportOptionsProps) => {
  const platforms = [
    { name: "Backstage", icon: "🎭" },
    { name: "Actors Access", icon: "🎬" },
    { name: "Casting Networks", icon: "🎥" },
    { name: "Self-Tape Download", icon: "💾" },
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <Button
            key={platform.name}
            variant="outline" 
            className="border-white/20 hover:bg-white/10"
            onClick={() => onExport(platform.name)}
          >
            <span className="mr-2 text-lg">{platform.icon}</span>
            {platform.name}
          </Button>
        ))}
      </div>
      
      <div className="bg-black/30 p-4 rounded-lg border border-white/10">
        <h4 className="font-medium text-white mb-2">Export Settings</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-white/70 block mb-1">Format</label>
            <select className="w-full p-2 bg-black/50 text-white border border-white/20 rounded-md">
              <option value="mp4">MP4</option>
              <option value="mov">MOV</option>
              <option value="webm">WebM</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-white/70 block mb-1">Quality</label>
            <select className="w-full p-2 bg-black/50 text-white border border-white/20 rounded-md">
              <option value="high">High (1080p)</option>
              <option value="medium">Medium (720p)</option>
              <option value="low">Low (480p)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
