
import { AnalysisResult, CoachPreferences } from "./types.ts";
import { generateRecommendations, methodSpecificExercises } from "./methodologyUtils.ts";

export function aggregateResults(
  frameAnalyses: any[],
  preferences: CoachPreferences
): AnalysisResult {
  // Calculate weighted averages for each category
  const weights = [0.2, 0.15, 0.3, 0.15, 0.2]; // Weights for beginning, quarter, middle, three-quarter, end
  
  const weightedScores = {
    emotionalRange: Math.round(
      frameAnalyses.reduce((sum, a, i) => sum + (a.emotionalRange.score * weights[i]), 0)
    ),
    physicalPresence: Math.round(
      frameAnalyses.reduce((sum, a, i) => sum + (a.physicalPresence.score * weights[i]), 0)
    ),
    characterEmbodiment: Math.round(
      frameAnalyses.reduce((sum, a, i) => sum + (a.characterEmbodiment.score * weights[i]), 0)
    )
  };

  // Get the selected coach methodology
  const selectedCoach = preferences.selectedCoach.toLowerCase();

  // Combine feedback from different frames with timestamps
  const combinedFeedback = {
    emotionalRange: frameAnalyses.map((a, i) => 
      `${['Start', 'Early', 'Middle', 'Later', 'End'][i]}: ${a.emotionalRange.feedback}`
    ).join(' '),
    physicalPresence: frameAnalyses.map((a, i) => 
      `${['Start', 'Early', 'Middle', 'Later', 'End'][i]}: ${a.physicalPresence.feedback}`
    ).join(' '),
    characterEmbodiment: frameAnalyses.map((a, i) => 
      `${['Start', 'Early', 'Middle', 'Later', 'End'][i]}: ${a.characterEmbodiment.feedback}`
    ).join(' ')
  };

  return {
    timestamp: new Date().toISOString(),
    overallScore: Math.round(
      (weightedScores.emotionalRange + weightedScores.physicalPresence + weightedScores.characterEmbodiment) / 3
    ),
    categories: {
      emotionalRange: {
        score: weightedScores.emotionalRange,
        feedback: combinedFeedback.emotionalRange
      },
      physicalPresence: {
        score: weightedScores.physicalPresence,
        feedback: combinedFeedback.physicalPresence
      },
      characterEmbodiment: {
        score: weightedScores.characterEmbodiment,
        feedback: combinedFeedback.characterEmbodiment
      }
    },
    methodologicalAnalysis: {
      methodologies: {
        [selectedCoach]: {
          analysis: `Detailed analysis based on ${preferences.selectedCoach}'s methodology, focusing on emotional expression, physical presence, and character embodiment throughout the performance.`,
          exercises: methodSpecificExercises[selectedCoach] || []
        }
      },
      synthesis: `Performance analyzed through ${preferences.selectedCoach}'s methodology, with particular attention to emotional range and physical presence across the entire performance duration.`,
      overallRecommendations: generateRecommendations(frameAnalyses, selectedCoach)
    },
    recommendations: generateRecommendations(frameAnalyses, selectedCoach)
  };
}
