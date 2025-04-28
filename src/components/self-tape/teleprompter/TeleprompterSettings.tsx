
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface TeleprompterSettingsProps {
  showTeleprompter: boolean;
  teleprompterSpeed: number;
  teleprompterOpacity: number;
  teleprompterText: string;
  aiReaderEnabled: boolean;
  onShowTeleprompterChange: (checked: boolean) => void;
  onSpeedChange: (values: number[]) => void;
  onOpacityChange: (values: number[]) => void;
  onTextChange: (text: string) => void;
  onAiReaderToggle: (checked: boolean) => void;
}

export const TeleprompterSettings = ({
  showTeleprompter,
  teleprompterSpeed,
  teleprompterOpacity,
  teleprompterText,
  aiReaderEnabled,
  onShowTeleprompterChange,
  onSpeedChange,
  onOpacityChange,
  onTextChange,
  onAiReaderToggle,
}: TeleprompterSettingsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="teleprompter-text">Script</Label>
          <textarea
            id="teleprompter-text"
            className="w-full h-60 p-3 bg-black/50 text-white border border-white/20 rounded-md"
            placeholder="Paste your script here..."
            value={teleprompterText}
            onChange={(e) => onTextChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-teleprompter"
              checked={showTeleprompter}
              onCheckedChange={onShowTeleprompterChange}
            />
            <Label htmlFor="show-teleprompter">Show Teleprompter</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="ai-reader"
              checked={aiReaderEnabled}
              onCheckedChange={onAiReaderToggle}
            />
            <Label htmlFor="ai-reader">AI Reader</Label>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Scroll Speed: {teleprompterSpeed}%</Label>
          <Slider
            value={[teleprompterSpeed]}
            min={10}
            max={100}
            step={1}
            onValueChange={onSpeedChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Opacity: {teleprompterOpacity}%</Label>
          <Slider
            value={[teleprompterOpacity]}
            min={10}
            max={100}
            step={1}
            onValueChange={onOpacityChange}
          />
        </div>
        
        {aiReaderEnabled && (
          <div className="space-y-4 bg-black/20 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white">AI Reader Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ai-voice">Voice</Label>
                <select 
                  id="ai-voice" 
                  className="w-full p-2 bg-black/50 text-white border border-white/20 rounded-md"
                >
                  <option value="female-neutral">Female (Neutral)</option>
                  <option value="male-neutral">Male (Neutral)</option>
                  <option value="female-dramatic">Female (Dramatic)</option>
                  <option value="male-dramatic">Male (Dramatic)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="ai-accent">Accent</Label>
                <select 
                  id="ai-accent" 
                  className="w-full p-2 bg-black/50 text-white border border-white/20 rounded-md"
                >
                  <option value="american">American</option>
                  <option value="british">British</option>
                  <option value="australian">Australian</option>
                  <option value="irish">Irish</option>
                </select>
              </div>
            </div>
            <Button className="w-full mt-2">
              <Play className="mr-2 h-4 w-4" />
              Test Voice
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
