
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import posthog from 'posthog-js'

export function PostHogPageTracker() {
  const location = useLocation()

  useEffect(() => {
    const url = window.origin + location.pathname
    posthog.capture('$pageview', {
      '$current_url': url
    })
  }, [location])

  return null
}
