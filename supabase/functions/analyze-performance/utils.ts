export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    recommendations: [] as string[]
  };

  // Extract scores and feedback
  const categories = ['Delivery', 'Presence', 'Emotional Range'];
  let totalScore = 0;
  let scoreCount = 0;

  categories.forEach(category => {
    const scoreRegex = new RegExp(`${category}\\s+Score:\\s*(\\d+)`, 'i');
    const feedbackRegex = new RegExp(`${category}\\s+Feedback:\\s*([^\\n]+)`, 'i');
    
    const scoreMatch = analysisText.match(scoreRegex);
    const feedbackMatch = analysisText.match(feedbackRegex);
    
    const key = category.replace(/\s+/g, '').toLowerCase() as keyof typeof analysis.categories;
    if (scoreMatch) {
      const score = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
      analysis.categories[key].score = score;
      totalScore += score;
      scoreCount++;
    }
    
    if (feedbackMatch) {
      analysis.categories[key].feedback = feedbackMatch[1].trim();
    }
  });

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
      "Focus on vocal exercises to improve delivery",
      "Practice stage presence through movement exercises",
      "Work on emotional range through character study"
    ];
  }

  return analysis;
};