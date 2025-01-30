import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

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
    console.log("Received request:", { 
      hasAudioData: !!audioData,
      userId,
      hasPreferences: !!coachPreferences
    });

    if (!audioData) {
      console.error("Invalid audio data received");
      throw new Error('Invalid or missing audio data');
    }

    const deepgramApiKey = Deno.env.get("DEEPGRAM_API_KEY");
    if (!deepgramApiKey) {
      console.error("Deepgram API key not found");
      throw new Error('Deepgram API key not configured');
    }
    console.log("Deepgram API key found");

    // Process audio with Deepgram
    console.log("Starting Deepgram analysis...");
    const response = await fetch("https://api.deepgram.com/v1/listen", {
      method: "POST",
      headers: {
        Authorization: `Token ${deepgramApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        buffer: audioData,
        mimetype: 'audio/webm',
        model: "nova-2",
        language: "en",
        detect_language: true,
        punctuate: true,
        diarize: true,
        utterances: true,
        sentiment: true,
        keywords: true,
        summarize: true,
        detect_topics: true,
        paragraphs: true
      }),
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
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || '';
    const words = result.results?.channels[0]?.alternatives[0]?.words || [];
    const paragraphs = result.results?.channels[0]?.alternatives[0]?.paragraphs?.paragraphs || [];
    const sentiment = result.results?.channels[0]?.alternatives[0]?.sentiment || {};

    const analysisPrompt = `
      As ${coachPreferences?.selected_coach || 'an expert acting coach'}, analyze this voice performance:

      Transcript: "${transcript}"
      Paragraphs Structure: ${JSON.stringify(paragraphs)}
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

    const result2 = await model.generateContent([analysisPrompt]);
    const response2 = await result2.response;
    const analysisText = response2.text();
    
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log("Voice analysis complete");

    // Add word timing data to the analysis
    const enrichedAnalysis = {
      ...analysis,
      wordTimings: words.map(word => ({
        word: word.word,
        start: word.start,
        end: word.end,
        confidence: word.confidence
      }))
    };

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