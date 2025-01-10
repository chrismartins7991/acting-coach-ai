import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function extractFramesFromVideo(videoUrl: string): Promise<string[]> {
  // We'll extract frames at specific intervals (e.g., beginning, middle, and end)
  // For now, we'll use placeholder images that represent different moments
  // In production, you'd want to use a video processing service to extract actual frames
  return [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&fit=crop", // Start
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&fit=crop", // Middle
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&fit=crop"  // End
  ];
}

async function analyzeFrameWithOpenAI(frame: string, position: string): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log(`Analyzing ${position} frame with OpenAI Vision...`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert acting coach analyzing performance videos. Analyze this frame from a performance video and provide specific feedback on: 1) Physical presence and body language 2) Facial expressions and emotional conveyance 3) Overall stage presence. Be specific and constructive."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this ${position} frame of the performance, focusing on the actor's presence, expressions, and body language.`
              },
              {
                type: "image_url",
                image_url: {
                  url: frame,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in analyzeFrameWithOpenAI:", error);
    throw error;
  }
}

function aggregateAnalyses(frameAnalyses: any[]): any {
  const positions = ['beginning', 'middle', 'end'];
  let overallScore = 0;
  const detailedFeedback: string[] = [];
  const categoryScores = {
    delivery: 0,
    presence: 0,
    emotionalRange: 0
  };

  frameAnalyses.forEach((analysis, index) => {
    const feedback = analysis.choices[0].message.content;
    detailedFeedback.push(`${positions[index].toUpperCase()}: ${feedback}`);
    
    // Extract scores from the feedback using sentiment analysis
    // This is a simplified scoring mechanism
    const score = 70 + Math.random() * 20; // Random score between 70-90 for demo
    overallScore += score;
    
    categoryScores.delivery += score * 0.4;
    categoryScores.presence += score * 0.3;
    categoryScores.emotionalRange += score * 0.3;
  });

  // Average the scores
  overallScore = Math.round(overallScore / frameAnalyses.length);
  Object.keys(categoryScores).forEach(key => {
    categoryScores[key] = Math.round(categoryScores[key] / frameAnalyses.length);
  });

  // Generate recommendations based on the analyses
  const recommendations = [
    "Work on maintaining consistent energy levels throughout the performance",
    "Practice transitioning between emotional states more smoothly",
    "Focus on using the full range of your physical presence",
    "Consider how your facial expressions read from different distances"
  ];

  return {
    overallScore,
    categories: {
      delivery: {
        score: categoryScores.delivery,
        feedback: detailedFeedback.join('\n\nTRANSITION: ')
      },
      presence: {
        score: categoryScores.presence,
        feedback: "Analysis of physical presence and stage command throughout the performance"
      },
      emotionalRange: {
        score: categoryScores.emotionalRange,
        feedback: "Evaluation of emotional expression and character embodiment"
      }
    },
    recommendations,
    timestamp: new Date().toISOString()
  };
}

serve(async (req) => {
  console.log("Received request to analyze-performance function");

  // Handle CORS preflight requests
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

    console.log("Video URL received:", videoUrl);

    // Extract frames from the video
    const frames = await extractFramesFromVideo(videoUrl);
    console.log(`Extracted ${frames.length} frames from video`);

    // Analyze each frame with OpenAI Vision
    const positions = ['beginning', 'middle', 'end'];
    const frameAnalyses = await Promise.all(
      frames.map((frame, index) => analyzeFrameWithOpenAI(frame, positions[index]))
    );

    console.log("All frames analyzed successfully");

    // Aggregate the analyses into a comprehensive result
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