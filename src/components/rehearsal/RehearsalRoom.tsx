
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Book, BookOpen, Mic, Play, Timer, Upload, Clipboard, Search, Copy, Eye, FileText } from "lucide-react";
import { ScriptEditor } from "./ScriptEditor";
import { AiReader } from "./AiReader";
import { MemorizationTools } from "./MemorizationTools";
import { ColdReadingMode } from "./ColdReadingMode";
import { useToast } from "@/components/ui/use-toast";

export const RehearsalRoom = () => {
  const { toast } = useToast();
  const [script, setScript] = useState("");
  const [activeTab, setActiveTab] = useState("script");
  const [coldReadingMode, setColdReadingMode] = useState(false);
  const [hideLines, setHideLines] = useState(false);
  const [aiReaderEnabled, setAiReaderEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleScriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setScript(event.target.result);
        toast({
          title: "Script uploaded",
          description: `${file.name} has been loaded successfully.`,
        });
      }
    };
    reader.readAsText(file);
  };
  
  const handlePasteScript = () => {
    navigator.clipboard.readText().then(text => {
      setScript(text);
      toast({
        title: "Script pasted",
        description: "Text has been pasted from clipboard.",
      });
    }).catch(err => {
      toast({
        title: "Clipboard error",
        description: "Could not access clipboard. Please paste manually.",
        variant: "destructive",
      });
    });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(script).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Script has been copied to clipboard.",
      });
    }).catch(err => {
      toast({
        title: "Clipboard error",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    });
  };

  const handleSaveScript = () => {
    // Create a blob from the script content
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.txt';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Script saved",
      description: "Script has been downloaded as a text file.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold text-white">Rehearsal Room</h2>
          <p className="text-white/60">Practice your lines, work with an AI reader, and improve your cold reading skills</p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === "script" && (
            <Button 
              variant="outline" 
              className="text-white border-white/20 hover:bg-white/10"
              onClick={handleSaveScript}
              disabled={!script}
            >
              <FileText className="w-4 h-4 mr-2" />
              Save Script
            </Button>
          )}
        </div>
      </div>
      
      <Card className="p-6 bg-black/30 border-white/10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6 bg-black/50">
            <TabsTrigger value="script" className="data-[state=active]:bg-theater-gold/20 data-[state=active]:text-theater-gold">
              <Book className="w-4 h-4 mr-2" />
              Script
            </TabsTrigger>
            <TabsTrigger value="ai-reader" className="data-[state=active]:bg-theater-gold/20 data-[state=active]:text-theater-gold">
              <Mic className="w-4 h-4 mr-2" />
              AI Reader
            </TabsTrigger>
            <TabsTrigger value="memorization" className="data-[state=active]:bg-theater-gold/20 data-[state=active]:text-theater-gold">
              <BookOpen className="w-4 h-4 mr-2" />
              Memorization
            </TabsTrigger>
            <TabsTrigger value="cold-reading" className="data-[state=active]:bg-theater-gold/20 data-[state=active]:text-theater-gold">
              <Eye className="w-4 h-4 mr-2" />
              Cold Reading
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="script" className="space-y-6">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Your Script</h3>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Script
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".txt,.pdf,.docx"
                    onChange={handleScriptUpload}
                  />
                </Button>
                
                <Button variant="outline" onClick={handlePasteScript}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Paste Script
                </Button>
                
                <Button variant="outline" onClick={handleCopyToClipboard} disabled={!script}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Script
                </Button>
              </div>
            </div>
            
            <ScriptEditor 
              value={script} 
              onChange={setScript} 
            />
          </TabsContent>
          
          <TabsContent value="ai-reader" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">AI Reader Settings</h3>
                <AiReader script={script} />
              </div>
              
              <div className="bg-black/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Script Preview</h3>
                <div className="max-h-80 overflow-y-auto p-4 bg-black/30 rounded-md border border-white/10">
                  <pre className="text-white/90 whitespace-pre-wrap font-sans text-sm">
                    {script || "No script loaded. Please add a script on the Script tab."}
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="memorization" className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Memorization Tools</h3>
            <MemorizationTools script={script} />
          </TabsContent>
          
          <TabsContent value="cold-reading" className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Cold Reading Practice</h3>
            <ColdReadingMode />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
