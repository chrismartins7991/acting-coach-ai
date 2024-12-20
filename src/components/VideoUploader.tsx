import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PerformanceAnalysis } from "./PerformanceAnalysis";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const GOOGLE_API_KEY = 'YOUR_GOOGLE_CLOUD_API_KEY'; // Replace with your actual API key
const GOOGLE_API_URL = 'https://videointelligence.googleapis.com/v1/videos:annotate';

const VideoUploader = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const pollOperationStatus = async (operationName: string) => {
    const operationUrl = `https://videointelligence.googleapis.com/v1/${operationName}?key=${GOOGLE_API_KEY}`;
    
    while (true) {
      const response = await fetch(operationUrl);
      const data = await response.json();
      
      if (data.done) {
        return data.response;
      }
      
      // Wait 5 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  };

  const analyzeVideo = async (gcsUri: string) => {
    const requestBody = {
      inputUri: gcsUri,
      features: [
        "FACE_DETECTION",
        "PERSON_DETECTION",
        "SPEECH_TRANSCRIPTION"
      ],
      videoContext: {
        speechTranscriptionConfig: {
          languageCode: "en-US",
          enableAutomaticPunctuation: true
        }
      }
    };

    const response = await fetch(`${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('Failed to start video analysis');
    }

    const data = await response.json();
    return pollOperationStatus(data.name);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a video file smaller than 50MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log("Starting video upload...");

      // First, we need to upload the video to Google Cloud Storage
      // You'll need to implement this part with your own storage solution
      // For now, we'll assume you have a function that returns a GCS URI
      const gcsUri = `gs://your-bucket-name/${file.name}`;
      
      console.log("Starting video analysis...");
      const analysisResult = await analyzeVideo(gcsUri);
      
      // Process the analysis results into the format expected by PerformanceAnalysis
      const processedAnalysis = {
        overallScore: 85, // You'll need to calculate this based on the analysis
        categories: {
          delivery: {
            score: 80,
            feedback: "Good vocal clarity and pacing"
          },
          presence: {
            score: 90,
            feedback: "Strong stage presence and body language"
          },
          emotionalRange: {
            score: 85,
            feedback: "Good emotional expression"
          }
        },
        recommendations: [
          "Consider varying your pace more",
          "Work on maintaining consistent eye contact",
          "Practice more dynamic gestures"
        ],
        timestamp: new Date().toISOString()
      };

      setAnalysis(processedAnalysis);
      
      toast({
        title: "Analysis Complete",
        description: "Your video has been analyzed successfully!",
      });

    } catch (error: any) {
      console.error("Error processing video:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative">
        <label className={`block p-8 rounded-lg border-2 border-dashed border-white/20 bg-black/20 cursor-pointer transition-all hover:bg-black/40 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isProcessing}
          />
          <div className="text-center">
            <Upload className="w-12 h-12 text-white mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">Upload Video</h3>
            <p className="text-white/80">Upload a video file (max 50MB) for analysis</p>
            {isProcessing && (
              <p className="text-white/80 mt-2">Processing video...</p>
            )}
          </div>
        </label>
      </div>

      {analysis && <PerformanceAnalysis analysis={analysis} />}
    </div>
  );
};

export default VideoUploader;