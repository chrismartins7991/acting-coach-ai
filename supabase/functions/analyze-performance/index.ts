import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoUrl } = await req.json()
    console.log("Received video URL for analysis:", videoUrl)

    // Simulate AI analysis with structured feedback
    // In a real implementation, this would call the actual AI service
    const mockAnalysis = {
      overallScore: 85,
      categories: {
        delivery: {
          score: 88,
          feedback: "Strong vocal projection and clear articulation. Consider varying your pace for dramatic effect."
        },
        presence: {
          score: 82,
          feedback: "Good stage presence and natural movements. Work on maintaining consistent eye contact with the camera."
        },
        emotionalRange: {
          score: 85,
          feedback: "Effective emotional expression. Could explore more subtle transitions between emotional states."
        }
      },
      recommendations: [
        "Practice varying your vocal dynamics to add more depth to the performance",
        "Consider incorporating more pauses for dramatic effect",
        "Experiment with different camera angles in future recordings"
      ],
      timestamp: new Date().toISOString()
    }

    console.log("Analysis completed:", mockAnalysis)

    return new Response(
      JSON.stringify(mockAnalysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})