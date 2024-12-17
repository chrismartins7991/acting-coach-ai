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

    const systemPrompt = "You are an expert acting coach analyzing a video performance. Provide feedback in a clear, structured format.";
    
    const userPrompt = `Analyze this acting performance and provide feedback in this EXACT format:

Delivery Score: [a number between 0-100]
Delivery Feedback: [1-2 sentences of specific feedback]
Presence Score: [a number between 0-100]
Presence Feedback: [1-2 sentences of specific feedback]
Emotional Range Score: [a number between 0-100]
Emotional Range Feedback: [1-2 sentences of specific feedback]
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

    // Extract the response text, handling different possible response formats
    let analysisText = '';
    if (aiResponse.choices?.[0]?.message?.content) {
      analysisText = aiResponse.choices[0].message.content;
    } else if (aiResponse.text) {
      analysisText = aiResponse.text;
    } else if (aiResponse.assistant) {
      analysisText = aiResponse.assistant;
    } else if (typeof aiResponse === 'string') {
      analysisText = aiResponse;
    }

    if (!analysisText) {
      console.error("Could not extract analysis text. AI Response:", aiResponse);
      throw new Error("Could not extract analysis text from AI response");
    }

    console.log("Extracted analysis text:", analysisText);

    // Extract scores with more lenient regex patterns
    const getScore = (text: string, category: string) => {
      const match = text.match(new RegExp(`${category}\\s*Score:\\s*(\\d+)`, 'i'));
      return match ? parseInt(match[1]) : 70; // Default score if not found
    };

    const getFeedback = (text: string, category: string) => {
      const match = text.match(new RegExp(`${category}\\s*Feedback:\\s*([^\\n]+)`, 'i'));
      return match ? match[1].trim() : `${category} needs improvement`; // Default feedback if not found
    };

    const scores = {
      delivery: getScore(analysisText, 'Delivery'),
      presence: getScore(analysisText, 'Presence'),
      emotional: getScore(analysisText, 'Emotional Range')
    };

    const feedback = {
      delivery: getFeedback(analysisText, 'Delivery'),
      presence: getFeedback(analysisText, 'Presence'),
      emotional: getFeedback(analysisText, 'Emotional Range')
    };

    // Extract recommendations with a more lenient pattern
    const recommendationsMatch = analysisText.match(/Recommendations?:?\s*((?:(?:\d+\.|\-)\s*[^\n]+\s*)+)/i);
    const recommendations = recommendationsMatch
      ? recommendationsMatch[1]
          .split(/(?:\d+\.|\-)\s*/)
          .filter(text => text.trim())
          .map(text => text.trim())
          .slice(0, 3)
      : [
          "Work on vocal clarity and projection",
          "Practice maintaining consistent stage presence",
          "Develop broader emotional range in performances"
        ];

    const analysis = {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(
        (scores.delivery + scores.presence + scores.emotional) / 3
      ),
      categories: {
        delivery: {
          score: scores.delivery,
          feedback: feedback.delivery
        },
        presence: {
          score: scores.presence,
          feedback: feedback.presence
        },
        emotionalRange: {
          score: scores.emotional,
          feedback: feedback.emotional
        }
      },
      recommendations: recommendations.slice(0, 3)
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