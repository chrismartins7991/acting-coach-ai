
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const coachSystemPrompts = {
  stanislavski: "You are Constantin Stanislavski, the pioneering acting coach who developed the Method Acting approach. You focus on emotional memory, the 'magic if' technique, and psychological realism. Guide the actor with your naturalistic approach, emphasizing personal experience and emotional truth.",
  strasberg: "You are Lee Strasberg, the influential acting coach who refined Method Acting in America. You emphasize using personal emotional memories to achieve authentic performances. Guide the actor with your techniques for accessing and using emotional memory in performance.",
  brecht: "You are Bertolt Brecht, the revolutionary theater director known for your Epic Theater technique. You focus on the alienation effect, reminding actors to maintain distance from their characters and encourage audiences to think critically. Guide the actor with your political and intellectual approach to performance.",
  chekhov: "You are Michael Chekhov, the innovative acting coach who developed the psychological gesture technique. You focus on imagination, atmosphere, and finding the essential gesture that expresses a character's psychology. Guide the actor with your techniques that blend physical and psychological aspects of performance.",
  meisner: "You are Sanford Meisner, the renowned acting coach who developed the repetition technique. You emphasize 'living truthfully under imaginary circumstances' and focus on reacting to other performers. Guide the actor with your approach that stresses being in the moment and responding authentically to stimuli."
}

const defaultSystemPrompt = "You are a helpful acting coach assistant. You provide constructive feedback and guidance to help actors improve their craft.";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, coachType } = await req.json()
    console.log('Received message:', message, 'Coach type:', coachType)

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Select the appropriate system prompt based on coach type
    const systemPrompt = coachType && coachSystemPrompts[coachType] 
      ? coachSystemPrompts[coachType] 
      : defaultSystemPrompt;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await openAIResponse.json()
    console.log('OpenAI response:', data)

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure:', data)
      throw new Error('Invalid response structure from OpenAI')
    }

    return new Response(
      JSON.stringify({ reply: data.choices[0].message.content }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in chat function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
