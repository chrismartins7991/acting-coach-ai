import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeFrameWithOpenAI } from "./openAiAnalyzer.ts";
import { aggregateAnalyses } from "./resultsAggregator.ts";
import { analyzeAudioWithGoogleCloud } from "./googleCloudAnalyzer.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_REQUEST_SIZE = 50 * 1024 * 1024; // 50MB

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
    // Check request size
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > MAX_REQUEST_SIZE) {
      throw new Error('Request too large - maximum size is 50MB');
    }

    // Read and parse request body
    const bodyText = await req.text();
    console.log("Request body size:", bodyText.length);
    
    const { videoUrl, frames, audio } = JSON.parse(bodyText);
    
    if (!videoUrl || !frames || !Array.isArray(frames) || !audio) {
      console.error("Invalid request data:", { videoUrl: !!videoUrl, frames: !!frames, audio: !!audio });
      throw new Error('Invalid request data - missing required fields');
    }

    console.log("Starting frame and audio analysis process...");

    // Process frames in smaller batches
    const framePositions = ['beginning', 'middle', 'end'];
    const frameAnalysisPromises = frames.map((frame, index) => {
      console.log(`Analyzing frame ${index + 1}/${frames.length}`);
      return analyzeFrameWithOpenAI(frame, framePositions[index]);
    });

    // Process audio separately
    console.log("Starting audio analysis...");
    
    // Convert base64 audio to blob
    const audioBlob = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    console.log("Audio blob size:", audioBlob.length);

    // Parallel processing of frames and audio
    const [frameResults, whisperResult, googleCloudResult] = await Promise.all([
      Promise.all(frameAnalysisPromises),
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

    console.log("All analyses completed, aggregating results...");

    // Combine all analyses
    const combinedAnalysis = {
      ...aggregateAnalyses(frameResults),
      audio: {
        transcript: whisperResult.text,
        characteristics: googleCloudResult,
        analysis: await analyzeAudioContent(whisperResult.text, googleCloudResult)
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

async function analyzeAudioContent(transcript: string, audioCharacteristics: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            Transcript: ${transcript}
            
            Audio Characteristics:
            - Emotion: ${audioCharacteristics.emotion}
            - Speaking Rate: ${audioCharacteristics.speakingRate} words/minute
            - Volume Variation: ${JSON.stringify(audioCharacteristics.volumeVariation)}
            - Pitch Analysis: ${JSON.stringify(audioCharacteristics.pitch)}
          `
        }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("GPT-4 API error:", error);
    throw new Error(`Failed to analyze speech: ${error}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
}