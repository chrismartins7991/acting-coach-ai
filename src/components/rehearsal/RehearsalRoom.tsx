
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Book, BookOpen, Mic, Play, Upload, Clipboard, Search, Eye, FileText, AlertCircle } from "lucide-react";
import { ScriptEditor } from "./ScriptEditor";
import { AiReader } from "./AiReader";
import { MemorizationTools } from "./MemorizationTools";
import { ColdReadingMode } from "./ColdReadingMode";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import * as pdfjsLib from 'pdfjs-dist';

// Set the PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const RehearsalRoom = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [script, setScript] = useState("");
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleScriptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      if (file.type === 'application/pdf') {
        await handlePdfUpload(file);
      } else {
        // Handle text files
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
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload error",
        description: "There was a problem processing your file.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePdfUpload = async (file: File) => {
    // Read the PDF file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    try {
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extractedText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        extractedText += pageText + '\n\n';
      }
      
      // Format the extracted text to clean it up
      const formattedText = extractedText
        .replace(/\s+/g, ' ')
        .replace(/ \n/g, '\n')
        .replace(/\n +/g, '\n')
        .replace(/\n{3,}/g, '\n\n');
      
      setScript(formattedText);
      toast({
        title: "PDF script extracted",
        description: `${file.name} has been processed successfully.`,
      });
    } catch (error) {
      console.error("PDF parsing error:", error);
      toast({
        title: "PDF parsing error",
        description: "Unable to extract text from this PDF file.",
        variant: "destructive",
      });
    }
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

  const handleSaveScript = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.txt';
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Script saved",
      description: "Script has been downloaded as a text file.",
    });
  };
  
  const handleFeatureSelect = (feature: string) => {
    setActiveFeature(activeFeature === feature ? null : feature);
  };
  
  return (
    <div className="space-y-8">
      {/* Script Editor Section - Central at the top */}
      <div className="flex flex-col items-center">
        <Card className="w-full lg:w-3/4 xl:w-2/3 p-4 bg-black/30 border-white/10">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Your Script</h3>
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()} 
                className={isMobile ? "text-xs px-2 py-1 h-8" : ""}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-1 h-4 w-4" />
                    {isMobile ? "Upload" : "Upload Script"}
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".txt,.pdf,.docx"
                  onChange={handleScriptUpload}
                />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handlePasteScript} 
                className={isMobile ? "text-xs px-2 py-1 h-8" : ""}
                disabled={isProcessing}
              >
                <Clipboard className="mr-1 h-4 w-4" />
                {isMobile ? "Paste" : "Paste Script"}
              </Button>
              
              {script && (
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/10"
                  onClick={handleSaveScript}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Save
                </Button>
              )}
            </div>
          </div>
          
          <ScriptEditor 
            value={script} 
            onChange={setScript} 
          />
        </Card>
      </div>

      {/* Feature Selection - Three Options Below */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI Reader */}
        <Card 
          className={`p-4 cursor-pointer hover:bg-black/40 transition-all ${activeFeature === 'reader' ? 'bg-black/40 border-theater-gold' : 'bg-black/30 border-white/10'}`}
          onClick={() => handleFeatureSelect('reader')}
        >
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-theater-gold/20 p-3 rounded-full mb-2">
              <Mic className="h-6 w-6 text-theater-gold" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">AI Reader</h3>
            <p className="text-sm text-white/70">Practice with an AI scene partner that reads other characters' lines</p>
          </div>
        </Card>
        
        {/* Line Memorization */}
        <Card 
          className={`p-4 cursor-pointer hover:bg-black/40 transition-all ${activeFeature === 'memorization' ? 'bg-black/40 border-theater-gold' : 'bg-black/30 border-white/10'}`}
          onClick={() => handleFeatureSelect('memorization')}
        >
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-theater-gold/20 p-3 rounded-full mb-2">
              <BookOpen className="h-6 w-6 text-theater-gold" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">AI Line Memorization</h3>
            <p className="text-sm text-white/70">Hide parts of your script progressively to help memorize lines</p>
          </div>
        </Card>
        
        {/* Cold Reading */}
        <Card 
          className={`p-4 cursor-pointer hover:bg-black/40 transition-all ${activeFeature === 'cold-reading' ? 'bg-black/40 border-theater-gold' : 'bg-black/30 border-white/10'}`}
          onClick={() => handleFeatureSelect('cold-reading')}
        >
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-theater-gold/20 p-3 rounded-full mb-2">
              <Eye className="h-6 w-6 text-theater-gold" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">AI Cold Reader</h3>
            <p className="text-sm text-white/70">Practice audition skills with timed script preparation</p>
          </div>
        </Card>
      </div>

      {/* Active Feature Area */}
      {activeFeature && (
        <Card className="p-6 bg-black/30 border-white/10">
          {activeFeature === 'reader' && <AiReader script={script} />}
          {activeFeature === 'memorization' && <MemorizationTools script={script} />}
          {activeFeature === 'cold-reading' && <ColdReadingMode />}
        </Card>
      )}
    </div>
  );
};
