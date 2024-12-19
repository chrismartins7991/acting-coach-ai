import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeVideoWithGoogleCloud } from "./googleCloud.ts";
import { processVideoAnalysis } from "./analysis.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const credentials = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
    if (!credentials) {
      throw new Error('Google Cloud credentials are not configured');
    }

    console.log("Retrieved Google Cloud credentials");

    const requestData = await req.json();
    const { videoUrl } = requestData;
    
    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: 'No video URL provided' }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log("Starting video analysis process for URL:", videoUrl);

    // Call Google Cloud Vision API
    const googleCloudResponse = await analyzeVideoWithGoogleCloud(videoUrl, credentials);
    console.log("Received response from Google Cloud Vision API");

    // Process the response
    const analysis = processVideoAnalysis(googleCloudResponse);
    console.log("Analysis processed successfully");

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
        error: error.message,
        timestamp: new Date().toISOString(),
        details: error.stack
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