
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColdReadingMode } from "./ColdReadingMode";
import { MemorizationTools } from "./MemorizationTools";
import { AiReader } from "./AiReader";
import { ScriptEditor } from "./ScriptEditor";
import { Upload, FileText, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as pdfjs from "pdfjs-dist";
import { useIsMobile } from "@/hooks/use-mobile";

// Initialize PDF.js worker
const pdfjsVersion = '5.2.133';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

export const RehearsalRoom = () => {
  const [script, setScript] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>("editor");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      if (file.type === "application/pdf") {
        // Handle PDF file
        const fileArrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: fileArrayBuffer }).promise;
        
        let fullText = '';
        
        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const textItems = textContent.items.map((item: any) => item.str).join(' ');
          fullText += textItems + '\n\n';
        }
        
        // Clean up common PDF extraction issues
        fullText = fullText
          .replace(/\s{2,}/g, ' ')        // Replace multiple spaces with single space
          .replace(/\n{3,}/g, '\n\n')     // Replace excessive newlines
          .replace(/([.!?])\s*(?=[A-Z])/g, '$1\n') // Add line breaks after sentences
          .trim();
        
        setScript(fullText);
        
        toast({
          title: "PDF Loaded",
          description: `Extracted ${pdf.numPages} pages of text from PDF.`,
        });
      } else if (file.type === "text/plain") {
        // Handle TXT file
        const text = await file.text();
        setScript(text);
        
        toast({
          title: "Text File Loaded",
          description: "Script loaded successfully.",
        });
      } else {
        toast({
          title: "Unsupported File",
          description: "Please upload a PDF or TXT file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error Loading File",
        description: "There was an error processing your file. Please try again with a different file.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Script Editor Section */}
      <section className="bg-black/20 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-xl font-semibold text-white mb-2 sm:mb-0">Script Editor</h2>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-black/30 text-white border-white/20 hover:bg-white/10"
              onClick={() => document.getElementById('script-upload')?.click()}
              disabled={isLoading}
            >
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Upload Script
                </>
              )}
            </Button>
            <input
              id="script-upload"
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
            
            {script && (
              <Button 
                variant="outline" 
                size="sm"
                className="bg-black/30 text-white border-white/20 hover:bg-white/10"
                onClick={() => {
                  const blob = new Blob([script], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'script.txt';
                  a.click();
                }}
              >
                <FileText className="mr-2 h-4 w-4" /> Download
              </Button>
            )}
          </div>
        </div>

        <ScriptEditor value={script} onChange={setScript} />

        {script && script.includes('\uFFFD') && (
          <div className="flex items-start gap-2 mt-4 p-3 bg-yellow-500/20 rounded-md text-sm text-yellow-300">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">There may be some encoding issues with this PDF.</p>
              <p>Try using the "Clean Text" button to fix common issues, or try a different PDF file.</p>
            </div>
          </div>
        )}
      </section>

      {/* Rehearsal Tools Section */}
      <section>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="w-full bg-black/20 border-b border-white/10">
            <TabsTrigger value="editor" className="flex-1">AI Reader</TabsTrigger>
            <TabsTrigger value="memorize" className="flex-1">Line Memorization</TabsTrigger>
            <TabsTrigger value="coldread" className="flex-1">Cold Reading</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="pt-4">
            <div className="grid grid-cols-1 gap-4">
              <AiReader script={script} />
            </div>
          </TabsContent>

          <TabsContent value="memorize" className="pt-4">
            <div className="grid grid-cols-1 gap-4">
              <MemorizationTools script={script} />
            </div>
          </TabsContent>

          <TabsContent value="coldread" className="pt-4">
            <div className="grid grid-cols-1 gap-4">
              <ColdReadingMode script={script} />
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};
