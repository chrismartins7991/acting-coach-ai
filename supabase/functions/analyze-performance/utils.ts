export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const createSystemPrompt = () => `You are an expert acting coach analyzing a video performance. 
Provide feedback in EXACTLY this format:

Delivery Score: [number between 0-100]
Delivery Feedback: [brief feedback about vocal delivery]
Presence Score: [number between 0-100]
Presence Feedback: [brief feedback about stage presence]
Emotional Range Score: [number between 0-100]
Emotional Range Feedback: [brief feedback about emotional expression]
Recommendations:
1. [specific recommendation]
2. [specific recommendation]
3. [specific recommendation]`;

export const parseAnalysis = (analysisText: string) => {
  console.log("Parsing analysis text:", analysisText);
  
  const analysis = {
    timestamp: new Date().toISOString(),
    overallScore: 0,
    categories: {
      delivery: { score: 0, feedback: "" },
      presence: { score: 0, feedback: "" },
      emotionalRange: { score: 0, feedback: "" }
    },
    recommendations: []
  };

  // Extract scores
  const scorePattern = /(\w+)\s+Score:\s*(\d+)/g;
  let totalScore = 0;
  let scoreCount = 0;
  let scoreMatch;
  
  while ((scoreMatch = scorePattern.exec(analysisText)) !== null) {
    const category = scoreMatch[1].toLowerCase();
    const score = Math.min(100, Math.max(0, parseInt(scoreMatch[2])));
    
    if (category === 'delivery' || category === 'presence' || category === 'emotional' || category === 'emotionalrange') {
      const key = category === 'emotional' || category === 'emotionalrange' ? 'emotionalRange' : category;
      if (analysis.categories[key]) {
        analysis.categories[key].score = score;
        totalScore += score;
        scoreCount++;
      }
    }
  }

  // Extract feedback
  const feedbackPattern = /(\w+)\s+Feedback:\s*([^\n]+)/g;
  let feedbackMatch;
  while ((feedbackMatch = feedbackPattern.exec(analysisText)) !== null) {
    const category = feedbackMatch[1].toLowerCase();
    const feedback = feedbackMatch[2].trim();
    
    if (category === 'delivery' || category === 'presence' || category === 'emotional' || category === 'emotionalrange') {
      const key = category === 'emotional' || category === 'emotionalrange' ? 'emotionalRange' : category;
      if (analysis.categories[key]) {
        analysis.categories[key].feedback = feedback;
      }
    }
  }

  // Calculate overall score
  analysis.overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

  // Extract recommendations
  const recommendationsMatch = analysisText.match(/Recommendations:\s*((?:(?:\d+\.|\-)\s*[^\n]+\s*)+)/i);
  if (recommendationsMatch) {
    const recommendations = recommendationsMatch[1]
      .split(/(?:\d+\.|\-)\s*/)
      .filter(text => text.trim())
      .map(text => text.trim());
    
    if (recommendations.length > 0) {
      analysis.recommendations = recommendations.slice(0, 3);
    }
  }

  // Add default recommendations if none were extracted
  if (analysis.recommendations.length === 0) {
    analysis.recommendations = [
      "Practice vocal exercises regularly",
      "Work on stage presence",
      "Explore emotional range through exercises"
    ];
  }

  return analysis;
};