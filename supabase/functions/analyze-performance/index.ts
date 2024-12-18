import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { VideoIntelligenceServiceClient } from "https://esm.sh/@google-cloud/video-intelligence";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLOUD_CREDENTIALS = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl } = await req.json();
    console.log("Received video URL:", videoUrl);

    if (!GOOGLE_CLOUD_CREDENTIALS) {
      throw new Error('Google Cloud credentials are not configured');
    }

    if (!videoUrl) {
      throw new Error('No video URL provided');
    }

    // Initialize the client
    const credentials = JSON.parse(GOOGLE_CLOUD_CREDENTIALS);
    const client = new VideoIntelligenceServiceClient({ credentials });

    console.log("Starting video analysis...");

    // Configure the request
    const request = {
      inputUri: videoUrl,
      features: [
        'FACE_DETECTION',
        'PERSON_DETECTION',
        'SPEECH_TRANSCRIPTION',
        'TEXT_DETECTION'
      ],
      videoContext: {
        speechTranscriptionConfig: {
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
        },
      },
    };

    // Start the analysis
    const [operation] = await client.annotateVideo(request);
    console.log("Analysis operation started:", operation.name);

    // Wait for the analysis to complete
    const [response] = await operation.promise();
    console.log("Analysis completed");

    // Process the results
    const analysis = processVideoAnalysis(response);
    console.log("Processed analysis:", analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-performance function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function processVideoAnalysis(response: any) {
  const faceAnnotations = response.annotationResults[0]?.faceAnnotations || [];
  const personAnnotations = response.annotationResults[0]?.personDetectionAnnotations || [];
  const speechTranscription = response.annotationResults[0]?.speechTranscriptions || [];
  
  // Calculate delivery score based on speech clarity and pacing
  const deliveryScore = calculateDeliveryScore(speechTranscription);
  
  // Calculate presence score based on face and person detection
  const presenceScore = calculatePresenceScore(faceAnnotations, personAnnotations);
  
  // Calculate emotional range score based on face detection
  const emotionalScore = calculateEmotionalScore(faceAnnotations);

  return {
    overallScore: Math.round((deliveryScore + presenceScore + emotionalScore) / 3),
    categories: {
      delivery: {
        score: deliveryScore,
        feedback: generateDeliveryFeedback(speechTranscription)
      },
      presence: {
        score: presenceScore,
        feedback: generatePresenceFeedback(faceAnnotations, personAnnotations)
      },
      emotionalRange: {
        score: emotionalScore,
        feedback: generateEmotionalFeedback(faceAnnotations)
      }
    },
    recommendations: generateRecommendations(deliveryScore, presenceScore, emotionalScore),
    timestamp: new Date().toISOString()
  };
}

function calculateDeliveryScore(speechTranscriptions: any[]): number {
  if (!speechTranscriptions.length) return 0;
  
  // Analyze speech confidence and clarity
  const confidenceScores = speechTranscriptions.flatMap(t => 
    t.alternatives[0]?.words?.map(w => w.confidence) || []
  );
  
  const avgConfidence = confidenceScores.length 
    ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length 
    : 0;
    
  return Math.round(avgConfidence * 100);
}

function calculatePresenceScore(faceAnnotations: any[], personAnnotations: any[]): number {
  if (!faceAnnotations.length && !personAnnotations.length) return 0;
  
  // Calculate score based on consistent face detection and good positioning
  const facePresenceScore = faceAnnotations.length 
    ? faceAnnotations.reduce((acc, face) => acc + (face.detectionConfidence || 0), 0) / faceAnnotations.length 
    : 0;
    
  const personPresenceScore = personAnnotations.length 
    ? personAnnotations.reduce((acc, person) => acc + (person.trackConfidence || 0), 0) / personAnnotations.length 
    : 0;
    
  return Math.round(((facePresenceScore + personPresenceScore) / 2) * 100);
}

function calculateEmotionalScore(faceAnnotations: any[]): number {
  if (!faceAnnotations.length) return 0;
  
  // Analyze emotional variation and intensity
  const emotionVariety = new Set(
    faceAnnotations.flatMap(face => 
      Object.entries(face.emotionAttributes || {})
        .filter(([_, value]) => (value as number) > 0.5)
        .map(([emotion]) => emotion)
    )
  ).size;
  
  const maxEmotionScore = 8; // Maximum number of different emotions we expect
  return Math.round((emotionVariety / maxEmotionScore) * 100);
}

function generateDeliveryFeedback(speechTranscriptions: any[]): string {
  if (!speechTranscriptions.length) {
    return "No speech detected. Consider adding more vocal elements to your performance.";
  }
  
  const confidence = calculateDeliveryScore(speechTranscriptions);
  if (confidence > 80) {
    return "Excellent vocal clarity and projection. Speech is well-paced and easily understood.";
  } else if (confidence > 60) {
    return "Good vocal delivery with room for improvement in clarity and projection.";
  } else {
    return "Focus on improving vocal clarity and projection. Consider working with a voice coach.";
  }
}

function generatePresenceFeedback(faceAnnotations: any[], personAnnotations: any[]): string {
  const presenceScore = calculatePresenceScore(faceAnnotations, personAnnotations);
  
  if (presenceScore > 80) {
    return "Strong stage presence with excellent positioning and consistent engagement.";
  } else if (presenceScore > 60) {
    return "Good stage presence. Work on maintaining consistent positioning and engagement.";
  } else {
    return "Focus on improving stage presence and camera engagement. Practice maintaining eye contact.";
  }
}

function generateEmotionalFeedback(faceAnnotations: any[]): string {
  const emotionalScore = calculateEmotionalScore(faceAnnotations);
  
  if (emotionalScore > 80) {
    return "Excellent emotional range and authenticity in expressions. Great control over emotional transitions.";
  } else if (emotionalScore > 60) {
    return "Good emotional expression. Work on expanding range and smoothing transitions between emotions.";
  } else {
    return "Focus on developing broader emotional range and more natural transitions between emotions.";
  }
}

function generateRecommendations(deliveryScore: number, presenceScore: number, emotionalScore: number): string[] {
  const recommendations = [];
  
  if (deliveryScore < 80) {
    recommendations.push("Practice vocal exercises to improve clarity and projection");
  }
  if (presenceScore < 80) {
    recommendations.push("Work on maintaining consistent eye contact and stage positioning");
  }
  if (emotionalScore < 80) {
    recommendations.push("Explore emotional range exercises to develop more varied expressions");
  }
  
  // Always provide at least one recommendation
  if (recommendations.length === 0) {
    recommendations.push("Continue developing your unique style while maintaining current strengths");
  }
  
  return recommendations.slice(0, 3); // Return top 3 recommendations
}