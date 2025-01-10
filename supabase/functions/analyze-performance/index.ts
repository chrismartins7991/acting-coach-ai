import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function extractFrameFromVideo(videoUrl: string): Promise<string> {
  // For now, we'll use a mock frame extraction
  // In production, you would want to use a video processing service
  // This is a placeholder URL for testing
  return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&fit=crop";
}

async function analyzeFrameWithOpenAI(frame: string): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log("Analyzing frame with OpenAI Vision...");
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert acting coach analyzing performance videos. Focus on delivery, presence, and emotional range."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this performance video frame and provide detailed feedback on the actor's delivery, presence, and emotional range."
              },
              {
                type: "image_url",
                image_url: {
                  url: frame,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in analyzeFrameWithOpenAI:", error);
    throw error;
  }
}

serve(async (req) => {
  console.log("Received request to analyze-performance function");

  // Handle CORS preflight requests
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

    const body = await req.json();
    console.log("Received request body:", body);

    const { videoUrl } = body;
    
    if (!videoUrl) {
      throw new Error('No video URL provided');
    }

    console.log("Video URL received:", videoUrl);

    // Extract a frame from the video
    const frame = await extractFrameFromVideo(videoUrl);
    console.log("Frame extracted:", frame);

    // Analyze the frame with OpenAI Vision
    const analysis = await analyzeFrameWithOpenAI(frame);
    console.log("OpenAI analysis received:", analysis);

    // Aggregate the analysis into a structured response
    const aggregatedAnalysis = {
      overallScore: 75, // Example score
      categories: {
        delivery: {
          score: 80,
          feedback: analysis.choices[0].message.content
        },
        presence: {
          score: 75,
          feedback: "Based on visual analysis of the performance"
        },
        emotionalRange: {
          score: 70,
          feedback: "Analysis of emotional expression throughout the performance"
        }
      },
      recommendations: [
        "Practice maintaining consistent eye contact",
        "Work on varying emotional intensity",
        "Focus on clear articulation"
      ],
      timestamp: new Date().toISOString()
    };

    console.log("Analysis complete");

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