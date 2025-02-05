
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.11.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { priceId, userId, returnUrl } = await req.json()
    
    if (!priceId || !userId || !returnUrl) {
      throw new Error('Missing required parameters')
    }

    console.log("Creating checkout session with:", { priceId, userId, returnUrl })

    // Get user's email
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId)
    if (userError || !user) {
      throw new Error('User not found')
    }

    // Create or retrieve Stripe customer
    const { data: usage, error: usageError } = await supabaseClient
      .from('user_usage')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (usageError) {
      throw new Error('Error fetching user usage')
    }

    let customerId = usage?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: userId,
        },
      })
      customerId = customer.id

      // Update user_usage with the new customer ID
      await supabaseClient
        .from('user_usage')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?success=false`,
      metadata: {
        user_id: userId,
      },
      allow_promotion_codes: true,
    })

    console.log("Checkout session created:", session.id)

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
