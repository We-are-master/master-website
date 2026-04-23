import { useEffect } from 'react'

/**
 * Hard-redirects the browser to an external URL on mount. Used for routes
 * that moved off this app (e.g. the portal lives at portal.getfixfy.com).
 */
export default function ExternalRedirect({ to }) {
  useEffect(() => {
    window.location.replace(to)
  }, [to])
  return null
}
