
import { AnalysisResult, CoachPreferences } from "./types.ts";
import { generateRecommendations, methodSpecificExercises } from "./methodologyUtils.ts";

export function aggregateResults(
  frameAnalyses: any[],
  preferences: CoachPreferences
): AnalysisResult {
  // Calculate weighted averages for each category
  const weights = [0.2, 0.15, 0.3, 0.15, 0.2]; // Weights for beginning, quarter, middle, three-quarter, end
  
  // Filter out any invalid analyses before calculating scores
  const validAnalyses = frameAnalyses.filter(analysis => 
    analysis && 
    typeof analysis.emotionalRange?.score === 'number' &&
    typeof analysis.physicalPresence?.score === 'number' &&
    typeof analysis.characterEmbodiment?.score === 'number'
  );

  if (validAnalyses.length === 0) {
    throw new Error('No valid frame analyses available');
  }

  const weightedScores = {
    emotionalRange: Math.round(
      validAnalyses.reduce((sum, a, i) => sum + (a.emotionalRange.score * weights[i]), 0)
    ),
    physicalPresence: Math.round(
      validAnalyses.reduce((sum, a, i) => sum + (a.physicalPresence.score * weights[i]), 0)
    ),
    characterEmbodiment: Math.round(
      validAnalyses.reduce((sum, a, i) => sum + (a.characterEmbodiment.score * weights[i]), 0)
    )
  };

  // Get the selected coach methodology
  const selectedCoach = preferences.selectedCoach.toLowerCase();

  // Format feedback with proper timestamps and filter out duplicates
  const combinedFeedback = {
    emotionalRange: validAnalyses.map((a, i) => ({
      timestamp: ['Start', 'Early', 'Middle', 'Later', 'End'][i],
      feedback: a.emotionalRange.feedback
    }))
    .filter((item, index, self) => 
      index === self.findIndex((t) => t.feedback === item.feedback)
    )
    .map(item => `${item.timestamp}: ${item.feedback}`)
    .join(' '),

    physicalPresence: validAnalyses.map((a, i) => ({
      timestamp: ['Start', 'Early', 'Middle', 'Later', 'End'][i],
      feedback: a.physicalPresence.feedback
    }))
    .filter((item, index, self) => 
      index === self.findIndex((t) => t.feedback === item.feedback)
    )
    .map(item => `${item.timestamp}: ${item.feedback}`)
    .join(' '),

    characterEmbodiment: validAnalyses.map((a, i) => ({
      timestamp: ['Start', 'Early', 'Middle', 'Later', 'End'][i],
      feedback: a.characterEmbodiment.feedback
    }))
    .filter((item, index, self) => 
      index === self.findIndex((t) => t.feedback === item.feedback)
    )
    .map(item => `${item.timestamp}: ${item.feedback}`)
    .join(' ')
  };

  const overallScore = Math.round(
    (weightedScores.emotionalRange + weightedScores.physicalPresence + weightedScores.characterEmbodiment) / 3
  );

  return {
    timestamp: new Date().toISOString(),
    overallScore,
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
          analysis: `Analysis based on ${preferences.selectedCoach}'s methodology, evaluating emotional expression (${weightedScores.emotionalRange}%), physical presence (${weightedScores.physicalPresence}%), and character embodiment (${weightedScores.characterEmbodiment}%).`,
          exercises: methodSpecificExercises[selectedCoach] || []
        }
      },
      synthesis: `Performance analyzed through ${preferences.selectedCoach}'s methodology. Overall score: ${overallScore}%. Strong areas: ${
        Object.entries(weightedScores)
          .sort(([, a], [, b]) => b - a)
          .map(([category, score]) => `${category} (${score}%)`)
          .join(', ')
      }.`,
      overallRecommendations: generateRecommendations(validAnalyses, selectedCoach)
    },
    recommendations: generateRecommendations(validAnalyses, selectedCoach)
  };
}
