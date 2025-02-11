
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import posthog from 'posthog-js'
import { supabase } from "@/integrations/supabase/client"

// Initialize PostHog
posthog.init('phc_F0aCwVpM2hdUxcy7g2PBVJFbJlmaZZaQ61qMPkzHvEu', {
  api_host: 'https://eu.i.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: true,
  persistence: 'localStorage',
  sanitize_properties: (props) => {
    // Remove any sensitive information from the properties
    const { $current_url, $referrer, ...sanitizedProps } = props
    return sanitizedProps
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
