import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function analyzeVideoWithGoogleCloud(videoUrl: string) {
  console.log("Starting Google Cloud Video analysis for:", videoUrl);
  
  const credentials = {
    type: Deno.env.get('GOOGLE_CLOUD_CREDENTIALS_TYPE'),
    project_id: Deno.env.get('GOOGLE_CLOUD_PROJECT_ID'),
    client_email: Deno.env.get('GOOGLE_CLOUD_CLIENT_EMAIL'),
    client_id: Deno.env.get('GOOGLE_CLOUD_CLIENT_ID'),
    private_key: Deno.env.get('GOOGLE_CLOUD_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
  };

  const response = await fetch('https://videointelligence.googleapis.com/v1/videos:annotate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getGoogleAccessToken(credentials)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputUri: videoUrl,
      features: ['FACE_DETECTION', 'SPEECH_TRANSCRIPTION', 'PERSON_DETECTION'],
      videoContext: {
        speechTranscriptionConfig: {
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Cloud API error: ${await response.text()}`);
  }

  return await response.json();
}

async function getGoogleAccessToken(credentials: any) {
  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  const scope = 'https://www.googleapis.com/auth/cloud-platform';
  
  const jwt = await createJWT(credentials, scope);
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!response.ok) {
    throw new Error('Failed to get Google access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function createJWT(credentials: any, scope: string) {
  const header = btoa(JSON.stringify({
    alg: 'RS256',
    typ: 'JWT',
  }));

  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({
    iss: credentials.client_email,
    scope: scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const signatureInput = `${header}.${payload}`;
  const signature = await signWithPrivateKey(signatureInput, credentials.private_key);
  
  return `${signatureInput}.${signature}`;
}

async function signWithPrivateKey(input: string, privateKey: string) {
  const encoder = new TextEncoder();
  const keyData = privateKey;
  
  const algorithm = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' },
  };

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    str2ab(keyData),
    algorithm,
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    algorithm,
    cryptoKey,
    encoder.encode(input)
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

async function analyzeFrameWithOpenAI(imageUrl: string, position: string) {
  console.log(`Analyzing frame at ${position} with OpenAI Vision...`);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert acting coach analyzing performance videos. Analyze this frame and provide specific feedback on: 1) Physical presence and body language 2) Facial expressions and emotional conveyance 3) Overall stage presence. Be specific and constructive."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${position} frame of the performance video, focusing on the actor's presence, expressions, and body language.`
            },
            {
              type: "image_url",
              image_url: imageUrl
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const result = await response.json();
  console.log(`Analysis received for ${position}:`, result);
  return result;
}

function aggregateAnalyses(googleCloudAnalysis: any, frameAnalyses: any[]) {
  console.log("Aggregating analyses from multiple sources...");
  
  const faceAnnotations = googleCloudAnalysis?.annotationResults?.[0]?.faceAnnotations || [];
  const personAnnotations = googleCloudAnalysis?.annotationResults?.[0]?.personDetectionAnnotations || [];
  const speechTranscriptions = googleCloudAnalysis?.annotationResults?.[0]?.speechTranscriptions || [];

  // Calculate base scores from Google Cloud data
  const presenceScore = calculatePresenceScore(personAnnotations);
  const emotionalScore = calculateEmotionalScore(faceAnnotations);
  const deliveryScore = calculateDeliveryScore(speechTranscriptions);

  // Combine with OpenAI frame analyses
  const openAIFeedback = frameAnalyses.map(analysis => analysis.choices[0].message.content);
  
  return {
    timestamp: new Date().toISOString(),
    overallScore: Math.round((presenceScore + emotionalScore + deliveryScore) / 3),
    categories: {
      delivery: {
        score: deliveryScore,
        feedback: generateDeliveryFeedback(speechTranscriptions, deliveryScore)
      },
      presence: {
        score: presenceScore,
        feedback: generatePresenceFeedback(personAnnotations, openAIFeedback, presenceScore)
      },
      emotionalRange: {
        score: emotionalScore,
        feedback: generateEmotionalFeedback(faceAnnotations, openAIFeedback, emotionalScore)
      }
    },
    recommendations: generateRecommendations(deliveryScore, presenceScore, emotionalScore, openAIFeedback)
  };
}

function calculatePresenceScore(personAnnotations: any[]): number {
  if (!personAnnotations.length) return 70;
  const avgConfidence = personAnnotations.reduce((sum, anno) => 
    sum + (anno.confidence || 0), 0) / personAnnotations.length;
  return Math.round(avgConfidence * 100);
}

function calculateEmotionalScore(faceAnnotations: any[]): number {
  if (!faceAnnotations.length) return 70;
  const emotionVariety = new Set(
    faceAnnotations.flatMap(face => 
      Object.entries(face.emotionLikelihood || {})
        .filter(([_, value]) => value === "LIKELY" || value === "VERY_LIKELY")
        .map(([emotion]) => emotion)
    )
  ).size;
  return Math.round((emotionVariety / 8) * 100);
}

function calculateDeliveryScore(speechTranscriptions: any[]): number {
  if (!speechTranscriptions.length) return 70;
  const confidenceScores = speechTranscriptions.flatMap(t => 
    t.alternatives?.[0]?.words?.map(w => w.confidence) || []
  );
  return confidenceScores.length 
    ? Math.round((confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) * 100)
    : 70;
}

function generateDeliveryFeedback(transcriptions: any[], score: number): string {
  const wordCount = transcriptions.reduce((acc, t) => 
    acc + (t.alternatives?.[0]?.words?.length || 0), 0);
  
  if (score > 80) {
    return `Excellent vocal clarity with ${wordCount} words clearly recognized. Speech is well-paced and easily understood.`;
  }
  if (score > 60) {
    return `Good vocal delivery with room for improvement. ${wordCount} words detected with varying clarity levels.`;
  }
  return `Focus on improving vocal clarity and projection. Only ${wordCount} words were clearly detected.`;
}

function generatePresenceFeedback(personAnnotations: any[], openAIFeedback: string[], score: number): string {
  const detectionCount = personAnnotations.length;
  const openAIInsights = openAIFeedback.join('\n\n');
  
  return `${score > 80 ? 'Strong' : score > 60 ? 'Good' : 'Developing'} stage presence with ${detectionCount} tracked movements.\n\nDetailed Analysis:\n${openAIInsights}`;
}

function generateEmotionalFeedback(faceAnnotations: any[], openAIFeedback: string[], score: number): string {
  const emotionChanges = faceAnnotations.length;
  const openAIInsights = openAIFeedback.join('\n\n');
  
  return `${score > 80 ? 'Excellent' : score > 60 ? 'Good' : 'Limited'} emotional range with ${emotionChanges} distinct expressions.\n\nDetailed Analysis:\n${openAIInsights}`;
}

function generateRecommendations(deliveryScore: number, presenceScore: number, emotionalScore: number, openAIFeedback: string[]): string[] {
  const recommendations = [];
  
  if (deliveryScore < 80) {
    recommendations.push("Practice vocal exercises focusing on clarity and projection");
  }
  if (presenceScore < 80) {
    recommendations.push("Work on maintaining consistent stage positioning and camera engagement");
  }
  if (emotionalScore < 80) {
    recommendations.push("Explore emotional range exercises to develop more varied expressions");
  }
  
  // Extract additional recommendations from OpenAI feedback
  const aiRecommendations = openAIFeedback
    .join(' ')
    .match(/should|could|recommend|try|practice|focus on|work on/gi);
    
  if (aiRecommendations && aiRecommendations.length > 0) {
    recommendations.push(...aiRecommendations.slice(0, 2));
  }
  
  if (recommendations.length === 0) {
    recommendations.push(
      "Continue developing your unique style while maintaining current strengths",
      "Consider experimenting with more challenging performance pieces",
      "Share your techniques with other performers"
    );
  }
  
  return recommendations.slice(0, 3);
}

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
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const body = await req.json();
    console.log("Received request body:", body);

    const { videoUrl } = body;
    
    if (!videoUrl) {
      throw new Error('No video URL provided');
    }

    console.log("Starting video analysis process...");

    // Get video analysis from Google Cloud
    const googleCloudAnalysis = await analyzeVideoWithGoogleCloud(videoUrl);
    console.log("Google Cloud analysis completed");

    // Extract frames and analyze with OpenAI Vision
    const framePositions = ['beginning', 'middle', 'end'];
    const frameAnalyses = await Promise.all(
      framePositions.map(position => analyzeFrameWithOpenAI(videoUrl, position))
    );
    console.log("OpenAI frame analyses completed");

    // Combine analyses
    const aggregatedAnalysis = aggregateAnalyses(googleCloudAnalysis, frameAnalyses);
    console.log("Analysis aggregated:", aggregatedAnalysis);

    return new Response(
      JSON.stringify(aggregatedAnalysis),
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