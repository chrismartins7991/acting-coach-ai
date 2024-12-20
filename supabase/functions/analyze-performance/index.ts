import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeVideoWithGoogleCloud } from "./googleCloud.ts";
import { parseAnalysis } from "./utils.ts";

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
    console.log("Starting analyze-performance function");
    const { videoUrl } = await req.json();
    
    if (!videoUrl) {
      throw new Error('No video URL provided');
    }

    // Get Google Cloud credentials from environment
    const credentials = {
      type: Deno.env.get('GOOGLE_CLOUD_CREDENTIALS_TYPE'),
      project_id: Deno.env.get('GOOGLE_CLOUD_PROJECT_ID'),
      private_key: Deno.env.get('GOOGLE_CLOUD_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      client_email: Deno.env.get('GOOGLE_CLOUD_CLIENT_EMAIL'),
      client_id: Deno.env.get('GOOGLE_CLOUD_CLIENT_ID'),
    };

    if (!credentials.private_key || !credentials.client_email) {
      throw new Error('Google Cloud credentials not properly configured');
    }

    console.log("Analyzing video with Google Cloud API:", videoUrl);
    const googleCloudResponse = await analyzeVideoWithGoogleCloud(videoUrl, credentials);
    console.log("Google Cloud analysis complete");

    // Parse the response into our standard format
    const analysis = parseAnalysis(googleCloudResponse);
    console.log("Analysis parsed:", analysis);

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