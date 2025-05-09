"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { differenceInDays, format, parseISO } from "date-fns"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useSubscription } from "@/hooks/useSubscription"
import type { Json } from "@/integrations/supabase/types"

interface PerformanceData {
  date: string
  day: number
  score: number
  actualDate: string
}

interface AnalysisJson {
  overallScore?: number
  methodologicalAnalysis?: {
    overallScore?: number
  }
  voice_feedback?: {
    overallScore?: number
  }
  ai_feedback?: {
    overallScore?: number
  }
}

export const PerformanceChart = () => {
  const [performances, setPerformances] = useState<PerformanceData[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const { user } = useAuth()
  const { toast } = useToast()
  const { isSubscribed } = useSubscription()

  const extractScore = (analysis: Json | null, voiceAnalysis: Json | null): number => {
    if (!analysis && !voiceAnalysis) return 0

    if (analysis && typeof analysis === "object" && !Array.isArray(analysis)) {
      const typedAnalysis = analysis as AnalysisJson

      // Direct overall score
      if ("overallScore" in analysis) {
        return Number(analysis.overallScore) || 0
      }

      // Check methodologicalAnalysis.overallScore
      if (typedAnalysis.methodologicalAnalysis?.overallScore !== undefined) {
        return Number(typedAnalysis.methodologicalAnalysis.overallScore) || 0
      }

      // Nested in voice_feedback
      if (typedAnalysis.voice_feedback?.overallScore !== undefined) {
        return Number(typedAnalysis.voice_feedback.overallScore) || 0
      }

      // Nested in ai_feedback
      if (typedAnalysis.ai_feedback?.overallScore !== undefined) {
        return Number(typedAnalysis.ai_feedback.overallScore) || 0
      }
    }

    // Try voice analysis
    if (
      voiceAnalysis &&
      typeof voiceAnalysis === "object" &&
      !Array.isArray(voiceAnalysis) &&
      "overallScore" in voiceAnalysis
    ) {
      return Number(voiceAnalysis.overallScore) || 0
    }

    return 0
  }

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!user) return

      try {
        // Get user subscription start date
        const { data: userData, error: userError } = await supabase
          .from("user_usage")
          .select("created_at, subscription_tier")
          .eq("user_id", user.id)
          .single()

        if (userError) throw userError

        const userStartDate = parseISO(userData.created_at)

        // Get performances data
        const { data: performancesData, error: performancesError } = await supabase
          .from("performances")
          .select(`
            id,
            created_at,
            title,
            status,
            performance_analysis (*)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })

        if (performancesError) throw performancesError

        // Get performance results
        const { data: resultsData, error: resultsError } = await supabase
          .from("performance_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })

        if (resultsError) throw resultsError

        let allPerformances: PerformanceData[] = []

        // Process performances data
        if (performancesData) {
          const performanceScores = performancesData.map((perf) => {
            const performanceDate = parseISO(perf.created_at)
            const daysSinceStart = differenceInDays(performanceDate, userStartDate) + 1

            // Extract score from performance_analysis
            let score = 0
            if (perf.performance_analysis) {
              const analysisArray = Array.isArray(perf.performance_analysis)
                ? perf.performance_analysis
                : [perf.performance_analysis]

              if (analysisArray.length > 0) {
                const analysis = analysisArray[0]
                score =
                  analysis.overall_score || extractScore(analysis.ai_feedback as Json, analysis.voice_feedback as Json)
              }
            }

            return {
              date: `Day ${daysSinceStart}`,
              day: daysSinceStart,
              score,
              actualDate: format(performanceDate, "MMM d, yyyy"),
            }
          })
          allPerformances = [...allPerformances, ...performanceScores]
        }

        // Process performance results data
        if (resultsData) {
          const resultScores = resultsData.map((result) => {
            const performanceDate = parseISO(result.created_at)
            const daysSinceStart = differenceInDays(performanceDate, userStartDate) + 1
            const score = extractScore(result.analysis, result.voice_analysis)

            return {
              date: `Day ${daysSinceStart}`,
              day: daysSinceStart,
              score,
              actualDate: format(performanceDate, "MMM d, yyyy"),
            }
          })
          allPerformances = [...allPerformances, ...resultScores]
        }

        // Filter and sort performances
        const validPerformances = allPerformances
          .filter((p) => p.score > 0)
          .sort((a, b) => a.day - b.day)
          .reduce((acc: PerformanceData[], current) => {
            const existingIndex = acc.findIndex((p) => p.day === current.day)
            if (existingIndex === -1) {
              acc.push(current)
            } else if (current.score > acc[existingIndex].score) {
              acc[existingIndex] = current
            }
            return acc
          }, [])

        setPerformances(validPerformances)

        // Get total points
        const { data: usageData } = await supabase
          .from("user_usage")
          .select("performance_count")
          .eq("user_id", user.id)
          .single()

        setTotalPoints(usageData?.performance_count || 0)
      } catch (error) {
        console.error("Error fetching performance data:", error)
        toast({
          title: "Error",
          description: "Failed to load performance data",
          variant: "destructive",
        })
      }
    }

    if (user) {
      fetchPerformanceData()
    }
  }, [user, toast])

  return (
    <Card className="p-6 shadow-lg border-muted bg-background/50 backdrop-blur-sm overflow-hidden mb-4 max-w-[900px] mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Performance Progress</h2>
          <div className="bg-primary/10 px-4 py-2 rounded-full">
            <span className="text-primary font-medium">{totalPoints} Points</span>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ChartContainer
            config={{
              score: {
                label: "Score",
                color: "hsl(var(--primary))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performances} margin={{ top: 20, right: 20, left: 20, bottom: 50 }}>
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  scale="point"
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  width={40}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent>
                      {({ payload }) => {
                        if (!payload?.length) return null
                        const data = payload[0].payload as PerformanceData
                        return (
                          <div className="space-y-1">
                            <p className="font-medium text-primary">Score: {data.score}%</p>
                            <p className="text-sm text-muted-foreground">{data.date}</p>
                            <p className="text-xs text-muted-foreground">{data.actualDate}</p>
                          </div>
                        )
                      }}
                    </ChartTooltipContent>
                  }
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "hsl(var(--primary))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--primary))",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </Card>
  )
}
