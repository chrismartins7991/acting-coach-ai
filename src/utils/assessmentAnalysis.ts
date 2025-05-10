
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
    good_improv: 80, // Renamed to avoid duplicate
    excellent_improv: 95, // Renamed to avoid duplicate
    
    // Emotion scores
    difficult: 35,
    somewhat_emotion: 60, // Renamed to avoid duplicate
    most: 80,
    all: 90,
    
    // Voice scores
    limited: 30,
    developing: 55,
    good_voice: 75, // Renamed to avoid duplicate
    excellent_voice: 90, // Renamed to avoid duplicate
    
    // Physical scores
    uncomfortable: 25,
    somewhat_physical: 50, // Renamed to avoid duplicate
    comfortable_physical: 75, // Renamed to avoid duplicate
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
  
  // Create mapping for options IDs that were renamed in scoreMap
  const optionMapping: Record<string, string> = {
    good: "good_improv", // Map original option ID to renamed score key
    excellent: "excellent_improv",
    somewhat: "somewhat_emotion",
    good: "good_voice", // This is actually a problem in the original quiz data - duplicate options
    excellent: "excellent_voice",
    somewhat: "somewhat_physical",
    comfortable: "comfortable_physical"
  };
  
  // Calculate scores for each area
  const scores: Record<string, number> = {};
  Object.entries(answers).forEach(([questionId, optionId]) => {
    // Check if we need to map this option to a renamed key
    const scoreKey = optionMapping[optionId] || optionId;
    scores[questionId] = scoreMap[scoreKey] || 50;
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
  
  // Add one more recommendation based on the overall score without type issues
  if (totalScore < 50) {
    recommendedFocus.push("Build a strong foundation with acting classes");
  } else if (totalScore < 75) {
    recommendedFocus.push("Continue regular practice and seek performance opportunities");
  } else {
    recommendedFocus.push("Challenge yourself with complex characters and advanced workshops");
  }
  
  return {
    total: totalScore,
    strengths,
    areasForGrowth,
    recommendedFocus
  };
};
