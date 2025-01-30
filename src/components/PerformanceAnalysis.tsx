import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Analysis, VoiceAnalysis } from "@/utils/videoAnalysis/types";

interface PerformanceAnalysisProps {
  analysis: Analysis | null;
  voiceAnalysis: VoiceAnalysis | null;
  isLoading?: boolean;
}

export const PerformanceAnalysis = ({ analysis, voiceAnalysis, isLoading }: PerformanceAnalysisProps) => {
  console.log("PerformanceAnalysis received:", { analysis, voiceAnalysis, isLoading });

  const methodologyPortraits = {
    strasberg: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/images/strasberg-portrait.jpg",
    chekhov: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/images/chekhov-portrait.jpg",
    stanislavski: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/images/stanislavski-portrait.jpg",
    brecht: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/images/brecht-portrait.jpg",
    meisner: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/images/meisner-portrait.jpg"
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-black/30 backdrop-blur-sm border-white/10">
          <CardHeader>
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-6 w-3/4 mt-4" />
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
            <Card key={i} className="bg-black/30 backdrop-blur-sm border-white/10">
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
    console.log("No analysis data available");
    return null;
  }

  const formatCategoryName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').trim();
  };

  // Get the selected coach from methodologicalAnalysis
  const selectedCoach = analysis?.methodologicalAnalysis?.methodologies 
    ? Object.keys(analysis.methodologicalAnalysis.methodologies)[0]
    : null;

  const combinedScore = analysis && voiceAnalysis 
    ? Math.round((analysis.overallScore + voiceAnalysis.overallScore) / 2)
    : analysis?.overallScore || voiceAnalysis?.overallScore || 0;

  console.log("Rendering analysis with score:", combinedScore);

  return (
    <div className="space-y-6">
      {selectedCoach && (
        <Card className="bg-black/30 backdrop-blur-sm border-white/10">
          <CardHeader className="flex md:flex-row gap-6 items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-theater-gold">
              <img 
                src={methodologyPortraits[selectedCoach as keyof typeof methodologyPortraits]} 
                alt={`${selectedCoach} portrait`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <CardTitle className="text-white capitalize">{selectedCoach} Method</CardTitle>
              <CardDescription className="text-white/60">Your Acting Coach</CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      <Card className="bg-black/30 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Overall Performance Score</CardTitle>
          <CardDescription className="text-white/60">Based on your selected preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={combinedScore} className="w-full" />
            <span className="text-2xl font-bold text-white">{combinedScore}%</span>
          </div>
        </CardContent>
      </Card>

      {analysis?.methodologicalAnalysis?.synthesis && (
        <Card className="bg-black/30 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Coach's Synthesis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/60">{analysis.methodologicalAnalysis.synthesis}</p>
          </CardContent>
        </Card>
      )}

      {analysis?.categories && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(analysis.categories).map(([category, data]) => (
            <Card key={category} className="bg-black/30 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">{formatCategoryName(category)}</CardTitle>
                <Progress value={data.score} className="mt-2" />
              </CardHeader>
              <CardContent>
                <p className="text-white/60">{data.feedback}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {voiceAnalysis?.categories && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(voiceAnalysis.categories).map(([category, data]) => (
            <Card key={category} className="bg-black/30 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">{formatCategoryName(category)}</CardTitle>
                <Progress value={data.score} className="mt-2" />
              </CardHeader>
              <CardContent>
                <p className="text-white/60">{data.feedback}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-black/30 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recommendations & Exercises</CardTitle>
          <CardDescription className="text-white/60">Areas for improvement and specific exercises from your coach</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">General Recommendations</h4>
            <ul className="list-disc pl-6 space-y-2">
              {analysis?.recommendations?.map((recommendation, index) => (
                <li key={`visual-${index}`} className="text-white/60">{recommendation}</li>
              ))}
              {voiceAnalysis?.recommendations?.map((recommendation, index) => (
                <li key={`voice-${index}`} className="text-white/60">{recommendation}</li>
              ))}
              {analysis?.methodologicalAnalysis?.overallRecommendations?.map((recommendation, index) => (
                <li key={`method-${index}`} className="text-white/60">{recommendation}</li>
              ))}
            </ul>
          </div>
          
          {selectedCoach && analysis?.methodologicalAnalysis?.methodologies[selectedCoach]?.exercises && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Recommended Exercises</h4>
              <ul className="list-disc pl-6 space-y-2">
                {analysis.methodologicalAnalysis.methodologies[selectedCoach].exercises.map((exercise, index) => (
                  <li key={`exercise-${index}`} className="text-white/60">{exercise}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};