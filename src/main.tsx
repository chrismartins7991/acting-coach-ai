
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import posthog from 'posthog-js'
import { supabase } from "@/integrations/supabase/client"

// Initialize PostHog with error handling
try {
  posthog.init('phc_F0aCwVpM2hdUxcy7g2PBVJFbJlmaZZaQ61qMPkzHvEu', {
    api_host: 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // Disable automatic pageview capture
    persistence: 'localStorage',
    bootstrap: {
      distinctID: 'anonymous',
      isIdentified: false
    },
    autocapture: false, // Disable autocapture to reduce requests
    loaded: (posthog) => {
      // Successfully loaded
      console.log('PostHog loaded successfully');
    },
    sanitize_properties: (props) => {
      // Remove any sensitive information from the properties
      const { $current_url, $referrer, ...sanitizedProps } = props
      return sanitizedProps
    },
    xhr_headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    request_timeout: 10000, // 10 second timeout
    opt_out_capturing_by_default: true // Only capture after explicit opt-in
  })
} catch (error) {
  console.warn('PostHog initialization failed:', error)
  // Create a mock posthog object to prevent errors
  window.posthog = {
    capture: () => {},
    identify: () => {},
    reset: () => {},
    people: {
      set: () => {}
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
