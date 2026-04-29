/* ============================================================
   Fixfy V2 — Home page (9 blocks per brief)
   100% B2B Infrastructure focus. NO FixfyPro/trade messaging.
   ============================================================ */

export function PageHome(){
  return `
${HomeHero()}
${HomeNumbers()}
${HomeHowItWorks()}
${HomeClients()}
${HomeInfrastructure()}
${HomeTestimonial()}
${HomeSolutionsPreview()}
${HomeFinalCTA()}
`;
}

/* ---------- Block 1: HERO ---------- */
function HomeHero(){
  return `
<section class="v2-section v2-hero dark">
  <div class="v2-container">
    <div class="v2-hero-grid">
      <div class="v2-hero-copy">
        <div class="v2-hero-eyebrow-top">Pre-fixed pricing<span>•</span>Certified partners</div>
        <h1 class="v2-h1" style="margin-top:22px">
          Maintenance<br/>
          <span class="v2-coral">infrastructure</span> for<br/>
          British business.
        </h1>
        <p class="v2-lede" style="margin-top:24px">
          Fully handled, end to end. Trades, scheduling, compliance, execution &amp; reporting — all in one place.
        </p>
        <div class="v2-hero-ctas" style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap">
          <a href="/contact" class="v2-btn v2-btn-primary">Book a demo <span class="arr">→</span></a>
          <a href="/platform" class="v2-btn v2-btn-outline">See the platform</a>
        </div>
        <div class="v2-hero-cert">
          <span class="v2-hero-cert-lbl">Certified ›</span>
          <span class="v2-cert">Gas Safe</span>
          <span class="v2-cert">NICEIC</span>
          <span class="v2-cert">OFTEC</span>
          <span class="v2-cert">NAPIT</span>
        </div>
      </div>
      <div class="v2-3d-canvas v2-hero-race-wrap" id="v2-hero-stage">
        ${HeroRaceStage()}
      </div>
    </div>
  </div>
</section>`;
}

/* Race pipeline narrative — was on platform, now on home */
function HeroRaceStage(){
  return `
<div class="hr-race">
  <div class="hr-rail"></div>
  <div class="hr-pulse"></div>

  <div class="hr-card req">
    <div class="hr-tag">REQUEST</div>
    <div class="hr-t">Leak · Camden HQ</div>
    <div class="hr-s">P1 · 4h SLA</div>
    <div class="hr-stamp">00:00s</div>
  </div>

  <div class="hr-card alloc">
    <div class="hr-tag">ALLOCATE</div>
    <div class="hr-t">B. Whitaker · Gas Safe</div>
    <div class="hr-s">1.2 mi · ⭐ 4.9</div>
    <div class="hr-stamp">00:08s</div>
  </div>

  <div class="hr-card track">
    <div class="hr-tag">TRACK</div>
    <div class="hr-t">On site</div>
    <div class="hr-s">in progress · 1h 14m</div>
    <div class="hr-stamp live"><span class="d"></span>LIVE</div>
  </div>

  <div class="hr-card done">
    <div class="hr-tag">DONE</div>
    <div class="hr-t">Closed · cert filed</div>
    <div class="hr-s">SLA met · £238</div>
    <div class="hr-stamp ok">✓ 02h 43m</div>
  </div>

  <div class="hr-spark"></div>
</div>`;
}

/* 6-scene rotating motion — kept and exported for Platform hero */
export function HeroSceneStage(){
  return `
<div class="v2-scene-stage">

  <!-- SCENE 1: PLUG & PLAY (dashboard + houses flying in, counter rising) -->
  <div class="v2-scene s1" data-i="0">
    <div class="s1-bg-grid"></div>
    <!-- houses streaming in -->
    <div class="s1-houses">
      <div class="s1-house h1">⌂</div>
      <div class="s1-house h2">⌂</div>
      <div class="s1-house h3">⌂</div>
      <div class="s1-house h4">⌂</div>
      <div class="s1-house h5">⌂</div>
      <div class="s1-house h6">⌂</div>
    </div>

    <!-- central dashboard -->
    <div class="v2-scene-card s1-dash coral-edge">
      <div class="s1-dash-h">
        <span class="t">FIXFY · LIVE</span>
        <span class="led-sm"><span class="d"></span>onboarding</span>
      </div>
      <div class="s1-dash-counter">
        <span class="num" id="s1-counter">11</span>
        <span class="lbl">sites connected</span>
      </div>
      <div class="s1-dash-rows">
        <div class="r"><span class="k">Assets</span><span class="v" data-target="462"><span class="bar"><span class="fill"></span></span><span class="val">462</span></span></div>
        <div class="r"><span class="k">SLAs</span><span class="v" data-target="44"><span class="bar"><span class="fill" style="--w:88%"></span></span><span class="val">44</span></span></div>
        <div class="r"><span class="k">Engineers</span><span class="v" data-target="132"><span class="bar"><span class="fill" style="--w:72%"></span></span><span class="val">132</span></span></div>
      </div>
      <div class="s1-dash-pulse"></div>
    </div>

    <div class="v2-scene-cap">Connect your properties</div>
  </div>

  <!-- SCENE 2: COMPLIANCE DASHBOARD (with timed amber alert + auto-allocation) -->
  <div class="v2-scene s2" data-i="1">
    <div class="v2-scene-card dash" style="position:absolute;inset:6% 8% 18%;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:22px">
      <div class="check ck-1"><div class="ico">⛽</div><div class="lbl">Gas Safe</div><div class="v">Cleared</div></div>
      <div class="check ck-2"><div class="ico">⚡</div><div class="lbl">EICR</div><div class="v">5y · Valid</div></div>
      <div class="check ck-3"><div class="ico">🔥</div><div class="lbl">Fire Safety</div><div class="v">Cleared</div></div>
      <div class="check ck-4"><div class="ico">💧</div><div class="lbl">Legionella</div><div class="v">Q1 done</div></div>
      <div class="check overdue ck-5"><div class="ico">⚠</div><div class="lbl">EICR · Unit 14</div><div class="v">Due in 30 days</div></div>
      <div class="check ck-6"><div class="ico">⚙</div><div class="lbl">PAT</div><div class="v">142 / 142</div></div>
    </div>
    <div class="alloc-line">
      <span class="dot"></span>
      <span class="txt">Fixfy auto-allocated certified engineer · ETA scheduled</span>
    </div>
    <div class="v2-scene-cap">Compliance, watched and allocated</div>
  </div>

  <!-- SCENE 3: REQUEST (animated cursor selecting P1) -->
  <div class="v2-scene s3" data-i="2">
    <div class="v2-scene-card req" style="position:absolute;inset:8% 12%;padding:28px">
      <div class="req-h">› New job · 00:12s</div>
      <div class="field"><div class="l">Trade</div><div class="v">Plumbing &amp; Heating</div></div>
      <div class="field"><div class="l">Site</div><div class="v">Camden HQ · Floor 3</div></div>
      <div class="field"><div class="l">Priority</div>
        <div class="prio-pick">
          <span class="pp p1 selected">P1 · 4h</span>
          <span class="pp p2">P2 · 24h</span>
          <span class="pp p3">P3 · 5d</span>
          <span class="pp p4">P4</span>
        </div>
      </div>
      <div class="cursor"></div>
    </div>
    <div class="v2-scene-cap">Log a job in 15 seconds</div>
  </div>

  <!-- SCENE 4: ALLOCATE -->
  <div class="v2-scene s4" data-i="3">
    <div class="map-bg">
      <div class="map-grid"></div>
      <svg class="map-roads" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,28 Q22,32 38,42 T100,52" stroke="rgba(255,255,255,0.10)" stroke-width="0.6" fill="none"/>
        <path d="M0,72 Q30,68 50,74 T100,68" stroke="rgba(255,255,255,0.08)" stroke-width="0.6" fill="none"/>
        <path d="M30,0 Q34,30 30,52 T36,100" stroke="rgba(255,255,255,0.08)" stroke-width="0.6" fill="none"/>
        <path d="M70,0 Q66,28 72,46 T68,100" stroke="rgba(255,255,255,0.08)" stroke-width="0.6" fill="none"/>
      </svg>
      <div class="pin trade"><span class="ring"></span></div>
      <div class="line"></div>
      <div class="pin site"><span class="ring"></span></div>
      <div class="v2-scene-card trade-card coral-edge">
        <div class="name">B. Whitaker</div>
        <div class="meta">1.2 mi · ⭐ 4.9 · GAS SAFE</div>
        <div style="margin-top:10px;font-family:var(--fx-mono);font-size:10px;letter-spacing:0.14em;color:#4ade80;text-transform:uppercase">› ASSIGNED</div>
      </div>
    </div>
    <div class="v2-scene-cap">Nearest vetted trade · assigned</div>
  </div>

  <!-- SCENE 5: TRACKING (animated progress + gradient bg) -->
  <div class="v2-scene s5" data-i="4">
    <div class="s5-bg"></div>
    <div class="s5-pulse"></div>
    <div class="v2-scene-card track" style="position:absolute;inset:14% 8% 22%;padding:26px;display:flex;flex-direction:column">
      <div style="font-family:var(--fx-mono);font-size:10.5px;letter-spacing:0.14em;color:rgba(255,255,255,0.5);text-transform:uppercase;display:flex;justify-content:space-between;align-items:center">
        <span>› Job · #FIX-4188 · LIVE</span>
        <span class="s5-led"><span class="d"></span>tracking</span>
      </div>
      <div style="font-size:17px;color:#fff;margin-top:10px;font-weight:500">Plumbing · Camden HQ</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:4px;font-family:var(--fx-mono);letter-spacing:0.04em">Engineer en route · ETA <span class="s5-eta">12</span> min</div>
      <div class="timeline-wrap" style="margin-top:auto;padding-top:36px">
        <div class="bar"><div class="bar-fill"></div></div>
        <div class="timeline">
          <div class="stage done">Assigned</div>
          <div class="stage done">En route</div>
          <div class="stage done">On site</div>
          <div class="stage">Closed</div>
        </div>
      </div>
    </div>
    <div class="v2-scene-cap">Track every step</div>
  </div>

  <!-- SCENE 6: DONE + REPORT -->
  <div class="v2-scene s6" data-i="5">
    <div class="v2-scene-card done coral-edge" style="position:absolute;inset:8% 10% 18%;padding:26px 28px;display:flex;flex-direction:column;align-items:center;text-align:center">
      <div class="check-big">✓</div>
      <h4>Resolved</h4>
      <div class="sub">All deliverables confirmed</div>
      <div class="docs">
        <div class="doc"><div class="doc-tag">PHOTO</div><div class="doc-fill"></div></div>
        <div class="doc"><div class="doc-tag">CERT</div><div class="doc-fill"></div></div>
        <div class="doc"><div class="doc-tag">INVOICE</div><div class="doc-fill"></div></div>
      </div>
      <div class="stats">
        <div class="stat"><div class="lbl">Duration</div><div class="val">2h 43m</div></div>
        <div class="stat"><div class="lbl">SLA</div><div class="val ok">Met</div></div>
        <div class="stat"><div class="lbl">Cost</div><div class="val">£238</div></div>
      </div>
      <div class="stamp">› Completed · with proof</div>
    </div>
    <div class="v2-scene-cap">Closed and documented</div>
  </div>

  <!-- progress bar -->
  <div class="v2-scene-progress" id="v2-scene-prog">
    <div class="seg active"></div>
    <div class="seg"></div>
    <div class="seg"></div>
    <div class="seg"></div>
    <div class="seg"></div>
    <div class="seg"></div>
  </div>
</div>`;
}

/* ---------- Block 2: NUMBERS Q1 2026 ---------- */
function HomeNumbers(){
  return `
<section class="v2-section dark">
  <div class="v2-container">
    <div class="v2-eyebrow">By the numbers · Q1 2026</div>
    <div class="v2-metrics" style="margin-top:36px">
      <div class="v2-metric">
        <div class="k">Avg SLA P1</div>
        <div class="num">17<span class="u">h</span> 48<span class="u">m</span></div>
        <div class="v">Average time to fully resolve urgent P1 jobs.</div>
      </div>
      <div class="v2-metric">
        <div class="k">Trades compliance</div>
        <div class="num">99.7<span class="u">%</span></div>
        <div class="v">Vetted, insured and continuously monitored professionals.</div>
      </div>
      <div class="v2-metric">
        <div class="k">Avg response time</div>
        <div class="num">8<span class="u">m</span> 4<span class="u">s</span></div>
        <div class="v">From first contact to job acknowledgement.</div>
      </div>
      <div class="v2-metric">
        <div class="k">Fast partner payouts</div>
        <div class="num">98.4<span class="u">%</span></div>
        <div class="v">Paid within 7 days. Trade invoices settled within a week of completion.</div>
      </div>
    </div>
  </div>
</section>`;
}

/* ---------- Block 3: HOW IT WORKS ---------- */
function HomeHowItWorks(){
  return `
<section class="v2-section dark">
  <div class="v2-container">
    <div class="v2-eyebrow">How it works</div>
    <h2 class="v2-h2" style="margin-top:18px">From request to resolution, one flow.</h2>
    <p class="v2-lede" style="margin-top:18px;max-width:60ch">Post jobs, assign vetted trades, and close with proof — all in one ledger.</p>

    <div class="v2-how">
      <svg class="v2-how-path" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
        <path class="v2-how-bg" d="M 50,30 Q 250,5 500,30 T 950,30" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.2" stroke-dasharray="3 4"/>
        <path class="v2-how-fg" d="M 50,30 Q 250,5 500,30 T 950,30" fill="none" stroke="url(#howGrad)" stroke-width="1.6" stroke-linecap="round"/>
        <defs>
          <linearGradient id="howGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stop-color="rgba(237,75,0,0)"/>
            <stop offset="40%" stop-color="rgba(237,75,0,0.95)"/>
            <stop offset="60%" stop-color="rgba(237,75,0,0.95)"/>
            <stop offset="100%" stop-color="rgba(237,75,0,0)"/>
          </linearGradient>
        </defs>
        <circle class="v2-how-pulse" r="4" cx="0" cy="0" fill="var(--fx-coral)"/>
      </svg>
      <div class="v2-how-step">
        <div class="v2-how-num">01</div>
        <h4>Post &amp; triage</h4>
        <p>Raise reactive or planned work in seconds. SLAs, priorities and escalation paths use your rules.</p>
      </div>
      <div class="v2-how-step">
        <div class="v2-how-num">02</div>
        <h4>Assign &amp; execute</h4>
        <p>Dispatch to your supply or ours. Track ETAs, evidence on site and completion in real time.</p>
      </div>
      <div class="v2-how-step">
        <div class="v2-how-num">03</div>
        <h4>Report &amp; close</h4>
        <p>Invoices, compliance records and audit-ready exports — without piecing together spreadsheets.</p>
      </div>
    </div>

    <div style="margin-top:48px">
      <a href="/platform" class="v2-btn v2-btn-outline">Explore the platform <span class="arr">→</span></a>
    </div>
  </div>
</section>`;
}

/* ---------- Block 4: TRUSTED CLIENTS (light) ---------- */
function HomeClients(){
  const clients = [
    'Kvadrat','Li & Fung','Good Place Lettings','Cornwallis',
    'Eagle Vision','Crystal Facilities','SC Johnson','Fantastic Services',
    'StyleSmith','NHS Property','Homyze','Checkatrade'
  ];
  return `
<section class="v2-section light">
  <div class="v2-container">
    <div class="v2-eyebrow">Trusted by the estates that run Britain</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:22ch">From listed estates to high-street chains, Fixfy keeps the lights on.</h2>
    <div class="v2-clients-grid">
      ${clients.map(c=>`<div class="v2-client">${c}</div>`).join('')}
    </div>
  </div>
</section>`;
}

/* ---------- Block 5: THE INFRASTRUCTURE (4 modules animated) ---------- */
function HomeInfrastructure(){
  return `
<section class="v2-section dark">
  <div class="v2-container">
    <div class="v2-eyebrow">The infrastructure</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:22ch">Everything your properties need, without the overhead.</h2>
    <p class="v2-lede" style="margin-top:18px;max-width:60ch">Four modules. One system. Everyone working from the same source of truth.</p>

    <div class="v2-infra" id="v2-infra">
      <div class="v2-infra-list" id="v2-infra-list">
        <div class="v2-infra-item active" data-mod="dashboard">
          <div class="row">
            <div class="ico">▦</div>
            <h4>Dashboard</h4>
            <span class="open">01</span>
          </div>
          <p>Real-time view of every job, quote and SLA across your portfolio. Compliance at a glance — no spreadsheets, no chasing.</p>
        </div>
        <div class="v2-infra-item" data-mod="assets">
          <div class="row">
            <div class="ico">◆</div>
            <h4>Assets</h4>
            <span class="open">02</span>
          </div>
          <p>Every site, every asset — fully tracked. Service history, warranties and spend, all linked and accessible.</p>
        </div>
        <div class="v2-infra-item" data-mod="jobs">
          <div class="row">
            <div class="ico">⚒</div>
            <h4>Jobs &amp; SLAs</h4>
            <span class="open">03</span>
          </div>
          <p>Manage reactive, planned and compliance work in one place. Track SLAs automatically, escalate when needed and close with full reports.</p>
        </div>
        <div class="v2-infra-item" data-mod="supply">
          <div class="row">
            <div class="ico">⌖</div>
            <h4>Supply network</h4>
            <span class="open">04</span>
          </div>
          <p>Access a network of vetted professionals. Fully vetted and approved, insured and ready to deliver at scale.</p>
        </div>
        <div class="v2-infra-item" data-mod="compliance">
          <div class="row">
            <div class="ico">▲</div>
            <h4>Compliance</h4>
            <span class="open">05</span>
          </div>
          <p>Stay compliant without the manual work. Automated scheduling, complete records and audit-ready reporting.</p>
        </div>
      </div>

      <div class="v2-infra-stage" id="v2-infra-stage">
        ${InfraMockDashboard()}
        ${InfraMockAssets()}
        ${InfraMockJobs()}
        ${InfraMockSupply()}
        ${InfraMockCompliance()}
      </div>
    </div>

    <div style="margin-top:48px">
      <a href="/platform" class="v2-btn v2-btn-outline">Explore the platform <span class="arr">→</span></a>
    </div>
  </div>
</section>`;
}

function InfraMockDashboard(){
  return `
<div class="v2-infra-mock active dash-mock" data-mod="dashboard">
  <div class="hd">
    <span>› Dashboard · Camden HQ + 11 sites</span>
    <span class="led">Live · 14:23 BST</span>
  </div>

  <!-- top KPI strip -->
  <div class="dash-kpis">
    <div class="kpi">
      <div class="lbl">Jobs ongoing</div>
      <div class="val">28</div>
      <div class="trend up">▲ 3 today</div>
    </div>
    <div class="kpi">
      <div class="lbl">Open quotes</div>
      <div class="val">14</div>
      <div class="trend">≈ steady</div>
    </div>
    <div class="kpi">
      <div class="lbl">Avg SLA P1</div>
      <div class="val">17h <span style="font-size:11px;opacity:.7">48m</span></div>
      <div class="trend up">▲ 4% faster</div>
    </div>
    <div class="kpi">
      <div class="lbl">Compliance</div>
      <div class="val">98.4<span style="font-size:11px;opacity:.7">%</span></div>
      <div class="trend up">▲ 0.6 pts</div>
    </div>
  </div>

  <!-- charts row -->
  <div class="dash-row">
    <div class="dash-card chart">
      <div class="ch-h">
        <span class="t">Jobs · last 14 days</span>
        <span class="leg"><span class="dot c1"></span>P1 <span class="dot c2"></span>P2/P3</span>
      </div>
      <svg class="bars" viewBox="0 0 280 80" preserveAspectRatio="none">
        ${[28,34,22,40,30,52,46,38,44,60,48,54,62,70].map((v,i)=>{
          const p1 = Math.round(v*0.32), p2=v-p1;
          const x = 8 + i*19, baseY=72;
          return `
            <rect x="${x}" y="${baseY-p2}" width="12" height="${p2}" fill="rgba(255,255,255,0.18)" rx="1"/>
            <rect x="${x}" y="${baseY-v}" width="12" height="${p1}" fill="var(--fx-coral)" rx="1"/>
          `;
        }).join('')}
        <line x1="0" x2="280" y1="72" y2="72" stroke="rgba(255,255,255,0.10)" stroke-width="0.5"/>
      </svg>
    </div>

    <div class="dash-card chart">
      <div class="ch-h">
        <span class="t">SLA performance</span>
        <span class="pct">96.2%</span>
      </div>
      <svg class="line-ch" viewBox="0 0 280 80" preserveAspectRatio="none">
        <defs>
          <linearGradient id="slaFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="var(--fx-coral)" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="var(--fx-coral)" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="M8,52 L36,46 L64,38 L92,40 L120,30 L148,34 L176,22 L204,26 L232,18 L260,14 L272,12 L272,76 L8,76 Z" fill="url(#slaFill)"/>
        <path class="ln-stroke" d="M8,52 L36,46 L64,38 L92,40 L120,30 L148,34 L176,22 L204,26 L232,18 L260,14 L272,12" fill="none" stroke="var(--fx-coral)" stroke-width="1.5" stroke-linecap="round"/>
        ${[8,36,64,92,120,148,176,204,232,260].map((x,i)=>{
          const ys=[52,46,38,40,30,34,22,26,18,14];
          return `<circle cx="${x}" cy="${ys[i]}" r="1.6" fill="var(--fx-coral)"/>`;
        }).join('')}
      </svg>
    </div>
  </div>

  <!-- right-side donuts + activity -->
  <div class="dash-row">
    <div class="dash-card donuts">
      <div class="ch-h"><span class="t">Compliance status</span></div>
      <div class="donut-grid">
        ${[
          {n:'Gas',v:100,c:'#4ade80'},
          {n:'EICR',v:96,c:'#4ade80'},
          {n:'Fire',v:100,c:'#4ade80'},
          {n:'PAT',v:97,c:'#facc15'},
          {n:'Water',v:100,c:'#4ade80'},
          {n:'Asbestos',v:88,c:'var(--fx-coral)'}
        ].map(d=>{
          const C=2*Math.PI*16, off = C*(1-d.v/100);
          return `
          <div class="donut">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>
              <circle cx="20" cy="20" r="16" fill="none" stroke="${d.c}" stroke-width="3" stroke-dasharray="${C}" stroke-dashoffset="${off}" stroke-linecap="round" transform="rotate(-90 20 20)"/>
            </svg>
            <div class="d-v">${d.v}%</div>
            <div class="d-n">${d.n}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="dash-card activity">
      <div class="ch-h"><span class="t">Live activity</span><span class="led-sm"><span class="dotp"></span>Live</span></div>
      <div class="act-list">
        <div class="act"><span class="time">14:21</span><span class="lab on">P1</span><span class="msg">Plumbing leak · Camden HQ · assigned to B. Whitaker</span></div>
        <div class="act"><span class="time">14:18</span><span class="lab ok">DONE</span><span class="msg">Lift A · service complete · cert filed</span></div>
        <div class="act"><span class="time">14:09</span><span class="lab on">P2</span><span class="msg">HVAC · Floor 3 · en route · ETA 12 min</span></div>
        <div class="act"><span class="time">13:54</span><span class="lab warn">DUE</span><span class="msg">EICR · Unit 14 · 30 days · auto-allocated</span></div>
        <div class="act"><span class="time">13:31</span><span class="lab ok">DONE</span><span class="msg">PPM · Fire panel · 8 sites · Q2 schedule met</span></div>
      </div>
    </div>
  </div>
</div>`;
}

function InfraMockAssets(){
  return `
<div class="v2-infra-mock" data-mod="assets">
  <div class="hd">
    <span>› Assets · Camden HQ</span>
    <span class="led">Live</span>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    ${[
      {n:'Boiler · Worcester 4000', m:'Last svc · 12 Jan', s:'OK'},
      {n:'Lift A · KONE MonoSpace', m:'Cert · 06 Mar', s:'OK'},
      {n:'AC unit · Floor 3', m:'PPM · 22 Apr', s:'DUE'},
      {n:'Fire panel · Advanced', m:'Inspect · 30 May', s:'OK'},
      {n:'Roller door · West', m:'Service · 18 Feb', s:'OK'},
      {n:'CCTV cluster · 8ch', m:'Healthcheck', s:'OK'}
    ].map(a=>`<div style="padding:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px">
      <div style="font-size:13px;color:#fff;font-weight:500">${a.n}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.5);font-family:var(--fx-mono);letter-spacing:0.04em;margin-top:4px">${a.m}</div>
      <div style="margin-top:8px;display:inline-flex;font-family:var(--fx-mono);font-size:9.5px;letter-spacing:0.14em;padding:3px 7px;border-radius:3px;${a.s==='DUE'?'background:rgba(237,75,0,0.16);color:var(--fx-coral)':'background:rgba(74,222,128,0.10);color:#4ade80'}">${a.s}</div>
    </div>`).join('')}
  </div>
  <div style="margin-top:auto;padding-top:18px;display:flex;justify-content:space-between;font-family:var(--fx-mono);font-size:10.5px;letter-spacing:0.12em;color:rgba(255,255,255,0.4);text-transform:uppercase">
    <span>42 assets tracked</span>
    <span>£1.42M lifetime spend</span>
  </div>
</div>`;
}

function InfraMockJobs(){
  return `
<div class="v2-infra-mock" data-mod="jobs">
  <div class="hd">
    <span>› Jobs · Open · 14</span>
    <span class="led">P1: 2 active</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px">
    ${[
      {id:'#FIX-4188',j:'Plumbing · leak in WC · Floor 2',p:'P1',s:'On site',t:'1h 12m'},
      {id:'#FIX-4181',j:'HVAC · noise in unit 4',p:'P3',s:'Assigned',t:'4h 02m'},
      {id:'#FIX-4178',j:'Electrical · socket replacement',p:'P3',s:'Closed',t:'—'},
      {id:'#FIX-4176',j:'Lock · door entry · main',p:'P2',s:'En route',t:'22m'},
      {id:'#FIX-4172',j:'PPM · gas safety · annual',p:'P4',s:'Scheduled',t:'+3d'}
    ].map(j=>`<div style="padding:12px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:7px;display:grid;grid-template-columns:80px 1fr 60px 90px;gap:12px;align-items:center">
      <div style="font-family:var(--fx-mono);font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.06em">${j.id}</div>
      <div style="font-size:12.5px;color:#fff">${j.j}</div>
      <div style="font-family:var(--fx-mono);font-size:10px;letter-spacing:0.1em;padding:3px 6px;border-radius:3px;background:rgba(237,75,0,0.16);color:var(--fx-coral);text-align:center">${j.p}</div>
      <div style="font-family:var(--fx-mono);font-size:10.5px;color:rgba(255,255,255,0.7);letter-spacing:0.06em">${j.s}</div>
    </div>`).join('')}
  </div>
  <div style="margin-top:auto;padding-top:18px;display:flex;justify-content:space-between;font-family:var(--fx-mono);font-size:10.5px;letter-spacing:0.12em;color:rgba(255,255,255,0.4);text-transform:uppercase">
    <span>SLA on track · 96.2%</span>
    <span>Avg close · 17h 48m</span>
  </div>
</div>`;
}

function InfraMockSupply(){
  return `
<div class="v2-infra-mock" data-mod="supply">
  <div class="hd">
    <span>› Supply network · UK</span>
    <span class="led">3,412 trades</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px">
    ${[
      {n:'B. Whitaker',c:'Plumbing · Gas Safe',r:'⭐ 4.9',d:'1.2 mi'},
      {n:'M. Patel',c:'Electrical · NICEIC',r:'⭐ 4.8',d:'2.4 mi'},
      {n:"S. O'Connor",c:'HVAC · F-Gas Cat 1',r:'⭐ 4.9',d:'3.1 mi'},
      {n:'R. Khan',c:'Locksmith · MLA',r:'⭐ 4.7',d:'0.8 mi'},
      {n:'A. Ashford',c:'Roofing · CompetentRoofer',r:'⭐ 4.8',d:'5.6 mi'}
    ].map(t=>`<div style="padding:12px 14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:7px;display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center">
      <div>
        <div style="font-size:13px;color:#fff;font-weight:500">${t.n}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);font-family:var(--fx-mono);letter-spacing:0.04em;margin-top:2px">${t.c}</div>
      </div>
      <div style="font-size:11.5px;color:rgba(255,255,255,0.7);font-family:var(--fx-mono)">${t.r}</div>
      <div style="font-size:11px;color:var(--fx-coral);font-family:var(--fx-mono);letter-spacing:0.06em">${t.d}</div>
    </div>`).join('')}
  </div>
  <div style="margin-top:auto;padding-top:18px;display:flex;justify-content:space-between;font-family:var(--fx-mono);font-size:10.5px;letter-spacing:0.12em;color:rgba(255,255,255,0.4);text-transform:uppercase">
    <span>National coverage</span>
    <span>99.7% vetted</span>
  </div>
</div>`;
}

function InfraMockCompliance(){
  return `
<div class="v2-infra-mock" data-mod="compliance">
  <div class="hd">
    <span>› Compliance · Q2 2026</span>
    <span class="led">Audit-ready</span>
  </div>
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
    ${[
      {n:'Gas Safety',d:'150 / 150',s:'OK',u:'Renewed annual',v:100},
      {n:'EICR',d:'48 / 50',s:'DUE',u:'2 expire 14 days',v:96},
      {n:'Fire Risk',d:'12 / 12',s:'OK',u:'All sites done',v:100},
      {n:'Legionella',d:'42 / 42',s:'OK',u:'Q2 schedule met',v:100},
      {n:'PAT',d:'894 / 920',s:'OK',u:'97% complete',v:97},
      {n:'Asbestos',d:'18 / 18',s:'OK',u:'Surveys filed',v:100}
    ].map(c=>`<div style="padding:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:13px;color:#fff;font-weight:500">${c.n}</div>
        <div style="font-family:var(--fx-mono);font-size:9.5px;letter-spacing:0.14em;padding:2px 6px;border-radius:3px;${c.s==='DUE'?'background:rgba(237,75,0,0.16);color:var(--fx-coral)':'background:rgba(74,222,128,0.10);color:#4ade80'}">${c.s}</div>
      </div>
      <div style="font-family:var(--fx-mono);font-size:10.5px;color:rgba(255,255,255,0.55);letter-spacing:0.04em;margin-top:6px">${c.d} · ${c.u}</div>
      <div style="margin-top:10px;height:3px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden"><div style="width:${c.v}%;height:100%;background:${c.s==='DUE'?'var(--fx-coral)':'#4ade80'}"></div></div>
    </div>`).join('')}
  </div>
</div>`;
}

/* ---------- Block 6: TESTIMONIAL (coral band) ---------- */
function HomeTestimonial(){
  return `
<section class="v2-section coral-band">
  <div class="v2-container">
    <div class="v2-coral-eyebrow">Customer · Li &amp; Fung</div>
    <p class="v2-coral-quote">A backlog of critical jobs was resolved in weeks. Fixfy quoted, planned and delivered everything — with trades fully managed and no chasing required.</p>
    <div class="v2-coral-attr">
      <div class="ava">SB</div>
      <div>
        <div class="who">Sabrina Braz</div>
        <div class="role">Facilities Manager · Li &amp; Fung</div>
      </div>
    </div>
  </div>
</section>`;
}

/* ---------- Block 7: SOLUTIONS PREVIEW (light) ---------- */
function HomeSolutionsPreview(){
  return `
<section class="v2-section light">
  <div class="v2-container">
    <div class="v2-eyebrow" style="color:var(--fx-coral)">Live smart portal</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:18ch;color:var(--fx-ink)">One dashboard for every property.</h2>
    <p class="v2-lede" style="margin-top:18px;max-width:50ch;color:var(--fx-slate)">Manage one or thousands, with the same control.</p>
    <div class="v2-sols-light">
      <a class="v2-sol-light" href="/solutions/real-estate">
        <span class="lbl">For real estate</span>
        <h4>Manage portfolios, compliance and maintenance across every asset.</h4>
        <span class="arr">Learn more</span>
      </a>
      <a class="v2-sol-light" href="/solutions/franchises">
        <span class="lbl">For franchises</span>
        <h4>Standardise maintenance across locations, with full control and visibility.</h4>
        <span class="arr">Learn more</span>
      </a>
      <a class="v2-sol-light" href="/solutions/enterprise-operations">
        <span class="lbl">For enterprise operations</span>
        <h4>Handle high-volume requests with consistent delivery and reporting.</h4>
        <span class="arr">Learn more</span>
      </a>
      <a class="v2-sol-light" href="/solutions/service-platforms">
        <span class="lbl">For service platforms</span>
        <h4>Plug into our infrastructure to manage jobs, suppliers and reporting at scale.</h4>
        <span class="arr">Learn more</span>
      </a>
    </div>
  </div>
</section>`;
}

/* ---------- Block 8: FINAL CTA ---------- */
function HomeFinalCTA(){
  return `
<section class="v2-section dark" style="text-align:center">
  <div class="v2-narrow">
    <div class="v2-eyebrow" style="justify-content:center;display:inline-flex">Ready when you are</div>
    <h2 class="v2-h2" style="margin-top:18px;font-size:clamp(36px,4.4vw,60px)">See Fixfy with your portfolio.</h2>
    <p class="v2-lede" style="margin:24px auto 0;max-width:60ch">30-minute demo. We&rsquo;ll load three of your sites into a sandbox so you can see exactly what your team would use on day one.</p>
    <div style="margin-top:36px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="/contact" class="v2-btn v2-btn-primary">Book a demo <span class="arr">→</span></a>
      <a href="/platform" class="v2-btn v2-btn-outline">See the platform</a>
    </div>
  </div>
</section>`;
}
