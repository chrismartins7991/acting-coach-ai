import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Analysis } from "@/utils/videoAnalysis/types";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceAnalysisProps {
  analysis: Analysis | null;
  isLoading?: boolean;
}

export const PerformanceAnalysis = ({ analysis, isLoading }: PerformanceAnalysisProps) => {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance Score</CardTitle>
          <CardDescription>Based on multiple factors including delivery, presence, emotional range, and vocal performance</CardDescription>
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

      {analysis.audio && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Voice Analysis</CardTitle>
              <CardDescription>Detailed analysis of your vocal performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-semibold">Transcript</h4>
                <p className="text-muted-foreground">{analysis.audio.transcript}</p>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Voice Characteristics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Emotion</p>
                    <p className="font-medium capitalize">{analysis.audio.characteristics.emotion} ({Math.round(analysis.audio.characteristics.emotionConfidence * 100)}% confidence)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Speaking Rate</p>
                    <p className="font-medium">{Math.round(analysis.audio.characteristics.speakingRate)} words/minute</p>
                  </div>
                </div>
              </div>

              {analysis.audio.characteristics.volumeVariation.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Volume Variation</h4>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analysis.audio.characteristics.volumeVariation}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="time" 
                          label={{ value: 'Time (seconds)', position: 'bottom' }} 
                        />
                        <YAxis 
                          label={{ value: 'Volume', angle: -90, position: 'insideLeft' }} 
                        />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {analysis.audio.characteristics.pitch.variations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Pitch Variation</h4>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analysis.audio.characteristics.pitch.variations}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="time" 
                          label={{ value: 'Time (seconds)', position: 'bottom' }} 
                        />
                        <YAxis 
                          label={{ value: 'Pitch', angle: -90, position: 'insideLeft' }} 
                        />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold">Expert Analysis</h4>
                <p className="text-muted-foreground">{analysis.audio.analysis}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Areas for improvement and next steps</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            {analysis.recommendations?.map((recommendation, index) => (
              <li key={index} className="text-muted-foreground">{recommendation}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};