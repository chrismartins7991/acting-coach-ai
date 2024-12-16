import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Category {
  score: number;
  feedback: string;
}

interface Analysis {
  overallScore: number;
  categories: {
    delivery: Category;
    presence: Category;
    emotionalRange: Category;
  };
  recommendations: string[];
  timestamp: string;
}

interface PerformanceAnalysisProps {
  analysis: Analysis;
}

export const PerformanceAnalysis = ({ analysis }: PerformanceAnalysisProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance Score</CardTitle>
          <CardDescription>Based on multiple factors including delivery, presence, and emotional range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={analysis.overallScore} className="w-full" />
            <span className="text-2xl font-bold">{analysis.overallScore}%</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(analysis.categories).map(([category, data]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category}</CardTitle>
              <Progress value={data.score} className="mt-2" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{data.feedback}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Areas for improvement and next steps</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="text-muted-foreground">{recommendation}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};