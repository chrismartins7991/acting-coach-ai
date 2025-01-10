import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function analyzeFrameWithOpenAI(imageUrl: string, position: string) {
  console.log(`Analyzing frame at ${position} with OpenAI Vision...`);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert acting coach analyzing performance videos. Analyze this frame and provide specific feedback on: 1) Physical presence and body language 2) Facial expressions and emotional conveyance 3) Overall stage presence. Be specific and constructive."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${position} frame of the performance video, focusing on the actor's presence, expressions, and body language.`
            },
            {
              type: "image_url",
              image_url: imageUrl
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const result = await response.json();
  console.log(`Analysis received for ${position}:`, result);
  return result;
}

function aggregateAnalyses(frameAnalyses: any[]) {
  console.log("Aggregating analyses from OpenAI...");
  
  // Extract feedback and scores from OpenAI analyses
  const feedbackByCategory = {
    delivery: [],
    presence: [],
    emotionalRange: []
  };
  
  // Process each frame analysis
  frameAnalyses.forEach(analysis => {
    const content = analysis.choices[0].message.content;
    
    // Extract scores using regex (assuming OpenAI provides numerical scores)
    const presenceScore = (content.match(/presence.*?(\d+)/i)?.[1] || 70);
    const emotionalScore = (content.match(/emotional.*?(\d+)/i)?.[1] || 70);
    const deliveryScore = (content.match(/delivery.*?(\d+)/i)?.[1] || 70);
    
    feedbackByCategory.presence.push(presenceScore);
    feedbackByCategory.emotionalRange.push(emotionalScore);
    feedbackByCategory.delivery.push(deliveryScore);
  });
  
  // Calculate average scores
  const getAverageScore = (scores: number[]) => 
    Math.round(scores.reduce((a, b) => a + Number(b), 0) / scores.length);
  
  const presenceScore = getAverageScore(feedbackByCategory.presence);
  const emotionalScore = getAverageScore(feedbackByCategory.emotionalRange);
  const deliveryScore = getAverageScore(feedbackByCategory.delivery);
  
  // Extract feedback from OpenAI responses
  const openAIFeedback = frameAnalyses.map(analysis => analysis.choices[0].message.content);
  
  return {
    timestamp: new Date().toISOString(),
    overallScore: Math.round((presenceScore + emotionalScore + deliveryScore) / 3),
    categories: {
      delivery: {
        score: deliveryScore,
        feedback: generateDeliveryFeedback(openAIFeedback)
      },
      presence: {
        score: presenceScore,
        feedback: generatePresenceFeedback(openAIFeedback)
      },
      emotionalRange: {
        score: emotionalScore,
        feedback: generateEmotionalFeedback(openAIFeedback)
      }
    },
    recommendations: generateRecommendations(deliveryScore, presenceScore, emotionalScore, openAIFeedback)
  };
}

function generateDeliveryFeedback(openAIFeedback: string[]): string {
  return openAIFeedback
    .map(feedback => feedback.match(/(?:delivery|voice|speech).*?([^.]+)/i)?.[1] || '')
    .filter(Boolean)
    .join('\n');
}

function generatePresenceFeedback(openAIFeedback: string[]): string {
  return openAIFeedback
    .map(feedback => feedback.match(/(?:presence|posture|movement).*?([^.]+)/i)?.[1] || '')
    .filter(Boolean)
    .join('\n');
}

function generateEmotionalFeedback(openAIFeedback: string[]): string {
  return openAIFeedback
    .map(feedback => feedback.match(/(?:emotional|expression|feeling).*?([^.]+)/i)?.[1] || '')
    .filter(Boolean)
    .join('\n');
}

function generateRecommendations(
  deliveryScore: number,
  presenceScore: number,
  emotionalScore: number,
  openAIFeedback: string[]
): string[] {
  const recommendations = [];
  
  if (deliveryScore < 80) {
    recommendations.push("Practice vocal exercises focusing on clarity and projection");
  }
  if (presenceScore < 80) {
    recommendations.push("Work on maintaining consistent stage positioning and camera engagement");
  }
  if (emotionalScore < 80) {
    recommendations.push("Explore emotional range exercises to develop more varied expressions");
  }
  
  // Extract additional recommendations from OpenAI feedback
  const aiRecommendations = openAIFeedback
    .join(' ')
    .match(/should|could|recommend|try|practice|focus on|work on/gi);
    
  if (aiRecommendations && aiRecommendations.length > 0) {
    recommendations.push(...aiRecommendations.slice(0, 2));
  }
  
  if (recommendations.length === 0) {
    recommendations.push(
      "Continue developing your unique style while maintaining current strengths",
      "Consider experimenting with more challenging performance pieces",
      "Share your techniques with other performers"
    );
  }
  
  return recommendations.slice(0, 3);
}

serve(async (req) => {
  console.log("Received request to analyze-performance function");

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const body = await req.json();
    console.log("Received request body:", body);

    const { videoUrl } = body;
    
    if (!videoUrl) {
      throw new Error('No video URL provided');
    }

    console.log("Starting video analysis process...");

    // Analyze frames with OpenAI Vision
    const framePositions = ['beginning', 'middle', 'end'];
    const frameAnalyses = await Promise.all(
      framePositions.map(position => analyzeFrameWithOpenAI(videoUrl, position))
    );
    console.log("OpenAI frame analyses completed");

    // Combine analyses
    const aggregatedAnalysis = aggregateAnalyses(frameAnalyses);
    console.log("Analysis aggregated:", aggregatedAnalysis);

    return new Response(
      JSON.stringify(aggregatedAnalysis),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );

  } catch (error) {
    console.error("Error in analyze-performance function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        details: error.stack
      }),
      { 
        status: error.message === 'Method not allowed' ? 405 : 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});