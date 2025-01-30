import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting analyze-voice function");
    
    const { audioData, userId, coachPreferences } = await req.json();
    console.log("Received request data:", { 
      hasAudioData: !!audioData,
      userId,
      hasPreferences: !!coachPreferences
    });

    if (!audioData) {
      console.error("No audio data received");
      throw new Error('Invalid or missing audio data');
    }

    const deepgramApiKey = Deno.env.get("DEEPGRAM_API_KEY");
    if (!deepgramApiKey) {
      console.error("Deepgram API key not found");
      throw new Error('Deepgram API key not configured');
    }
    console.log("Deepgram API key found");

    // Convert base64 to binary
    console.log("Converting audio data...");
    const binaryData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    console.log("Audio data converted, size:", binaryData.length);

    // Process audio with Deepgram
    console.log("Starting Deepgram analysis...");
    const response = await fetch("https://api.deepgram.com/v1/listen", {
      method: "POST",
      headers: {
        Authorization: `Token ${deepgramApiKey}`,
        "Content-Type": "audio/webm",
      },
      body: binaryData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Deepgram API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Deepgram API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log("Deepgram analysis completed successfully");

    // Initialize Gemini for additional analysis
    console.log("Starting Gemini analysis...");
    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || '';
    const words = result.results?.channels[0]?.alternatives[0]?.words || [];
    const paragraphs = result.results?.channels[0]?.alternatives[0]?.paragraphs?.paragraphs || [];
    const sentiment = result.results?.channels[0]?.alternatives[0]?.sentiment || {};

    const analysisPrompt = `
      As ${coachPreferences?.selected_coach || 'an expert acting coach'}, analyze this voice performance:

      Transcript: "${transcript}"
      Word Timing: ${JSON.stringify(words.slice(0, 5))}... (${words.length} words total)
      Sentiment Analysis: ${JSON.stringify(sentiment)}

      Focus on:
      ${coachPreferences?.emotion_in_voice ? '- Emotional authenticity in voice' : ''}
      ${coachPreferences?.voice_expressiveness ? '- Voice expressiveness and variation' : ''}
      ${coachPreferences?.clearness_of_diction ? '- Clarity of speech and diction' : ''}

      Provide analysis in this JSON format:
      {
        "overallScore": <number 0-100>,
        "categories": {
          "voiceClarity": { "score": <number 0-100>, "feedback": "<specific feedback>" },
          "emotionalExpression": { "score": <number 0-100>, "feedback": "<specific feedback>" },
          "paceAndTiming": { "score": <number 0-100>, "feedback": "<specific feedback>" },
          "volumeControl": { "score": <number 0-100>, "feedback": "<specific feedback>" }
        },
        "recommendations": ["<specific recommendation>", "<specific recommendation>", "<specific recommendation>"]
      }`;

    // Add word timing data to the analysis
    const enrichedAnalysis = {
      transcript,
      wordTimings: words.map(word => ({
        word: word.word,
        start: word.start,
        end: word.end,
        confidence: word.confidence
      })),
      sentiment,
      paragraphs
    };

    console.log("Voice analysis complete");

    return new Response(
      JSON.stringify(enrichedAnalysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-voice function:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString(),
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});