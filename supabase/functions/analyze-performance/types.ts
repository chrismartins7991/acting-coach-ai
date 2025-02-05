
export interface Category {
  score: number;
  feedback: string;
}

export interface AnalysisResult {
  timestamp: string;
  overallScore: number;
  categories: {
    emotionalRange: Category;
    physicalPresence: Category;
    characterEmbodiment: Category;
  };
  methodologicalAnalysis?: {
    methodologies: {
      [key: string]: {
        analysis: string;
        exercises: string[];
      }
    };
    synthesis: string;
    overallRecommendations: string[];
  };
  recommendations: string[];
}

export interface CoachPreferences {
  selectedCoach: string;
  focusAreas: {
    emotionInVoice: boolean;
    voiceExpressiveness: boolean;
    physicalPresence: boolean;
    faceExpressions: boolean;
    clearnessOfDiction: boolean;
  };
}

export interface AnalysisRequest {
  videoUrl: string;
  frames: string[];
  coachPreferences: CoachPreferences;
}
