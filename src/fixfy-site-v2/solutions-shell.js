/* Fixfy — Business Solutions pages · shared cinematic shell + scroll effects */

export function solAmbient() {
  return `<div class="sol-ambient" aria-hidden="true">
  <div class="sol-atmos">
    <span class="blob b1"></span>
    <span class="blob b2"></span>
    <span class="blob b3"></span>
  </div>
  <div class="sol-grid"></div>
  <div class="sol-vignette"></div>
  <div class="sol-scan"></div>
</div>`
}

export function solGlows() {
  return `<div class="sol-sec-glow g-coral" data-parallax="0.14"></div>
<div class="sol-sec-glow g-blue" data-parallax="-0.08"></div>`
}

export function solPageWrap(inner) {
  return `${solAmbient()}<div class="sol-page"><div class="sol-flow">${inner}</div></div>`
}

export function initSolutionsPage() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const root = document.querySelector('.sol-page')
  if (!root) return () => {}

  const cleanups = []
  const reveals = [...root.querySelectorAll('.sol-reveal')]

  function revealCheck() {
    const vh = window.innerHeight
    reveals.forEach((r) => {
      if (r.classList.contains('in')) return
      const rect = r.getBoundingClientRect()
      if (rect.top < vh * 0.88 && rect.bottom > 0) r.classList.add('in')
    })
  }

  if (reduce) {
    reveals.forEach((r) => r.classList.add('in'))
  } else {
    const safety = setTimeout(() => reveals.forEach((r) => r.classList.add('in')), 2800)
    cleanups.push(() => clearTimeout(safety))
  }

  const pxEls = [...root.querySelectorAll('[data-parallax]')]
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

  const heroMock = root.querySelector('.sol-mock-float')
  if (heroMock && !reduce) {
    const onMove = (e) => {
      const r = heroMock.getBoundingClientRect()
      const mx = (e.clientX - r.left) / r.width - 0.5
      const my = (e.clientY - r.top) / r.height - 0.5
      heroMock.style.transform = `perspective(1200px) rotateY(${(-mx * 5).toFixed(2)}deg) rotateX(${(my * 4).toFixed(2)}deg) translateZ(0)`
    }
    const onLeave = () => {
      heroMock.style.transform = ''
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    heroMock.addEventListener('mouseleave', onLeave)
    cleanups.push(() => {
      window.removeEventListener('mousemove', onMove)
      heroMock.removeEventListener('mouseleave', onLeave)
    })
  }

  return () => cleanups.forEach((fn) => fn())
}
