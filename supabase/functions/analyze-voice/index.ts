import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audioData } = await req.json();
    console.log("Received audio data length:", audioData?.length || 0);
    
    if (!audioData) {
      throw new Error('No audio data provided');
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Call Gemini API for voice analysis
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this voice performance for an actor. Consider the following aspects:
                   1. Voice clarity and diction
                   2. Emotional expression through voice
                   3. Pace and timing
                   4. Volume control and modulation
                   
                   Provide feedback in this JSON format:
                   {
                     "overallScore": number (0-100),
                     "categories": {
                       "voiceClarity": { "score": number, "feedback": "string" },
                       "emotionalExpression": { "score": number, "feedback": "string" },
                       "paceAndTiming": { "score": number, "feedback": "string" },
                       "volumeControl": { "score": number, "feedback": "string" }
                     },
                     "recommendations": ["string"]
                   }
                   
                   Audio data length: ${audioData.length} characters`
          }]
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error response:", errorText);
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const result = await response.json();
    console.log("Gemini API response:", result);

    // Extract JSON from the response text
    const jsonMatch = result.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log("Parsed analysis:", analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in voice analysis:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});