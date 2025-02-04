
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
    console.log("Received request for video analysis:", { videoUrl, userId })

    if (!videoUrl || !userId) {
      throw new Error('Video URL and user ID are required')
    }

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
      console.error("Error fetching preferences:", preferencesError)
      throw new Error('Failed to get user preferences')
    }

    // Create a new performance record
    const { data: performance, error: performanceError } = await supabase
      .from('performances')
      .insert({
        user_id: userId,
        title: 'Performance ' + new Date().toLocaleDateString(),
        video_url: videoUrl,
        status: 'processing'
      })
      .select()
      .single()

    if (performanceError) {
      console.error("Error creating performance record:", performanceError)
      throw new Error('Failed to create performance record')
    }

    // Include coach preferences in the analysis request
    const analysisParams = {
      videoUrl,
      performanceId: performance.id,
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

    console.log("Analysis parameters:", analysisParams)

    // Call analyze-performance function
    const { data: analysis, error: analysisError } = await supabase.functions
      .invoke('analyze-performance', {
        body: analysisParams
      })

    if (analysisError) {
      console.error("Error in performance analysis:", analysisError)
      
      // Update performance status to error
      await supabase
        .from('performances')
        .update({ status: 'error' })
        .eq('id', performance.id)

      throw analysisError
    }

    // Save analysis results
    const { error: saveError } = await supabase
      .from('performance_analysis')
      .insert({
        performance_id: performance.id,
        overall_score: analysis.overallScore,
        ai_feedback: analysis,
      })

    if (saveError) {
      console.error("Error saving analysis:", saveError)
      throw new Error('Failed to save analysis results')
    }

    // Update performance status to completed
    await supabase
      .from('performances')
      .update({ status: 'completed' })
      .eq('id', performance.id)

    // Increment user's performance count
    await supabase.rpc('increment_performance_count', { user_id: userId })

    console.log("Analysis completed successfully")

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  } catch (error) {
    console.error("Error in analyze-video function:", error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      }
    )
  }
})
