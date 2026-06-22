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
      <a href="/contact" class="cin-cta-primary">Get in touch <span class="arr">→</span></a>
      <a href="/platform" class="cin-cta-ghost">See the portal</a>
    </div>
    <div class="cin-cert">
      <span class="lbl">Certified ›</span>
      <span class="badge">Gas Safe</span><span class="badge">NICEIC</span>
      <span class="badge">OFTEC</span><span class="badge">NAPIT</span>
    </div>`
}

const CIN_ICONS = {
  request: '<path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>',
  booked: '<path d="M16 19a4 4 0 0 0-8 0"/><circle cx="12" cy="9" r="3.2"/><path d="M19 14.5l1.6 1.6 3-3"/>',
  finished: '<path d="M14.7 6.3a2 2 0 0 1 0 2.8l-8.2 8.2-3.2.8.8-3.2 8.2-8.2a2 2 0 0 1 2.6-.2z"/><path d="M16.5 12.5l4 4M14 21h7"/>',
  report: '<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
}

function CinIcon(path, size) {
  const s = size || 16
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="${s}" height="${s}">${path}</svg>`
}

function CinHeroDeck() {
  const stages = [
    {
      ic: 'request',
      k: 'Request',
      v: 'You (or your tenant) raise it',
      m: 'That&rsquo;s the last thing you do',
      stamp: '00:00s',
      pill: 'Logged',
    },
    {
      ic: 'booked',
      k: 'We allocate',
      v: 'Vetted, insured trade assigned',
      m: 'Matched from our own network',
      stamp: '00:08s',
      pill: 'Allocated',
    },
    {
      ic: 'finished',
      k: 'We deliver',
      v: 'On site · on SLA',
      m: 'Evidence captured',
      stamp: '03h 41m',
      pill: 'Complete',
    },
    {
      ic: 'report',
      k: 'Done',
      v: 'Closed, certified, logged',
      m: 'You just got the update',
      stamp: 'live',
      pill: 'Published',
      live: true,
    },
  ]
  return `
<div class="hv-C">
  <div class="cin-hero-copy" style="max-width:900px">${CinHeroCopy()}</div>
  <div class="cin-deck-wrap">
    <div class="cin-deck" id="cin-deck" data-tilt-deck>
      <div class="pn-h"><span>› Send your demand to Fixfy · one job, end to end</span><span class="cin-led"><span class="d"></span><span id="cin-live-clock">Live</span></span></div>
      <div class="cin-deck-body cin-job" id="cin-job">
        ${stages
          .map(
            (s, i) => `
        <div class="cin-stage" data-stage="${i}">
          <span class="cin-link"></span>
          <div class="cin-stage-top">
            <span class="cin-stage-node">
              <span class="ic-main">${CinIcon(CIN_ICONS[s.ic], 15)}</span>
              <span class="ic-check">${CinIcon(CIN_ICONS.check, 14)}</span>
            </span>
            <span class="cin-stage-stamp${s.live ? ' live' : ''}">${s.stamp}</span>
          </div>
          <div class="cin-stage-k">${s.k}</div>
          <div class="cin-stage-v">${s.v}</div>
          <div class="cin-stage-m">${s.m}</div>
          <span class="cin-stage-pill${s.live ? ' is-live' : ''}">${s.pill}</span>
        </div>`,
          )
          .join('')}
      </div>
      <div class="cin-job-foot">
        <span class="lbl">End to end</span>
        <span class="path">Request <i>›</i> Allocated <i>›</i> Delivered <i>›</i> Done</span>
        <span class="own">The trade is ours.</span>
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
  <div class="cin-reveal">${decorate(HomeClients(), false)}</div>
  <div class="cin-reveal">${decorate(HomeNumbers(), true)}</div>
  <div class="cin-reveal">${CinProblemSolution()}</div>
  <div class="cin-reveal">${decorate(HomeHowItWorks(), true)}</div>
  <div class="cin-reveal">${decorate(HomeInfrastructure(), true)}</div>
  <div class="cin-reveal">${CinCapabilities()}</div>
  <div class="cin-reveal">${CinCaseStudies()}</div>
  <div class="cin-reveal">${decorate(HomeSolutionsPreview(), false)}</div>
  <div class="cin-reveal">${CinSecurity()}</div>
  <div class="cin-reveal">${CinFAQ()}</div>
  <div class="cin-reveal">${decorate(HomeFinalCTA(), true)}</div>
</div>`
}

function formatUkLiveClock() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).formatToParts(new Date())
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00'
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
  const tz = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'UK'
  return `Live ${hour}:${minute} ${tz}`
}

export function initCinematic() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cleanups = []

  const liveClock = document.getElementById('cin-live-clock')
  if (liveClock) {
    const tick = () => {
      liveClock.textContent = formatUkLiveClock()
    }
    tick()
    const clockTimer = setInterval(tick, 30_000)
    cleanups.push(() => clearInterval(clockTimer))
  }

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

  const jobDeck = document.querySelector('.cin-deck-body.cin-job')
  if (jobDeck) {
    const stages = [...jobDeck.querySelectorAll('.cin-stage')]
    const STEP = 1150
    const START = 480
    const HOLD = 2400
    let timers = []
    const clearTimers = () => {
      timers.forEach(clearTimeout)
      timers = []
    }
    const settleAll = () => {
      stages.forEach((s) => {
        s.classList.add('done')
        s.classList.remove('active')
      })
    }
    const runOnce = () => {
      clearTimers()
      stages.forEach((s) => s.classList.remove('active', 'done'))
      void jobDeck.offsetWidth
      stages.forEach((s, i) => {
        timers.push(
          setTimeout(() => {
            if (i > 0) {
              stages[i - 1].classList.remove('active')
              stages[i - 1].classList.add('done')
            }
            s.classList.add('active')
          }, START + i * STEP),
        )
      })
      const last = stages[stages.length - 1]
      timers.push(
        setTimeout(() => {
          last.classList.remove('active')
          last.classList.add('done')
        }, START + stages.length * STEP),
      )
      timers.push(setTimeout(runOnce, START + stages.length * STEP + HOLD))
    }
    if (reduce) {
      settleAll()
    } else {
      let armed = false
      const checkJob = () => {
        const r = jobDeck.getBoundingClientRect()
        const inView = r.top < window.innerHeight * 0.85 && r.bottom > 0
        if (inView && !armed) {
          armed = true
          runOnce()
        } else if (!inView && r.top > window.innerHeight) {
          armed = false
          clearTimers()
        }
      }
      window.addEventListener('scroll', checkJob, { passive: true })
      const jobTimer = setTimeout(checkJob, 650)
      cleanups.push(() => {
        window.removeEventListener('scroll', checkJob)
        clearTimeout(jobTimer)
        clearTimers()
      })
    }
  }

  return () => cleanups.forEach((fn) => fn())
}
