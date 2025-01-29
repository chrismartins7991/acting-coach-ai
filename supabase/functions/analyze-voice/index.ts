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
    const { audioSegments, coachPreferences } = await req.json();
    console.log("Received audio segments:", audioSegments.length);
    
    if (!audioSegments || !audioSegments.length) {
      throw new Error('No audio segments provided');
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Process each audio segment with Gemini
    const segmentAnalyses = await Promise.all(audioSegments.map(async (segment: any) => {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this voice performance segment for an actor. Consider:
                     1. Voice clarity and diction
                     2. Emotional expression through voice
                     3. Pace and timing
                     4. Volume control and modulation
                     
                     Segment duration: ${segment.endTime - segment.startTime} seconds
                     
                     Provide analysis in this JSON format:
                     {
                       "segmentScore": number (0-100),
                       "voiceClarity": { "score": number, "feedback": "string" },
                       "emotionalExpression": { "score": number, "feedback": "string" },
                       "paceAndTiming": { "score": number, "feedback": "string" },
                       "volumeControl": { "score": number, "feedback": "string" }
                     }`
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${await response.text()}`);
      }

      const result = await response.json();
      const jsonMatch = result.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch[0]);
    }));

    // Aggregate segment analyses
    const overallScore = Math.round(
      segmentAnalyses.reduce((sum, analysis) => sum + analysis.segmentScore, 0) / segmentAnalyses.length
    );

    const voiceAnalysis = {
      overallScore,
      categories: {
        voiceClarity: {
          score: Math.round(
            segmentAnalyses.reduce((sum, a) => sum + a.voiceClarity.score, 0) / segmentAnalyses.length
          ),
          feedback: segmentAnalyses[Math.floor(segmentAnalyses.length / 2)].voiceClarity.feedback
        },
        emotionalExpression: {
          score: Math.round(
            segmentAnalyses.reduce((sum, a) => sum + a.emotionalExpression.score, 0) / segmentAnalyses.length
          ),
          feedback: segmentAnalyses[Math.floor(segmentAnalyses.length / 2)].emotionalExpression.feedback
        },
        paceAndTiming: {
          score: Math.round(
            segmentAnalyses.reduce((sum, a) => sum + a.paceAndTiming.score, 0) / segmentAnalyses.length
          ),
          feedback: segmentAnalyses[Math.floor(segmentAnalyses.length / 2)].paceAndTiming.feedback
        },
        volumeControl: {
          score: Math.round(
            segmentAnalyses.reduce((sum, a) => sum + a.volumeControl.score, 0) / segmentAnalyses.length
          ),
          feedback: segmentAnalyses[Math.floor(segmentAnalyses.length / 2)].volumeControl.feedback
        }
      },
      recommendations: [
        "Practice vocal exercises focusing on breath control and projection",
        "Work on maintaining consistent emotional expression through voice",
        "Focus on pacing and rhythm in dialogue delivery"
      ]
    };

    console.log("Voice analysis complete:", voiceAnalysis);

    return new Response(
      JSON.stringify(voiceAnalysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in voice analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});