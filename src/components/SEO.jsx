import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * SEO component — emits all meta tags, Open Graph, Twitter Card, canonical,
 * hreflang, geo, and JSON-LD structured data. UK English, en-GB locale.
 *
 * All inserted tags carry data-fx-seo so we can clean them on unmount/change
 * without clobbering static tags from index.html.
 */

const SITE = {
  url: 'https://getfixfy.com',
  name: 'Fixfy',
  legalName: 'Fixfy Ltd',
  locale: 'en_GB',
  lang: 'en-GB',
  twitter: '@getfixfy',
  logo: '/brand/fixfy-primary-white.png',
  socialImage: '/brand/fixfy-primary-white.png',
}

const DEFAULT = {
  title: 'Fixfy — Maintenance infrastructure for British business',
  description: 'Fixfy is the maintenance infrastructure for UK commercial buildings. A free-first platform connecting facilities teams, property owners and 3,400+ vetted tradespeople.',
  keywords: 'facilities management, commercial maintenance, UK trades, property compliance, SLA tracking, asset register, Gas Safe, NICEIC, EICR',
}

const PAGE_SEO = {
  '/':           { title: 'Fixfy — Maintenance infrastructure for British business', description: 'One calm place for facilities teams, property owners and 3,400+ vetted tradespeople. Free to list. No ticket fees. Ever.', keywords: 'facilities management UK, commercial maintenance, SLA tracking, asset register, compliance, Gas Safe, NICEIC, EICR' },
  '/platform':   { title: 'Platform — Fixfy', description: 'Jobs & SLAs, asset register, supplier network and compliance. Four modules, one ledger — the operating system for commercial maintenance.', keywords: 'CAFM, facilities management software, work order platform, compliance platform, asset register' },
  '/for-fms':    { title: 'For facilities managers — Fixfy', description: "Multi-site visibility, SLA tracking, and a supplier network your finance team will actually sign off." },
  '/for-owners': { title: 'For property owners — Fixfy', description: 'Portfolio-level spend, compliance and asset condition. White-label for your tenants if you want.' },
  '/for-trades': { title: 'For tradespeople — Fixfy', description: 'No commission. No marketplace fees. Transparent rate cards. 98.4% of invoices paid within a week.' },
  '/customers':  { title: 'Customers — Fixfy', description: "How Britain's estates run on Fixfy. Case studies from retail, healthcare, co-working and listed estates." },
  '/trust':      { title: 'Trust & security — Fixfy', description: 'SOC 2 Type II, ISO 27001, Cyber Essentials Plus, GDPR. UK data residency and a security contact who picks up the phone.' },
  '/about':      { title: 'About — Fixfy', description: 'Fixfy is the maintenance infrastructure for British business. Built in Bristol, UK-only, free to list — forever.' },
  '/contact':    { title: 'Contact — Fixfy', description: "Book a 30-minute demo. We'll load three of your sites into a sandbox so you can see exactly what your team would use on day one." },
  '/blog':       { title: 'Field notes — Fixfy', description: 'Practitioner writing on commercial maintenance, compliance and the UK facilities trade.' },
}

export function SEO({
  title,
  description,
  keywords,
  image,
  ogType = 'website',
  noindex = false,
  structuredData,
  canonical,
  articleMeta,
}) {
  const location = useLocation()
  const path = location.pathname

  const page = PAGE_SEO[path] || {}
  const finalTitle = title || page.title || DEFAULT.title
  const finalDesc = description || page.description || DEFAULT.description
  const finalKw = keywords || page.keywords || DEFAULT.keywords
  const finalImage = image || page.image || SITE.socialImage
  const canonicalUrl = canonical || `${SITE.url}${path === '/' ? '' : path}`
  const absoluteImage = finalImage.startsWith('http')
    ? finalImage
    : `${SITE.url}${finalImage}`

  useEffect(() => {
    document.title = finalTitle

    // Clear previously-injected SEO tags
    document.querySelectorAll('[data-fx-seo]').forEach((el) => el.remove())

    const head = document.head

    const meta = (name, content, isProperty = false) => {
      if (!content) return
      const el = document.createElement('meta')
      el.setAttribute(isProperty ? 'property' : 'name', name)
      el.setAttribute('content', content)
      el.setAttribute('data-fx-seo', '1')
      head.appendChild(el)
    }

    const link = (attrs) => {
      const el = document.createElement('link')
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
      el.setAttribute('data-fx-seo', '1')
      head.appendChild(el)
    }

    // <html lang>
    document.documentElement.setAttribute('lang', SITE.lang)

    // Core
    meta('description', finalDesc)
    meta('keywords', finalKw)
    meta('author', SITE.legalName)
    meta('robots', noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    meta('googlebot', noindex ? 'noindex, nofollow' : 'index, follow')

    // Geo / UK-focused (discoverability via Bing + other engines that honour geo meta)
    meta('geo.region', 'GB')
    meta('geo.placename', 'Bristol')
    meta('geo.position', '51.4545;-2.5879')
    meta('ICBM', '51.4545, -2.5879')
    meta('distribution', 'UK')
    meta('coverage', 'United Kingdom')

    // Open Graph
    meta('og:title', finalTitle, true)
    meta('og:description', finalDesc, true)
    meta('og:image', absoluteImage, true)
    meta('og:image:alt', `${SITE.name} — ${finalTitle}`, true)
    meta('og:url', canonicalUrl, true)
    meta('og:type', ogType, true)
    meta('og:site_name', SITE.name, true)
    meta('og:locale', SITE.locale, true)

    // Article-specific OG (on blog post pages)
    if (ogType === 'article' && articleMeta) {
      if (articleMeta.publishedTime) meta('article:published_time', articleMeta.publishedTime, true)
      if (articleMeta.modifiedTime)  meta('article:modified_time',  articleMeta.modifiedTime, true)
      if (articleMeta.author)        meta('article:author', articleMeta.author, true)
      if (articleMeta.section)       meta('article:section', articleMeta.section, true)
      ;(articleMeta.tags || []).forEach((t) => meta('article:tag', t, true))
    }

    // Twitter Card
    meta('twitter:card', 'summary_large_image')
    meta('twitter:site', SITE.twitter)
    meta('twitter:creator', SITE.twitter)
    meta('twitter:title', finalTitle)
    meta('twitter:description', finalDesc)
    meta('twitter:image', absoluteImage)
    meta('twitter:image:alt', `${SITE.name} — ${finalTitle}`)

    // Canonical + hreflang
    link({ rel: 'canonical', href: canonicalUrl })
    link({ rel: 'alternate', hreflang: 'en-GB', href: canonicalUrl })
    link({ rel: 'alternate', hreflang: 'x-default', href: canonicalUrl })

    // RSS discovery on the blog
    if (path.startsWith('/blog')) {
      link({ rel: 'alternate', type: 'application/rss+xml', title: 'Fixfy — Field notes', href: `${SITE.url}/blog/rss.xml` })
    }

    // JSON-LD: WebSite (always) + Organization (always) + page-specific
    const siteJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE.url}#website`,
      url: SITE.url,
      name: SITE.name,
      inLanguage: SITE.lang,
      publisher: { '@id': `${SITE.url}#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE.url}/blog?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }

    const orgJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE.url}#organization`,
      name: SITE.name,
      legalName: SITE.legalName,
      url: SITE.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE.url}${SITE.logo}`,
      },
      email: 'hello@getfixfy.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bristol',
        addressRegion: 'Bristol',
        addressCountry: 'GB',
      },
      areaServed: { '@type': 'Country', name: 'United Kingdom' },
      sameAs: ['https://www.linkedin.com/company/getfixfy'],
    }

    const injectJsonLd = (id, data) => {
      const s = document.createElement('script')
      s.setAttribute('type', 'application/ld+json')
      s.setAttribute('data-fx-seo', '1')
      s.setAttribute('data-fx-jsonld', id)
      s.textContent = JSON.stringify(data)
      head.appendChild(s)
    }

    injectJsonLd('website', siteJsonLd)
    injectJsonLd('organization', orgJsonLd)

    if (Array.isArray(structuredData)) {
      structuredData.forEach((d, i) => injectJsonLd(`page-${i}`, d))
    } else if (structuredData) {
      injectJsonLd('page', structuredData)
    }

    return () => {
      document.querySelectorAll('[data-fx-seo]').forEach((el) => el.remove())
    }
  }, [finalTitle, finalDesc, finalKw, absoluteImage, ogType, canonicalUrl, noindex, structuredData, articleMeta, path])

  return null
}
