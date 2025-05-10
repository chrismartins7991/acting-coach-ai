
interface AnalysisResult {
  total: number;
  strengths: { name: string; score: number }[];
  areasForGrowth: { name: string; score: number }[];
  recommendedFocus: string[];
}

export const analyzeAssessmentAnswers = (answers: Record<string, string>): AnalysisResult => {
  // Map option IDs to numerical scores (0-100)
  const scoreMap: Record<string, number> = {
    // Technique scores
    beginner: 25,
    familiar: 50,
    comfortable: 75,
    expert: 95,
    
    // Improvisation scores
    nervous: 30,
    basic: 55,
    good: 80,
    excellent: 95,
    
    // Emotion scores
    difficult: 35,
    somewhat: 60,
    most: 80,
    all: 90,
    
    // Voice scores
    limited: 30,
    developing: 55,
    good: 75,
    excellent: 90,
    
    // Physical scores
    uncomfortable: 25,
    somewhat: 50,
    comfortable: 75,
    very: 90
  };
  
  // Create skill mapping for display
  const skillMapping: Record<string, string> = {
    technique: "Acting Techniques",
    improvisation: "Improvisation",
    emotion: "Emotional Connection",
    voice: "Voice Projection",
    physical: "Physical Presence"
  };
  
  // Calculate scores for each area
  const scores: Record<string, number> = {};
  Object.entries(answers).forEach(([questionId, optionId]) => {
    scores[questionId] = scoreMap[optionId] || 50;
  });
  
  // Calculate total score
  const scoreValues = Object.values(scores);
  const totalScore = Math.round(
    scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length
  );
  
  // Sort skills by score to identify strengths and weaknesses
  const sortedSkills = Object.entries(scores)
    .map(([skill, score]) => ({ 
      id: skill,
      name: skillMapping[skill] || skill, 
      score 
    }))
    .sort((a, b) => b.score - a.score);
  
  // Get top 2 strengths and weaknesses
  const strengths = sortedSkills.slice(0, 2);
  const areasForGrowth = [...sortedSkills].sort((a, b) => a.score - b.score).slice(0, 2);
  
  // Generate recommendations based on areas for growth
  const recommendedFocus = areasForGrowth.map(area => {
    switch(area.id) {
      case "technique":
        return "Study different acting methodologies and practice their applications";
      case "improvisation":
        return "Regular improvisation exercises and spontaneity training";
      case "emotion":
        return "Emotional range expansion through sense memory and personal connection";
      case "voice":
        return "Voice control and projection exercises";
      case "physical":
        return "Movement and body awareness techniques";
      default:
        return "Focus on developing your overall acting craft";
    }
  });
  
  // Add one more recommendation based on the overall score
  if (totalScore < 50) {
    recommendedFocus.push("Build a strong foundation with acting classes and basic technique practice");
  } else if (totalScore < 75) {
    recommendedFocus.push("Continue regular practice and seek performance opportunities to apply your skills");
  } else {
    recommendedFocus.push("Challenge yourself with complex characters and advanced acting workshops");
  }
  
  return {
    total: totalScore,
    strengths,
    areasForGrowth,
    recommendedFocus
  };
};
