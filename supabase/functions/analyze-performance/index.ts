import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl } = await req.json();
    console.log("Analyzing video URL:", videoUrl);

    if (!RAPIDAPI_KEY) {
      console.error("RAPIDAPI_KEY is not configured");
      throw new Error('RAPIDAPI_KEY is not configured');
    }

    // Call RapidAPI Computer Vision endpoint
    console.log("Making RapidAPI request with URL:", videoUrl);
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
                text: "You are an acting coach. Analyze this acting performance video and provide detailed feedback in this exact format, with no additional text:\n\nDelivery Score: [0-100]\nDelivery Feedback: [specific feedback about voice, articulation, pace]\n\nPresence Score: [0-100]\nPresence Feedback: [specific feedback about body language, movements]\n\nEmotional Range Score: [0-100]\nEmotional Range Feedback: [specific feedback about expression, authenticity]\n\nRecommendations:\n1. [specific recommendation]\n2. [specific recommendation]\n3. [specific recommendation]"
              },
              {
                type: "image",
                url: videoUrl
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

    // Check for valid response structure
    if (!aiResponse.assistant && !aiResponse.text) {
      console.error("Invalid AI response format:", aiResponse);
      throw new Error("Invalid AI response format");
    }

    // Extract the content from the RapidAPI response
    const analysisText = aiResponse.assistant || aiResponse.text;
    console.log("Analysis text:", analysisText);

    // Parse scores and feedback using more specific regex patterns
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

    console.log("Extracted scores:", {
      delivery: deliveryScoreMatch?.[1],
      presence: presenceScoreMatch?.[1],
      emotional: emotionalScoreMatch?.[1]
    });

    // Validate that we have all required scores
    if (!deliveryScoreMatch || !presenceScoreMatch || !emotionalScoreMatch) {
      console.error("Failed to extract scores from AI response");
      throw new Error("Failed to parse AI response format");
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

    console.log("Final analysis object:", JSON.stringify(analysis, null, 2));

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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