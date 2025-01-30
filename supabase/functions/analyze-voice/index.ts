import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioSegments, userId, coachPreferences } = await req.json();
    console.log("Received audio analysis request:", { 
      segmentsCount: audioSegments?.length,
      userId,
      hasPreferences: !!coachPreferences
    });

    if (!audioSegments || !Array.isArray(audioSegments)) {
      console.error("Invalid audio segments received:", audioSegments);
      throw new Error('Invalid or missing audio segments');
    }

    const deepgramApiKey = Deno.env.get("DEEPGRAM_API_KEY");
    if (!deepgramApiKey) {
      console.error("Deepgram API key not found");
      throw new Error('Deepgram API key not configured');
    }

    console.log("Processing audio segments with Deepgram...");

    // Process each audio segment with Deepgram
    const deepgramPromises = audioSegments.map(async (segment, index) => {
      console.log(`Processing segment ${index + 1}/${audioSegments.length}`);
      
      try {
        const response = await fetch("https://api.deepgram.com/v1/listen", {
          method: "POST",
          headers: {
            Authorization: `Token ${deepgramApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            buffer: segment.audioData,
            mimetype: 'audio/webm',
            model: "nova-2",
            language: "en",
            detect_language: true,
            punctuate: true,
            diarize: true,
            filler_words: true,
            utterances: true,
            sentiment: true
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Deepgram API error for segment ${index}:`, errorText);
          throw new Error(`Deepgram API error: ${errorText}`);
        }

        const result = await response.json();
        console.log(`Successfully processed segment ${index + 1}`);
        return {
          timestamp: segment.startTime,
          analysis: result
        };
      } catch (error) {
        console.error(`Error processing segment ${index}:`, error);
        throw error;
      }
    });

    console.log("Waiting for all Deepgram analyses to complete...");
    const segmentAnalyses = await Promise.all(deepgramPromises);
    console.log("All Deepgram analyses completed");

    // Aggregate Deepgram results
    const aggregatedResults = {
      transcript: segmentAnalyses.map(sa => sa.analysis.results?.channels[0]?.alternatives[0]?.transcript || '').join(' '),
      confidence: segmentAnalyses.reduce((acc, sa) => acc + (sa.analysis.results?.channels[0]?.alternatives[0]?.confidence || 0), 0) / segmentAnalyses.length,
      words: segmentAnalyses.flatMap(sa => sa.analysis.results?.channels[0]?.alternatives[0]?.words || []),
      sentiment: segmentAnalyses.map(sa => sa.analysis.results?.channels[0]?.alternatives[0]?.sentiment || {}),
      fillerWords: segmentAnalyses.reduce((acc, sa) => acc + (sa.analysis.results?.channels[0]?.alternatives[0]?.filler_words?.length || 0), 0)
    };

    console.log("Analyzing voice performance with Gemini...");
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const analysisPrompt = `
      As ${coachPreferences?.selected_coach || 'an expert acting coach'}, analyze this voice performance:

      Transcript: "${aggregatedResults.transcript}"
      Overall Confidence: ${aggregatedResults.confidence}
      Filler Words Count: ${aggregatedResults.fillerWords}
      Sentiment Analysis: ${JSON.stringify(aggregatedResults.sentiment)}

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

    const result = await model.generateContent([analysisPrompt]);
    const response = await result.response;
    const analysisText = response.text();
    
    console.log("Parsing Gemini analysis...");
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log("Voice analysis complete");

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-voice function:", error);
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