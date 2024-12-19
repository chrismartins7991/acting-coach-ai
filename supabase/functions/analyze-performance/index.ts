import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log("Starting analyze-performance function");
    
    const { videoUrl } = await req.json();
    console.log("Received video URL:", videoUrl);
    
    if (!videoUrl) {
      throw new Error('No video URL provided');
    }

    // For now, return a mock analysis while we debug the connection
    const mockAnalysis = {
      timestamp: new Date().toISOString(),
      overallScore: 85,
      categories: {
        delivery: {
          score: 80,
          feedback: "Good vocal clarity and pacing."
        },
        presence: {
          score: 85,
          feedback: "Strong stage presence and engagement."
        },
        emotionalRange: {
          score: 90,
          feedback: "Excellent emotional expression and authenticity."
        }
      },
      recommendations: [
        "Practice varying your vocal tone for more dynamic delivery",
        "Continue working on maintaining consistent eye contact",
        "Explore more subtle emotional transitions"
      ]
    };

    console.log("Returning mock analysis for testing");
    
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