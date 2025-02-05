
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
        console.log('Processing successful checkout:', session.id)

        // For one-time payments, update subscription info immediately
        if (session.mode === 'payment') {
          console.log('Processing one-time payment')
          const { error } = await supabaseClient.rpc('handle_subscription_updated', {
            user_id: session.metadata.user_id,
            customer: session.customer,
            subscription_id: null,
            price_id: session.line_items?.data[0]?.price?.id
          })

          if (error) {
            console.error('Error updating subscription:', error)
            throw error
          }
          console.log('Successfully processed one-time payment')
        } else {
          // For subscriptions, retrieve and process the subscription details
          console.log('Processing subscription payment')
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const { error } = await supabaseClient.rpc('handle_subscription_updated', {
            user_id: session.metadata.user_id,
            customer: session.customer,
            subscription_id: subscription.id,
            price_id: subscription.items.data[0]?.price?.id
          })

          if (error) {
            console.error('Error updating subscription:', error)
            throw error
          }
          console.log('Successfully processed subscription payment')
        }
        break
      }
      // Add other webhook events as needed
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }))
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
})
