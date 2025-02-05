
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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('Missing STRIPE_SECRET_KEY');
      throw new Error('Stripe configuration error');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    })

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      throw new Error('Supabase configuration error');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const { priceId, userId, returnUrl } = await req.json()
    
    console.log("Processing checkout request:", { priceId, userId, returnUrl });
    
    if (!priceId || !userId || !returnUrl) {
      throw new Error('Missing required parameters');
    }

    // Get user's email
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId)
    if (userError || !user?.email) {
      console.error('User error:', userError);
      throw new Error('User not found or missing email');
    }

    console.log('Found user email:', user.email);

    // Create a new Stripe customer for test mode
    console.log('Creating new test mode Stripe customer for user:', userId);
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: userId,
      },
    });

    // Verify price ID exists
    try {
      const price = await stripe.prices.retrieve(priceId);
      console.log('Price found:', price.id);
    } catch (error) {
      console.error('Price verification error:', error);
      throw new Error(`Invalid price ID: ${priceId}`);
    }

    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?success=false`,
      metadata: {
        user_id: userId,
      },
      allow_promotion_codes: true,
    });

    console.log('Checkout session created successfully:', session.id);
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
