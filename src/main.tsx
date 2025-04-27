
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import { Toaster } from '@/components/ui/toaster'
import posthog from 'posthog-js'
import { defineCustomElements } from '@ionic/pwa-elements/loader';

// Initialize PWA elements for native features
defineCustomElements(window);

// Initialize PostHog with your project API key and host URL (if available)
if (import.meta.env.VITE_POSTHOG_API_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false, // We'll handle this with our PageTracker component
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        // Don't track in development mode
        posthog.opt_out_capturing()
      }
    },
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>,
)
