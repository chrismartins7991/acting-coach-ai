import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    console.log("Processing video URL:", videoUrl);

    if (!RAPIDAPI_KEY) {
      console.error("RAPIDAPI_KEY is not configured");
      throw new Error('RAPIDAPI_KEY is not configured');
    }

    // Ensure the URL is properly encoded
    const encodedUrl = encodeURI(videoUrl);
    console.log("Encoded URL:", encodedUrl);

    const prompt = `Analyze this acting performance video and provide feedback in exactly this format:
Delivery Score: [number between 0-100]
Delivery Feedback: [1-2 sentences about voice and articulation]
Presence Score: [number between 0-100]
Presence Feedback: [1-2 sentences about body language]
Emotional Range Score: [number between 0-100]
Emotional Range Feedback: [1-2 sentences about emotional expression]
Recommendations:
1. [specific actionable recommendation]
2. [specific actionable recommendation]
3. [specific actionable recommendation]`;

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
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image",
                url: encodedUrl
              }
            ]
          }
        ],
        web_access: false
      })
    });

    console.log("RapidAPI response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("RapidAPI error response:", errorText);
      throw new Error(`RapidAPI returned status ${response.status}: ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log("Raw AI Response:", JSON.stringify(aiResponse, null, 2));

    // Extract the content from the response
    const analysisText = aiResponse.assistant || aiResponse.text;
    if (!analysisText) {
      console.error("No analysis text in response:", aiResponse);
      throw new Error("Invalid response format from AI");
    }

    console.log("Analysis text:", analysisText);

    // Parse scores and feedback
    const deliveryScoreMatch = analysisText.match(/Delivery Score:\s*(\d+)/i);
    const presenceScoreMatch = analysisText.match(/Presence Score:\s*(\d+)/i);
    const emotionalScoreMatch = analysisText.match(/Emotional Range Score:\s*(\d+)/i);

    const deliveryFeedbackMatch = analysisText.match(/Delivery Feedback:\s*([^\n]+)/i);
    const presenceFeedbackMatch = analysisText.match(/Presence Feedback:\s*([^\n]+)/i);
    const emotionalFeedbackMatch = analysisText.match(/Emotional Range Feedback:\s*([^\n]+)/i);

    // Extract recommendations
    const recommendationsMatch = analysisText.match(/Recommendations:\s*((?:\d+\.\s*[^\n]+\s*)+)/i);
    const recommendations = recommendationsMatch
      ? recommendationsMatch[1]
          .split(/\d+\.\s*/)
          .filter(text => text.trim())
          .map(text => text.trim())
          .slice(0, 3)
      : [];

    // Validate parsed data
    if (!deliveryScoreMatch || !presenceScoreMatch || !emotionalScoreMatch) {
      console.error("Failed to parse scores from response:", analysisText);
      throw new Error("Failed to parse AI response");
    }

    const analysis = {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(
        (parseInt(deliveryScoreMatch[1]) + 
         parseInt(presenceScoreMatch[1]) + 
         parseInt(emotionalScoreMatch[1])) / 3
      ),
      categories: {
        delivery: {
          score: parseInt(deliveryScoreMatch[1]),
          feedback: deliveryFeedbackMatch?.[1] || "No specific feedback provided"
        },
        presence: {
          score: parseInt(presenceScoreMatch[1]),
          feedback: presenceFeedbackMatch?.[1] || "No specific feedback provided"
        },
        emotionalRange: {
          score: parseInt(emotionalScoreMatch[1]),
          feedback: emotionalFeedbackMatch?.[1] || "No specific feedback provided"
        }
      },
      recommendations: recommendations.length > 0 ? recommendations : [
        "Work on vocal projection and clarity",
        "Practice maintaining consistent energy throughout the performance",
        "Focus on emotional transitions between scenes"
      ]
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