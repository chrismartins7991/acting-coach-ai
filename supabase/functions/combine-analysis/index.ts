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

    const prompt = `As an expert in acting methodologies, analyze this performance through multiple perspectives. Here's the data:

Video Analysis: ${JSON.stringify(videoAnalysis)}
Voice Analysis: ${JSON.stringify(voiceAnalysis)}

Provide analysis from each methodology perspective and format as JSON with this exact structure:
{
  "methodologies": {
    "strasberg": {
      "analysis": "string",
      "recommendations": ["string"]
    },
    "chekhov": {
      "analysis": "string",
      "recommendations": ["string"]
    },
    "stanislavski": {
      "analysis": "string",
      "recommendations": ["string"]
    },
    "brecht": {
      "analysis": "string",
      "recommendations": ["string"]
    },
    "meisner": {
      "analysis": "string",
      "recommendations": ["string"]
    }
  },
  "synthesis": "string",
  "overallRecommendations": ["string"]
}`

    console.log('Sending prompt to OpenAI')
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
    console.log('OpenAI response:', data)

    // Extract the content and parse it as JSON
    const content = data.choices[0].message.content
    console.log('Raw content:', content)

    // Try to parse the content directly
    let analysis
    try {
      analysis = JSON.parse(content)
    } catch (e) {
      console.error('Failed to parse content directly:', e)
      // If direct parsing fails, try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response')
      }
      analysis = JSON.parse(jsonMatch[0])
    }

    console.log('Parsed analysis:', analysis)

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