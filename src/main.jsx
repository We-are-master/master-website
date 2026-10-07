import './middleware/enforceHTTPS.js'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { aplicarTabela } from './b2c/content/tabela-ao-vivo.js'
import './styles/fixfy-tokens.css'
import './styles/fixfy-logo.css'
import './styles/fixfy-site-v2/colors_and_type.css'
import './styles/fixfy-site-v2/site-v2.css'
import './styles/fixfy-site-v2/site-v2-phase3.css'
import './styles/fixfy-site-v2/site-v2-platform.css'
import './styles/fixfy-site-v2/home-cinematic.css'
import './styles/fixfy-site-v2/home-cinematic-2.css'
import './styles/fixfy-site-v2/solutions-cinematic.css'
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

/**
 * Tabela de preço do OS antes do primeiro render: o servidor cobra por ela,
 * então a página tem que mostrar a mesma. Espera no máximo 1,5s; 204, erro ou
 * documento inválido = segue com a tabela embutida em pricing.js.
 */
async function carregarTabela() {
  const controle = typeof AbortController !== 'undefined' ? new AbortController() : null
  let timer
  const limite = new Promise((resolve) => {
    timer = setTimeout(() => {
      controle?.abort()
      resolve(null)
    }, 1500)
  })
  const busca = fetch('/api/b2c/tabela', { signal: controle?.signal, headers: { Accept: 'application/json' } })
    .then((res) => (res.status === 200 ? res.json() : null))
    .catch(() => null)
  try {
    const corpo = await Promise.race([busca, limite])
    if (corpo?.documento) {
      const r = aplicarTabela(corpo.documento, corpo.versao ?? null)
      if (!r.ok) console.warn('[tabela] documento do OS inválido, usando a tabela embutida:', r.erro)
    }
  } catch {
    // Qualquer falha: tabela embutida.
  } finally {
    clearTimeout(timer)
  }
}

// App só é importado depois da tabela: módulos que leem preço na carga
// (copy.js, guides.js) já nascem com os números do OS.
carregarTabela()
  .then(() => import('./App.jsx'))
  .then(({ default: App }) => {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })
