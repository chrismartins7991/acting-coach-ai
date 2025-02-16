
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import posthog from 'posthog-js'
import { supabase } from "@/integrations/supabase/client"

// Initialize PostHog with error handling
try {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_F0aCwVpM2hdUxcy7g2PBVJFbJlmaZZaQ61qMPkzHvEu', {
    api_host: 'https://eu.i.posthog.com',
    loaded: (posthog) => {
      // Successfully loaded
      console.log('PostHog loaded successfully');
    },
    persistence: 'localStorage',
    bootstrap: {
      distinctId: 'anonymous',
      isIdentifiedId: false
    },
    autocapture: false, // Disable autocapture to reduce requests
    capture_pageview: false, // Disable automatic pageview capture
    sanitize_properties: (props) => {
      // Remove any sensitive information from the properties
      const { $current_url, $referrer, ...sanitizedProps } = props
      return sanitizedProps
    },
    xhr_headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    request_timeout: 10000 // 10 second timeout
  })
} catch (error) {
  console.warn('PostHog initialization failed:', error)
  // Create a mock posthog object to prevent errors
  window.posthog = {
    capture: () => Promise.resolve({ status: 1 }),
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

