export interface Category {
  score: number;
  feedback: string;
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
  overallScore: number;
  categories: {
    emotionalRange: Category;
    voiceAndDelivery: Category;
    physicalPresence: Category;
    characterEmbodiment: Category;
  };
  recommendations: string[];
  timestamp?: string;
  methodologicalAnalysis?: CombinedMethodologicalAnalysis;
}

export interface AnalyzeVideoParams {
  videoUrl: string;
  title: string;
  userId: string;
}