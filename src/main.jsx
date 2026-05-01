import './middleware/enforceHTTPS.js'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/fixfy-tokens.css'
import './styles/fixfy-logo.css'
import './styles/fixfy-site-v2/colors_and_type.css'
import './styles/fixfy-site-v2/site-v2.css'
import './styles/fixfy-site-v2/site-v2-phase3.css'
import './styles/fixfy-site-v2/site-v2-platform.css'
import './index.css'
import './styles/fixfy.css'
import './styles/blog.css'

// Lazy load toastify CSS after initial render to improve FCP
const loadToastifyCSS = () => {
  // Use requestIdleCallback if available, otherwise setTimeout
  const load = () => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@10/dist/ReactToastify.min.css'
    link.media = 'print' // Load as non-render-blocking
    link.onload = () => { link.media = 'all' }
    document.head.appendChild(link)
  }
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(load, { timeout: 2000 })
  } else {
    setTimeout(load, 100)
  }
}

// Load CSS after initial render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadToastifyCSS)
} else {
  loadToastifyCSS()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
