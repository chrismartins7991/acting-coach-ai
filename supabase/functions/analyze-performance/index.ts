import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeFrameWithOpenAI } from "./openAiAnalyzer.ts";
import { aggregateAnalyses } from "./resultsAggregator.ts";
import { analyzeAudioWithGoogleCloud } from "./googleCloudAnalyzer.ts";

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

    // Process audio with both Whisper and Google Cloud
    console.log("Starting audio analysis...");
    
    // Convert base64 audio to blob for processing
    const audioBlob = Uint8Array.from(atob(audio), c => c.charCodeAt(0));

    // Parallel processing of audio with both services
    const [whisperResult, googleCloudResult] = await Promise.all([
      // Whisper Transcription
      (async () => {
        const formData = new FormData();
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

        return await transcriptionResponse.json();
      })(),
      
      // Google Cloud Speech-to-Text Analysis
      analyzeAudioWithGoogleCloud(audioBlob)
    ]);

    console.log("Audio analysis completed");

    // Analyze speech content and characteristics with GPT-4
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
            content: 'Analyze the following speech transcript and audio characteristics for an acting performance. Consider vocal delivery, emotional expression, clarity, and technical aspects. Provide scores out of 100 for each aspect and detailed feedback.'
          },
          {
            role: 'user',
            content: `
              Transcript: ${whisperResult.text}
              
              Audio Characteristics from Google Cloud:
              - Emotion: ${googleCloudResult.emotion}
              - Pitch: ${googleCloudResult.pitch}
              - Speaking Rate: ${googleCloudResult.speakingRate}
              - Volume Variation: ${googleCloudResult.volumeVariation}
            `
          }
        ],
      }),
    });

    if (!speechAnalysisResponse.ok) {
      throw new Error(`Failed to analyze speech: ${await speechAnalysisResponse.text()}`);
    }

    const speechAnalysis = await speechAnalysisResponse.json();
    console.log("Speech analysis completed");

    // Combine all analyses
    const combinedAnalysis = {
      ...aggregateAnalyses(frameAnalyses),
      audio: {
        transcript: whisperResult.text,
        characteristics: googleCloudResult,
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