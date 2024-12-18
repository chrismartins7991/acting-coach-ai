import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createSystemPrompt, parseAnalysis } from "./utils.ts";

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl } = await req.json();
    console.log("Received video URL:", videoUrl);

    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY is not configured');
    }

    if (!videoUrl) {
      throw new Error('No video URL provided');
    }

    // Ensure the URL is HTTPS
    const encodedUrl = encodeURI(videoUrl).replace('http://', 'https://');
    console.log("Encoded URL:", encodedUrl);

    const systemPrompt = createSystemPrompt();
    console.log("Using system prompt:", systemPrompt);

    // Make the request to the vision API
    const response = await fetch("https://chatgpt-vision1.p.rapidapi.com/matagvision2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "chatgpt-vision1.p.rapidapi.com",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this acting performance video and provide detailed feedback following the exact format specified."
              },
              {
                type: "image_url",
                image_url: {
                  url: encodedUrl
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      console.error("RapidAPI error response status:", response.status);
      const errorText = await response.text();
      console.error("RapidAPI error response:", errorText);
      throw new Error(`RapidAPI returned status ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("Raw AI Response:", aiResponse);

    let analysisText = '';
    if (aiResponse.choices?.[0]?.message?.content) {
      analysisText = aiResponse.choices[0].message.content;
      console.log("Extracted analysis text:", analysisText);
    } else {
      console.error("Unexpected AI response structure:", aiResponse);
      throw new Error("Could not find analysis text in AI response");
    }

    // Check if the AI indicates it can't see the video
    if (analysisText.toLowerCase().includes("don't see the video") || 
        analysisText.toLowerCase().includes("cannot see the video") ||
        analysisText.toLowerCase().includes("can't see the video")) {
      throw new Error("AI could not process the video. Please ensure the video URL is accessible and in a supported format.");
    }

    const analysis = parseAnalysis(analysisText);
    console.log("Final analysis object:", analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-performance function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});