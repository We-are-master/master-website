/* ============================================================
   Fixfy V2 — Platform page (rewritten, scroll-driven narrative)
   Goal: prove we are THE infrastructure for any business that
         needs maintenance to never fail.
   Sections:
     1. Hero — bold thesis + KPI strip
     2. The pain (no filters)
     3. Our infrastructure (live system diagram, scroll-animated)
     4. Module deep-dive: Dashboard
     5. Module: Compliance — never fail
     6. Module: Demand engine — generate it, we absorb it
     7. Module: Trade network — the supply graph
     8. Module: Jobs / SLAs — the ledger
     9. Integrations + Security
    10. Final CTA
   ============================================================ */

import { HeroSceneStage } from './page-home-v2.js'

export function PagePlatform(){
  return `
${PfHero()}
${PfConnect()}
${PfPain()}
${PfSystemDiagram()}
${PfModuleDashboard()}
${PfModuleCompliance()}
${PfModuleDemand()}
${PfModuleNetwork()}
${PfModuleLedger()}
${PfIntegrations()}
${PfFinalCTA()}
`;
}

/* ----- 1. HERO (cinematic race narrative) ----- */
function PfHero(){
  return `
<section class="v2-section dark v2-page-hero pf-hero pf-hero-rot">
  <div class="pf-hero-bg">
    <div class="pf-hero-grid-bg"></div>
    <div class="pf-hero-glow a"></div>
    <div class="pf-hero-glow b"></div>
  </div>
  <div class="v2-container">
    <div class="pf-hero-cine-grid">
      <div class="pf-hero-copy">
        <div class="v2-eyebrow lg">The platform</div>
        <h1 class="pf-hero-h">Run maintenance like <span class="v2-coral">infrastructure</span>.<br/>Not like a backlog.</h1>
        <p class="pf-hero-lede">From the moment a request lands to the moment the certificate is filed — every step, on rails. One platform that absorbs the chaos so your team doesn&rsquo;t.</p>
        <div class="pf-hero-ctas">
          <a href="/contact" class="v2-btn v2-btn-primary">See it on your portfolio <span class="arr">→</span></a>
          <a href="/contact" class="v2-btn v2-btn-outline">Talk to us</a>
        </div>
      </div>

      <div class="v2-3d-canvas pf-hero-stage-canvas" id="v2-hero-stage">
        ${HeroSceneStage()}
      </div>
    </div>

    <div class="pf-hero-strip">
      <div class="pf-hero-stat"><div class="num">17h <span>48m</span></div><div class="lbl">avg P1 resolution</div></div>
      <div class="pf-hero-stat"><div class="num">99.7<span>%</span></div><div class="lbl">trades vetted</div></div>
      <div class="pf-hero-stat"><div class="num">8m <span>4s</span></div><div class="lbl">avg response time</div></div>
      <div class="pf-hero-stat"><div class="num">98.4<span>%</span></div><div class="lbl">trades paid &lt;7 days</div></div>
    </div>
  </div>
</section>`;
}

/* ----- 1b. CONNECT — how easy it is ----- */
function PfConnect(){
  return `
<section class="v2-section dark pf-connect v2-reveal">
  <div class="v2-container">
    <div class="pf-connect-h">
      <div class="v2-eyebrow">Plug &amp; play</div>
      <h2 class="v2-h2 pf-connect-h2">Any business in London. Live in days, not months.</h2>
      <p class="v2-lede" style="max-width:60ch;margin-top:18px">Three steps to go from spreadsheets and inboxes to a system that runs itself.</p>
    </div>

    <div class="pf-connect-steps">
      <div class="pf-cn-step">
        <div class="pf-cn-num">01</div>
        <div class="pf-cn-line"></div>
        <h3>Send us your sites</h3>
        <p>A list of properties is enough. We import assets, contracts and certificates in the background. No project plan needed.</p>
        <div class="pf-cn-vis">
          <div class="cv-row"><span class="dot"></span> 12 sites · imported</div>
          <div class="cv-row"><span class="dot"></span> 462 assets · linked</div>
          <div class="cv-row"><span class="dot"></span> 44 SLAs · configured</div>
        </div>
      </div>

      <div class="pf-cn-step">
        <div class="pf-cn-num">02</div>
        <div class="pf-cn-line"></div>
        <h3>We connect the network</h3>
        <p>Your preferred trades, plus the Fixfy network — all routed by the same engine. Compliance is watched from day one.</p>
        <div class="pf-cn-vis ring">
          <span class="r r1"></span><span class="r r2"></span><span class="r r3"></span>
          <span class="cv-tag">vetted &amp; routed</span>
        </div>
      </div>

      <div class="pf-cn-step">
        <div class="pf-cn-num">03</div>
        <div class="pf-cn-line last"></div>
        <h3>Your team logs in</h3>
        <p>Dashboards live, jobs flowing, certificates auto-renewing. The first week you save hours. After that, you stop counting.</p>
        <div class="pf-cn-vis">
          <div class="cv-row up"><span class="dot ok"></span> First job logged · day 1</div>
          <div class="cv-row up"><span class="dot ok"></span> First cert filed · day 2</div>
          <div class="cv-row up"><span class="dot ok"></span> Audit-ready · week 1</div>
        </div>
      </div>
    </div>

    <div class="pf-connect-foot">
      <div class="ff-ico">⚡</div>
      <div class="ff-t">Migration on us. Onboarding takes <strong>days</strong>, not weeks. We bring the team — yours just shows up to use it.</div>
    </div>
  </div>
</section>`;
}

/* ----- 2. THE PAIN — direct, no filters ----- */
function PfPain(){
  return `
<section class="v2-section darker pf-pain v2-reveal">
  <div class="v2-container">
    <div class="v2-eyebrow">The reality</div>
    <h2 class="v2-h2 pf-pain-h">Maintenance is the headache no one wants to own.</h2>
    <p class="v2-lede pf-pain-lede">A leak, a failed lift, a missed gas safety renewal — and suddenly your day is gone.<br/>Tickets in five inboxes. Spreadsheets that lie. Trades that don&rsquo;t turn up. Audits you can&rsquo;t explain.</p>

    <div class="pf-pain-grid">
      <div class="pf-pain-card">
        <div class="ix">!</div>
        <h4>Compliance is binary</h4>
        <p>Either every certificate is in date, or you are exposed. There is no &ldquo;mostly compliant&rdquo;.</p>
      </div>
      <div class="pf-pain-card">
        <div class="ix">↗</div>
        <h4>Demand spikes don&rsquo;t care</h4>
        <p>Storm hits, boiler dies, two sites flood. Your team can&rsquo;t scale at 2am — but the SLA still expires.</p>
      </div>
      <div class="pf-pain-card">
        <div class="ix">⌕</div>
        <h4>Trades you don&rsquo;t know are not trades you trust</h4>
        <p>Vetted, insured, certified, rated. Or it&rsquo;s a gamble — on your asset, on your tenant, on your name.</p>
      </div>
      <div class="pf-pain-card">
        <div class="ix">≈</div>
        <h4>Reports always feel like archaeology</h4>
        <p>Pulling spend, SLA performance and compliance status from five tools, three teams and two PDFs.</p>
      </div>
    </div>

    <div class="pf-pain-line">
      <span class="pf-pain-bullet"></span>
      <p>We took the entire headache and turned it into infrastructure. <strong>That&rsquo;s the platform.</strong></p>
    </div>
  </div>
</section>`;
}

/* ----- 3. SYSTEM DIAGRAM — animated layers ----- */
function PfSystemDiagram(){
  return `
<section class="v2-section dark pf-diagram v2-reveal">
  <div class="v2-container">
    <div class="v2-eyebrow">How it&rsquo;s built</div>
    <h2 class="v2-h2 pf-diag-h">One system. Four layers. Every stakeholder, same source of truth.</h2>
    <p class="v2-lede" style="max-width:62ch;margin-top:18px">From the request to the regulator, every action is captured, scheduled and reported in the same ledger.</p>

    <div class="pf-arch">
      <!-- left side: clients -->
      <div class="pf-arch-side left">
        <div class="pf-arch-h">Goes in →</div>
        <div class="pf-arch-chip">Tenant request</div>
        <div class="pf-arch-chip">Scheduled PPM</div>
        <div class="pf-arch-chip">BMS sensor trip</div>
        <div class="pf-arch-chip">Compliance trigger</div>
        <div class="pf-arch-chip">Ad-hoc job</div>
      </div>

      <!-- core: layered platform -->
      <div class="pf-arch-core">
        <div class="pf-arch-layer dash"><span class="lbl">Dashboard · live ops</span><span class="d-led"></span></div>
        <div class="pf-arch-layer eng"><span class="lbl">Compliance engine</span></div>
        <div class="pf-arch-layer ledger"><span class="lbl">Job &amp; SLA ledger</span></div>
        <div class="pf-arch-layer net"><span class="lbl">Trade allocation graph · multiple vetted</span></div>
        <div class="pf-arch-pulse"></div>
      </div>

      <!-- right side: outputs -->
      <div class="pf-arch-side right">
        <div class="pf-arch-h">→ Comes out</div>
        <div class="pf-arch-chip ok">Resolved</div>
        <div class="pf-arch-chip ok">Cert filed</div>
        <div class="pf-arch-chip ok">Photo &amp; sign-off</div>
        <div class="pf-arch-chip ok">Invoice · ledger</div>
        <div class="pf-arch-chip ok">Audit pack</div>
      </div>
    </div>
  </div>
</section>`;
}

/* ----- 4. MODULE: DASHBOARD ----- */
function PfModuleDashboard(){
  return `
<section class="v2-section dark pf-mod v2-reveal" id="pf-dashboard">
  <div class="v2-container">
    <div class="pf-mod-grid">
      <div class="pf-mod-copy">
        <div class="v2-eyebrow">Module · 01 · Dashboard</div>
        <h2>Every job, every site, every minute.</h2>
        <p>One pane of glass. Live status across the portfolio — what&rsquo;s open, what&rsquo;s breaching, what closed today, where spend is going. Built for FMs, executives and auditors at the same time.</p>
        <ul class="pf-mod-list">
          <li><strong>Real-time job feed</strong> — every site, every priority, no refresh needed.</li>
          <li><strong>SLA performance</strong> — track to target, breach risk, time-to-close trend.</li>
          <li><strong>Compliance posture</strong> — every certificate, every site, drilled to asset level.</li>
          <li><strong>Spend &amp; quotes</strong> — open quotes, approvals, run-rate, forecast.</li>
          <li><strong>Custom views</strong> — by region, brand, asset class or contract.</li>
        </ul>
      </div>
      <div class="pf-mod-mock dash-mock-sim">
        ${PfDashboardMock()}
      </div>
    </div>
  </div>
</section>`;
}

function PfDashboardMock(){
  return `
<div class="pf-dash">
  <div class="pf-dash-h">
    <span class="t">› Dashboard · 12 sites · live</span>
    <span class="led"><span class="d"></span>14:23 BST</span>
  </div>
  <div class="pf-dash-kpis">
    <div class="k"><div class="lbl">Open jobs</div><div class="val">28</div><div class="t up">▲ 3</div></div>
    <div class="k"><div class="lbl">P1 active</div><div class="val">2</div><div class="t">on track</div></div>
    <div class="k"><div class="lbl">SLA</div><div class="val">96.2<span>%</span></div><div class="t up">▲ 0.8</div></div>
    <div class="k"><div class="lbl">Spend MTD</div><div class="val">£42<span>k</span></div><div class="t">vs £45k plan</div></div>
  </div>
  <div class="pf-dash-row">
    <div class="pf-dash-c chart">
      <div class="hh"><span>Jobs · last 14d</span><span class="leg"><span class="dot c1"></span>P1 <span class="dot c2"></span>P2/3</span></div>
      <svg viewBox="0 0 320 90" preserveAspectRatio="none">
        ${[28,34,22,40,30,52,46,38,44,60,48,54,62,70].map((v,i)=>{
          const p1=Math.round(v*0.32),p2=v-p1,x=10+i*22,baseY=82;
          return `<rect x="${x}" y="${baseY-p2}" width="14" height="${p2}" fill="rgba(255,255,255,0.18)" rx="1"/>
                  <rect x="${x}" y="${baseY-v}" width="14" height="${p1}" fill="var(--fx-coral)" rx="1"/>`;
        }).join('')}
      </svg>
    </div>
    <div class="pf-dash-c chart">
      <div class="hh"><span>SLA · trend</span><span class="ok">96.2%</span></div>
      <svg viewBox="0 0 320 90" preserveAspectRatio="none">
        <defs><linearGradient id="pfSlaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="var(--fx-coral)" stop-opacity=".40"/><stop offset="100%" stop-color="var(--fx-coral)" stop-opacity="0"/></linearGradient></defs>
        <path d="M10,60 L40,52 L70,46 L100,48 L130,38 L160,40 L190,28 L220,32 L250,22 L280,18 L310,14 L310,86 L10,86 Z" fill="url(#pfSlaFill)"/>
        <path class="ln" d="M10,60 L40,52 L70,46 L100,48 L130,38 L160,40 L190,28 L220,32 L250,22 L280,18 L310,14" stroke="var(--fx-coral)" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    </div>
  </div>
  <div class="pf-dash-row">
    <div class="pf-dash-c">
      <div class="hh"><span>Compliance status</span></div>
      <div class="don-grid">
        ${[
          {n:'Gas',v:100,c:'#4ade80'},
          {n:'EICR',v:96,c:'#4ade80'},
          {n:'Fire',v:100,c:'#4ade80'},
          {n:'PAT',v:97,c:'#facc15'},
          {n:'Water',v:100,c:'#4ade80'},
          {n:'Asb',v:88,c:'var(--fx-coral)'}
        ].map(d=>{
          const C=2*Math.PI*15,off=C*(1-d.v/100);
          return `<div class="don">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>
              <circle cx="20" cy="20" r="15" fill="none" stroke="${d.c}" stroke-width="3" stroke-dasharray="${C}" stroke-dashoffset="${off}" stroke-linecap="round" transform="rotate(-90 20 20)"/>
            </svg>
            <div class="dv">${d.v}<span>%</span></div>
            <div class="dn">${d.n}</div>
          </div>`;
        }).join('')}
      </div>
    </div>
    <div class="pf-dash-c">
      <div class="hh"><span>Live activity</span><span class="led-sm"><span class="d"></span>Live</span></div>
      <div class="act">
        <div class="row"><span class="time">14:21</span><span class="lab on">P1</span><span class="msg">Plumbing leak · Camden HQ → B. Whitaker</span></div>
        <div class="row"><span class="time">14:18</span><span class="lab ok">DONE</span><span class="msg">Lift A · service complete · cert filed</span></div>
        <div class="row"><span class="time">14:09</span><span class="lab on">P2</span><span class="msg">HVAC · Floor 3 · ETA 12 min</span></div>
        <div class="row"><span class="time">13:54</span><span class="lab warn">DUE</span><span class="msg">EICR · Unit 14 · auto-allocated</span></div>
      </div>
    </div>
  </div>
</div>`;
}

/* ----- 5. MODULE: COMPLIANCE — never fail ----- */
function PfModuleCompliance(){
  return `
<section class="v2-section darker pf-mod flip v2-reveal" id="pf-compliance">
  <div class="v2-container">
    <div class="pf-mod-grid">
      <div class="pf-mod-mock">
        ${PfComplianceMock()}
      </div>
      <div class="pf-mod-copy">
        <div class="v2-eyebrow">Module · 02 · Compliance</div>
        <h2>Designed so you never miss.</h2>
        <p>Every certificate, every renewal, every regulator — automated end-to-end. Watched continuously. Allocated automatically. Filed against the asset, not a folder. The platform&rsquo;s job is to make sure compliance never becomes a fire-drill.</p>
        <ul class="pf-mod-list">
          <li><strong>Auto-watched renewals</strong> — Gas Safe, EICR, FRA, Legionella, Asbestos, PAT.</li>
          <li><strong>Auto-allocation</strong> — when something goes amber, a certified engineer is already booked.</li>
          <li><strong>Asset-level filing</strong> — every cert linked to the equipment it covers.</li>
          <li><strong>One-click audit pack</strong> — every record, every signature, regulator-ready.</li>
          <li><strong>Regulatory updates</strong> — pushed by us when the rules change.</li>
        </ul>
      </div>
    </div>
  </div>
</section>`;
}

function PfComplianceMock(){
  return `
<div class="pf-comp">
  <div class="pf-dash-h"><span class="t">› Compliance · live watch</span><span class="led-sm"><span class="d"></span>monitoring</span></div>
  <div class="pf-comp-grid">
    ${[
      {n:'Gas Safety · CP12',c:'150 / 150',u:'next renewal · 18d',v:100,s:'OK'},
      {n:'EICR · 5-yearly',c:'48 / 50',u:'2 expire 30d',v:96,s:'WATCH'},
      {n:'Fire Risk',c:'12 / 12',u:'all sites',v:100,s:'OK'},
      {n:'Legionella · L8',c:'42 / 42',u:'Q2 done',v:100,s:'OK'},
      {n:'Asbestos register',c:'18 / 18',u:'surveys filed',v:100,s:'OK'},
      {n:'PAT · annual',c:'894 / 920',u:'97% complete',v:97,s:'OK'}
    ].map(c=>`<div class="pf-comp-c ${c.s==='WATCH'?'watch':''}">
      <div class="row"><div class="n">${c.n}</div><div class="s">${c.s}</div></div>
      <div class="meta">${c.c} · ${c.u}</div>
      <div class="bar"><div class="fill" style="width:${c.v}%"></div></div>
    </div>`).join('')}
  </div>
  <div class="pf-comp-alloc">
    <span class="dot"></span>
    <span>EICR · Unit 14 · Fixfy auto-allocated certified electrician · ETA scheduled</span>
  </div>
</div>`;
}

/* ----- 6. MODULE: DEMAND — generate it, we absorb it ----- */
function PfModuleDemand(){
  return `
<section class="v2-section dark pf-mod v2-reveal" id="pf-demand">
  <div class="v2-container">
    <div class="pf-mod-grid">
      <div class="pf-mod-copy">
        <div class="v2-eyebrow">Module · 03 · Demand engine</div>
        <h2>Generate as much demand as you want. We take the hit.</h2>
        <p>Open more sites, run more campaigns, take on more contracts — the platform absorbs the volume. Allocation, scheduling and trade capacity scale on the network side. Your team doesn&rsquo;t.</p>
        <ul class="pf-mod-list">
          <li><strong>Elastic capacity</strong> — multiple vetted trades across London, ramped on demand.</li>
          <li><strong>Auto-routing</strong> — priority, geography, certification, rating, ETA.</li>
          <li><strong>Burst-resilient</strong> — storms, heatwaves, mass-rollouts handled in-system.</li>
          <li><strong>No queue at the customer</strong> — backlog stays our problem, not yours.</li>
        </ul>
      </div>
      <div class="pf-mod-mock">
        ${PfDemandMock()}
      </div>
    </div>
  </div>
</section>`;
}

function PfDemandMock(){
  // pre-compute the wave path once so fill + stroke match
  const pts = [...Array(24).keys()].map(i=>{
    const x = i*26;
    const y = 110 - Math.round(40*Math.sin(i*0.6) + 18*Math.sin(i*1.7+1.2)) + 8;
    return {x, y: Math.max(20, Math.min(120, y))};
  });
  const linePath = pts.map((p,i)=>`${i===0?'M':'L'}${p.x},${p.y}`).join(' ');
  const fillPath = `M0,120 ${pts.map(p=>`L${p.x},${p.y}`).join(' ')} L600,120 Z`;
  return `
<div class="pf-demand">
  <div class="pf-dash-h"><span class="t">› Throughput · last 24h</span><span class="led-sm"><span class="d"></span>live</span></div>
  <div class="pf-demand-row">
    <div class="m"><div class="lbl">Jobs absorbed</div><div class="val">412</div></div>
    <div class="m"><div class="lbl">Peak / hour</div><div class="val">38</div></div>
    <div class="m"><div class="lbl">Avg dispatch</div><div class="val">8m <span>4s</span></div></div>
  </div>
  <div class="pf-demand-wave">
    <svg viewBox="0 0 600 140" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pfWave" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="var(--fx-coral)" stop-opacity=".55"/>
          <stop offset="100%" stop-color="var(--fx-coral)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${fillPath}" fill="url(#pfWave)"/>
      <path class="ln" d="${linePath}" stroke="var(--fx-coral)" stroke-width="2" fill="none" stroke-linecap="round"/>
      <line x1="0" y1="58" x2="600" y2="58" stroke="rgba(255,255,255,0.10)" stroke-width="0.6" stroke-dasharray="2 4"/>
      <text x="6" y="54" font-family="ui-monospace,monospace" font-size="9" fill="rgba(255,255,255,0.5)" letter-spacing="1">CAPACITY HEADROOM</text>
    </svg>
  </div>
  <div class="pf-demand-trades">
    <div class="lbl">Allocation pool · live</div>
    <div class="bars">
      ${[
        {t:'Plumbing · Gas Safe',used:62},
        {t:'Electrical · NICEIC',used:48},
        {t:'HVAC · F-Gas',used:74},
        {t:'Locksmith · MLA',used:18},
        {t:'Roofing · CR',used:31}
      ].map(t=>`<div class="brow">
        <span class="n">${t.t}</span>
        <div class="bar"><div class="f" style="width:${t.used}%"></div></div>
        <span class="p">${t.used}%</span>
      </div>`).join('')}
    </div>
  </div>
</div>`;
}

/* ----- 7. MODULE: NETWORK ----- */
function PfModuleNetwork(){
  return `
<section class="v2-section darker pf-mod flip v2-reveal" id="pf-network">
  <div class="v2-container">
    <div class="pf-mod-grid">
      <div class="pf-mod-mock">
        ${PfNetworkMock()}
      </div>
      <div class="pf-mod-copy">
        <div class="v2-eyebrow">Module · 04 · Trade network</div>
        <h2>The supply graph. Vetted across London.</h2>
        <p>Gas Safe, NICEIC, OFTEC, NAPIT, F-Gas, MLA, CompetentRoofer, GGF. Insurance, certifications and ratings continuously verified. Routed by priority, geography and skill — not by who picks up the phone.</p>
        <ul class="pf-mod-list">
          <li><strong>Continuous vetting</strong> — insurance, certs, ratings, complaints, all watched.</li>
          <li><strong>London-wide coverage</strong> — every borough, every postcode, dispatch in minutes.</li>
          <li><strong>Bring your own panel</strong> — preferred suppliers ride the same rails.</li>
          <li><strong>Performance per job</strong> — trade scorecard improves the routing every cycle.</li>
        </ul>
      </div>
    </div>
  </div>
</section>`;
}

function PfNetworkMock(){
  // London map: stylised concentric postcode rings (like the BR / W / N / E / SE / SW etc.)
  // Trade dots scattered around a central hub. No counts shown.
  return `
<div class="pf-net">
  <div class="pf-dash-h"><span class="t">› London supply graph</span><span class="led-sm"><span class="d"></span>live</span></div>
  <div class="pf-net-map">
    <svg viewBox="0 0 320 320" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="pfNetGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(237,75,0,0.20)"/>
          <stop offset="100%" stop-color="rgba(237,75,0,0)"/>
        </radialGradient>
      </defs>
      <!-- glow at centre -->
      <circle cx="160" cy="160" r="140" fill="url(#pfNetGlow)"/>
      <!-- concentric rings = London postcode zones -->
      <circle cx="160" cy="160" r="40" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="0.7" stroke-dasharray="2 4"/>
      <circle cx="160" cy="160" r="80" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.7" stroke-dasharray="2 4"/>
      <circle cx="160" cy="160" r="120" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.7" stroke-dasharray="2 4"/>
      <!-- river thames suggestion -->
      <path d="M40,200 Q120,180 160,205 Q210,225 280,195" fill="none" stroke="rgba(120,160,220,0.18)" stroke-width="2" stroke-linecap="round"/>
      <!-- borough labels -->
      <text x="160" y="62" text-anchor="middle" font-family="ui-monospace,monospace" font-size="8" fill="rgba(255,255,255,0.4)" letter-spacing="2">N</text>
      <text x="265" y="164" text-anchor="middle" font-family="ui-monospace,monospace" font-size="8" fill="rgba(255,255,255,0.4)" letter-spacing="2">E</text>
      <text x="160" y="270" text-anchor="middle" font-family="ui-monospace,monospace" font-size="8" fill="rgba(255,255,255,0.4)" letter-spacing="2">SE</text>
      <text x="55" y="164" text-anchor="middle" font-family="ui-monospace,monospace" font-size="8" fill="rgba(255,255,255,0.4)" letter-spacing="2">W</text>
      <!-- trade dots: deterministic positions -->
      ${[
        [120,80],[180,75],[210,110],[240,140],[260,180],[245,220],[200,245],[150,255],[105,235],[80,200],[65,150],[85,110],
        [140,115],[195,135],[220,170],[195,200],[150,210],[110,180],[125,140],[180,155],[160,135],[170,180],[135,170]
      ].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.6" fill="rgba(74,222,128,0.85)"/>`).join('')}
      <!-- routing lines from centre out -->
      <line x1="160" y1="160" x2="195" y2="135" stroke="rgba(237,75,0,0.45)" stroke-width="1" stroke-dasharray="2 3"/>
      <line x1="160" y1="160" x2="125" y2="140" stroke="rgba(237,75,0,0.35)" stroke-width="1" stroke-dasharray="2 3"/>
      <line x1="160" y1="160" x2="170" y2="180" stroke="rgba(237,75,0,0.30)" stroke-width="1" stroke-dasharray="2 3"/>
      <!-- coral pulse hub -->
      <circle cx="160" cy="160" r="6" fill="var(--fx-coral)"><animate attributeName="r" values="4;10;4" dur="2.2s" repeatCount="indefinite"/></circle>
      <circle cx="160" cy="160" r="3.5" fill="#fff"/>
    </svg>
  </div>
  <div class="pf-net-cats">
    ${[
      {n:'Plumbing',v:'Gas Safe'},
      {n:'Electrical',v:'NICEIC'},
      {n:'HVAC',v:'F-Gas'},
      {n:'Locksmith',v:'MLA'},
      {n:'Roofing',v:'CR'},
      {n:'Glazing',v:'GGF'}
    ].map(t=>`<div class="c">
      <div class="n">${t.n}</div>
      <div class="v">${t.v}</div>
    </div>`).join('')}
  </div>
</div>`;
}

/* ----- 8. MODULE: LEDGER (jobs + SLA) ----- */
function PfModuleLedger(){
  return `
<section class="v2-section dark pf-mod v2-reveal" id="pf-ledger">
  <div class="v2-container">
    <div class="pf-mod-grid">
      <div class="pf-mod-copy">
        <div class="v2-eyebrow">Module · 05 · Job &amp; SLA ledger</div>
        <h2>Every job, immutable. Every SLA, watched.</h2>
        <p>Reactive, planned and compliance work in one ledger. Priority routing P1–P4, breach detection in real time, escalation rules baked in, closed with photo, certificate and invoice. Audit-ready by construction.</p>
        <ul class="pf-mod-list">
          <li><strong>Same flow</strong> for reactive, planned and compliance work.</li>
          <li><strong>P1 / P2 / P3 / P4</strong> SLAs defined per contract, watched per job.</li>
          <li><strong>Auto-escalation</strong> at risk of breach — to the right person, before it happens.</li>
          <li><strong>Closed with proof</strong> — photo, signature, certificate, invoice.</li>
          <li><strong>Exports</strong> to your accounting and BI in one click.</li>
        </ul>
      </div>
      <div class="pf-mod-mock">
        ${PfLedgerMock()}
      </div>
    </div>
  </div>
</section>`;
}

function PfLedgerMock(){
  return `
<div class="pf-led">
  <div class="pf-dash-h"><span class="t">› Job ledger · open</span><span class="led-sm">14 active</span></div>
  <div class="pf-led-list">
    ${[
      {id:'#FIX-4188',t:'Plumbing · leak in WC · Floor 2',p:'P1',s:'On site · 1h 12m',c:'#fff',pc:'var(--fx-coral)',sc:'#fff'},
      {id:'#FIX-4187',t:'HVAC · noise in unit 4',p:'P3',s:'Assigned · 4h 02m',c:'#fff',pc:'#facc15',sc:'rgba(255,255,255,0.7)'},
      {id:'#FIX-4186',t:'Electrical · socket replacement',p:'P3',s:'Closed · cert filed',c:'rgba(255,255,255,0.55)',pc:'#facc15',sc:'#4ade80'},
      {id:'#FIX-4185',t:'Lock · door entry · main',p:'P2',s:'En route · 22m',c:'#fff',pc:'#facc15',sc:'#fff'},
      {id:'#FIX-4184',t:'PPM · gas safety · annual',p:'P4',s:'Scheduled · +3d',c:'rgba(255,255,255,0.7)',pc:'rgba(255,255,255,0.5)',sc:'rgba(255,255,255,0.55)'}
    ].map(j=>`<div class="row">
      <div class="id">${j.id}</div>
      <div class="t" style="color:${j.c}">${j.t}</div>
      <div class="p" style="background:rgba(${j.pc==='var(--fx-coral)'?'237,75,0':j.pc==='#facc15'?'250,204,21':'255,255,255'},0.16);color:${j.pc}">${j.p}</div>
      <div class="s" style="color:${j.sc}">${j.s}</div>
    </div>`).join('')}
  </div>
  <div class="pf-led-foot">
    <span>SLA on track · <strong>96.2%</strong></span>
    <span>Avg close · <strong>17h 48m</strong></span>
    <span>Audit-ready · <strong>100%</strong></span>
  </div>
</div>`;
}

/* ----- 9. INTEGRATIONS + SECURITY ----- */
function PfIntegrations(){
  return `
<section class="v2-section darker pf-int v2-reveal">
  <div class="v2-container">
    <div class="v2-eyebrow">Integrations &amp; security</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:24ch">Plugs into the systems you already run.</h2>
    <div class="v2-features" style="margin-top:48px">
      <div class="v2-feature"><div class="ico">⌖</div><h4>Accounting</h4><p>Xero, Sage, QuickBooks, NetSuite. Invoices, VAT, reconciliation — straight in.</p></div>
      <div class="v2-feature"><div class="ico">⌬</div><h4>Property management</h4><p>Yardi, MRI, Reapit, Arthur. Properties and tenants stay in sync, automatically.</p></div>
      <div class="v2-feature"><div class="ico">◇</div><h4>Building management</h4><p>BMS feeds → automatic job creation when sensors trip, before tenants notice.</p></div>
      <div class="v2-feature"><div class="ico">▣</div><h4>BI &amp; reporting</h4><p>Power BI, Tableau, Looker. Canned exports + a versioned data API.</p></div>
      <div class="v2-feature"><div class="ico">⛨</div><h4>Security</h4><p>ISO 27001 aligned. Data encrypted at rest and in flight. SSO via SAML/OIDC.</p></div>
      <div class="v2-feature"><div class="ico">⚖</div><h4>Compliance</h4><p>GDPR. UK data residency. Full audit trail per record, per user, per change.</p></div>
    </div>
  </div>
</section>`;
}

/* ----- 10. FINAL CTA ----- */
function PfFinalCTA(){
  return `
<section class="v2-section coral-band">
  <div class="v2-container" style="text-align:center">
    <h2 class="v2-coral-quote" style="font-size:clamp(28px,3.6vw,46px);max-width:22ch;margin:0 auto;line-height:1.1">Run maintenance like infrastructure. Not like a backlog.</h2>
    <p style="margin:24px auto 0;max-width:60ch;font-size:17px;color:rgba(255,255,255,0.95);line-height:1.55">30-minute demo. We&rsquo;ll load three of your sites into a sandbox so you can see exactly what your team would use on day one.</p>
    <div style="margin-top:36px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="/contact" class="v2-btn v2-btn-light">Book a demo <span class="arr">→</span></a>
    </div>
  </div>
</section>`;
}
