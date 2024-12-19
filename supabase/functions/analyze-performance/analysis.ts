import { AnalysisResult } from "./types.ts";

export function processVideoAnalysis(googleCloudResponse: any): AnalysisResult {
  console.log("Processing video analysis results");

  // Extract relevant data from Google Cloud response
  const faceAnnotations = googleCloudResponse?.annotationResults?.[0]?.faceAnnotations || [];
  const personAnnotations = googleCloudResponse?.annotationResults?.[0]?.personDetectionAnnotations || [];
  const speechTranscriptions = googleCloudResponse?.annotationResults?.[0]?.speechTranscriptions || [];

  // Calculate scores
  const deliveryScore = calculateDeliveryScore(speechTranscriptions);
  const presenceScore = calculatePresenceScore(faceAnnotations, personAnnotations);
  const emotionalScore = calculateEmotionalScore(faceAnnotations);

  return {
    timestamp: new Date().toISOString(),
    overallScore: Math.round((deliveryScore + presenceScore + emotionalScore) / 3),
    categories: {
      delivery: {
        score: deliveryScore,
        feedback: generateDeliveryFeedback(deliveryScore)
      },
      presence: {
        score: presenceScore,
        feedback: generatePresenceFeedback(presenceScore)
      },
      emotionalRange: {
        score: emotionalScore,
        feedback: generateEmotionalFeedback(emotionalScore)
      }
    },
    recommendations: generateRecommendations(deliveryScore, presenceScore, emotionalScore)
  };
}

function calculateDeliveryScore(speechTranscriptions: any[]): number {
  if (!speechTranscriptions.length) return 0;
  const confidenceScores = speechTranscriptions.flatMap(t => 
    t.alternatives?.[0]?.words?.map(w => w.confidence) || []
  );
  const avgConfidence = confidenceScores.length 
    ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length 
    : 0;
  return Math.round(avgConfidence * 100);
}

function calculatePresenceScore(faceAnnotations: any[], personAnnotations: any[]): number {
  const faceConfidence = faceAnnotations.reduce((acc, face) => acc + (face.detectionConfidence || 0), 0) / (faceAnnotations.length || 1);
  const personConfidence = personAnnotations.reduce((acc, person) => acc + (person.confidence || 0), 0) / (personAnnotations.length || 1);
  return Math.round(((faceConfidence + personConfidence) / 2) * 100);
}

function calculateEmotionalScore(faceAnnotations: any[]): number {
  if (!faceAnnotations.length) return 0;
  const emotionVariety = new Set(
    faceAnnotations.flatMap(face => 
      Object.entries(face.emotionLikelihood || {})
        .filter(([_, value]) => value === "LIKELY" || value === "VERY_LIKELY")
        .map(([emotion]) => emotion)
    )
  ).size;
  return Math.round((emotionVariety / 8) * 100); // 8 is max number of different emotions
}

function generateDeliveryFeedback(score: number): string {
  if (score > 80) return "Excellent vocal clarity and projection. Speech is well-paced and easily understood.";
  if (score > 60) return "Good vocal delivery with room for improvement in clarity and projection.";
  return "Focus on improving vocal clarity and projection. Consider working with a voice coach.";
}

function generatePresenceFeedback(score: number): string {
  if (score > 80) return "Strong stage presence with excellent positioning and consistent engagement.";
  if (score > 60) return "Good stage presence. Work on maintaining consistent positioning and engagement.";
  return "Focus on improving stage presence and camera engagement. Practice maintaining eye contact.";
}

function generateEmotionalFeedback(score: number): string {
  if (score > 80) return "Excellent emotional range and authenticity in expressions.";
  if (score > 60) return "Good emotional expression. Work on expanding range and smoothing transitions.";
  return "Focus on developing broader emotional range and more natural transitions between emotions.";
}

function generateRecommendations(deliveryScore: number, presenceScore: number, emotionalScore: number): string[] {
  const recommendations = [];
  if (deliveryScore < 80) recommendations.push("Practice vocal exercises to improve clarity and projection");
  if (presenceScore < 80) recommendations.push("Work on maintaining consistent eye contact and stage positioning");
  if (emotionalScore < 80) recommendations.push("Explore emotional range exercises to develop more varied expressions");
  return recommendations.length ? recommendations : ["Continue developing your unique style while maintaining current strengths"];
}