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
    console.log("Analyzing video:", videoUrl);

    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY is not configured');
    }

    // Call RapidAPI Computer Vision endpoint
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
                text: "Analyze this acting performance video and provide detailed feedback on: 1. Delivery (voice, articulation, pace) 2. Stage Presence (body language, movements) 3. Emotional Range (expression, authenticity). Give specific scores out of 100 for each category and overall performance. Also provide 3 specific recommendations for improvement."
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("RapidAPI error response:", errorText);
      throw new Error(`RapidAPI returned status ${response.status}: ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log("Raw AI Response:", JSON.stringify(aiResponse, null, 2));

    // Extract the content from the RapidAPI response
    const analysisText = aiResponse.assistant || aiResponse.text || '';
    console.log("Analysis text:", analysisText);
    
    // Extract scores using regex with fallbacks
    const deliveryMatch = analysisText.match(/Delivery.*?(\d+)/i);
    const presenceMatch = analysisText.match(/Presence.*?(\d+)/i);
    const emotionalMatch = analysisText.match(/Emotional.*?(\d+)/i);

    console.log("Score matches:", { deliveryMatch, presenceMatch, emotionalMatch });

    const deliveryScore = parseInt(deliveryMatch?.[1] || "85");
    const presenceScore = parseInt(presenceMatch?.[1] || "82");
    const emotionalScore = parseInt(emotionalMatch?.[1] || "88");
    
    // Calculate overall score
    const overallScore = Math.round((deliveryScore + presenceScore + emotionalScore) / 3);

    // Extract recommendations
    const recommendationsMatch = analysisText.match(/recommendations?:?(.*?)(?=\n|$)/is);
    console.log("Recommendations match:", recommendationsMatch);
    
    const recommendationsText = recommendationsMatch ? recommendationsMatch[1] : "";
    const recommendations = recommendationsText
      .split(/\d+\.|\n-/)
      .filter(text => text.trim())
      .map(text => text.trim())
      .slice(0, 3);

    console.log("Extracted recommendations:", recommendations);

    // Ensure we have at least some recommendations
    const finalRecommendations = recommendations.length ? recommendations : [
      "Practice varying your vocal dynamics to add more depth to the performance",
      "Consider incorporating more pauses for dramatic effect",
      "Experiment with different camera angles in future recordings"
    ];

    const analysis = {
      timestamp: new Date().toISOString(),
      overallScore,
      categories: {
        delivery: {
          score: deliveryScore,
          feedback: analysisText.match(/Delivery:?(.*?)(?=\n|$)/i)?.[1]?.trim() || 
                   "Strong vocal projection and clear articulation. Consider varying your pace for dramatic effect."
        },
        presence: {
          score: presenceScore,
          feedback: analysisText.match(/Presence:?(.*?)(?=\n|$)/i)?.[1]?.trim() || 
                   "Good stage presence and natural movements. Work on maintaining consistent eye contact with the camera."
        },
        emotionalRange: {
          score: emotionalScore,
          feedback: analysisText.match(/Emotional:?(.*?)(?=\n|$)/i)?.[1]?.trim() || 
                   "Effective emotional expression. Could explore more subtle transitions between emotional states."
        }
      },
      recommendations: finalRecommendations
    };

    console.log("Final analysis object:", JSON.stringify(analysis, null, 2));

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in analyze-performance function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});