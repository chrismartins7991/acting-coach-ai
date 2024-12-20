import { AnalysisResult } from "./types.ts";

export const parseAnalysis = (googleCloudResponse: any): AnalysisResult => {
  console.log("Parsing Google Cloud analysis response");

  try {
    // Extract relevant data from Google Cloud response
    const faceAnnotations = googleCloudResponse?.annotationResults?.[0]?.faceAnnotations || [];
    const personAnnotations = googleCloudResponse?.annotationResults?.[0]?.personDetectionAnnotations || [];
    const speechTranscriptions = googleCloudResponse?.annotationResults?.[0]?.speechTranscriptions || [];

    // Calculate scores based on Google Cloud data
    const deliveryScore = calculateDeliveryScore(speechTranscriptions);
    const presenceScore = calculatePresenceScore(faceAnnotations, personAnnotations);
    const emotionalScore = calculateEmotionalScore(faceAnnotations);

    return {
      timestamp: new Date().toISOString(),
      overallScore: Math.round((deliveryScore + presenceScore + emotionalScore) / 3),
      categories: {
        delivery: {
          score: deliveryScore,
          feedback: generateDeliveryFeedback(deliveryScore, speechTranscriptions)
        },
        presence: {
          score: presenceScore,
          feedback: generatePresenceFeedback(presenceScore, personAnnotations)
        },
        emotionalRange: {
          score: emotionalScore,
          feedback: generateEmotionalFeedback(emotionalScore, faceAnnotations)
        }
      },
      recommendations: generateRecommendations(deliveryScore, presenceScore, emotionalScore)
    };
  } catch (error) {
    console.error("Error parsing Google Cloud response:", error);
    throw new Error(`Failed to parse analysis: ${error.message}`);
  }
};

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
  const faceConfidence = faceAnnotations.reduce((acc, face) => 
    acc + (face.detectionConfidence || 0), 0) / (faceAnnotations.length || 1);
  
  const personConfidence = personAnnotations.reduce((acc, person) => 
    acc + (person.confidence || 0), 0) / (personAnnotations.length || 1);
  
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

function generateDeliveryFeedback(score: number, transcriptions: any[]): string {
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

function generatePresenceFeedback(score: number, personAnnotations: any[]): string {
  const detectionCount = personAnnotations.length;
  
  if (score > 80) {
    return `Strong stage presence maintained throughout ${detectionCount} tracked segments with excellent positioning.`;
  }
  if (score > 60) {
    return `Good stage presence with ${detectionCount} tracked movements. Work on maintaining consistent positioning.`;
  }
  return `Presence needs improvement. Only ${detectionCount} clear positioning moments detected.`;
}

function generateEmotionalFeedback(score: number, faceAnnotations: any[]): string {
  const emotionChanges = faceAnnotations.length;
  
  if (score > 80) {
    return `Excellent emotional range with ${emotionChanges} distinct emotional expressions detected.`;
  }
  if (score > 60) {
    return `Good emotional expression with ${emotionChanges} emotional changes. Work on transitions.`;
  }
  return `Limited emotional range detected. Only ${emotionChanges} clear emotional expressions found.`;
}

function generateRecommendations(deliveryScore: number, presenceScore: number, emotionalScore: number): string[] {
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
  
  if (recommendations.length === 0) {
    recommendations.push(
      "Continue developing your unique style while maintaining current strengths",
      "Consider experimenting with more challenging performance pieces",
      "Share your techniques with other performers"
    );
  }
  
  return recommendations.slice(0, 3); // Return top 3 recommendations
}