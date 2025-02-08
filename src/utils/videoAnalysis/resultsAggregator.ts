import { AnalysisResult, CoachPreferences } from "./types";
import { generateRecommendations, methodSpecificExercises } from "./methodologyUtils";

export function aggregateResults(
  frameAnalyses: any[],
  preferences: CoachPreferences
): AnalysisResult {
  console.log("Starting enhanced results aggregation with temporal context");
  
  // Enhanced weighting system for temporal progression
  const weights = [0.2, 0.15, 0.3, 0.15, 0.2]; // beginning, quarter, middle, three-quarter, end
  const timeLabels = ['beginning', 'early', 'middle', 'later', 'end'];
  
  // Filter and validate analyses
  const validAnalyses = frameAnalyses.filter(analysis => 
    analysis && 
    typeof analysis.emotionalRange?.score === 'number' &&
    typeof analysis.physicalPresence?.score === 'number' &&
    typeof analysis.characterEmbodiment?.score === 'number'
  );

  if (validAnalyses.length === 0) {
    throw new Error('No valid frame analyses available');
  }

  // Calculate weighted scores with temporal context
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

  // Enhanced temporal feedback compilation
  const timelineAnalysis = validAnalyses.map((analysis, index) => ({
    timestamp: timeLabels[index],
    emotionalRange: {
      score: analysis.emotionalRange.score,
      feedback: analysis.emotionalRange.feedback,
      observations: analysis.emotionalRange.observations || [],
      technicalNotes: analysis.emotionalRange.technicalNotes || []
    },
    physicalPresence: {
      score: analysis.physicalPresence.score,
      feedback: analysis.physicalPresence.feedback,
      keyMoments: analysis.physicalPresence.keyMoments || [],
      technicalNotes: analysis.physicalPresence.technicalNotes || []
    },
    characterEmbodiment: {
      score: analysis.characterEmbodiment.score,
      feedback: analysis.characterEmbodiment.feedback,
      evidence: analysis.characterEmbodiment.evidence || [],
      technicalNotes: analysis.characterEmbodiment.technicalNotes || []
    }
  }));

  // Get selected coach methodology
  const selectedCoach = preferences.selectedCoach.toLowerCase();

  // Format detailed feedback with proper timestamps
  const detailedFeedback = {
    emotionalRange: timelineAnalysis.map(t => ({
      timestamp: t.timestamp,
      feedback: t.emotionalRange.feedback,
      observations: t.emotionalRange.observations,
      technicalNotes: t.emotionalRange.technicalNotes
    })),
    physicalPresence: timelineAnalysis.map(t => ({
      timestamp: t.timestamp,
      feedback: t.physicalPresence.feedback,
      keyMoments: t.physicalPresence.keyMoments,
      technicalNotes: t.physicalPresence.technicalNotes
    })),
    characterEmbodiment: timelineAnalysis.map(t => ({
      timestamp: t.timestamp,
      feedback: t.characterEmbodiment.feedback,
      evidence: t.characterEmbodiment.evidence,
      technicalNotes: t.characterEmbodiment.technicalNotes
    }))
  };

  const overallScore = Math.round(
    (weightedScores.emotionalRange + weightedScores.physicalPresence + weightedScores.characterEmbodiment) / 3
  );

  // Combine feedback with observations for more context
  const combineTimelineFeedback = (feedbackArray: any[], type: string) => {
    return feedbackArray.map((t, i) => {
      const observations = type === 'emotionalRange' ? t.observations[0] :
                         type === 'physicalPresence' ? t.keyMoments[0] :
                         t.evidence[0];
      return `${t.timestamp.toUpperCase()}: ${t.feedback} ${observations ? `(Example: ${observations})` : ''}`;
    }).join(' ');
  };

  // Generate comprehensive performance analysis
  return {
    timestamp: new Date().toISOString(),
    overallScore,
    categories: {
      emotionalRange: {
        score: weightedScores.emotionalRange,
        feedback: combineTimelineFeedback(detailedFeedback.emotionalRange, 'emotionalRange')
      },
      physicalPresence: {
        score: weightedScores.physicalPresence,
        feedback: combineTimelineFeedback(detailedFeedback.physicalPresence, 'physicalPresence')
      },
      characterEmbodiment: {
        score: weightedScores.characterEmbodiment,
        feedback: combineTimelineFeedback(detailedFeedback.characterEmbodiment, 'characterEmbodiment')
      }
    },
    methodologicalAnalysis: {
      methodologies: {
        [selectedCoach]: {
          analysis: `Detailed ${preferences.selectedCoach} methodology analysis:
            Emotional Range (${weightedScores.emotionalRange}%): Progressive development through performance.
            Physical Presence (${weightedScores.physicalPresence}%): Spatial awareness and body language evolution.
            Character Embodiment (${weightedScores.characterEmbodiment}%): Character development arc.`,
          exercises: methodSpecificExercises[selectedCoach] || []
        }
      },
      synthesis: `Performance analyzed through ${preferences.selectedCoach}'s methodology shows ${
        overallScore >= 80 ? 'strong' : overallScore >= 60 ? 'developing' : 'emerging'
      } command of technique. Overall score: ${overallScore}%. Key strengths: ${
        Object.entries(weightedScores)
          .sort(([, a], [, b]) => b - a)
          .map(([category, score]) => `${category} (${score}%)`)
          .join(', ')
      }.`,
      overallRecommendations: generateRecommendations(validAnalyses, selectedCoach)
    },
    timelineAnalysis,
    recommendations: generateRecommendations(validAnalyses, selectedCoach)
  };
}
