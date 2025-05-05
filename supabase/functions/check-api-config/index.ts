
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { checkKey } = await req.json();
    
    // Check if specific key is configured
    if (checkKey) {
      const keyValue = Deno.env.get(checkKey);
      return new Response(
        JSON.stringify({ 
          isConfigured: !!keyValue,
          key: checkKey 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check all required API keys
    const requiredKeys = [
      'GEMINI_API_KEY',
      'OPENAI_API_KEY',
      'DEEPGRAM_API_KEY',
      'STRIPE_SECRET_KEY'
    ];
    
    const results = {};
    let allConfigured = true;
    
    for (const key of requiredKeys) {
      const value = Deno.env.get(key);
      results[key] = !!value;
      if (!value) allConfigured = false;
    }
    
    return new Response(
      JSON.stringify({ 
        keysConfigured: allConfigured,
        details: results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
