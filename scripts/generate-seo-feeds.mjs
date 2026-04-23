#!/usr/bin/env node
// Generates sitemap.xml and blog/rss.xml into dist/ after a Vite build.
// Reads src/content/blog/*.md to discover posts. Meant to be wired into
// the "build" npm script as a post-step.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const ROOT = resolve(fileURLToPath(import.meta.url), '../..')
const SITE_URL = 'https://getfixfy.com'

const STATIC_ROUTES = [
  { path: '/',           priority: 1.0, changefreq: 'weekly' },
  { path: '/platform',   priority: 0.9, changefreq: 'monthly' },
  { path: '/for-fms',    priority: 0.8, changefreq: 'monthly' },
  { path: '/for-owners', priority: 0.8, changefreq: 'monthly' },
  { path: '/for-trades', priority: 0.8, changefreq: 'monthly' },
  { path: '/customers',  priority: 0.7, changefreq: 'monthly' },
  { path: '/trust',      priority: 0.7, changefreq: 'monthly' },
  { path: '/about',      priority: 0.7, changefreq: 'monthly' },
  { path: '/contact',    priority: 0.8, changefreq: 'monthly' },
  { path: '/blog',       priority: 0.9, changefreq: 'weekly' },
]

function loadPosts() {
  const dir = join(ROOT, 'src/content/blog')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = readFileSync(join(dir, f), 'utf8')
      const { data, content } = matter(raw)
      const slug = data.slug || f.replace(/\.md$/, '')
      const iso = data.date instanceof Date
        ? data.date.toISOString()
        : (data.date ? new Date(data.date).toISOString() : new Date().toISOString())
      return {
        slug,
        title: data.title || slug,
        date: iso,
        author: 'Fixfy',
        excerpt: data.excerpt || '',
        seoDescription: data.seoDescription || data.excerpt || '',
        tags: data.tags || [],
        content,
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildSitemap(posts) {
  const now = new Date().toISOString().slice(0, 10)
  const urls = []
  for (const r of STATIC_ROUTES) {
    urls.push(`  <url>
    <loc>${SITE_URL}${r.path === '/' ? '/' : r.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
    <xhtml:link rel="alternate" hreflang="en-GB" href="${SITE_URL}${r.path === '/' ? '/' : r.path}"/>
  </url>`)
  }
  for (const p of posts) {
    const loc = `${SITE_URL}/blog/${p.slug}`
    urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${p.date.slice(0, 10)}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en-GB" href="${loc}"/>
  </url>`)
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
}

function buildRss(posts) {
  const items = posts.map((p) => `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <author>hello@getfixfy.com (${xmlEscape(p.author)})</author>
      <description>${xmlEscape(p.seoDescription || p.excerpt)}</description>
      ${(p.tags || []).map((t) => `<category>${xmlEscape(t)}</category>`).join('\n      ')}
    </item>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Fixfy — Field notes</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Practitioner writing on UK commercial maintenance, compliance and the facilities trade — from Fixfy.</description>
    <language>en-gb</language>
    <copyright>© Fixfy Ltd ${new Date().getFullYear()}</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Fixfy site build</generator>
${items}
  </channel>
</rss>
`
}

const posts = loadPosts()
const dist = join(ROOT, 'dist')

if (!existsSync(dist)) {
  console.error('[seo-feeds] dist/ not found — run vite build first')
  process.exit(1)
}

const sitemapOut = join(dist, 'sitemap.xml')
writeFileSync(sitemapOut, buildSitemap(posts), 'utf8')
console.log(`[seo-feeds] wrote ${sitemapOut} (${STATIC_ROUTES.length + posts.length} urls)`)

const rssDir = join(dist, 'blog')
mkdirSync(rssDir, { recursive: true })
const rssOut = join(rssDir, 'rss.xml')
writeFileSync(rssOut, buildRss(posts), 'utf8')
console.log(`[seo-feeds] wrote ${rssOut} (${posts.length} items)`)

// Also overwrite the public sitemap so dev preview sees it
const publicSitemap = join(ROOT, 'public/sitemap.xml')
writeFileSync(publicSitemap, buildSitemap(posts), 'utf8')
console.log(`[seo-feeds] wrote ${publicSitemap}`)
