export interface AnalysisResult {
  timestamp: string;
  overallScore: number;
  categories: {
    delivery: {
      score: number;
      feedback: string;
    };
    presence: {
      score: number;
      feedback: string;
    };
    emotionalRange: {
      score: number;
      feedback: string;
    };
  };
  recommendations: string[];
}

export interface FrameAnalysis {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}