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
    good_improv: 80, 
    excellent_improv: 95, 
    
    // Emotion scores
    difficult: 35,
    somewhat_emotion: 60, 
    most: 80,
    all: 90,
    
    // Voice scores
    limited: 30,
    developing: 55,
    good_voice: 75, 
    excellent_voice: 90, 
    
    // Physical scores
    uncomfortable: 25,
    somewhat_physical: 50, 
    comfortable_physical: 75, 
    very: 90,
    
    // New self-tape scores
    novice: 20,
    basic_selftape: 50,
    intermediate: 75,
    advanced: 95,
    
    // New audition scores
    nervous_audition: 25,
    learning: 50,
    confident: 80,
    very_confident: 95,
    
    // New practice method scores
    minimal: 30,
    some_methods: 55,
    regular: 75,
    comprehensive: 90
  };
  
  // Create skill mapping for display
  const skillMapping: Record<string, string> = {
    technique: "Acting Techniques",
    improvisation: "Improvisation",
    emotion: "Emotional Connection",
    voice: "Voice Projection",
    physical: "Physical Presence",
    selftape: "Self-Tape Creation",
    audition: "Audition Performance",
    practice: "Practice Methods"
  };
  
  // Fix: Create mapping for options IDs that were renamed in scoreMap
  // Remove duplicates by using different property names for each
  const optionMapping: Record<string, string> = {
    good: "good_improv", // For improvisation question
    excellent: "excellent_improv", // For improvisation question
    somewhat: "somewhat_emotion", // For emotion question
    // For voice question, using unique keys
    "voice_good": "good_voice", 
    "voice_excellent": "excellent_voice",
    // For physical question, using unique keys
    "physical_somewhat": "somewhat_physical",
    "physical_comfortable": "comfortable_physical"
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
  const recommendedFocus: string[] = areasForGrowth.map(area => {
    switch(area.id) {
      case "technique":
        return "Try our AI Reader feature to practice different acting techniques with script analysis";
      case "improvisation":
        return "Use the Cold Reading Practice tool to improve your spontaneity and thinking on your feet";
      case "emotion":
        return "Practice with our AI Coach for emotional connection exercises and personalized feedback";
      case "voice":
        return "Use our AI Reader tool to practice voice projection and modulation with guidance";
      case "physical":
        return "Record yourself in our Self-Tape Studio to analyze and improve your physical presence";
      case "selftape":
        return "Visit our Self-Tape Studio section to create professional-quality audition videos";
      case "audition":
        return "Practice audition techniques with our camera recording and playback features";
      case "practice":
        return "Explore our Line Memorization Tools to establish an effective practice routine";
      default:
        return "Explore our full range of acting practice tools to enhance your overall craft";
    }
  });
  
  // Add one more recommendation based on the overall score
  if (totalScore < 50) {
    recommendedFocus.push("Begin with our AI Reader and Cold Reading features to build your foundation");
  } else if (totalScore < 75) {
    recommendedFocus.push("Continue your progress by practicing regularly with our Rehearsal Room tools");
  } else {
    recommendedFocus.push("Take your skills to the next level with advanced Self-Tape Studio features");
  }
  
  return {
    total: totalScore,
    strengths,
    areasForGrowth,
    recommendedFocus
  };
};
