import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Lazy load toastify CSS
const loadToastifyCSS = () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@10/dist/ReactToastify.min.css'
  document.head.appendChild(link)
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
