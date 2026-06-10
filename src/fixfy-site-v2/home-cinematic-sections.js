/* ============================================================
   Fixfy V3 — Cinematic Home · extended content sections
   Copy aligned with the live marketing site (realistic UK B2B).
   ============================================================ */

function cinGlowsLocal() {
  return `
    <div class="cin-sec-glow g-coral" data-parallax="0.16" style="left:-12%;top:-12%"></div>
    <div class="cin-sec-glow g-blue" data-parallax="-0.1" style="right:-14%;bottom:-14%"></div>`
}

export function CinProblemSolution() {
  const pains = [
    { ic: '⊗', t: 'Chasing contractors', d: 'WhatsApp threads, voicemails and no-shows. No single record of who is doing what, where.' },
    { ic: '▤', t: 'Spreadsheet sprawl', d: 'Jobs, certificates and spend scattered across files nobody trusts or keeps current.' },
    { ic: '⚠', t: 'Compliance exposure', d: 'Gas, electrical and fire certificates lapsing unnoticed — a fine or an incident waiting to happen.' },
    { ic: '◷', t: 'No real-time visibility', d: 'Leadership can\'t answer "what\'s open, what\'s overdue, what did it cost" without a week of digging.' },
  ]
  const gains = [
    { t: 'One live ledger', d: 'Every job, quote, asset and certificate in one auditable system of record.' },
    { t: 'Vetted supply on tap', d: 'Insured, certified trades dispatched automatically — yours or ours.' },
    { t: 'Compliance on autopilot', d: 'Scheduled, tracked and escalated before anything expires.' },
    { t: 'Answers in one click', d: 'SLA, spend and status across the whole portfolio, in real time.' },
  ]
  return `
<section class="v2-section dark cin-ps">
  ${cinGlowsLocal()}
  <div class="v2-container">
    <div class="v2-eyebrow">The problem</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:20ch">Maintenance is fragmented. It costs you time, money and sleep.</h2>
    <div class="cin-ps-grid">
      <div class="cin-ps-col problem">
        <div class="cin-ps-tag">Without Fixfy</div>
        ${pains.map((p) => `
          <div class="cin-pain">
            <div class="ic">${p.ic}</div>
            <div><h4>${p.t}</h4><p>${p.d}</p></div>
          </div>`).join('')}
      </div>
      <div class="cin-ps-arrow"><span>→</span></div>
      <div class="cin-ps-col solution">
        <div class="cin-ps-tag coral">With Fixfy</div>
        ${gains.map((g) => `
          <div class="cin-gain">
            <div class="ic">✓</div>
            <div><h4>${g.t}</h4><p>${g.d}</p></div>
          </div>`).join('')}
      </div>
    </div>
  </div>
</section>`
}

export function CinCapabilities() {
  const feats = [
    { ic: '◷', t: 'Planned & reactive', d: 'PPM schedules and emergency call-outs run side by side, on the same rules engine.' },
    { ic: '▦', t: 'Audit-ready reporting', d: 'One-click exports for boards, auditors and insurers — every job evidenced with photos and certs.' },
    { ic: '⌘', t: 'Field app for trades', d: 'Engineers accept, navigate, capture proof and close jobs from their phone. No paperwork.' },
    { ic: '⊞', t: 'Budgets & approvals', d: 'Spend limits, multi-step approvals and PO matching baked into every job.' },
    { ic: '⟲', t: 'Asset lifecycle', d: 'Service history, warranties and replace-vs-repair signals for every asset you own.' },
    { ic: '⌁', t: 'Open API & webhooks', d: 'Push jobs in, pull status out. Embed Fixfy into the systems your team already runs.' },
  ]
  return `
<section class="v2-section dark">
  ${cinGlowsLocal()}
  <div class="v2-container">
    <div class="v2-eyebrow">More than a dashboard</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:24ch">Everything maintenance touches — handled in one place.</h2>
    <div class="cin-feat-grid">
      ${feats.map((f) => `
        <div class="cin-feat">
          <div class="cin-feat-ic">${f.ic}</div>
          <h4>${f.t}</h4>
          <p>${f.d}</p>
        </div>`).join('')}
    </div>
  </div>
</section>`
}

export function CinUseCases() {
  const segs = [
    {
      id: 're',
      tab: 'Real Estate',
      href: '/solutions/real-estate',
      h: 'We&rsquo;re the maintenance operation behind your portfolio — compliance, reactive and planned, fully managed.',
      d: 'From listed estates to build-to-rent, we run compliance, reactive and planned work across every asset — spend and SLAs visible per building and region.',
      points: ['Per-asset compliance calendar', 'Works packaging & approvals', 'Tenant-reported jobs triaged automatically'],
      metric: '17h 48m',
      mlbl: 'avg P1 resolution',
    },
    {
      id: 'fr',
      tab: 'Franchises',
      href: '/solutions/franchises',
      h: 'One operational standard across every location. We run it; you keep brand control.',
      d: 'Protect brand and revenue uptime across sites. One playbook enforced everywhere — we deliver; franchisees and HQ get visibility without the overhead.',
      points: ['Brand-standard SLAs per site', 'Franchisee self-serve, HQ oversight', 'Revenue-protecting priority routing'],
      metric: '8m 4s',
      mlbl: 'avg response time',
    },
    {
      id: 'en',
      tab: 'Enterprise',
      href: '/solutions/enterprise-operations',
      h: 'High volume, consistently delivered — by our team and our trades, not your overhead.',
      d: 'Run complex compliance regimes at scale — our operation handles dispatch, delivery and reporting so your teams aren&rsquo;t building maintenance overhead.',
      points: ['Multi-entity, multi-region rollups', 'Approval chains & budget controls', 'Audit-ready exports per job'],
      metric: '99.7%',
      mlbl: 'trades compliance',
    },
    {
      id: 'sp',
      tab: 'Service Platforms',
      href: '/solutions/service-platforms',
      h: 'Plug our operation into yours. Jobs, trades and reporting, delivered at scale.',
      d: 'Embed our vetted supply, dispatch and tracking into your product. We run the trade network and delivery; you keep the customer relationship.',
      points: ['REST API + webhooks', 'White-label dispatch & tracking', 'National vetted supply, on demand'],
      metric: '98.4%',
      mlbl: 'paid within 7 days',
    },
  ]
  return `
<section class="v2-section light cin-uc">
  <div class="v2-container">
    <div class="v2-eyebrow" style="color:var(--fx-coral)">Built for your model</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:20ch;color:var(--fx-ink)">One platform, tuned to how you operate.</h2>
    <div class="cin-uc-tabs" id="cin-uc-tabs">
      ${segs.map((s, i) => `<button class="cin-uc-tab${i === 0 ? ' active' : ''}" data-uc="${s.id}">${s.tab}</button>`).join('')}
    </div>
    <div class="cin-uc-stage">
      ${segs.map((s, i) => `
        <div class="cin-uc-panel${i === 0 ? ' active' : ''}" data-uc="${s.id}">
          <div class="cin-uc-copy">
            <h3>${s.h}</h3>
            <p>${s.d}</p>
            <ul>${s.points.map((p) => `<li><span class="tick">✓</span>${p}</li>`).join('')}</ul>
            <a href="${s.href}" class="v2-btn v2-btn-coral-outline" style="margin-top:8px">Learn more <span class="arr">→</span></a>
          </div>
          <div class="cin-uc-metric">
            <div class="big">${s.metric}</div>
            <div class="lbl">${s.mlbl}</div>
          </div>
        </div>`).join('')}
    </div>
  </div>
</section>`
}

export function CinCaseStudies() {
  return `
<section class="v2-section dark">
  ${cinGlowsLocal()}
  <div class="v2-container">
    <div class="v2-eyebrow">Customer · Li &amp; Fung</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:22ch">Teams that run Britain&rsquo;s estates trust Fixfy to deliver.</h2>
    <div class="cin-case-grid" style="grid-template-columns:1fr;max-width:720px">
      <div class="cin-case">
        <p class="q">A backlog of critical jobs was resolved in weeks. Fixfy quoted, planned and delivered everything — with trades fully managed and no chasing required.</p>
        <div class="cin-case-stats">
          <div><div class="v">3 wks</div><div class="l">backlog cleared</div></div>
          <div><div class="v">17h</div><div class="l">avg P1 resolution</div></div>
        </div>
        <div class="cin-case-attr">
          <div class="ava">SB</div>
          <div><div class="who">Sabrina Braz</div><div class="role">Facilities Manager · Li &amp; Fung</div></div>
        </div>
      </div>
    </div>
  </div>
</section>`
}

export function CinSecurity() {
  const certs = [
    { t: 'Gas Safe', d: 'Every gas engineer verified and monitored continuously.' },
    { t: 'NICEIC', d: 'Electrical work from certified, insured professionals.' },
    { t: 'OFTEC', d: 'Oil and heating engineers vetted to industry standards.' },
    { t: 'NAPIT', d: 'Additional electrical and building-services certification.' },
  ]
  const points = [
    'UK data residency & encryption at rest and in transit',
    'Role-based access, SSO/SAML and full audit logging',
    'Insurance & right-to-work checks on every trade',
    'Continuous vetting — certifications, ratings and complaints watched',
  ]
  return `
<section class="v2-section dark cin-sec-band">
  ${cinGlowsLocal()}
  <div class="v2-container">
    <div class="cin-sec-2col">
      <div>
        <div class="v2-eyebrow">Security &amp; compliance</div>
        <h2 class="v2-h2" style="margin-top:18px;max-width:18ch">Vetted trades. Audit-ready records. From day one.</h2>
        <p class="v2-lede" style="margin-top:18px;max-width:46ch">Your compliance obligations and supplier standards are handled to the level your auditors, insurers and board expect.</p>
        <ul class="cin-sec-list">
          ${points.map((p) => `<li><span class="tick">✓</span>${p}</li>`).join('')}
        </ul>
      </div>
      <div class="cin-cert-grid">
        ${certs.map((c) => `
          <div class="cin-cert-card">
            <div class="cin-cert-shield">◈</div>
            <h4>${c.t}</h4>
            <p>${c.d}</p>
          </div>`).join('')}
      </div>
    </div>
  </div>
</section>`
}

export function CinFAQ() {
  const qs = [
    {
      q: 'Do we use your trades or keep our own?',
      a: 'Both. Dispatch to your existing supply chain, to Fixfy&rsquo;s national vetted network, or a blend — all from the same workflow, with the same tracking and proof.',
    },
    {
      q: 'How long does onboarding take?',
      a: 'Most teams are live in days, not months. We load a sample of your sites into a sandbox during the demo, then migrate assets and rules with you. No big-bang cutover required.',
    },
    {
      q: 'How does pricing work?',
      a: 'A platform subscription scaled to your portfolio, plus pre-fixed pricing on managed work so there are no surprises. We&rsquo;ll size it precisely after a 30-minute scoping call.',
    },
    {
      q: 'Can Fixfy handle our compliance regime?',
      a: 'Yes — gas, electrical, fire, water, asbestos, PAT and more, with scheduling, escalation and audit-ready records per asset and per site.',
    },
    {
      q: 'Does it integrate with our existing systems?',
      a: 'A REST API and webhooks let you push jobs in and pull status out. We integrate with common finance, property and ITSM systems; tell us your stack and we&rsquo;ll confirm.',
    },
    {
      q: 'How do I become a trade partner?',
      a: 'Visit our <a href="https://getfixfy.com/partners" style="color:var(--fx-coral);text-decoration:underline">partner programme</a> to apply, then sign up at <a href="https://partners.getfixfy.com" style="color:var(--fx-coral);text-decoration:underline">partners.getfixfy.com</a>. Vetted trades across London get access to commercial jobs, recurring maintenance work and pre-booked requests through the Fixfy operating system.',
    },
  ]
  return `
<section class="v2-section light cin-faq">
  <div class="v2-container">
    <div class="v2-eyebrow" style="color:var(--fx-coral)">Questions, answered</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:16ch;color:var(--fx-ink)">Everything you need to evaluate Fixfy.</h2>
    <div class="cin-faq-list" id="cin-faq-list">
      ${qs.map((item, i) => `
        <div class="cin-faq-item${i === 0 ? ' open' : ''}">
          <button class="cin-faq-q">${item.q}<span class="cin-faq-ic">+</span></button>
          <div class="cin-faq-a"><p>${item.a}</p></div>
        </div>`).join('')}
    </div>
  </div>
</section>`
}

export function initCinematicSections() {
  const handlers = []

  document.querySelectorAll('.cin-uc-tab').forEach((t) => {
    const fn = () => {
      const id = t.dataset.uc
      document.querySelectorAll('.cin-uc-tab').forEach((x) => x.classList.toggle('active', x === t))
      document.querySelectorAll('.cin-uc-panel').forEach((p) => p.classList.toggle('active', p.dataset.uc === id))
    }
    t.addEventListener('click', fn)
    handlers.push([t, fn])
  })

  document.querySelectorAll('.cin-faq-item').forEach((item) => {
    const q = item.querySelector('.cin-faq-q')
    const fn = () => {
      const isOpen = item.classList.contains('open')
      document.querySelectorAll('.cin-faq-item').forEach((x) => x.classList.remove('open'))
      if (!isOpen) item.classList.add('open')
    }
    q.addEventListener('click', fn)
    handlers.push([q, fn])
  })

  return () => handlers.forEach(([el, fn]) => el.removeEventListener('click', fn))
}
