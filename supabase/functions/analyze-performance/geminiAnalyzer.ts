
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";
import { CoachPreferences } from "./types.ts";

export async function analyzeFrameWithGemini(
  frame: string,
  position: string,
  preferences: CoachPreferences,
  model: any
): Promise<any> {
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
      throw new Error(`No valid JSON found in response for frame at ${position}`);
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error(`Error analyzing frame at ${position}:`, error);
    return {
      emotionalRange: { score: 70, feedback: `Unable to analyze emotional range in frame at ${position}.` },
      physicalPresence: { score: 70, feedback: `Unable to analyze physical presence in frame at ${position}.` },
      characterEmbodiment: { score: 70, feedback: `Unable to analyze character embodiment in frame at ${position}.` }
    };
  }
}
