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

    // Call RapidAPI's Video Analysis API
    const response = await fetch('https://ai-video-analysis.p.rapidapi.com/api/v1/analyze', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': Deno.env.get('RAPIDAPI_KEY') || '',
        'X-RapidAPI-Host': 'ai-video-analysis.p.rapidapi.com'
      },
      body: JSON.stringify({
        url: videoUrl,
        features: [
          "emotion_recognition",
          "pose_estimation",
          "voice_analysis",
          "scene_understanding"
        ]
      })
    });

    const analysisData = await response.json()

    return new Response(
      JSON.stringify(analysisData),
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