/**
 * Client-side behaviour ported from website-v2/router-v3.js.
 * Run these after the corresponding HTML is in the DOM (useLayoutEffect).
 */
import { tourMock } from './page-fixfypro.js'

export function htmlPageStub(name, blurb) {
  return `
    <section class="v2-section dark" style="min-height:60vh;display:flex;align-items:center">
      <div class="v2-narrow" style="text-align:center">
        <span class="v2-eyebrow">Coming in Phase 2</span>
        <h1 class="v2-h1" style="margin-top:18px">${name}</h1>
        <p class="v2-lede" style="margin:24px auto 0">${blurb}</p>
        <div style="margin-top:36px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap">
          <a href="/" class="v2-btn v2-btn-outline">← Back home</a>
          <a href="/contact" class="v2-btn v2-btn-primary">Talk to us <span class="arr">→</span></a>
        </div>
      </div>
    </section>`
}

export function initBgToggle() {
  const stored = localStorage.getItem('v2-bg') || 'black'
  applyBg(stored)
  document.querySelectorAll('.v2-bg-opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-bg-opt')
      applyBg(mode)
      try {
        localStorage.setItem('v2-bg', mode)
      } catch (_) {
        /* ignore */
      }
    })
  })
}

function applyBg(mode) {
  if (mode === 'navy') document.body.setAttribute('data-bg', 'navy')
  else document.body.removeAttribute('data-bg')
  document.querySelectorAll('.v2-bg-opt').forEach((b) => {
    b.setAttribute('aria-pressed', b.getAttribute('data-bg-opt') === mode ? 'true' : 'false')
  })
}

/** Home: infrastructure module switcher */
export function initInfraModules() {
  const items = document.querySelectorAll('.v2-infra-item')
  const mocks = document.querySelectorAll('.v2-infra-mock')
  if (!items.length) return () => {}

  const activate = (it) => {
    const mod = it.dataset.mod
    items.forEach((x) => x.classList.toggle('active', x === it))
    mocks.forEach((m) => m.classList.toggle('active', m.dataset.mod === mod))
  }

  const handlers = []
  items.forEach((it) => {
    const onClick = () => activate(it)
    const onEnter = () => activate(it)
    it.addEventListener('click', onClick)
    it.addEventListener('mouseenter', onEnter)
    handlers.push([it, onClick, onEnter])
  })

  return () => {
    handlers.forEach(([it, onClick, onEnter]) => {
      it.removeEventListener('click', onClick)
      it.removeEventListener('mouseenter', onEnter)
    })
  }
}

/** Platform hero scenes + timer */
export function initHeroScenes() {
  const stage = document.querySelector('.v2-scene-stage')
  if (!stage) return () => {}

  const scenes = stage.querySelectorAll('.v2-scene')
  const segs = stage.querySelectorAll('.v2-scene-progress .seg')
  let i = 0
  const SCENE_MS = 3200

  const advance = () => {
    scenes.forEach((s, idx) => s.classList.toggle('is-active', idx === i))
    segs.forEach((s, idx) => {
      s.classList.remove('active')
      s.classList.toggle('done', idx < i)
    })
    if (segs[i]) {
      segs[i].classList.remove('active')
      void segs[i].offsetWidth
      segs[i].classList.add('active')
    }
  }

  advance()

  const animateCounter = () => {
    const el = stage.querySelector('#s1-counter')
    if (!el) return
    let n = 11
    el.textContent = n
    if (window.__s1CounterTimer) clearInterval(window.__s1CounterTimer)
    window.__s1CounterTimer = setInterval(() => {
      n++
      if (n > 22) n = 11
      el.textContent = n
    }, 280)
  }
  animateCounter()

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scenes.forEach((s) => {
        if (!s.classList.contains('is-active')) s.style.opacity = '0'
      })
      const cur = stage.querySelector('.v2-scene.is-active')
      if (cur) cur.style.opacity = '1'
    })
  })

  if (window.__heroSceneTimer) clearInterval(window.__heroSceneTimer)
  window.__heroSceneTimer = setInterval(() => {
    i = (i + 1) % scenes.length
    if (i === 0) segs.forEach((s) => s.classList.remove('done'))
    advance()
    scenes.forEach((s, idx) => {
      s.style.opacity = idx === i ? '1' : '0'
    })
  }, SCENE_MS)

  return () => {
    if (window.__heroSceneTimer) clearInterval(window.__heroSceneTimer)
    if (window.__s1CounterTimer) clearInterval(window.__s1CounterTimer)
  }
}

/** Platform scroll reveal */
export function initPlatformReveal() {
  const els = document.querySelectorAll('.v2-reveal')
  if (!els.length) return () => {}
  if (!('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('in'))
    return () => {}
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in')
          io.unobserve(en.target)
        }
      })
    },
    { rootMargin: '-10% 0px -10% 0px', threshold: 0.05 },
  )
  els.forEach((e) => io.observe(e))
  return () => io.disconnect()
}

/** Contact placeholder submit */
export function initContactForm() {
  const form = document.getElementById('v2-contact-form')
  if (!form) return () => {}
  const onSubmit = (e) => {
    e.preventDefault()
    const btn = form.querySelector('button')
    btn.textContent = "✓ Sent — we'll be in touch within a working day"
    btn.disabled = true
    btn.style.background = '#4ade80'
  }
  form.addEventListener('submit', onSubmit)
  return () => form.removeEventListener('submit', onSubmit)
}

/** FixfyPro tour tabs */
export function initTour() {
  const tabs = document.querySelectorAll('.v2-tour-tab')
  const mock = document.getElementById('tour-mock')
  const cap = document.getElementById('tour-cap')
  const name = document.getElementById('tour-name')
  const captions = {
    quote:
      'A signed quote in 60 seconds. Templates by trade, customer signs on phone, scheduled the moment they accept.',
    schedule:
      'One calendar across every job &mdash; from Fixfy or your own clients. No double-bookings, ever.',
    invoice:
      'Invoice auto-generated when the job is signed off. VAT-ready. Tap to send, customer pays in-app.',
    dashboard:
      'See your real numbers &mdash; revenue, repeat customers, days-to-paid &mdash; on your phone, every morning.',
  }
  const names = { quote: 'Quote', schedule: 'Schedule', invoice: 'Invoice', dashboard: 'Dashboard' }

  const handlers = []
  tabs.forEach((t) => {
    const fn = () => {
      tabs.forEach((x) => x.classList.remove('active'))
      t.classList.add('active')
      const k = t.dataset.tab
      if (mock) mock.innerHTML = tourMock(k)
      if (cap) cap.innerHTML = captions[k] || ''
      if (name) name.textContent = names[k] || ''
    }
    t.addEventListener('click', fn)
    handlers.push([t, fn])
  })

  return () => {
    handlers.forEach(([t, fn]) => t.removeEventListener('click', fn))
  }
}

export function cleanupHeroTimers() {
  if (window.__heroSceneTimer) clearInterval(window.__heroSceneTimer)
  if (window.__s1CounterTimer) clearInterval(window.__s1CounterTimer)
}
