
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";
import { analyzeFrameWithGemini } from "./geminiAnalyzer.ts";
import { aggregateResults } from "./resultsAggregator.ts";
import { AnalysisRequest } from "./types.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: AnalysisRequest = await req.json();
    console.log("Received request data:", {
      hasVideoUrl: !!requestData.videoUrl,
      hasFrames: !!requestData.frames,
      framesCount: requestData.frames?.length,
      hasCoachPreferences: !!requestData.coachPreferences,
      coachPreferences: requestData.coachPreferences
    });

    if (!requestData.frames || !Array.isArray(requestData.frames)) {
      throw new Error('Invalid or missing frames array');
    }

    const preferences = requestData.coachPreferences;
    if (!preferences || !preferences.selectedCoach) {
      throw new Error('Coach preferences are required');
    }

    // Initialize Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision-latest" });

    console.log("Analyzing frames with Gemini Vision...");
    
    // Take strategic frame samples for analysis
    const frameIndices = [
      0, // beginning
      Math.floor(requestData.frames.length * 0.25), // quarter
      Math.floor(requestData.frames.length * 0.5), // middle
      Math.floor(requestData.frames.length * 0.75), // three-quarters
      requestData.frames.length - 1 // end
    ];
    
    const selectedFrames = frameIndices.map(i => requestData.frames[i]);
    
    // Analyze frames in parallel with proper position labeling
    const framePromises = selectedFrames.map((frame: string, index: number) => {
      const position = ['beginning', 'quarter', 'middle', 'three-quarter', 'end'][index];
      console.log(`Analyzing frame at ${position}...`);
      return analyzeFrameWithGemini(frame, position, preferences, model);
    });

    const frameAnalyses = await Promise.all(framePromises);
    console.log("Frame analyses completed:", frameAnalyses);

    // Aggregate results with improved weighting
    const analysisResult = aggregateResults(frameAnalyses, preferences);
    console.log("Sending aggregated analysis:", analysisResult);

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error("Error in analyze-performance function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
