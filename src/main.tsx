
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import posthog from 'posthog-js'
import { supabase } from "@/integrations/supabase/client"

declare global {
  interface Window {
    posthog?: typeof posthog;
  }
}

// Initialize PostHog with error handling
try {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_F0aCwVpM2hdUxcy7g2PBVJFbJlmaZZaQ61qMPkzHvEu', {
    api_host: 'https://eu.i.posthog.com',
    loaded: (posthog) => {
      console.log('PostHog loaded successfully');
    },
    persistence: 'localStorage',
    bootstrap: {
      distinctID: 'anonymous',
      isIdentified: false
    },
    autocapture: false,
    capture_pageview: false,
    sanitize_properties: (props) => {
      const { $current_url, $referrer, ...sanitizedProps } = props
      return sanitizedProps
    },
    xhr_headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    request_timeout: 10000,
    api_method: 'POST' // Explicitly set the API method to POST
  })
} catch (error) {
  console.warn('PostHog initialization failed:', error)
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
