import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createSystemPrompt, parseAnalysis } from "./utils.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl } = await req.json();
    console.log("Received video URL:", videoUrl);

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!videoUrl) {
      throw new Error('No video URL provided');
    }

    // For now, we'll simulate an analysis since we can't process video directly
    // In a production environment, you'd want to:
    // 1. Extract frames from the video
    // 2. Analyze key frames
    // 3. Combine the analysis
    const mockAnalysis = {
      overallScore: 75,
      categories: {
        delivery: {
          score: 80,
          feedback: "Good vocal projection and clear articulation. Pace could be more varied for dramatic effect."
        },
        presence: {
          score: 70,
          feedback: "Strong stage presence with good use of space. Could improve on maintaining consistent eye contact."
        },
        emotionalRange: {
          score: 75,
          feedback: "Demonstrated good emotional depth. Could explore more subtle variations in emotional transitions."
        }
      },
      recommendations: [
        "Practice varying vocal pace and tone for more dynamic delivery",
        "Work on maintaining consistent eye contact with the camera/audience",
        "Explore more subtle emotional transitions between scenes"
      ],
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(mockAnalysis),
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