import { FrameAnalysis } from "./types.ts";

export async function analyzeFrameWithOpenAI(imageUrl: string, position: string): Promise<FrameAnalysis> {
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