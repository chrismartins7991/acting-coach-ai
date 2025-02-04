
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const methodSpecificExercises = {
  strasberg: [
    "Sensory Memory Exercise: Recall a specific emotional memory and recreate the physical sensations",
    "Animal Exercise: Embody an animal's movements to explore physical expression",
    "Private Moment Exercise: Practice being completely uninhibited in private",
  ],
  stanislavski: [
    "Given Circumstances: Write detailed backstory for your character",
    "Magic If Exercise: Ask yourself 'What if I were in this situation?'",
    "Physical Action Exercise: Break down your scene into specific actions",
  ],
  meisner: [
    "Repetition Exercise: Practice the famous repetition technique with a partner",
    "Independent Activity: Perform a challenging task while delivering lines",
    "Emotional Preparation: Use personal experiences to prepare for scenes",
  ],
  chekhov: [
    "Psychological Gesture: Create a gesture that embodies your character's core desire",
    "Atmosphere Exercise: Practice being affected by different imaginary atmospheres",
    "Imaginary Body Exercise: Transform your physicality to match your character",
  ],
  brecht: [
    "Gestus Exercise: Develop social gestures that reveal class and status",
    "Alienation Exercise: Practice stepping out of character to comment on actions",
    "Contradiction Exercise: Show opposing elements in your character",
  ]
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log("Received request data:", {
      hasVideoUrl: !!requestData.videoUrl,
      hasFrames: !!requestData.frames,
      framesCount: requestData.frames?.length,
      hasCoachPreferences: !!requestData.coachPreferences
    });

    if (!requestData.frames || !Array.isArray(requestData.frames)) {
      throw new Error('Invalid or missing frames array');
    }

    const preferences = requestData.coachPreferences;
    if (!preferences || !preferences.selectedCoach) {
      throw new Error('Coach preferences are required');
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision-latest" });

    console.log("Analyzing frames with Gemini Vision...");
    
    // Take a smaller sample of frames for analysis (e.g., beginning, middle, and end)
    const frameIndices = [0, Math.floor(requestData.frames.length / 2), requestData.frames.length - 1];
    const selectedFrames = frameIndices.map(i => requestData.frames[i]);
    
    // Analyze frames in parallel with coach-specific context
    const framePromises = selectedFrames.map(async (frame: string, index: number) => {
      const position = ['beginning', 'middle', 'end'][index];
      console.log(`Analyzing frame at ${position}...`);
      
      try {
        const prompt = `You are an acting coach analyzing a frame from the ${position} of an acting performance.
        Focus on these visual aspects:
        ${preferences.physical_presence ? '- Physical presence and body language' : ''}
        ${preferences.face_expressions ? '- Facial expressions and emotional conveyance' : ''}
        
        Evaluate the performance and return a JSON object in this format:
        {
          "emotionalRange": { "score": <number 0-100>, "feedback": "<specific feedback>" },
          "physicalPresence": { "score": <number 0-100>, "feedback": "<specific feedback>" },
          "characterEmbodiment": { "score": <number 0-100>, "feedback": "<specific feedback>" }
        }`;

        const base64Data = frame.includes('base64,') ? frame.split('base64,')[1] : frame;

        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          },
          prompt
        ]);
        
        const response = await result.response;
        const responseText = response.text();
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error(`No valid JSON found in response for frame ${index}`);
        }

        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error(`Error analyzing frame ${index}:`, error);
        // Return default scores if analysis fails
        return {
          emotionalRange: { score: 70, feedback: "Unable to analyze emotional range in this frame." },
          physicalPresence: { score: 70, feedback: "Unable to analyze physical presence in this frame." },
          characterEmbodiment: { score: 70, feedback: "Unable to analyze character embodiment in this frame." }
        };
      }
    });

    const frameAnalyses = await Promise.all(framePromises);
    console.log("Frame analyses completed:", frameAnalyses);

    // Aggregate analyses
    const aggregatedAnalysis = {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(
        frameAnalyses.reduce((sum, analysis) => {
          return sum + (
            analysis.emotionalRange.score +
            analysis.physicalPresence.score +
            analysis.characterEmbodiment.score
          ) / 3;
        }, 0) / frameAnalyses.length
      ),
      categories: {
        emotionalRange: {
          score: Math.round(
            frameAnalyses.reduce((sum, a) => sum + a.emotionalRange.score, 0) / frameAnalyses.length
          ),
          feedback: frameAnalyses[1]?.emotionalRange.feedback || "No feedback available."
        },
        physicalPresence: {
          score: Math.round(
            frameAnalyses.reduce((sum, a) => sum + a.physicalPresence.score, 0) / frameAnalyses.length
          ),
          feedback: frameAnalyses[1]?.physicalPresence.feedback || "No feedback available."
        },
        characterEmbodiment: {
          score: Math.round(
            frameAnalyses.reduce((sum, a) => sum + a.characterEmbodiment.score, 0) / frameAnalyses.length
          ),
          feedback: frameAnalyses[1]?.characterEmbodiment.feedback || "No feedback available."
        }
      },
      methodologicalAnalysis: {
        methodologies: {
          [preferences.selectedCoach.toLowerCase()]: {
            analysis: `Analysis based on ${preferences.selectedCoach}'s methodology.`,
            exercises: methodSpecificExercises[preferences.selectedCoach.toLowerCase()] || [],
            recommendations: [
              `Focus on ${frameAnalyses[1]?.emotionalRange.score < 80 ? 'improving emotional range' : 'maintaining strong emotional presence'}`,
              `Work on ${frameAnalyses[1]?.physicalPresence.score < 80 ? 'enhancing physical presence' : 'continuing excellent stage presence'}`,
              `Consider ${frameAnalyses[1]?.characterEmbodiment.score < 80 ? 'deepening character embodiment' : 'sharing your character development techniques'}`
            ]
          }
        },
        synthesis: `Performance analyzed through ${preferences.selectedCoach}'s methodology, focusing on emotional authenticity and physical presence.`,
        overallRecommendations: [
          `Focus on ${frameAnalyses[1]?.emotionalRange.score < 80 ? 'emotional depth' : 'maintaining emotional authenticity'}`,
          `Work on ${frameAnalyses[1]?.physicalPresence.score < 80 ? 'physical presence' : 'advanced movement techniques'}`,
          `Develop ${frameAnalyses[1]?.characterEmbodiment.score < 80 ? 'character work' : 'character subtleties'}`
        ]
      }
    };

    console.log("Sending analysis response");

    return new Response(
      JSON.stringify(aggregatedAnalysis),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error("Error in analyze-performance function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
