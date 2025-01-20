export interface Category {
  score: number;
  feedback: string;
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