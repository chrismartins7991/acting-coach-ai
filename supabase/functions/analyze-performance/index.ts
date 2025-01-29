import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const requestData = await req.json();
    console.log("Received request data:", { 
      hasFrames: !!requestData.frames,
      framesCount: requestData.frames?.length 
    });

    // Validate required fields
    if (!requestData || !requestData.frames || !Array.isArray(requestData.frames)) {
      console.error("Invalid request data:", requestData);
      throw new Error('Invalid or missing frames array');
    }

    if (requestData.frames.length === 0) {
      throw new Error('No frames provided for analysis');
    }

    console.log(`Processing ${requestData.frames.length} frames...`);
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("Analyzing frames with Gemini Vision...");
    
    // Analyze each frame
    const framePositions = ['beginning', 'middle', 'end'];
    const framePromises = requestData.frames.slice(0, 3).map(async (frame: string, index: number) => {
      console.log(`Analyzing frame at ${framePositions[index]}...`);
      
      const prompt = `You are an acting coach AI analyzing a frame from a ${framePositions[index]} of an acting performance video.
      Evaluate the performance and return ONLY a JSON object in this exact format, with no additional text:
      {
        "emotionalRange": { "score": <number 0-100>, "feedback": "<specific feedback>" },
        "physicalPresence": { "score": <number 0-100>, "feedback": "<specific feedback>" },
        "characterEmbodiment": { "score": <number 0-100>, "feedback": "<specific feedback>" },
        "voiceAndDelivery": { "score": <number 0-100>, "feedback": "<estimated from visual cues>" }
      }`;

      try {
        if (!frame || typeof frame !== 'string') {
          throw new Error(`Invalid frame data at position ${index}`);
        }

        // Remove data URL prefix if present
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
        console.log(`Raw response for ${framePositions[index]}:`, responseText);

        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error(`No valid JSON found in response for frame ${index}`);
        }

        const parsedJson = JSON.parse(jsonMatch[0]);
        console.log(`Parsed analysis for ${framePositions[index]}:`, parsedJson);
        return parsedJson;
      } catch (error) {
        console.error(`Error analyzing frame ${index}:`, error);
        throw error;
      }
    });

    const frameAnalyses = await Promise.all(framePromises);
    console.log("All frame analyses completed");

    // Aggregate the analyses
    console.log("Aggregating analyses...");
    const aggregatedAnalysis = {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(
        frameAnalyses.reduce((sum, analysis) => {
          return sum + (
            analysis.emotionalRange.score +
            analysis.physicalPresence.score +
            analysis.characterEmbodiment.score +
            analysis.voiceAndDelivery.score
          ) / 4;
        }, 0) / frameAnalyses.length
      ),
      categories: {
        emotionalRange: {
          score: Math.round(
            frameAnalyses.reduce((sum, a) => sum + a.emotionalRange.score, 0) / frameAnalyses.length
          ),
          feedback: frameAnalyses[1].emotionalRange.feedback // Use middle frame feedback
        },
        physicalPresence: {
          score: Math.round(
            frameAnalyses.reduce((sum, a) => sum + a.physicalPresence.score, 0) / frameAnalyses.length
          ),
          feedback: frameAnalyses[1].physicalPresence.feedback
        },
        characterEmbodiment: {
          score: Math.round(
            frameAnalyses.reduce((sum, a) => sum + a.characterEmbodiment.score, 0) / frameAnalyses.length
          ),
          feedback: frameAnalyses[1].characterEmbodiment.feedback
        },
        voiceAndDelivery: {
          score: Math.round(
            frameAnalyses.reduce((sum, a) => sum + a.voiceAndDelivery.score, 0) / frameAnalyses.length
          ),
          feedback: frameAnalyses[1].voiceAndDelivery.feedback
        }
      },
      recommendations: [
        `Focus on ${frameAnalyses[1].emotionalRange.score < 80 ? 'improving emotional range' : 'maintaining strong emotional presence'}`,
        `Work on ${frameAnalyses[1].physicalPresence.score < 80 ? 'enhancing physical presence' : 'continuing excellent stage presence'}`,
        `Consider ${frameAnalyses[1].characterEmbodiment.score < 80 ? 'deepening character embodiment' : 'sharing your character development techniques'}`
      ]
    };

    console.log("Analysis complete:", aggregatedAnalysis);

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
        timestamp: new Date().toISOString(),
        details: error.stack
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