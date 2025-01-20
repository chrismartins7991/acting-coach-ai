import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoAnalysis, voiceAnalysis } = await req.json()
    console.log('Received analyses:', { videoAnalysis, voiceAnalysis })

    if (!videoAnalysis || !voiceAnalysis) {
      throw new Error('Missing required analysis data')
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = `As an expert in acting methodologies, analyze the following performance data through the perspectives of Strasberg, Chekhov, Stanislavski, Brecht, and Meisner. 

Video Analysis:
${JSON.stringify(videoAnalysis, null, 2)}

Voice Analysis:
${JSON.stringify(voiceAnalysis, null, 2)}

Provide a comprehensive analysis that includes:
1. Each method's perspective on the performance
2. Specific techniques from each methodology that could enhance the performance
3. A synthesis of how these different approaches could be combined for optimal improvement

Format the response as JSON with the following structure:
{
  "methodologies": {
    "strasberg": { "analysis": "", "recommendations": [] },
    "chekhov": { "analysis": "", "recommendations": [] },
    "stanislavski": { "analysis": "", "recommendations": [] },
    "brecht": { "analysis": "", "recommendations": [] },
    "meisner": { "analysis": "", "recommendations": [] }
  },
  "synthesis": "",
  "overallRecommendations": []
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert acting coach well-versed in all major acting methodologies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    const analysis = JSON.parse(data.choices[0].message.content)

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in combine-analysis function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})