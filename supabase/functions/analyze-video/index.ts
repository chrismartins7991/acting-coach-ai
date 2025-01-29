import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoUrl, userId } = await req.json()

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's coach preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_coach_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (preferencesError) {
      throw new Error('Failed to get user preferences')
    }

    // Include coach preferences in the analysis request
    const analysisParams = {
      videoUrl,
      coachPreferences: {
        selectedCoach: preferences.selected_coach,
        focusAreas: {
          emotionInVoice: preferences.emotion_in_voice,
          voiceExpressiveness: preferences.voice_expressiveness,
          physicalPresence: preferences.physical_presence,
          faceExpressions: preferences.face_expressions,
          clearnessOfDiction: preferences.clearness_of_diction,
        }
      }
    }

    // Call your existing analysis logic here with the updated parameters
    // ... (analysis logic)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
