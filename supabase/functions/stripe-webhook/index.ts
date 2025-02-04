
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.11.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret!)
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        
        // Call our database function to update subscription
        const { error } = await supabaseClient.rpc('handle_subscription_updated', {
          user_id: session.metadata.user_id,
          customer: session.customer,
          subscription_id: session.subscription,
          price_id: session.line_items?.data[0]?.price?.id
        })

        if (error) {
          throw error
        }
        break
      }
      // Add other webhook events as needed
    }

    return new Response(JSON.stringify({ received: true }))
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
})
