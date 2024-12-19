import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { parseAnalysis } from "./utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("Starting analyze-performance function");
    const { videoUrl } = await req.json();
    
    if (!videoUrl) {
      throw new Error('No video URL provided');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log("Analyzing video:", videoUrl);

    // Call OpenAI API for analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert acting coach analyzing a video performance. 
            Your task is to provide a detailed analysis in this EXACT format:

            Delivery Score: [number 0-100]
            Delivery Feedback: [2-3 sentences about vocal delivery, clarity, and timing]
            Presence Score: [number 0-100]
            Presence Feedback: [2-3 sentences about stage presence, body language, and movement]
            Emotional Range Score: [number 0-100]
            Emotional Range Feedback: [2-3 sentences about emotional expression and authenticity]
            Recommendations:
            1. [specific actionable recommendation]
            2. [specific actionable recommendation]
            3. [specific actionable recommendation]`
          },
          {
            role: 'user',
            content: `Please analyze this video performance: ${videoUrl}
            
            Focus on:
            1. Delivery (voice, clarity, timing)
            2. Stage presence and body language
            3. Emotional range and authenticity
            
            Provide specific, actionable feedback that will help the performer improve.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const aiResponse = await response.json();
    console.log("OpenAI response received:", aiResponse);

    const analysis = parseAnalysis(aiResponse.choices[0].message.content);
    console.log("Parsed analysis:", analysis);

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