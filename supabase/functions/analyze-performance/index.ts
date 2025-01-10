import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeFrameWithOpenAI } from "./openAiAnalyzer.ts";
import { aggregateAnalyses } from "./resultsAggregator.ts";
import { analyzeAudioWithGoogleCloud } from "./googleCloudAnalyzer.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  console.log("Received request to analyze-performance function");

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Increase request read limit to 50MB
    const bodyText = await req.text();
    console.log("Request body size:", bodyText.length);
    
    if (bodyText.length > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('Request too large - maximum size is 50MB');
    }

    const { videoUrl, frames, audio } = JSON.parse(bodyText);
    
    if (!videoUrl || !frames || !Array.isArray(frames) || !audio) {
      console.error("Invalid request data:", { videoUrl: !!videoUrl, frames: !!frames, audio: !!audio });
      throw new Error('Invalid request data - missing required fields');
    }

    console.log("Starting frame and audio analysis process...");

    // Analyze frames with OpenAI Vision
    const framePositions = ['beginning', 'middle', 'end'];
    const frameAnalyses = await Promise.all(
      frames.map((frame, index) => {
        console.log(`Analyzing frame ${index + 1}/${frames.length}`);
        return analyzeFrameWithOpenAI(frame, framePositions[index]);
      })
    );
    console.log("OpenAI frame analyses completed");

    // Process audio
    console.log("Starting audio analysis...");
    
    // Convert base64 audio to blob
    const audioBlob = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    console.log("Audio blob size:", audioBlob.length);

    // Parallel processing of audio
    const [whisperResult, googleCloudResult] = await Promise.all([
      // Whisper Transcription
      (async () => {
        console.log("Starting Whisper transcription...");
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
          const error = await transcriptionResponse.text();
          console.error("Whisper API error:", error);
          throw new Error(`Failed to transcribe audio: ${error}`);
        }

        const result = await transcriptionResponse.json();
        console.log("Whisper transcription completed");
        return result;
      })(),
      
      // Google Cloud Analysis
      (async () => {
        console.log("Starting Google Cloud audio analysis...");
        const result = await analyzeAudioWithGoogleCloud(audioBlob);
        console.log("Google Cloud analysis completed");
        return result;
      })()
    ]);

    console.log("Audio analysis completed");

    // Analyze speech content with GPT-4
    console.log("Starting GPT-4 speech analysis...");
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
            content: 'Analyze the following speech transcript and audio characteristics for an acting performance. Consider vocal delivery, emotional expression, clarity, and technical aspects. Provide detailed feedback.'
          },
          {
            role: 'user',
            content: `
              Transcript: ${whisperResult.text}
              
              Audio Characteristics:
              - Emotion: ${googleCloudResult.emotion}
              - Speaking Rate: ${googleCloudResult.speakingRate} words/minute
              - Volume Variation: ${JSON.stringify(googleCloudResult.volumeVariation)}
              - Pitch Analysis: ${JSON.stringify(googleCloudResult.pitch)}
            `
          }
        ],
      }),
    });

    if (!speechAnalysisResponse.ok) {
      const error = await speechAnalysisResponse.text();
      console.error("GPT-4 API error:", error);
      throw new Error(`Failed to analyze speech: ${error}`);
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

    console.log("Analysis complete, sending response");

    return new Response(
      JSON.stringify(combinedAnalysis),
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
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});