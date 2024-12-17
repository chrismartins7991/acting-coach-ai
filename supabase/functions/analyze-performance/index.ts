import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const encodedUrl = encodeURI(videoUrl).replace('http://', 'https://');
    console.log("Encoded URL:", encodedUrl);

    const systemPrompt = "You are an expert acting coach. Analyze this video and provide feedback in a specific format.";
    
    const userPrompt = `Analyze this acting performance and provide feedback in this EXACT format, including the exact labels and colons:

Delivery Score: [number]
Delivery Feedback: [text]
Presence Score: [number]
Presence Feedback: [text]
Emotional Range Score: [number]
Emotional Range Feedback: [text]
Recommendations:
1. [text]
2. [text]
3. [text]`;

    console.log("Making RapidAPI request...");
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
                text: userPrompt
              },
              {
                type: "image",
                url: encodedUrl
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("RapidAPI error response:", errorText);
      throw new Error(`RapidAPI returned status ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("Raw AI Response:", JSON.stringify(aiResponse, null, 2));

    // Extract the response text from the appropriate field
    let analysisText = '';
    if (aiResponse.text) {
      analysisText = aiResponse.text;
    } else if (aiResponse.assistant) {
      analysisText = aiResponse.assistant;
    } else if (aiResponse.choices?.[0]?.message?.content) {
      analysisText = aiResponse.choices[0].message.content;
    } else {
      console.error("Unexpected AI response format:", aiResponse);
      throw new Error("Could not extract analysis text from AI response");
    }

    console.log("Analysis text:", analysisText);

    // Extract scores and feedback using strict regex patterns
    const scores = {
      delivery: analysisText.match(/Delivery Score:\s*(\d+)/)?.[1],
      presence: analysisText.match(/Presence Score:\s*(\d+)/)?.[1],
      emotional: analysisText.match(/Emotional Range Score:\s*(\d+)/)?.[1]
    };

    const feedback = {
      delivery: analysisText.match(/Delivery Feedback:\s*([^\n]+)/)?.[1],
      presence: analysisText.match(/Presence Feedback:\s*([^\n]+)/)?.[1],
      emotional: analysisText.match(/Emotional Range Feedback:\s*([^\n]+)/)?.[1]
    };

    // Validate that we have all required scores and feedback
    if (!scores.delivery || !scores.presence || !scores.emotional ||
        !feedback.delivery || !feedback.presence || !feedback.emotional) {
      console.error("Missing required scores or feedback:", { scores, feedback });
      throw new Error("AI response missing required fields");
    }

    // Extract recommendations
    const recommendationsMatch = analysisText.match(/Recommendations:\s*((?:(?:\d+\.|\-)\s*[^\n]+\s*)+)/);
    const recommendations = recommendationsMatch
      ? recommendationsMatch[1]
          .split(/(?:\d+\.|\-)\s*/)
          .filter(text => text.trim())
          .map(text => text.trim())
          .slice(0, 3)
      : [
          "Focus on vocal projection and clarity",
          "Practice maintaining consistent stage presence",
          "Work on emotional authenticity"
        ];

    const analysis = {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(
        (parseInt(scores.delivery) + 
         parseInt(scores.presence) + 
         parseInt(scores.emotional)) / 3
      ),
      categories: {
        delivery: {
          score: parseInt(scores.delivery),
          feedback: feedback.delivery
        },
        presence: {
          score: parseInt(scores.presence),
          feedback: feedback.presence
        },
        emotionalRange: {
          score: parseInt(scores.emotional),
          feedback: feedback.emotional
        }
      },
      recommendations
    };

    console.log("Final analysis:", JSON.stringify(analysis, null, 2));

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