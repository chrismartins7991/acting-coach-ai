export interface Category {
  score: number;
  feedback: string;
}

export interface TimelineObservation {
  timestamp: string;
  emotionalRange: {
    score: number;
    feedback: string;
    observations: string[];
    technicalNotes: string[];
  };
  physicalPresence: {
    score: number;
    feedback: string;
    keyMoments: string[];
    technicalNotes: string[];
  };
  characterEmbodiment: {
    score: number;
    feedback: string;
    evidence: string[];
    technicalNotes: string[];
  };
}

export interface VoiceAnalysis {
  overallScore: number;
  categories: {
    voiceClarity: Category;
    emotionalExpression: Category;
    paceAndTiming: Category;
    volumeControl: Category;
  };
  recommendations: string[];
}

export interface MethodologyAnalysis {
  analysis: string;
  recommendations: string[];
}

export interface CombinedMethodologicalAnalysis {
  methodologies: {
    strasberg: MethodologyAnalysis;
    chekhov: MethodologyAnalysis;
    stanislavski: MethodologyAnalysis;
    brecht: MethodologyAnalysis;
    meisner: MethodologyAnalysis;
  };
  synthesis: string;
  overallRecommendations: string[];
}

export interface Analysis {
  timestamp: string;
  overallScore: number;
  categories: {
    emotionalRange: Category;
    physicalPresence: Category;
    characterEmbodiment: Category;
  };
  recommendations: string[];
  methodologicalAnalysis?: CombinedMethodologicalAnalysis;
  timelineAnalysis?: TimelineObservation[];
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
  timelineAnalysis?: any[];
  recommendations: string[];
}

export interface AnalyzeVideoParams {
  videoUrl: string;
  title: string;
  userId: string;
}
