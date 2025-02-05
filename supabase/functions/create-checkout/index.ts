
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

    console.log('Using Stripe key starting with:', stripeKey.substring(0, 8));

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

    // Get current user usage data
    const { data: usages, error: usageError } = await supabaseClient
      .from('user_usage')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (usageError) {
      console.error('Usage error:', usageError);
      throw new Error('Error fetching user usage');
    }

    let customerId = usages?.stripe_customer_id;
    let customer;

    // Try to retrieve or create customer
    if (customerId) {
      try {
        // Attempt to retrieve existing customer
        customer = await stripe.customers.retrieve(customerId);
        console.log('Retrieved existing customer:', customerId);
      } catch (error) {
        if (error.code === 'resource_missing' && error.param === 'customer') {
          console.log('Customer exists in different mode, creating new test customer');
          customerId = null; // Reset customer ID to create new one
        } else {
          throw error; // Re-throw if it's a different error
        }
      }
    }

    // Create new customer if needed
    if (!customerId) {
      console.log('Creating new Stripe customer for user:', userId);
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;

      // Update user_usage with the new customer ID
      const { error: updateError } = await supabaseClient
        .from('user_usage')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Error updating user usage with customer ID');
      }
      console.log('Updated user_usage with new customer ID:', customerId);
    }

    // Verify price ID exists
    try {
      const price = await stripe.prices.retrieve(priceId);
      console.log('Price found:', price.id);
    } catch (error) {
      console.error('Price verification error:', error);
      throw new Error(`Invalid price ID: ${priceId}`);
    }

    // Determine if this is a one-time payment or subscription
    const mode = priceId === 'price_1QomrhGW0eRF7KXGL1h0XbPR' ? 'payment' : 'subscription';
    console.log('Creating checkout session with mode:', mode);

    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: mode,
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
    } catch (stripeError) {
      console.error('Stripe checkout error:', stripeError);
      return new Response(JSON.stringify({ error: stripeError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
