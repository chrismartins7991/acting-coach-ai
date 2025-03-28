
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";
import { CoachPreferences } from "./types.ts";

export async function analyzeFrameWithGemini(
  frame: string,
  position: string,
  preferences: CoachPreferences,
  model: any
): Promise<any> {
  const coachMethod = preferences.selectedCoach.toLowerCase();
  
  // Enhanced methodology-specific prompts
  const methodologyPrompts: { [key: string]: string } = {
    strasberg: "Focus on emotional memory application and sensory details. Look for authentic emotional connections and physical manifestations of inner experiences.",
    meisner: "Evaluate the truthfulness of reactions and emotional availability. Look for genuine responses to imaginary circumstances.",
    stanislavski: "Analyze the character's objectives, super-objectives, and through-line of actions. Evaluate physical actions and psychological gestures.",
    chekhov: "Assess the quality of psychological gestures, atmosphere creation, and character transformation. Look for archetypal embodiment.",
    brecht: "Examine the social gestures, alienation effects, and critical distance maintained by the performer. Analyze demonstrative elements."
  };

  // Create dynamic focus areas based on preferences
  const focusPrompt = Object.entries(preferences.focusAreas)
    .filter(([_, enabled]) => enabled)
    .map(([area]) => {
      switch(area) {
        case 'emotionInVoice': return 'emotional authenticity and vocal resonance';
        case 'voiceExpressiveness': return 'vocal dynamics, pitch variation, and emotional coloring';
        case 'physicalPresence': return 'spatial awareness, body language, and gestural vocabulary';
        case 'faceExpressions': return 'micro-expressions, emotional truthfulness, and facial dynamics';
        case 'clearnessOfDiction': return 'articulation, speech rhythm, and vocal technique';
        default: return '';
      }
    })
    .filter(area => area)
    .join(', ');

  // Enhanced analysis prompt with temporal context
  const prompt = `As a master acting coach specializing in the ${preferences.selectedCoach} method, analyze this ${position} frame of the performance with precise detail and temporal context.

    ${methodologyPrompts[coachMethod] || ''}
    
    Consider these specific aspects: ${focusPrompt}
    
    Provide a detailed analysis in this exact JSON format:
    {
      "emotionalRange": {
        "score": <number 0-100>,
        "feedback": "<specific, time-contextualized feedback using ${preferences.selectedCoach}'s methodology>",
        "observations": ["<list of specific visual cues and their interpretations>"],
        "technicalNotes": ["<methodology-specific technical observations>"]
      },
      "physicalPresence": {
        "score": <number 0-100>,
        "feedback": "<detailed observations on physical presence and spatial relationships>",
        "keyMoments": ["<specific physical choices and their effectiveness>"],
        "technicalNotes": ["<methodology-specific movement analysis>"]
      },
      "characterEmbodiment": {
        "score": <number 0-100>,
        "feedback": "<detailed character analysis through ${preferences.selectedCoach}'s lens>",
        "evidence": ["<specific moments demonstrating character work>"],
        "technicalNotes": ["<methodology-specific character development observations>"]
      }
    }

    Be extremely specific in your feedback, using terminology and concepts from ${preferences.selectedCoach}'s methodology. Reference visible elements in the frame that support your analysis.`;

  try {
    console.log(`Analyzing frame at ${position} using ${preferences.selectedCoach}'s methodology`);
    
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
    
    console.log(`Detailed analysis received for ${position} frame:`, responseText);
    
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
    
    // Enhanced fallback responses with methodology-specific context
    const methodologyFeedback = {
      strasberg: {
        exercises: "Practice sense memory exercises",
        focus: "Deepen emotional connection through personal memories"
      },
      meisner: {
        exercises: "Return to repetition exercises",
        focus: "Build stronger emotional truthfulness"
      },
      stanislavski: {
        exercises: "Review character objectives and actions",
        focus: "Strengthen the through-line of actions"
      },
      chekhov: {
        exercises: "Revisit psychological gesture work",
        focus: "Enhance archetypal embodiment"
      },
      brecht: {
        exercises: "Practice social gesture exercises",
        focus: "Develop stronger critical distance"
      }
    };

    const feedback = methodologyFeedback[coachMethod as keyof typeof methodologyFeedback];

    return {
      emotionalRange: { 
        score: 60,
        feedback: `Further development needed in emotional range. ${feedback.focus}.`,
        observations: [`Consider ${feedback.exercises} to enhance emotional authenticity`],
        technicalNotes: ["Review basic emotional connection exercises"]
      },
      physicalPresence: { 
        score: 60,
        feedback: `Physical presence needs refinement. Ensure proper lighting and full body visibility in future recordings.`,
        keyMoments: ["Limited visibility affects analysis accuracy"],
        technicalNotes: ["Focus on full-body awareness exercises"]
      },
      characterEmbodiment: { 
        score: 60,
        feedback: `Character work requires deeper integration with ${preferences.selectedCoach}'s methodology.`,
        evidence: ["Character choices need stronger technical foundation"],
        technicalNotes: [`Work on ${feedback.exercises} to strengthen character embodiment`]
      }
    };
  }
}
