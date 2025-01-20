import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from "@/hooks/useSubscription";
import { Lock } from "lucide-react";

interface Category {
  score: number;
  feedback: string;
}

interface Analysis {
  overallScore: number;
  categories: {
    emotionalRange: Category;
    voiceAndDelivery: Category;
    physicalPresence: Category;
    characterEmbodiment: Category;
  };
  recommendations: string[];
}

interface PerformanceAnalysisProps {
  analysis: Analysis | null;
  isLoading?: boolean;
}

export const PerformanceAnalysis = ({ analysis, isLoading }: PerformanceAnalysisProps) => {
  const { subscriptionTier } = useSubscription();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const isProFeature = (feature: string) => {
    const proFeatures = ['emotionalRange', 'characterEmbodiment', 'recommendations'];
    return proFeatures.includes(feature) && subscriptionTier === 'free';
  };

  const formatCategoryName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').trim();
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(analysis.categories).map(([category, data]) => (
          <Card key={category} className={isProFeature(category) ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{formatCategoryName(category)}</CardTitle>
                {isProFeature(category) && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <Progress value={data.score} className="mt-2" />
            </CardHeader>
            <CardContent>
              {isProFeature(category) ? (
                <p className="text-muted-foreground">Upgrade to Pro to unlock detailed feedback</p>
              ) : (
                <p className="text-muted-foreground">{data.feedback}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recommendations</CardTitle>
            {subscriptionTier === 'free' && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <CardDescription>Areas for improvement and next steps</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptionTier === 'free' ? (
            <p className="text-muted-foreground">Upgrade to Pro to unlock personalized recommendations</p>
          ) : (
            <ul className="list-disc pl-6 space-y-2">
              {analysis.recommendations?.map((recommendation, index) => (
                <li key={index} className="text-muted-foreground">{recommendation}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};