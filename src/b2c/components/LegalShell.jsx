import B2CLayout from './Chrome.jsx'
import { Eyebrow } from './Sections.jsx'

/**
 * Moldura das páginas legais do site (termos, privacidade): título, versão,
 * índice das seções e o texto. O índice vira coluna fixa no computador.
 */
export default function LegalShell({ icon, eyebrow, title, lede, version, toc = [], children }) {
  return (
    <B2CLayout>
      <section className="mo-section">
        <div className="mo-wrap">
          <header className="mo-doc-head">
            <Eyebrow icon={icon}>{eyebrow}</Eyebrow>
            <h1 className="mo-h2">
              {title}
              <span className="mo-dot">.</span>
            </h1>
            {lede && <p className="mo-lede">{lede}</p>}
            {version && <p className="mo-doc-version">{version}</p>}
          </header>

          <div className="mo-doc-layout">
            {toc.length > 0 && (
              <nav className="mo-doc-toc" aria-label="On this page">
                <p className="mo-doc-toc__title">On this page</p>
                <ol>
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`}>{item.label}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <article className="mo-doc">{children}</article>
          </div>
        </div>
      </section>
    </B2CLayout>
  )
}
