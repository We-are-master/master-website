// Vite plugin — transforms .md imports under src/content/blog/ into
// ready-to-use JS modules at build time. Keeps gray-matter + marked
// out of the browser bundle (gray-matter uses Node's Buffer, which
// throws at runtime).
//
// Each .md file becomes:
//   export default { frontmatter: {...}, html: "...", content: "..." }

import { readFileSync } from 'node:fs'
import matter from 'gray-matter'
import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: false, smartypants: true })

function compile(raw) {
  const { data, content } = matter(raw)
  const html = marked.parse(content)
  const frontmatter = { ...data }
  if (frontmatter.date instanceof Date) {
    frontmatter.date = frontmatter.date.toISOString()
  }
  return `export default ${JSON.stringify({ frontmatter, html, content })};`
}

function matches(id) {
  if (!id) return false
  // Strip querystrings (?import, ?t=xxx, etc.) before matching
  const clean = id.split('?')[0]
  return clean.endsWith('.md') && clean.includes('/content/blog/')
}

export default function blogMarkdownPlugin() {
  return {
    name: 'fx-blog-markdown',
    enforce: 'pre',
    // Owning `load` alone is enough: we read the raw .md from disk and
    // return a compiled JS module. No transform hook — otherwise Rollup
    // would run it on our own JS output and re-process it as markdown.
    load(id) {
      if (!matches(id)) return null
      const path = id.split('?')[0]
      const raw = readFileSync(path, 'utf8')
      return compile(raw)
    },
  }
}
