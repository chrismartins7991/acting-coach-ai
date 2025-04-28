import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { CameraPreview } from "./camera/CameraPreview";
import { RecordingControls } from "./controls/RecordingControls";
import { TeleprompterSettings } from "./teleprompter/TeleprompterSettings";
import { TakeComparison } from "./TakeComparison";
import { ExportOptions } from "./ExportOptions";

export const SelfTapeStudio = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [showFramingGuide, setShowFramingGuide] = useState(true);
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [showLightingTips, setShowLightingTips] = useState(true);
  const [recordedTakes, setRecordedTakes] = useState<string[]>([]);
  const [currentTake, setCurrentTake] = useState(1);
  const [aiReaderEnabled, setAiReaderEnabled] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(50);
  const [teleprompterOpacity, setTeleprompterOpacity] = useState(80);
  const [teleprompterText, setTeleprompterText] = useState("");
  const [activeTab, setActiveTab] = useState("record");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: micActive 
      });
      
      streamRef.current = stream;
      setCameraActive(true);
      
      toast({
        title: "Camera activated",
        description: "Your camera is now ready for recording.",
      });
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };
  
  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };
  
  const handleStartRecording = () => {
    if (streamRef.current) {
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedTakes(prev => [...prev, url]);
        setCurrentTake(prev => prev + 1);
        
        toast({
          title: "Take recorded",
          description: `Take ${currentTake} has been saved.`,
        });
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    }
  };
  
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleExport = (platform: string) => {
    toast({
      title: "Exporting for " + platform,
      description: "Your video is being prepared for export.",
    });
    // Implementation for actual export would go here
  };
  
  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      handleStopCamera();
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-black/30 border-white/10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="record">Record</TabsTrigger>
            <TabsTrigger value="teleprompter">Teleprompter</TabsTrigger>
            <TabsTrigger value="export">Export & Compare</TabsTrigger>
          </TabsList>
          
          <TabsContent value="record" className="space-y-6">
            <CameraPreview
              cameraActive={cameraActive}
              showFramingGuide={showFramingGuide}
              showTeleprompter={showTeleprompter}
              showLightingTips={showLightingTips}
              currentTake={currentTake}
              stream={streamRef.current}
              teleprompterText={teleprompterText}
              teleprompterSpeed={teleprompterSpeed}
              teleprompterOpacity={teleprompterOpacity}
              isRecording={isRecording}
              onStartCamera={handleStartCamera}
            />
            
            <RecordingControls
              cameraActive={cameraActive}
              micActive={micActive}
              isRecording={isRecording}
              showFramingGuide={showFramingGuide}
              showLightingTips={showLightingTips}
              onMicToggle={() => setMicActive(!micActive)}
              onFramingGuideToggle={setShowFramingGuide}
              onLightingTipsToggle={setShowLightingTips}
              onStartCamera={handleStartCamera}
              onStopCamera={handleStopCamera}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
            />
          </TabsContent>
          
          <TabsContent value="teleprompter" className="space-y-6">
            <TeleprompterSettings
              showTeleprompter={showTeleprompter}
              teleprompterSpeed={teleprompterSpeed}
              teleprompterOpacity={teleprompterOpacity}
              teleprompterText={teleprompterText}
              aiReaderEnabled={aiReaderEnabled}
              onShowTeleprompterChange={setShowTeleprompter}
              onSpeedChange={(values) => setTeleprompterSpeed(values[0])}
              onOpacityChange={(values) => setTeleprompterOpacity(values[0])}
              onTextChange={setTeleprompterText}
              onAiReaderToggle={setAiReaderEnabled}
            />
          </TabsContent>
          
          <TabsContent value="export" className="space-y-6">
            {recordedTakes.length > 0 ? (
              <>
                <TakeComparison takes={recordedTakes} />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Export Options</h3>
                  <ExportOptions onExport={handleExport} />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-white/50 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No takes recorded</h3>
                <p className="text-white/70 mb-4">Record your first take to see it here</p>
                <Button 
                  onClick={() => setActiveTab("record")}
                  className="bg-theater-gold hover:bg-theater-gold/90 text-black"
                >
                  Go to Recording
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
