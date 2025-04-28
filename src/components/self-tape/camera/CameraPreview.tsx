
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { CameraView } from "../CameraView";
import { FramingGuide } from "../FramingGuide";
import { Teleprompter } from "../Teleprompter";
import { LightingTips } from "../LightingTips";
import { TakeCounter } from "../TakeCounter";

interface CameraPreviewProps {
  cameraActive: boolean;
  showFramingGuide: boolean;
  showTeleprompter: boolean;
  showLightingTips: boolean;
  currentTake: number;
  stream: MediaStream | null;
  teleprompterText: string;
  teleprompterSpeed: number;
  teleprompterOpacity: number;
  isRecording: boolean;
  onStartCamera: () => void;
}

export const CameraPreview = ({
  cameraActive,
  showFramingGuide,
  showTeleprompter,
  showLightingTips,
  currentTake,
  stream,
  teleprompterText,
  teleprompterSpeed,
  teleprompterOpacity,
  isRecording,
  onStartCamera,
}: CameraPreviewProps) => {
  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      {cameraActive ? (
        <CameraView stream={stream} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button onClick={onStartCamera}>
            <Camera className="mr-2 h-4 w-4" />
            Activate Camera
          </Button>
        </div>
      )}
      
      {cameraActive && showFramingGuide && (
        <FramingGuide />
      )}
      
      {cameraActive && showTeleprompter && (
        <Teleprompter 
          text={teleprompterText}
          speed={teleprompterSpeed}
          opacity={teleprompterOpacity}
          isRecording={isRecording}
        />
      )}
      
      {cameraActive && showLightingTips && (
        <LightingTips />
      )}
      
      {cameraActive && (
        <TakeCounter currentTake={currentTake} />
      )}
    </div>
  );
};
