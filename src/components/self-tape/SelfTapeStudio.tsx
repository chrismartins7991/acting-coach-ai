
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Camera, Video, Mic, MicOff, Play, stop as Stop, Download, Clipboard, Settings } from "lucide-react";
import { CameraView } from "./CameraView";
import { TakeCounter } from "./TakeCounter";
import { FramingGuide } from "./FramingGuide";
import { Teleprompter } from "./Teleprompter";
import { LightingTips } from "./LightingTips";
import { TakeComparison } from "./TakeComparison";
import { ExportOptions } from "./ExportOptions";
import { useToast } from "@/components/ui/use-toast";

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
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {cameraActive ? (
                <CameraView stream={streamRef.current} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button onClick={handleStartCamera}>
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
            
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={micActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMicActive(!micActive)}
                  >
                    {micActive ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                    {micActive ? "Mic On" : "Mic Off"}
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="framing-guide"
                      checked={showFramingGuide}
                      onCheckedChange={setShowFramingGuide}
                    />
                    <Label htmlFor="framing-guide">Framing Guide</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="lighting-tips"
                      checked={showLightingTips}
                      onCheckedChange={setShowLightingTips}
                    />
                    <Label htmlFor="lighting-tips">Lighting Tips</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                {cameraActive && !isRecording ? (
                  <Button onClick={handleStartRecording} className="bg-red-600 hover:bg-red-700">
                    <Video className="mr-2 h-4 w-4" />
                    Start Recording
                  </Button>
                ) : isRecording ? (
                  <Button onClick={handleStopRecording} variant="destructive">
                    <Stop className="mr-2 h-4 w-4" />
                    Stop Recording
                  </Button>
                ) : null}
                
                {cameraActive && (
                  <Button variant="outline" onClick={handleStopCamera}>
                    Turn Off Camera
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="teleprompter" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teleprompter-text">Script</Label>
                  <textarea
                    id="teleprompter-text"
                    className="w-full h-60 p-3 bg-black/50 text-white border border-white/20 rounded-md"
                    placeholder="Paste your script here..."
                    value={teleprompterText}
                    onChange={(e) => setTeleprompterText(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-teleprompter"
                      checked={showTeleprompter}
                      onCheckedChange={setShowTeleprompter}
                    />
                    <Label htmlFor="show-teleprompter">Show Teleprompter</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ai-reader"
                      checked={aiReaderEnabled}
                      onCheckedChange={setAiReaderEnabled}
                    />
                    <Label htmlFor="ai-reader">AI Reader</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>
                    Scroll Speed: {teleprompterSpeed}%
                  </Label>
                  <Slider
                    value={[teleprompterSpeed]}
                    min={10}
                    max={100}
                    step={1}
                    onValueChange={(values) => setTeleprompterSpeed(values[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>
                    Opacity: {teleprompterOpacity}%
                  </Label>
                  <Slider
                    value={[teleprompterOpacity]}
                    min={10}
                    max={100}
                    step={1}
                    onValueChange={(values) => setTeleprompterOpacity(values[0])}
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
