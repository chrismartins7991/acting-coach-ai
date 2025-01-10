import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeFrameWithOpenAI } from "./openAiAnalyzer.ts";
import { aggregateAnalyses } from "./resultsAggregator.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Received request to analyze-performance function");

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { videoUrl, frames, audio } = await req.json();
    
    if (!videoUrl || !frames || !Array.isArray(frames) || !audio) {
      throw new Error('Invalid request data');
    }

    console.log("Starting frame and audio analysis process...");

    // Analyze frames with OpenAI Vision
    const framePositions = ['beginning', 'middle', 'end'];
    const frameAnalyses = await Promise.all(
      frames.map((frame, index) => analyzeFrameWithOpenAI(frame, framePositions[index]))
    );
    console.log("OpenAI frame analyses completed");

    // Process audio with Whisper
    console.log("Starting audio transcription...");
    const formData = new FormData();
    const audioBlob = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    formData.append('file', new Blob([audioBlob], { type: 'audio/webm' }), 'audio.webm');
    formData.append('model', 'whisper-1');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`Failed to transcribe audio: ${await transcriptionResponse.text()}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    console.log("Audio transcription completed");

    // Analyze speech content with GPT-4
    const speechAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Analyze the following speech transcript from an acting performance. Focus on vocal delivery, emotional expression, and clarity. Provide scores out of 100 for each aspect and brief feedback.'
          },
          {
            role: 'user',
            content: transcriptionResult.text
          }
        ],
      }),
    });

    if (!speechAnalysisResponse.ok) {
      throw new Error(`Failed to analyze speech: ${await speechAnalysisResponse.text()}`);
    }

    const speechAnalysis = await speechAnalysisResponse.json();
    console.log("Speech analysis completed");

    // Combine visual and audio analyses
    const combinedAnalysis = {
      ...aggregateAnalyses(frameAnalyses),
      speech: {
        transcript: transcriptionResult.text,
        analysis: speechAnalysis.choices[0].message.content
      }
    };

    return new Response(
      JSON.stringify(combinedAnalysis),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
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