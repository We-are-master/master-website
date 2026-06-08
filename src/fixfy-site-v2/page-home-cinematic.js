/* ============================================================
   Fixfy V3 — Cinematic Home
   Reuses content blocks from page-home-v2.js and replaces the
   hero with the command-deck cinematic variant (production).
   ============================================================ */

import {
  HomeNumbers,
  HomeHowItWorks,
  HomeClients,
  HomeInfrastructure,
  HomeSolutionsPreview,
  HomeFinalCTA,
} from './page-home-v2.js'
import {
  CinProblemSolution,
  CinCapabilities,
  CinUseCases,
  CinCaseStudies,
  CinSecurity,
  CinFAQ,
  initCinematicSections,
} from './home-cinematic-sections.js'

function cinWords(parts) {
  let i = 0
  return parts
    .map((p) => {
      const delay = (0.12 + i * 0.07).toFixed(2)
      i++
      return `<span class="word" style="animation-delay:${delay}s">${
        p.cls ? `<span class="${p.cls}">${p.t}</span>` : p.t
      }</span>`
    })
    .join(' ')
}

function CinHeroCopy() {
  return `
    <div class="cin-eyebrow"><span class="pip"></span>Pre-fixed pricing · Certified partners</div>
    <h1 class="cin-h1">${cinWords([
      { t: 'Maintenance' },
      { t: 'infrastructure', cls: 'grad' },
      { t: 'for' },
      { t: 'British' },
      { t: 'business.' },
    ])}</h1>
    <p class="cin-lede">Fully handled, end to end. Trades, scheduling, compliance, execution &amp; reporting — all in one place.</p>
    <div class="cin-ctas">
      <a href="/contact" class="cin-cta-primary">Book a demo <span class="arr">→</span></a>
      <a href="/platform" class="cin-cta-ghost">See the platform</a>
    </div>
    <div class="cin-cert">
      <span class="lbl">Certified ›</span>
      <span class="badge">Gas Safe</span><span class="badge">NICEIC</span>
      <span class="badge">OFTEC</span><span class="badge">NAPIT</span>
    </div>`
}

function CinHeroDeck() {
  const cells = [
    { k: 'Quotes ongoing', v: '12', t: 'Avg £274 per quote' },
    { k: 'Jobs ongoing', v: '16', t: 'open right now' },
    { k: 'Avg response', v: '8m 4s', t: 'to acknowledgement' },
    { k: 'Assets', v: '37', t: 'active' },
  ]
  return `
<div class="hv-C">
  <div class="cin-hero-copy" style="max-width:900px">${CinHeroCopy()}</div>
  <div class="cin-deck-wrap">
    <div class="cin-deck" id="cin-deck" data-tilt-deck>
      <div class="pn-h"><span>› Fixfy command · live portfolio</span><span class="cin-led"><span class="d"></span>Live 14:23 BST</span></div>
      <div class="cin-deck-body">
        ${cells.map((c) => `<div class="cin-kpi"><div class="k">${c.k}</div><div class="v">${c.v}</div><div class="t">${c.t}</div></div>`).join('')}
      </div>
      <div class="cin-deck-glow"></div>
    </div>
  </div>
</div>`
}

function CinHero() {
  return `
<section class="cin-hero" id="cin-hero" data-variant="C">
  <div class="cin-atmos"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span></div>
  <div class="cin-grid" data-parallax="0.12"></div>
  <div class="cin-scan"></div>
  <div class="cin-vignette"></div>
  <div class="cin-noise"></div>
  <div class="cin-hero-inner">
    <div class="v2-container">
      ${CinHeroDeck()}
    </div>
  </div>
</section>`
}

function cinGlows() {
  return `
    <div class="cin-sec-glow g-coral" data-parallax="0.18" style="left:-12%;top:-10%"></div>
    <div class="cin-sec-glow g-blue" data-parallax="-0.12" style="right:-14%;bottom:-12%"></div>`
}

function decorate(html, glows) {
  if (!html) return ''
  return html.replace(/(<section class="v2-section[^"]*"[^>]*>)/, (m) => (glows ? m + cinGlows() : m))
}

export function CinematicHome() {
  return `
<div class="cin-home">
  ${CinHero()}
  <div class="cin-reveal">${decorate(HomeNumbers(), true)}</div>
  <div class="cin-reveal">${CinProblemSolution()}</div>
  <div class="cin-reveal">${decorate(HomeHowItWorks(), true)}</div>
  <div class="cin-reveal">${decorate(HomeInfrastructure(), true)}</div>
  <div class="cin-reveal">${CinCapabilities()}</div>
  <div class="cin-reveal">${CinUseCases()}</div>
  <div class="cin-reveal">${decorate(HomeClients(), false)}</div>
  <div class="cin-reveal">${CinCaseStudies()}</div>
  <div class="cin-reveal">${decorate(HomeSolutionsPreview(), false)}</div>
  <div class="cin-reveal">${CinSecurity()}</div>
  <div class="cin-reveal">${CinFAQ()}</div>
  <div class="cin-reveal">${decorate(HomeFinalCTA(), true)}</div>
</div>`
}

export function initCinematic() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cleanups = []

  const heroEl = document.getElementById('cin-hero')
  if (heroEl && !reduce) heroEl.classList.add('is-armed')

  const reveals = [...document.querySelectorAll('.cin-reveal')]
  function revealCheck() {
    const vh = window.innerHeight
    reveals.forEach((r) => {
      if (r.classList.contains('in')) return
      const rect = r.getBoundingClientRect()
      if (rect.top < vh * 0.9 && rect.bottom > 0) r.classList.add('in')
    })
  }
  if (reduce) reveals.forEach((r) => r.classList.add('in'))
  const revealSafety = setTimeout(() => reveals.forEach((r) => r.classList.add('in')), 2500)
  cleanups.push(() => clearTimeout(revealSafety))

  let bar = document.querySelector('.cin-progress')
  if (!bar) {
    bar = document.createElement('div')
    bar.className = 'cin-progress'
    document.body.appendChild(bar)
    cleanups.push(() => bar.remove())
  }

  const pxEls = [...document.querySelectorAll('[data-parallax]')]
  function applyParallax() {
    const vh = window.innerHeight
    pxEls.forEach((el) => {
      const f = parseFloat(el.dataset.parallax) || 0
      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const delta = center - vh / 2
      el.style.transform = `translate3d(0, ${(-delta * f).toFixed(1)}px, 0)`
    })
  }

  const onScroll = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight
    bar.style.width = `${h > 0 ? (window.scrollY / h) * 100 : 0}%`
    revealCheck()
    if (!reduce) applyParallax()
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  onScroll()
  cleanups.push(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })

  const hero = document.getElementById('cin-hero')
  if (hero && !reduce) {
    const deck = document.getElementById('cin-deck')
    const onMove = (e) => {
      const r = hero.getBoundingClientRect()
      const mx = (e.clientX - r.left) / r.width - 0.5
      const my = (e.clientY - r.top) / r.height - 0.5
      if (deck) deck.style.transform = `rotateX(${(26 - my * 6).toFixed(2)}deg) rotateY(${(-mx * 5).toFixed(2)}deg)`
    }
    const onLeave = () => {
      if (deck) deck.style.transform = 'rotateX(26deg)'
    }
    hero.addEventListener('mousemove', onMove)
    hero.addEventListener('mouseleave', onLeave)
    cleanups.push(() => {
      hero.removeEventListener('mousemove', onMove)
      hero.removeEventListener('mouseleave', onLeave)
    })
  }

  const items = document.querySelectorAll('.v2-infra-item')
  const mocks = document.querySelectorAll('.v2-infra-mock')
  const infraHandlers = []
  items.forEach((it) => {
    const act = () => {
      const mod = it.dataset.mod
      items.forEach((x) => x.classList.toggle('active', x === it))
      mocks.forEach((m) => m.classList.toggle('active', m.dataset.mod === mod))
    }
    it.addEventListener('click', act)
    it.addEventListener('mouseenter', act)
    infraHandlers.push([it, act])
  })
  cleanups.push(() => {
    infraHandlers.forEach(([it, act]) => {
      it.removeEventListener('click', act)
      it.removeEventListener('mouseenter', act)
    })
  })

  const sectionsCleanup = initCinematicSections()
  if (sectionsCleanup) cleanups.push(sectionsCleanup)

  const deckBody = document.querySelector('.cin-deck-body')
  if (deckBody && !reduce) {
    const kpis = [...deckBody.querySelectorAll('.cin-kpi')]
    let armed = false
    const timeouts = []
    function runValidate() {
      deckBody.classList.remove('is-validating')
      kpis.forEach((k) => k.classList.remove('cin-val', 'cin-done'))
      void deckBody.offsetWidth
      deckBody.classList.add('is-validating')
      kpis.forEach((k, i) => {
        const t = 240 + i * 260
        timeouts.push(setTimeout(() => k.classList.add('cin-val'), t))
        timeouts.push(setTimeout(() => k.classList.add('cin-done'), t + 560))
      })
    }
    function checkDeck() {
      const r = deckBody.getBoundingClientRect()
      const inView = r.top < window.innerHeight * 0.85 && r.bottom > 0
      if (inView && !armed) {
        armed = true
        runValidate()
      } else if (!inView && r.top > window.innerHeight) {
        armed = false
      }
    }
    window.addEventListener('scroll', checkDeck, { passive: true })
    const deckTimer = setTimeout(checkDeck, 650)
    cleanups.push(() => {
      window.removeEventListener('scroll', checkDeck)
      clearTimeout(deckTimer)
      timeouts.forEach(clearTimeout)
    })
  }

  return () => cleanups.forEach((fn) => fn())
}
