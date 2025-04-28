
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Camera, Video, Mic, MicOff, Play, Square } from "lucide-react";

interface RecordingControlsProps {
  cameraActive: boolean;
  micActive: boolean;
  isRecording: boolean;
  showFramingGuide: boolean;
  showLightingTips: boolean;
  onMicToggle: () => void;
  onFramingGuideToggle: (checked: boolean) => void;
  onLightingTipsToggle: (checked: boolean) => void;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const RecordingControls = ({
  cameraActive,
  micActive,
  isRecording,
  showFramingGuide,
  showLightingTips,
  onMicToggle,
  onFramingGuideToggle,
  onLightingTipsToggle,
  onStartCamera,
  onStopCamera,
  onStartRecording,
  onStopRecording,
}: RecordingControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 justify-between items-center">
      <div className="space-y-2">
        <div className="flex items-center space-x-4">
          <Button
            variant={micActive ? "default" : "outline"}
            size="sm"
            onClick={onMicToggle}
          >
            {micActive ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
            {micActive ? "Mic On" : "Mic Off"}
          </Button>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="framing-guide"
              checked={showFramingGuide}
              onCheckedChange={onFramingGuideToggle}
            />
            <Label htmlFor="framing-guide">Framing Guide</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="lighting-tips"
              checked={showLightingTips}
              onCheckedChange={onLightingTipsToggle}
            />
            <Label htmlFor="lighting-tips">Lighting Tips</Label>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        {cameraActive && !isRecording ? (
          <Button onClick={onStartRecording} className="bg-red-600 hover:bg-red-700">
            <Video className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        ) : isRecording ? (
          <Button onClick={onStopRecording} variant="destructive">
            <Square className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        ) : null}
        
        {cameraActive && (
          <Button variant="outline" onClick={onStopCamera}>
            Turn Off Camera
          </Button>
        )}
      </div>
    </div>
  );
};
