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
    console.log("Starting analyze-performance function");
    
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

    // Get Google Cloud credentials from environment
    const credentials = {
      type: Deno.env.get('GOOGLE_CLOUD_CREDENTIALS_TYPE'),
      project_id: Deno.env.get('GOOGLE_CLOUD_PROJECT_ID'),
      private_key: Deno.env.get('GOOGLE_CLOUD_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      client_email: Deno.env.get('GOOGLE_CLOUD_CLIENT_EMAIL'),
      client_id: Deno.env.get('GOOGLE_CLOUD_CLIENT_ID'),
    };

    // Log credentials presence (not the values)
    console.log("Credentials check:", {
      hasType: !!credentials.type,
      hasProjectId: !!credentials.project_id,
      hasPrivateKey: !!credentials.private_key,
      hasClientEmail: !!credentials.client_email,
      hasClientId: !!credentials.client_id
    });

    // Validate credentials
    if (!credentials.private_key || !credentials.client_email) {
      console.error("Missing Google Cloud credentials");
      throw new Error('Google Cloud credentials not properly configured');
    }

    console.log("Analyzing video with Google Cloud API");
    const googleCloudResponse = await analyzeVideoWithGoogleCloud(videoUrl, credentials);
    console.log("Google Cloud analysis complete");

    // Process the response into our standard format
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