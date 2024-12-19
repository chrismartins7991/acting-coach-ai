import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { processVideoAnalysis } from "./analysis.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const credentials = JSON.parse(Deno.env.get('GOOGLE_CLOUD_CREDENTIALS') || '{}');
    if (!credentials.api_key) {
      throw new Error('Google Cloud credentials are not configured');
    }

    const requestData = await req.json();
    const { videoUrl } = requestData;
    
    if (!videoUrl) {
      throw new Error('No video URL provided');
    }

    console.log("Starting video analysis process for URL:", videoUrl);

    // Mock analysis for testing
    const mockAnalysis = {
      timestamp: new Date().toISOString(),
      overallScore: 75,
      categories: {
        delivery: {
          score: 80,
          feedback: "Good vocal clarity and projection. Speech is well-paced and easily understood."
        },
        presence: {
          score: 70,
          feedback: "Decent stage presence. Work on maintaining consistent positioning and engagement."
        },
        emotionalRange: {
          score: 75,
          feedback: "Good emotional expression. Work on expanding range and smoothing transitions."
        }
      },
      recommendations: [
        "Practice vocal exercises to improve clarity and projection",
        "Work on maintaining consistent eye contact",
        "Explore emotional range exercises"
      ]
    };

    return new Response(
      JSON.stringify(mockAnalysis),
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
        error: error.message,
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