import { useEffect } from 'react'

const ORIGIN = 'https://getfixfy.com'

function setMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Título, descrição, canonical e Open Graph de cada página B2C. */
export function usePageMeta({ title, description, path = '/', image = '/b2c/img/hero.webp', noindex = false }) {
  useEffect(() => {
    const prevTitle = document.title
    if (title) document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', `${ORIGIN}${path}`)
    setMeta('property', 'og:image', `${ORIGIN}${image}`)
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow')
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `${ORIGIN}${path === '/' ? '' : path}`)
    return () => {
      document.title = prevTitle
    }
  }, [title, description, path, image, noindex])
}
