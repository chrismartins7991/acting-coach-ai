import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeVideoWithGoogleCloud } from "./googleCloud.ts";
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