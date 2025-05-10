
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
        return "Study different acting methodologies and practice their applications";
      case "improvisation":
        return "Regular improvisation exercises and spontaneity training";
      case "emotion":
        return "Emotional range expansion through sense memory and personal connection";
      case "voice":
        return "Voice control and projection exercises";
      case "physical":
        return "Movement and body awareness techniques";
      case "selftape":
        return "Improve self-tape skills with proper lighting, sound, and framing techniques";
      case "audition":
        return "Practice audition techniques and mental preparation strategies";
      case "practice":
        return "Establish a consistent practice routine with varied methods";
      default:
        return "Focus on developing your overall acting craft";
    }
  });
  
  // Add one more recommendation based on the overall score
  // Fix: Allow any string in recommendedFocus by removing type inference limitation
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
