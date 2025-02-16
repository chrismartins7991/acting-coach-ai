
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import posthog from 'posthog-js'

export function PostHogPageTracker() {
  const location = useLocation()

  useEffect(() => {
    try {
      const url = window.origin + location.pathname
      const captureResult = posthog.capture('$pageview', {
        '$current_url': url,
        '$host': window.location.host,
        '$pathname': location.pathname,
      })
      
      if (captureResult && typeof captureResult === 'object' && 'catch' in captureResult) {
        captureResult.catch(error => {
          console.warn('Failed to capture pageview:', error)
        })
      }
    } catch (error) {
      console.warn('Error in PostHogPageTracker:', error)
    }
  }, [location])

  return null
}
