import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PerformanceAnalysisProps {
  analysis: Analysis | null;
  voiceAnalysis: VoiceAnalysis | null;
  isLoading?: boolean;
}

export const PerformanceAnalysis = ({ analysis, voiceAnalysis, isLoading }: PerformanceAnalysisProps) => {
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

  if (!analysis && !voiceAnalysis) {
    return null;
  }

  const formatCategoryName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').trim();
  };

  const combinedScore = analysis && voiceAnalysis 
    ? Math.round((analysis.overallScore + voiceAnalysis.overallScore) / 2)
    : analysis?.overallScore || voiceAnalysis?.overallScore || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance Score</CardTitle>
          <CardDescription>Combined score based on visual performance and voice analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={combinedScore} className="w-full" />
            <span className="text-2xl font-bold">{combinedScore}%</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visual" disabled={!analysis}>Visual Performance</TabsTrigger>
          <TabsTrigger value="voice" disabled={!voiceAnalysis}>Voice Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="visual">
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(analysis.categories).map(([category, data]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle>{formatCategoryName(category)}</CardTitle>
                    <Progress value={data.score} className="mt-2" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{data.feedback}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="voice">
          {voiceAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(voiceAnalysis.categories).map(([category, data]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle>{formatCategoryName(category)}</CardTitle>
                    <Progress value={data.score} className="mt-2" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{data.feedback}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Areas for improvement and next steps</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            {analysis?.recommendations?.map((recommendation, index) => (
              <li key={`visual-${index}`} className="text-muted-foreground">{recommendation}</li>
            ))}
            {voiceAnalysis?.recommendations?.map((recommendation, index) => (
              <li key={`voice-${index}`} className="text-muted-foreground">{recommendation}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};