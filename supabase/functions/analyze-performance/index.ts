import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY')
const RAPIDAPI_HOST = "chatgpt-vision1.p.rapidapi.com"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoUrl } = await req.json()

    const payload = {
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this acting performance and provide detailed feedback on: 1. Body language and movement 2. Vocal delivery and expression 3. Emotional authenticity 4. Areas for improvement"
            },
            {
              type: "image",
              url: videoUrl
            }
          ]
        }
      ],
      web_access: false
    }

    const response = await fetch("https://chatgpt-vision1.p.rapidapi.com/matagvision2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": RAPIDAPI_KEY || "",
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})