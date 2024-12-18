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

    const systemPrompt = `You are an expert acting coach. Analyze this video performance and provide feedback in exactly this format:

Delivery Score: [score between 0-100]
Delivery Feedback: [clear feedback about vocal delivery]
Presence Score: [score between 0-100]
Presence Feedback: [clear feedback about stage presence]
Emotional Range Score: [score between 0-100]
Emotional Range Feedback: [clear feedback about emotional expression]
Recommendations:
1. [specific recommendation]
2. [specific recommendation]
3. [specific recommendation]`;

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
                text: "Please analyze this acting performance video."
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
      console.error("RapidAPI error response status:", response.status);
      const errorText = await response.text();
      console.error("RapidAPI error response:", errorText);
      throw new Error(`RapidAPI returned status ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("Raw AI Response:", aiResponse);

    // Extract the analysis text from the response
    let analysisText = '';
    if (aiResponse.choices && aiResponse.choices[0] && aiResponse.choices[0].message) {
      analysisText = aiResponse.choices[0].message.content;
    } else if (typeof aiResponse === 'string') {
      analysisText = aiResponse;
    }

    console.log("Extracted analysis text:", analysisText);

    if (!analysisText) {
      throw new Error("No valid analysis text found in AI response");
    }

    // Parse the analysis text
    const analysis = {
      timestamp: new Date().toISOString(),
      overallScore: 0,
      categories: {
        delivery: {
          score: 70,
          feedback: "Default delivery feedback"
        },
        presence: {
          score: 70,
          feedback: "Default presence feedback"
        },
        emotionalRange: {
          score: 70,
          feedback: "Default emotional range feedback"
        }
      },
      recommendations: [
        "Practice vocal exercises regularly",
        "Work on stage presence",
        "Explore emotional range through exercises"
      ]
    };

    // Extract scores and feedback
    const categories = ['Delivery', 'Presence', 'Emotional Range'];
    let totalScore = 0;

    categories.forEach(category => {
      const scoreMatch = analysisText.match(new RegExp(`${category} Score: (\\d+)`));
      const feedbackMatch = analysisText.match(new RegExp(`${category} Feedback: ([^\\n]+)`));
      
      const categoryKey = category.replace(/\s+/g, '').charAt(0).toLowerCase() + category.replace(/\s+/g, '').slice(1);
      
      if (scoreMatch && scoreMatch[1]) {
        const score = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
        analysis.categories[categoryKey].score = score;
        totalScore += score;
      }
      
      if (feedbackMatch && feedbackMatch[1]) {
        analysis.categories[categoryKey].feedback = feedbackMatch[1].trim();
      }
    });

    // Calculate overall score
    analysis.overallScore = Math.round(totalScore / categories.length);

    // Extract recommendations
    const recommendationsMatch = analysisText.match(/Recommendations:\s*((?:(?:\d+\.|\-)\s*[^\n]+\s*)+)/i);
    if (recommendationsMatch) {
      const recommendations = recommendationsMatch[1]
        .split(/(?:\d+\.|\-)\s*/)
        .filter(text => text.trim())
        .map(text => text.trim())
        .slice(0, 3);
      
      if (recommendations.length > 0) {
        analysis.recommendations = recommendations;
      }
    }

    console.log("Final analysis:", analysis);

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