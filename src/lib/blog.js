// Blog content loader. The actual markdown parsing happens at build time
// via scripts/vite-plugin-blog.mjs — each .md file is transformed into a
// JS module exporting { frontmatter, html, content }.
//
// At runtime we just glob-import those modules, normalise, and sort.

const modules = import.meta.glob('../content/blog/*.md', {
  import: 'default',
  eager: true,
})

function normalise(path, mod) {
  const fm = mod.frontmatter || {}
  const filename = path.split('/').pop().replace(/\.md$/, '')
  const slug = fm.slug || filename
  const dateIso = fm.date || null
  const wordCount = (mod.content || '').trim().split(/\s+/).length
  const readMinutes = fm.readMinutes || Math.max(1, Math.round(wordCount / 220))

  return {
    slug,
    title: fm.title || 'Untitled',
    date: dateIso,
    author: fm.author || null,
    excerpt: fm.excerpt || '',
    cover: fm.cover || null,
    tags: fm.tags || [],
    seoDescription: fm.seoDescription || fm.excerpt || '',
    readMinutes,
    html: mod.html || '',
    content: mod.content || '',
  }
}

const POSTS = Object.entries(modules)
  .map(([path, mod]) => normalise(path, mod))
  .sort((a, b) => (a.date < b.date ? 1 : -1))

const BY_SLUG = Object.fromEntries(POSTS.map((p) => [p.slug, p]))

export function getAllPosts() { return POSTS }
export function getPost(slug) { return BY_SLUG[slug] || null }
export function getAllSlugs() { return POSTS.map((p) => p.slug) }
export function getAllTags() {
  const s = new Set()
  POSTS.forEach((p) => (p.tags || []).forEach((t) => s.add(t)))
  return Array.from(s).sort()
}

export function formatDate(iso, locale = 'en-GB') {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
}

export function shortDate(iso, locale = 'en-GB') {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(locale, { month: 'short', year: '2-digit' }).replace(/\s/, " '")
}
