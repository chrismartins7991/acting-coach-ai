
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import posthog from 'posthog-js'

// Initialize PostHog
posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
