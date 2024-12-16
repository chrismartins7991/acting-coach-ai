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

    // Ensure the URL is properly encoded and uses HTTPS
    const encodedUrl = encodeURI(videoUrl).replace('http://', 'https://');
    console.log("Encoded URL:", encodedUrl);

    const systemPrompt = "You are an acting coach. Analyze the video and provide specific, actionable feedback.";
    const userPrompt = "Please analyze this acting performance and provide feedback in exactly this format:\n\n" +
      "Delivery Score: [number 0-100]\n" +
      "Delivery Feedback: [brief feedback about voice and articulation]\n\n" +
      "Presence Score: [number 0-100]\n" +
      "Presence Feedback: [brief feedback about body language]\n\n" +
      "Emotional Range Score: [number 0-100]\n" +
      "Emotional Range Feedback: [brief feedback about emotional expression]\n\n" +
      "Recommendations:\n" +
      "1. [specific recommendation]\n" +
      "2. [specific recommendation]\n" +
      "3. [specific recommendation]";

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
        ],
        web_access: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("RapidAPI error response:", errorText);
      throw new Error(`RapidAPI returned status ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("Raw AI Response:", JSON.stringify(aiResponse, null, 2));

    const analysisText = aiResponse.assistant || aiResponse.text;
    if (!analysisText) {
      console.error("No analysis text in response:", aiResponse);
      throw new Error("Invalid response format from AI");
    }

    console.log("Analysis text:", analysisText);

    // Parse scores with more lenient regex patterns
    const deliveryScoreMatch = analysisText.match(/Delivery Score:?\s*(\d+)/i);
    const presenceScoreMatch = analysisText.match(/Presence Score:?\s*(\d+)/i);
    const emotionalScoreMatch = analysisText.match(/Emotional Range Score:?\s*(\d+)/i);

    const deliveryFeedbackMatch = analysisText.match(/Delivery Feedback:?\s*([^\n]+)/i);
    const presenceFeedbackMatch = analysisText.match(/Presence Feedback:?\s*([^\n]+)/i);
    const emotionalFeedbackMatch = analysisText.match(/Emotional Range Feedback:?\s*([^\n]+)/i);

    // Extract recommendations with a more flexible pattern
    const recommendationsMatch = analysisText.match(/Recommendations:?\s*((?:\d+\.?\s*[^\n]+\s*)+)/i);
    const recommendations = recommendationsMatch
      ? recommendationsMatch[1]
          .split(/\d+\.?\s*/)
          .filter(text => text.trim())
          .map(text => text.trim())
          .slice(0, 3)
      : ["Work on vocal projection", "Practice body language", "Develop emotional range"];

    // Provide default values if parsing fails
    const analysis = {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(
        (parseInt(deliveryScoreMatch?.[1] || "70") + 
         parseInt(presenceScoreMatch?.[1] || "70") + 
         parseInt(emotionalScoreMatch?.[1] || "70")) / 3
      ),
      categories: {
        delivery: {
          score: parseInt(deliveryScoreMatch?.[1] || "70"),
          feedback: deliveryFeedbackMatch?.[1] || "Focus on clear articulation and vocal projection"
        },
        presence: {
          score: parseInt(presenceScoreMatch?.[1] || "70"),
          feedback: presenceFeedbackMatch?.[1] || "Work on maintaining strong stage presence"
        },
        emotionalRange: {
          score: parseInt(emotionalScoreMatch?.[1] || "70"),
          feedback: emotionalFeedbackMatch?.[1] || "Continue developing emotional authenticity"
        }
      },
      recommendations: recommendations.length > 0 ? recommendations : [
        "Practice vocal exercises daily",
        "Record and review your performances",
        "Study different emotional expressions"
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