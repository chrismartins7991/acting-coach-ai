
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";
import { CoachPreferences } from "./types.ts";

export async function analyzeFrameWithGemini(
  frame: string,
  position: string,
  preferences: CoachPreferences,
  model: any
): Promise<any> {
  const coachMethod = preferences.selectedCoach.toLowerCase();
  
  // Create a focused analysis prompt based on the selected coach's methodology
  const methodologyPrompts: { [key: string]: string } = {
    strasberg: "Analyze the emotional truth and sense memory application",
    meisner: "Focus on authenticity of reaction and emotional availability",
    stanislavski: "Evaluate physical actions and character objectives",
    chekhov: "Assess psychological gesture and archetypal expression",
    brecht: "Analyze social gestures and alienation effects"
  };

  const focusPrompt = Object.entries(preferences.focusAreas)
    .filter(([_, enabled]) => enabled)
    .map(([area]) => {
      switch(area) {
        case 'emotionInVoice': return 'emotional expression and vocal quality';
        case 'voiceExpressiveness': return 'voice dynamics and range';
        case 'physicalPresence': return 'physical presence and stage command';
        case 'faceExpressions': return 'facial expressiveness and emotional conveyance';
        case 'clearnessOfDiction': return 'clarity of speech and articulation';
        default: return '';
      }
    })
    .filter(area => area)
    .join(', ');

  const prompt = `As an expert acting coach using the ${preferences.selectedCoach} method, analyze this performance frame.
    ${methodologyPrompts[coachMethod] || ''}
    
    Focus on: ${focusPrompt}
    
    Provide a detailed analysis in this exact JSON format:
    {
      "emotionalRange": {
        "score": <number 0-100>,
        "feedback": "<specific feedback using ${preferences.selectedCoach}'s method>"
      },
      "physicalPresence": {
        "score": <number 0-100>,
        "feedback": "<detailed observations on physical presence>"
      },
      "characterEmbodiment": {
        "score": <number 0-100>,
        "feedback": "<specific character embodiment analysis>"
      }
    }

    Be specific and constructive in your feedback, using terminology from ${preferences.selectedCoach}'s methodology.`;

  try {
    console.log(`Analyzing frame at ${position} with ${preferences.selectedCoach}'s method`);
    
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
    
    console.log(`Analysis response for ${position} frame:`, responseText);
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No valid JSON found in response for frame at ${position}`);
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate the analysis structure
    if (!analysis.emotionalRange?.score || 
        !analysis.physicalPresence?.score || 
        !analysis.characterEmbodiment?.score) {
      throw new Error('Invalid analysis structure');
    }

    return analysis;
  } catch (error) {
    console.error(`Error analyzing frame at ${position}:`, error);
    
    // Provide more informative feedback even in error cases
    const methodologyFeedback = {
      strasberg: "Focus on emotional memory exercises",
      meisner: "Practice repetition exercises for authenticity",
      stanislavski: "Work on character objectives and actions",
      chekhov: "Develop psychological gesture work",
      brecht: "Explore social gesture exercises"
    };

    return {
      emotionalRange: { 
        score: 60,
        feedback: `Could not fully analyze emotional range. ${methodologyFeedback[coachMethod]}.`
      },
      physicalPresence: { 
        score: 60,
        feedback: `Physical presence analysis incomplete. Consider recording in better lighting and with clear full-body visibility.`
      },
      characterEmbodiment: { 
        score: 60,
        feedback: `Character embodiment assessment limited. Try another take with more distinct character choices.`
      }
    };
  }
}
