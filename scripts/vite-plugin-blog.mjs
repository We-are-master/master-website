// Vite plugin — transforms .md imports under src/content/blog/ into
// ready-to-use JS modules at build time. Keeps gray-matter + marked
// out of the browser bundle (gray-matter uses Node's Buffer, which
// throws at runtime).
//
// Each .md file becomes:
//   export default { frontmatter: {...}, html: "...", content: "..." }

import matter from 'gray-matter'
import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: false, smartypants: true })

export default function blogMarkdownPlugin() {
  return {
    name: 'fx-blog-markdown',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return null
      if (!id.includes('/content/blog/')) return null

      const { data, content } = matter(code)
      const html = marked.parse(content)

      // Normalise date to ISO string so it survives JSON serialisation
      const frontmatter = { ...data }
      if (frontmatter.date instanceof Date) {
        frontmatter.date = frontmatter.date.toISOString()
      }

      const payload = { frontmatter, html, content }
      return {
        code: `export default ${JSON.stringify(payload)};`,
        map: null,
      }
    },
  }
}
