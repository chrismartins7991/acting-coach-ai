import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeFrameWithOpenAI } from "./openAiAnalyzer.ts";
import { aggregateAnalyses } from "./resultsAggregator.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Received request to analyze-performance function");

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { videoUrl, frames } = await req.json();
    
    if (!videoUrl || !frames || !Array.isArray(frames)) {
      throw new Error('Invalid request data');
    }

    console.log("Starting frame analysis process...");

    // Analyze frames with OpenAI Vision
    const framePositions = ['beginning', 'middle', 'end'];
    const frameAnalyses = await Promise.all(
      frames.map((frame, index) => analyzeFrameWithOpenAI(frame, framePositions[index]))
    );
    console.log("OpenAI frame analyses completed");

    // Combine analyses
    const aggregatedAnalysis = aggregateAnalyses(frameAnalyses);
    console.log("Analysis aggregated:", aggregatedAnalysis);

    return new Response(
      JSON.stringify(aggregatedAnalysis),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in analyze-performance function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        details: error.stack
      }),
      { 
        status: error.message === 'Method not allowed' ? 405 : 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});