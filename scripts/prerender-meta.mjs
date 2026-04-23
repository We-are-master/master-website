#!/usr/bin/env node
// Post-build step: for every known static route, produce a dedicated
// {route}/index.html with the right <title>, meta tags, Open Graph,
// Twitter Card, canonical, hreflang, geo and JSON-LD baked into <head>.
//
// We keep the body identical to the base SPA shell — React hydrates on top.
// This is not full SSG, but it is enough for every social scraper
// (LinkedIn, Twitter, Slack, Discord) and every search engine that
// doesn't execute JS (Bing is only partially reliable, so this helps).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { readdirSync } from 'node:fs'

const ROOT = resolve(fileURLToPath(import.meta.url), '../..')
const DIST = join(ROOT, 'dist')

const SITE = {
  url: 'https://getfixfy.com',
  name: 'Fixfy',
  legalName: 'Fixfy Ltd',
  locale: 'en_GB',
  lang: 'en-GB',
  twitter: '@getfixfy',
  logo: '/brand/fixfy-primary-white.png',
}

const STATIC_PAGES = {
  '/': {
    title: 'Fixfy — Maintenance infrastructure for British business',
    description: 'One calm place for facilities teams, property owners and 3,400+ vetted tradespeople. Free to list. No ticket fees. Ever.',
    keywords: 'facilities management UK, commercial maintenance, SLA tracking, asset register, compliance, Gas Safe, NICEIC, EICR',
    ogType: 'website',
  },
  '/platform': {
    title: 'Platform — Fixfy',
    description: 'Jobs & SLAs, asset register, supplier network and compliance. Four modules, one ledger — the operating system for commercial maintenance.',
    keywords: 'CAFM, facilities management software, work order platform, compliance platform, asset register',
    ogType: 'website',
  },
  '/for-fms': {
    title: 'For facilities managers — Fixfy',
    description: "Multi-site visibility, SLA tracking, and a supplier network your finance team will actually sign off.",
    ogType: 'website',
  },
  '/for-owners': {
    title: 'For property owners — Fixfy',
    description: 'Portfolio-level spend, compliance and asset condition. White-label for your tenants if you want.',
    ogType: 'website',
  },
  '/for-trades': {
    title: 'For tradespeople — Fixfy',
    description: 'No commission. No marketplace fees. Transparent rate cards. 98.4% of invoices paid within a week.',
    ogType: 'website',
  },
  '/customers': {
    title: 'Customers — Fixfy',
    description: "How Britain's estates run on Fixfy. Case studies from retail, healthcare, co-working and listed estates.",
    ogType: 'website',
  },
  '/trust': {
    title: 'Trust & security — Fixfy',
    description: 'SOC 2 Type II, ISO 27001, Cyber Essentials Plus, GDPR. UK data residency and a security contact who picks up the phone.',
    ogType: 'website',
  },
  '/about': {
    title: 'About — Fixfy',
    description: 'Fixfy is the maintenance infrastructure for British business. Built in Bristol, UK-only, free to list — forever.',
    ogType: 'website',
  },
  '/contact': {
    title: 'Contact — Fixfy',
    description: "Book a 30-minute demo. We'll load three of your sites into a sandbox so you can see exactly what your team would use on day one.",
    ogType: 'website',
  },
  '/blog': {
    title: 'Field notes — Fixfy',
    description: 'Practitioner writing on commercial maintenance, compliance and the UK facilities trade. Research, playbooks and essays from the Fixfy team.',
    keywords: 'facilities management blog, UK commercial maintenance, fire door compliance, FM playbook, CAFM alternatives',
    ogType: 'website',
  },
}

function loadPosts() {
  const dir = join(ROOT, 'src/content/blog')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = readFileSync(join(dir, f), 'utf8')
      const { data } = matter(raw)
      const slug = data.slug || f.replace(/\.md$/, '')
      const iso = data.date instanceof Date
        ? data.date.toISOString()
        : (data.date ? new Date(data.date).toISOString() : new Date().toISOString())
      return {
        path: `/blog/${slug}`,
        title: `${data.title} — Fixfy`,
        description: data.seoDescription || data.excerpt || '',
        keywords: (data.tags || []).join(', '),
        ogType: 'article',
        article: {
          publishedTime: iso,
          section: (data.tags || [])[0],
          tags: data.tags || [],
        },
        slug,
        rawTitle: data.title,
        rawDescription: data.seoDescription || data.excerpt || '',
      }
    })
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildHead(route, meta, posts) {
  const url = `${SITE.url}${route === '/' ? '' : route}`
  const absImage = `${SITE.url}${SITE.logo}`
  const tags = []

  tags.push(`<title>${esc(meta.title)}</title>`)
  tags.push(`<meta name="description" content="${esc(meta.description)}"/>`)
  if (meta.keywords) tags.push(`<meta name="keywords" content="${esc(meta.keywords)}"/>`)
  tags.push(`<meta name="author" content="${SITE.legalName}"/>`)
  tags.push(`<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"/>`)
  tags.push(`<meta name="googlebot" content="index, follow"/>`)

  // Geo / UK
  tags.push(`<meta name="geo.region" content="GB"/>`)
  tags.push(`<meta name="geo.placename" content="Bristol"/>`)
  tags.push(`<meta name="geo.position" content="51.4545;-2.5879"/>`)
  tags.push(`<meta name="ICBM" content="51.4545, -2.5879"/>`)
  tags.push(`<meta name="distribution" content="UK"/>`)
  tags.push(`<meta name="coverage" content="United Kingdom"/>`)

  // Open Graph
  tags.push(`<meta property="og:title" content="${esc(meta.title)}"/>`)
  tags.push(`<meta property="og:description" content="${esc(meta.description)}"/>`)
  tags.push(`<meta property="og:image" content="${absImage}"/>`)
  tags.push(`<meta property="og:image:alt" content="${esc(SITE.name + ' — ' + meta.title)}"/>`)
  tags.push(`<meta property="og:url" content="${url}"/>`)
  tags.push(`<meta property="og:type" content="${meta.ogType || 'website'}"/>`)
  tags.push(`<meta property="og:site_name" content="${SITE.name}"/>`)
  tags.push(`<meta property="og:locale" content="${SITE.locale}"/>`)

  if (meta.ogType === 'article' && meta.article) {
    if (meta.article.publishedTime) tags.push(`<meta property="article:published_time" content="${meta.article.publishedTime}"/>`)
    if (meta.article.section)       tags.push(`<meta property="article:section" content="${esc(meta.article.section)}"/>`)
    ;(meta.article.tags || []).forEach((t) => tags.push(`<meta property="article:tag" content="${esc(t)}"/>`))
  }

  // Twitter
  tags.push(`<meta name="twitter:card" content="summary_large_image"/>`)
  tags.push(`<meta name="twitter:site" content="${SITE.twitter}"/>`)
  tags.push(`<meta name="twitter:creator" content="${SITE.twitter}"/>`)
  tags.push(`<meta name="twitter:title" content="${esc(meta.title)}"/>`)
  tags.push(`<meta name="twitter:description" content="${esc(meta.description)}"/>`)
  tags.push(`<meta name="twitter:image" content="${absImage}"/>`)

  // Canonical + hreflang
  tags.push(`<link rel="canonical" href="${url}"/>`)
  tags.push(`<link rel="alternate" hreflang="en-GB" href="${url}"/>`)
  tags.push(`<link rel="alternate" hreflang="x-default" href="${url}"/>`)

  // RSS discovery on blog
  if (route === '/blog' || route.startsWith('/blog/')) {
    tags.push(`<link rel="alternate" type="application/rss+xml" title="Fixfy — Field notes" href="${SITE.url}/blog/rss.xml"/>`)
  }

  // JSON-LD — WebSite + Organization always
  const jsonlds = []
  jsonlds.push({
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
  })
  jsonlds.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: { '@type': 'ImageObject', url: absImage },
    email: 'hello@getfixfy.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bristol',
      addressRegion: 'Bristol',
      addressCountry: 'GB',
    },
    areaServed: { '@type': 'Country', name: 'United Kingdom' },
    sameAs: ['https://www.linkedin.com/company/getfixfy'],
  })

  // Route-specific JSON-LD
  if (route === '/blog') {
    jsonlds.push({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${SITE.url}/blog`,
      name: 'Fixfy — Field notes',
      description: meta.description,
      url: `${SITE.url}/blog`,
      inLanguage: SITE.lang,
      publisher: { '@id': `${SITE.url}#organization` },
      blogPost: posts.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.rawTitle,
        url: `${SITE.url}${p.path}`,
        datePublished: p.article.publishedTime,
        author: { '@type': 'Organization', name: SITE.name, '@id': `${SITE.url}#organization` },
      })),
    })
  }
  if (route.startsWith('/blog/') && route !== '/blog') {
    jsonlds.push({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: meta.rawTitle,
      datePublished: meta.article.publishedTime,
      dateModified: meta.article.publishedTime,
      description: meta.rawDescription,
      author: { '@type': 'Organization', name: SITE.name, '@id': `${SITE.url}#organization` },
      publisher: { '@id': `${SITE.url}#organization` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      inLanguage: SITE.lang,
      articleSection: meta.article.section,
      keywords: (meta.article.tags || []).join(', '),
      image: absImage,
    })
    jsonlds.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Field notes', item: `${SITE.url}/blog` },
        { '@type': 'ListItem', position: 3, name: meta.rawTitle, item: url },
      ],
    })
  }

  jsonlds.forEach((data) => {
    tags.push(`<script type="application/ld+json">${JSON.stringify(data)}</script>`)
  })

  return tags.join('\n    ')
}

function rewriteHtml(baseHtml, head) {
  // Strip the existing <title> so we don't end up with two
  let html = baseHtml.replace(/<title>[\s\S]*?<\/title>/, '')

  // Strip existing canonical / description meta we had hardcoded (they're stale at per-route level)
  html = html.replace(/<meta name="description"[^>]*>/, '')
  html = html.replace(/<meta name="keywords"[^>]*>/, '')
  html = html.replace(/<meta name="author"[^>]*>/, '')
  html = html.replace(/<link rel="canonical"[^>]*>/, '')

  // Inject our full head just before </head>
  return html.replace('</head>', `    ${head}\n  </head>`)
}

if (!existsSync(DIST)) {
  console.error('[prerender-meta] dist/ not found — run vite build first')
  process.exit(1)
}

const baseHtml = readFileSync(join(DIST, 'index.html'), 'utf8')
const posts = loadPosts()

let wrote = 0

// Static routes
for (const [route, meta] of Object.entries(STATIC_PAGES)) {
  const head = buildHead(route, meta, posts)
  const html = rewriteHtml(baseHtml, head)
  let outPath
  if (route === '/') {
    outPath = join(DIST, 'index.html')
  } else {
    const dir = join(DIST, route.replace(/^\//, ''))
    mkdirSync(dir, { recursive: true })
    outPath = join(dir, 'index.html')
  }
  writeFileSync(outPath, html, 'utf8')
  wrote++
}

// Blog post routes
for (const p of posts) {
  const meta = {
    title: p.title,
    description: p.description,
    keywords: p.keywords,
    ogType: 'article',
    article: p.article,
    rawTitle: p.rawTitle,
    rawDescription: p.rawDescription,
    authorName: p.authorName,
    authorRole: p.authorRole,
  }
  const head = buildHead(p.path, meta, posts)
  const html = rewriteHtml(baseHtml, head)
  const dir = join(DIST, p.path.replace(/^\//, ''))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html, 'utf8')
  wrote++
}

console.log(`[prerender-meta] wrote ${wrote} per-route HTML snapshots`)
