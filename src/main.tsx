
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import posthog from 'posthog-js'
import { supabase } from "@/integrations/supabase/client"

// Initialize PostHog with async configuration
const initPostHog = async () => {
  try {
    const { data: secretData, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'VITE_POSTHOG_KEY')
      .single()

    if (error) {
      console.error('Error fetching PostHog key:', error)
      return
    }

    const posthogKey = secretData?.value

    if (!posthogKey) {
      console.error('PostHog key not found in secrets')
      return
    }

    posthog.init(posthogKey, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      autocapture: true,
      loaded: (posthog) => {
        if (import.meta.env.DEV) posthog.debug()
      },
      capture_pageview: true,
      persistence: 'localStorage',
      sanitize_properties: (props) => {
        // Remove any sensitive information from the properties
        const { $current_url, $referrer, ...sanitizedProps } = props
        return sanitizedProps
      }
    })
  } catch (error) {
    console.error('Error initializing PostHog:', error)
  }
}

// Initialize PostHog
initPostHog()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
