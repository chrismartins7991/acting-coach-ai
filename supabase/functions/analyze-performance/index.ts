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

    const systemPrompt = `You are an expert acting coach analyzing a video performance. You must provide feedback in the exact format specified, using numbers between 0-100 for scores.`;
    
    const userPrompt = `Analyze this acting performance and provide feedback in this exact format, maintaining all headers and using numbers between 0-100 for scores:

Delivery Score: [number]
Delivery Feedback: [feedback]
Presence Score: [number]
Presence Feedback: [feedback]
Emotional Range Score: [number]
Emotional Range Feedback: [feedback]
Recommendations:
1. [recommendation]
2. [recommendation]
3. [recommendation]`;

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
      console.error("RapidAPI error response status:", response.status);
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

    // Extract scores and feedback using more robust regex patterns
    const extractScore = (text: string, category: string): number => {
      const pattern = new RegExp(`${category}\\s*Score:\\s*(\\d+)`, 'i');
      const match = text.match(pattern);
      if (match && match[1]) {
        const score = parseInt(match[1]);
        return score >= 0 && score <= 100 ? score : 70;
      }
      return 70; // Default score
    };

    const extractFeedback = (text: string, category: string): string => {
      const pattern = new RegExp(`${category}\\s*Feedback:\\s*([^\\n]+)`, 'i');
      const match = text.match(pattern);
      return match?.[1]?.trim() || `${category} shows room for improvement`;
    };

    // Extract recommendations
    const recommendationsPattern = /Recommendations?:?\s*((?:(?:\d+\.|\-)\s*[^\n]+\s*)+)/i;
    const recommendationsMatch = analysisText.match(recommendationsPattern);
    let recommendations = recommendationsMatch
      ? recommendationsMatch[1]
          .split(/(?:\d+\.|\-)\s*/)
          .filter(text => text.trim())
          .map(text => text.trim())
          .slice(0, 3)
      : [
          "Focus on vocal clarity and projection",
          "Work on maintaining consistent stage presence",
          "Practice emotional range exercises"
        ];

    // Ensure we have exactly 3 recommendations
    while (recommendations.length < 3) {
      recommendations.push("Continue practicing and developing your craft");
    }
    recommendations = recommendations.slice(0, 3);

    const analysis = {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(
        (
          extractScore(analysisText, 'Delivery') +
          extractScore(analysisText, 'Presence') +
          extractScore(analysisText, 'Emotional Range')
        ) / 3
      ),
      categories: {
        delivery: {
          score: extractScore(analysisText, 'Delivery'),
          feedback: extractFeedback(analysisText, 'Delivery')
        },
        presence: {
          score: extractScore(analysisText, 'Presence'),
          feedback: extractFeedback(analysisText, 'Presence')
        },
        emotionalRange: {
          score: extractScore(analysisText, 'Emotional Range'),
          feedback: extractFeedback(analysisText, 'Emotional Range')
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