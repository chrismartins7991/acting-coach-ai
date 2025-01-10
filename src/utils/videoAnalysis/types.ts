export interface Category {
  score: number;
  feedback: string;
}

export interface AudioCharacteristics {
  confidence: number;
  emotion: string;
  emotionConfidence: number;
  speakingRate: number;
  pitch: {
    variations: Array<{
      time?: number;
      value?: number;
    }>;
    average: number;
  };
  volumeVariation: Array<{
    time?: number;
    value?: number;
  }>;
}

export interface Analysis {
  overallScore: number;
  categories: {
    delivery: Category;
    presence: Category;
    emotionalRange: Category;
  };
  recommendations: string[];
  timestamp: string;
  audio?: {
    transcript: string;
    characteristics: AudioCharacteristics;
    analysis: string;
  };
}

export interface AnalyzeVideoParams {
  videoUrl: string;
  title: string;
  userId: string;
}