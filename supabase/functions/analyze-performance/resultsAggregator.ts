import { AnalysisResult, FrameAnalysis } from "./types.ts";

export function aggregateAnalyses(frameAnalyses: FrameAnalysis[]): AnalysisResult {
  console.log("Aggregating analyses from OpenAI...");
  
  const feedbackByCategory = {
    delivery: [] as number[],
    presence: [] as number[],
    emotionalRange: [] as number[]
  };
  
  frameAnalyses.forEach(analysis => {
    const content = analysis.choices[0].message.content;
    
    const presenceScore = Number(content.match(/presence.*?(\d+)/i)?.[1] || 70);
    const emotionalScore = Number(content.match(/emotional.*?(\d+)/i)?.[1] || 70);
    const deliveryScore = Number(content.match(/delivery.*?(\d+)/i)?.[1] || 70);
    
    feedbackByCategory.presence.push(presenceScore);
    feedbackByCategory.emotionalRange.push(emotionalScore);
    feedbackByCategory.delivery.push(deliveryScore);
  });
  
  const getAverageScore = (scores: number[]) => 
    Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  
  const presenceScore = getAverageScore(feedbackByCategory.presence);
  const emotionalScore = getAverageScore(feedbackByCategory.emotionalRange);
  const deliveryScore = getAverageScore(feedbackByCategory.delivery);
  
  const openAIFeedback = frameAnalyses.map(analysis => analysis.choices[0].message.content);
  
  return {
    timestamp: new Date().toISOString(),
    overallScore: Math.round((presenceScore + emotionalScore + deliveryScore) / 3),
    categories: {
      delivery: {
        score: deliveryScore,
        feedback: generateFeedback(openAIFeedback, 'delivery')
      },
      presence: {
        score: presenceScore,
        feedback: generateFeedback(openAIFeedback, 'presence')
      },
      emotionalRange: {
        score: emotionalScore,
        feedback: generateFeedback(openAIFeedback, 'emotional')
      }
    },
    recommendations: generateRecommendations(deliveryScore, presenceScore, emotionalScore, openAIFeedback)
  };
}

function generateFeedback(openAIFeedback: string[], category: string): string {
  const pattern = category === 'delivery' 
    ? /(?:delivery|voice|speech).*?([^.]+)/i
    : category === 'presence'
    ? /(?:presence|posture|movement).*?([^.]+)/i
    : /(?:emotional|expression|feeling).*?([^.]+)/i;

  return openAIFeedback
    .map(feedback => feedback.match(pattern)?.[1] || '')
    .filter(Boolean)
    .join('\n');
}

function generateRecommendations(
  deliveryScore: number,
  presenceScore: number,
  emotionalScore: number,
  openAIFeedback: string[]
): string[] {
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