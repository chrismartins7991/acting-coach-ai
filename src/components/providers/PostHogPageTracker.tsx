
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import posthog from 'posthog-js'

export function PostHogPageTracker() {
  const location = useLocation()

  useEffect(() => {
    try {
      const url = window.origin + location.pathname
      // Ensure posthog.capture is called with the correct arguments
      posthog?.capture?.('$pageview', {
        $current_url: url,
        $host: window.location.host,
        $pathname: location.pathname,
      })
    } catch (error) {
      console.warn('Error in PostHogPageTracker:', error)
    }
  }, [location])

  return null
}
