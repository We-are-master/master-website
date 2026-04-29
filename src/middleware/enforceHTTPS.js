// Redirects HTTP → HTTPS (non-local only). Kept out of .jsx for React Fast Refresh.

export function enforceHTTPS() {
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'http:' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    window.location.replace(window.location.href.replace('http:', 'https:'))
  }
}

if (typeof window !== 'undefined') {
  enforceHTTPS()
}
