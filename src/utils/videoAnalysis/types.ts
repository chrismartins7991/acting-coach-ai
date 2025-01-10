export interface Category {
  score: number;
  feedback: string;
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
}

export interface AnalyzeVideoParams {
  videoUrl: string;
  title: string;
  userId: string;
}