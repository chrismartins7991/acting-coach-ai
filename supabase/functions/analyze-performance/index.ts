
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log("Received request data:", {
      hasVideoUrl: !!requestData.videoUrl,
      hasFrames: !!requestData.frames,
      framesCount: requestData.frames?.length,
      hasCoachPreferences: !!requestData.coachPreferences,
      coachPreferences: requestData.coachPreferences
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
    
    // Take a smaller sample of frames for analysis
    const frameIndices = [0, Math.floor(requestData.frames.length / 2), requestData.frames.length - 1];
    const selectedFrames = frameIndices.map(i => requestData.frames[i]);
    
    // Create prompt based on user preferences
    const focusPrompt = Object.entries(preferences.focusAreas)
      .filter(([_, enabled]) => enabled)
      .map(([area]) => {
        switch(area) {
          case 'emotionInVoice': return 'emotional expression in voice';
          case 'voiceExpressiveness': return 'voice dynamics and range';
          case 'physicalPresence': return 'physical presence and body language';
          case 'faceExpressions': return 'facial expressions and emotional conveyance';
          case 'clearnessOfDiction': return 'clarity of speech and diction';
          default: return '';
        }
      })
      .filter(area => area)
      .join(', ');
    
    // Analyze frames in parallel
    const framePromises = selectedFrames.map(async (frame: string, index: number) => {
      const position = ['beginning', 'middle', 'end'][index];
      console.log(`Analyzing frame at ${position}...`);
      
      const prompt = `You are an acting coach using the ${preferences.selectedCoach} method analyzing a frame from a performance.
      Focus specifically on these aspects: ${focusPrompt}.
      
      Return a strict JSON object with this format:
      {
        "emotionalRange": { "score": <number 0-100>, "feedback": "<specific feedback based on ${preferences.selectedCoach} method>" },
        "physicalPresence": { "score": <number 0-100>, "feedback": "<specific feedback based on ${preferences.selectedCoach} method>" },
        "characterEmbodiment": { "score": <number 0-100>, "feedback": "<specific feedback based on ${preferences.selectedCoach} method>" }
      }`;

      try {
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
        return {
          emotionalRange: { score: 70, feedback: `Unable to analyze emotional range in frame ${position}.` },
          physicalPresence: { score: 70, feedback: `Unable to analyze physical presence in frame ${position}.` },
          characterEmbodiment: { score: 70, feedback: `Unable to analyze character embodiment in frame ${position}.` }
        };
      }
    });

    const frameAnalyses = await Promise.all(framePromises);
    console.log("Frame analyses completed:", frameAnalyses);

    // Coach-specific exercises based on method and preferences
    const methodSpecificExercises = {
      strasberg: [
        "Sensory Memory Exercise: Recall a specific emotional memory",
        "Animal Exercise: Embody an animal's movements",
        "Private Moment Exercise: Practice being uninhibited"
      ],
      stanislavski: [
        "Given Circumstances: Write detailed backstory",
        "Magic If Exercise: Explore character motivation",
        "Physical Action Exercise: Break down scene actions"
      ],
      meisner: [
        "Repetition Exercise: Practice with a partner",
        "Independent Activity: Perform while delivering lines",
        "Emotional Preparation: Use personal experiences"
      ],
      chekhov: [
        "Psychological Gesture: Create character's core gesture",
        "Atmosphere Exercise: Work with imaginary atmospheres",
        "Imaginary Body Exercise: Transform physicality"
      ],
      brecht: [
        "Gestus Exercise: Develop social gestures",
        "Alienation Exercise: Step out of character",
        "Contradiction Exercise: Show opposing elements"
      ]
    };

    // Aggregate analyses with focus on selected preferences
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
            analysis: `Analysis based on ${preferences.selectedCoach}'s methodology, focusing on ${focusPrompt}.`,
            exercises: methodSpecificExercises[preferences.selectedCoach.toLowerCase()] || [],
          }
        },
        synthesis: `Performance analyzed through ${preferences.selectedCoach}'s methodology, focusing on ${focusPrompt}.`,
        overallRecommendations: [
          `Focus on ${frameAnalyses[1]?.emotionalRange.score < 80 ? 'emotional depth' : 'maintaining emotional authenticity'}`,
          `Work on ${frameAnalyses[1]?.physicalPresence.score < 80 ? 'physical presence' : 'advanced movement techniques'}`,
          `Develop ${frameAnalyses[1]?.characterEmbodiment.score < 80 ? 'character work' : 'character subtleties'}`
        ]
      },
      recommendations: [
        `Focus on ${frameAnalyses[1]?.emotionalRange.score < 80 ? 'emotional depth' : 'maintaining emotional authenticity'}`,
        `Work on ${frameAnalyses[1]?.physicalPresence.score < 80 ? 'physical presence' : 'advanced movement techniques'}`,
        `Develop ${frameAnalyses[1]?.characterEmbodiment.score < 80 ? 'character work' : 'character subtleties'}`
      ]
    };

    console.log("Sending aggregated analysis:", aggregatedAnalysis);

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

