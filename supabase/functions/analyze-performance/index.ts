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

    const systemPrompt = `You are an expert acting coach analyzing a video performance. Provide feedback in EXACTLY this format:

Delivery Score: [number between 0-100]
Delivery Feedback: [brief feedback about vocal delivery]
Presence Score: [number between 0-100]
Presence Feedback: [brief feedback about stage presence]
Emotional Range Score: [number between 0-100]
Emotional Range Feedback: [brief feedback about emotional expression]
Recommendations:
1. [specific recommendation]
2. [specific recommendation]
3. [specific recommendation]

Do not deviate from this format. Each score must be a number between 0 and 100.`;

    console.log("Making RapidAPI request with system prompt:", systemPrompt);

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
                text: "Please analyze this acting performance video and provide feedback in the exact format specified."
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
    if (aiResponse.choices?.[0]?.message?.content) {
      analysisText = aiResponse.choices[0].message.content;
      console.log("Extracted analysis text:", analysisText);
    } else {
      console.error("Unexpected AI response structure:", aiResponse);
      throw new Error("Could not find analysis text in AI response");
    }

    if (!analysisText) {
      throw new Error("No valid analysis text found in AI response");
    }

    // Initialize analysis object with default values
    const analysis = {
      timestamp: new Date().toISOString(),
      overallScore: 0,
      categories: {
        delivery: { score: 0, feedback: "" },
        presence: { score: 0, feedback: "" },
        emotionalRange: { score: 0, feedback: "" }
      },
      recommendations: []
    };

    // Extract scores and feedback using more precise regex patterns
    const scorePattern = /(\w+)\s+Score:\s*(\d+)/g;
    const feedbackPattern = /(\w+)\s+Feedback:\s*([^\n]+)/g;
    
    let totalScore = 0;
    let scoreCount = 0;

    // Extract scores
    let scoreMatch;
    while ((scoreMatch = scorePattern.exec(analysisText)) !== null) {
      const category = scoreMatch[1].toLowerCase();
      const score = Math.min(100, Math.max(0, parseInt(scoreMatch[2])));
      
      if (category === 'delivery' || category === 'presence' || category === 'emotional' || category === 'emotionalrange') {
        const key = category === 'emotional' || category === 'emotionalrange' ? 'emotionalRange' : category;
        if (analysis.categories[key]) {
          analysis.categories[key].score = score;
          totalScore += score;
          scoreCount++;
        }
      }
    }

    // Extract feedback
    let feedbackMatch;
    while ((feedbackMatch = feedbackPattern.exec(analysisText)) !== null) {
      const category = feedbackMatch[1].toLowerCase();
      const feedback = feedbackMatch[2].trim();
      
      if (category === 'delivery' || category === 'presence' || category === 'emotional' || category === 'emotionalrange') {
        const key = category === 'emotional' || category === 'emotionalrange' ? 'emotionalRange' : category;
        if (analysis.categories[key]) {
          analysis.categories[key].feedback = feedback;
        }
      }
    }

    // Calculate overall score
    analysis.overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    // Extract recommendations
    const recommendationsMatch = analysisText.match(/Recommendations:\s*((?:(?:\d+\.|\-)\s*[^\n]+\s*)+)/i);
    if (recommendationsMatch) {
      const recommendations = recommendationsMatch[1]
        .split(/(?:\d+\.|\-)\s*/)
        .filter(text => text.trim())
        .map(text => text.trim());
      
      if (recommendations.length > 0) {
        analysis.recommendations = recommendations.slice(0, 3);
      }
    }

    // Ensure we have at least some recommendations
    if (analysis.recommendations.length === 0) {
      analysis.recommendations = [
        "Practice vocal exercises regularly",
        "Work on stage presence",
        "Explore emotional range through exercises"
      ];
    }

    // Validate the analysis object
    if (!analysis.overallScore && analysis.overallScore !== 0) {
      throw new Error("Failed to calculate overall score");
    }

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