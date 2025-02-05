
export const methodSpecificExercises = {
  strasberg: [
    "Sensory Memory Exercise: Recall a specific emotional memory",
    "Animal Exercise: Embody an animal's movements",
    "Private Moment Exercise: Practice being uninhibited"
  ],
  stanislavski: [
    "Given Circumstances: Write detailed backstory",
    "Magic If Exercise: Explore character motivation",
    "Physical Action Exercise: Break down scene actions"
  ],
  meisner: [
    "Repetition Exercise: Practice with a partner",
    "Independent Activity: Perform while delivering lines",
    "Emotional Preparation: Use personal experiences"
  ],
  chekhov: [
    "Psychological Gesture: Create character's core gesture",
    "Atmosphere Exercise: Work with imaginary atmospheres",
    "Imaginary Body Exercise: Transform physicality"
  ],
  brecht: [
    "Gestus Exercise: Develop social gestures",
    "Alienation Exercise: Step out of character",
    "Contradiction Exercise: Show opposing elements"
  ]
};

export function generateRecommendations(
  frameAnalyses: any[],
  selectedCoach: string
): string[] {
  const baseRecommendations = [];
  
  const avgScores = {
    emotionalRange: Math.round(frameAnalyses.reduce((sum, a) => sum + a.emotionalRange.score, 0) / frameAnalyses.length),
    physicalPresence: Math.round(frameAnalyses.reduce((sum, a) => sum + a.physicalPresence.score, 0) / frameAnalyses.length),
    characterEmbodiment: Math.round(frameAnalyses.reduce((sum, a) => sum + a.characterEmbodiment.score, 0) / frameAnalyses.length)
  };

  if (avgScores.emotionalRange < 80) {
    baseRecommendations.push("Focus on developing emotional depth and authenticity");
  }
  if (avgScores.physicalPresence < 80) {
    baseRecommendations.push("Work on physical presence and spatial awareness");
  }
  if (avgScores.characterEmbodiment < 80) {
    baseRecommendations.push("Deepen character work through detailed analysis");
  }

  const methodExercises = methodSpecificExercises[selectedCoach.toLowerCase() as keyof typeof methodSpecificExercises] || [];
  
  return [...baseRecommendations, ...methodExercises].slice(0, 3);
}
