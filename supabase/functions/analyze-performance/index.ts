import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeVideoWithGoogleCloud } from "./googleCloud.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Received request to analyze-performance function");

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
    
    const credentials = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
    if (!credentials) {
      console.error("Missing Google Cloud credentials");
      throw new Error('Google Cloud credentials are not configured');
    }

    const requestData = await req.json();
    const { videoUrl } = requestData;
    
    if (!videoUrl) {
      console.error("No video URL provided in request");
      throw new Error('No video URL provided');
    }

    console.log("Starting video analysis process for URL:", videoUrl);

    // Call Google Cloud Vision API
    const analysis = await analyzeVideoWithGoogleCloud(videoUrl, credentials);
    console.log("Analysis completed successfully");

    return new Response(
      JSON.stringify(analysis),
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