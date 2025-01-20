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
}

export interface AnalyzeVideoParams {
  videoUrl: string;
  title: string;
  userId: string;
}

export interface Performance {
  id: string;
  title: string;
  video_url: string;
  ai_feedback: Analysis;
  voice_feedback?: VoiceAnalysis;
  created_at: string;
}