import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoUrl } = await req.json()
    console.log("Analyzing video:", videoUrl)

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '')
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // Create the analysis prompt
    const prompt = `Analyze this acting performance video and provide detailed feedback on:
    1. Overall Performance Score (0-100)
    2. Emotional Range (score and feedback)
    3. Voice and Delivery (score and feedback)
    4. Physical Presence (score and feedback)
    5. Character Embodiment (score and feedback)
    6. Specific recommendations for improvement

    Format the response as a JSON object with these fields:
    {
      "overallScore": number,
      "categories": {
        "emotionalRange": { "score": number, "feedback": string },
        "voiceAndDelivery": { "score": number, "feedback": string },
        "physicalPresence": { "score": number, "feedback": string },
        "characterEmbodiment": { "score": number, "feedback": string }
      },
      "recommendations": string[]
    }`

    console.log("Starting Gemini analysis...")
    
    // Analyze the video
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "video/mp4",
          data: videoUrl
        }
      },
      prompt
    ])
    const response = await result.response
    const analysisText = response.text()
    
    console.log("Raw analysis result:", analysisText)

    // Parse the response into JSON
    const analysis = JSON.parse(analysisText)
    
    console.log("Parsed analysis:", analysis)

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error("Error analyzing video:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})