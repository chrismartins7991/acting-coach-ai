
import { AnalysisResult, CoachPreferences } from "./types.ts";
import { generateRecommendations, methodSpecificExercises } from "./methodologyUtils.ts";

export function aggregateResults(
  frameAnalyses: any[],
  preferences: CoachPreferences
): AnalysisResult {
  const avgScores = {
    emotionalRange: Math.round(frameAnalyses.reduce((sum, a) => sum + a.emotionalRange.score, 0) / frameAnalyses.length),
    physicalPresence: Math.round(frameAnalyses.reduce((sum, a) => sum + a.physicalPresence.score, 0) / frameAnalyses.length),
    characterEmbodiment: Math.round(frameAnalyses.reduce((sum, a) => sum + a.characterEmbodiment.score, 0) / frameAnalyses.length)
  };

  const selectedCoach = preferences.selectedCoach.toLowerCase();

  return {
    timestamp: new Date().toISOString(),
    overallScore: Math.round(
      (avgScores.emotionalRange + avgScores.physicalPresence + avgScores.characterEmbodiment) / 3
    ),
    categories: {
      emotionalRange: {
        score: avgScores.emotionalRange,
        feedback: frameAnalyses[1]?.emotionalRange.feedback || "No feedback available."
      },
      physicalPresence: {
        score: avgScores.physicalPresence,
        feedback: frameAnalyses[1]?.physicalPresence.feedback || "No feedback available."
      },
      characterEmbodiment: {
        score: avgScores.characterEmbodiment,
        feedback: frameAnalyses[1]?.characterEmbodiment.feedback || "No feedback available."
      }
    },
    methodologicalAnalysis: {
      methodologies: {
        [selectedCoach]: {
          analysis: `Analysis based on ${preferences.selectedCoach}'s methodology, focusing on emotional expression, physical presence, and character embodiment.`,
          exercises: methodSpecificExercises[selectedCoach] || []
        }
      },
      synthesis: `Performance analyzed through ${preferences.selectedCoach}'s methodology, with particular attention to emotional range and physical presence.`,
      overallRecommendations: generateRecommendations(frameAnalyses, selectedCoach)
    },
    recommendations: generateRecommendations(frameAnalyses, selectedCoach)
  };
}
