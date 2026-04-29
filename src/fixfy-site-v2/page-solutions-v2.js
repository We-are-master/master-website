/* ============================================================
   Fixfy V2 — Solution pages (Real Estate, Franchises,
   Enterprise Operations, Service Platforms)
   ============================================================ */

/* Shared sub-blocks */
function VictorQuote(){
  return `
<section class="v2-victor">
  <div class="v2-container">
    <div class="v2-victor-inner">
      <div class="v2-eyebrow" style="color:#fff;margin-bottom:24px">Founder · on uptime</div>
      <blockquote>McDonald&rsquo;s doesn&rsquo;t stop selling fries because a fryer broke and the outlet doesn&rsquo;t work. We need to be better and faster than whoever fixes that.</blockquote>
      <div class="by">
        <div class="ava">VB</div>
        <div>
          <div class="who">Victor Braz</div>
          <div class="role">Founder · Fixfy</div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function FinalCTA(label, sub){
  return `
<section class="v2-section dark" style="text-align:center">
  <div class="v2-narrow">
    <div class="v2-eyebrow" style="display:inline-flex">Ready when you are</div>
    <h2 class="v2-h2" style="margin-top:18px">${label||'See Fixfy with your portfolio.'}</h2>
    <p class="v2-lede" style="margin:24px auto 0;max-width:60ch">${sub||'30-minute demo. We&rsquo;ll load three of your sites into a sandbox so you can see exactly what your team would use on day one.'}</p>
    <div style="margin-top:36px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="/contact" class="v2-btn v2-btn-primary">Book a demo <span class="arr">→</span></a>
      <a href="/platform" class="v2-btn v2-btn-outline">See the platform</a>
    </div>
  </div>
</section>`;
}

function SolHero(eyebrow, h1, lede, mockHTML){
  return `
<section class="v2-section dark v2-page-hero">
  <div class="v2-container">
    <div class="v2-page-hero-grid">
      <div>
        <div class="v2-eyebrow lg">For ${eyebrow}</div>
        <h1>${h1}</h1>
        <p class="lede">${lede}</p>
        <div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap">
          <a href="/contact" class="v2-btn v2-btn-primary">Book a demo <span class="arr">→</span></a>
          <a href="/platform" class="v2-btn v2-btn-outline">See the platform</a>
        </div>
      </div>
      <div class="v2-page-mock">${mockHTML}</div>
    </div>
  </div>
</section>`;
}

function ChallengeBlock(title, items){
  return `
<section class="v2-section dark">
  <div class="v2-container">
    <div class="v2-eyebrow">The challenge</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:22ch">${title}</h2>
    <div class="v2-challenges">
      ${items.map(x=>`<div class="v2-challenge"><div class="x">×</div><p>${x}</p></div>`).join('')}
    </div>
  </div>
</section>`;
}

function FeatureBlock(title, lede, items){
  return `
<section class="v2-section dark">
  <div class="v2-container">
    <div class="v2-eyebrow">Key features</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:24ch">${title}</h2>
    ${lede ? `<p class="v2-lede" style="margin-top:18px">${lede}</p>` : ''}
    <div class="v2-features">
      ${items.map((f,i)=>`<div class="v2-feature">
        <div class="ico">${String(i+1).padStart(2,'0')}</div>
        <h4>${f.t}</h4>
        <p>${f.d}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

function UseCaseBlock(cases){
  return `
<section class="v2-section dark">
  <div class="v2-container">
    <div class="v2-eyebrow">Use cases</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:22ch">How it works in practice.</h2>
    <div class="v2-usecases">
      ${cases.map(c=>`<div class="v2-usecase">
        <h4>${c.title}</h4>
        <p class="scenario">${c.scenario}</p>
        <ol>${c.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
        <div class="out">${c.outcome}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

function ROIBlock(stats){
  return `
<section class="v2-section dark">
  <div class="v2-container">
    <div class="v2-eyebrow">ROI · benefits</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:22ch">Operational impact, day one.</h2>
    <div class="v2-roi">
      ${stats.map(s=>`<div class="v2-roi-stat">
        <div class="num">${s.n}${s.u?`<span class="u">${s.u}</span>`:''}</div>
        <div class="lbl">${s.l}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

/* ============================================================
   1. REAL ESTATE
   ============================================================ */
export function PageRealEstate(){
  const heroMock = `
<div class="sol-mo re-mo">
  <div class="sol-mo-h">
    <span>› Tenant request · live route</span>
    <span class="live"><span class="d"></span>P1 · in progress</span>
  </div>
  <div class="sol-mo-body">
    <div class="re-stack">
      <div class="re-card tenant">
        <div class="re-ava">SK</div>
        <div class="re-body">
          <div class="re-role">TENANT</div>
          <div class="re-name">Sarah K. · Flat 4B</div>
          <div class="re-msg">"Heating's down again — kids are home."</div>
        </div>
        <div class="re-stamp">8:47 PM</div>
      </div>
      <div class="re-arrow a1"></div>
      <div class="re-card agency">
        <div class="re-ava">RE</div>
        <div class="re-body">
          <div class="re-role">AGENCY · AUTHORISED</div>
          <div class="re-name">Eaton &amp; Co · 14 units</div>
          <div class="re-msg">P1 raised · routed to gas-safe network</div>
        </div>
        <div class="re-stamp">8:48 PM</div>
        <div class="re-spinner"></div>
      </div>
      <div class="re-arrow a2"></div>
      <div class="re-card master">
        <div class="re-ava">BW</div>
        <div class="re-body">
          <div class="re-role">MASTER · ON SITE</div>
          <div class="re-name">B. Whitaker · Gas Safe</div>
          <div class="re-msg">Boiler reset · pressure restored · ✓ closed</div>
        </div>
        <div class="re-stamp">10:15 PM</div>
        <div class="re-check">✓</div>
      </div>
    </div>
  </div>
</div>`;

  return `
${SolHero(
  'real estate',
  'Manage portfolios, compliance and maintenance across every asset.',
  'One dashboard for every property. From single buildings to thousand-unit portfolios, maintain complete control without the complexity.',
  heroMock
)}

${ChallengeBlock('Real-estate operations are stitched together with spreadsheets and chasing.', [
  'Maintenance scattered across multiple agencies, with no single source of truth.',
  'Compliance drifting — Gas Safe, EICR, fire risk all on different calendars.',
  'Coordinating different vendors and trades, by phone, by email, by luck.',
  'Tenant complaints turning into reputational damage before you hear them.',
  'No service history per asset — every issue is a brand-new investigation.'
])}

${FeatureBlock(
  'Asset-level control. Portfolio-level visibility.',
  'Built around the Assets module: every site, every asset — fully tracked. Service history, warranties and spend, all linked and accessible.',
  [
    {t:'Portfolio dashboard',d:'All properties, jobs, compliance and spend in one view — sortable by region, asset type or risk.'},
    {t:'Asset-level tracking',d:'Every boiler, lock, lift, AC unit — full service history, warranties and forecasted lifetime cost.'},
    {t:'Automated compliance',d:'Gas Safe, EICRs, fire risk, Legionella, asbestos — scheduled and renewed automatically.'},
    {t:'Tenant portal',d:'Tenants log issues directly from a phone-first link. P1s reach you in minutes, not days.'},
    {t:'Pre-fixed pricing',d:'Transparent rates per trade, per region. Quotes generated in seconds, no surprise bills.'},
    {t:'Spend forecasting',d:'See lifetime cost per asset, per portfolio. Budget with data, not gut feel.'}
  ]
)}

${UseCaseBlock([
  {
    title:'Emergency response · winter',
    scenario:'Heating failure in a residential building, 8:47 PM.',
    steps:[
      'Tenant logs the fault via portal · 8:47 PM',
      'P1 job created, Gas Safe engineer assigned · 8:49 PM',
      'Engineer on site within SLA · 10:15 PM',
      'Repair complete, tenant notified · 11:30 PM'
    ],
    outcome:'Total resolution · 2h 43m · evidence + invoice attached'
  },
  {
    title:'Portfolio compliance · annual',
    scenario:'Annual gas safety certificates across 150 properties.',
    steps:[
      'System flags certs expiring in 60 days',
      'Jobs auto-created with P3 priority and grouped geographically',
      'Engineers scheduled across 4 weeks · zero double-booking',
      'All 150 certificates renewed on time, audit pack generated'
    ],
    outcome:'Zero non-compliant nights · audit-ready in one click'
  }
])}

${ROIBlock([
  {n:'70',u:'%',l:'Less admin time coordinating vendors'},
  {n:'100',u:'%',l:'Compliance visibility, real-time'},
  {n:'17h 48m',l:'Average P1 resolution across portfolio'},
  {n:'£0',l:'Surprise bills — pre-fixed pricing'}
])}

${FinalCTA('Run your portfolio with one team behind it.', 'See it on three of your sites. We’ll load them into a sandbox and walk through everything in 30 minutes.')}
`;
}

/* ============================================================
   2. FRANCHISES (with Victor quote)
   ============================================================ */
export function PageFranchises(){
  const heroMock = `
<div class="sol-mo fr-mo">
  <div class="sol-mo-h">
    <span>› Birmingham · Bull Ring</span>
    <span class="live"><span class="d"></span>P1 · 2h SLA</span>
  </div>
  <div class="sol-mo-body">
    <div class="fr-grid">
      <div class="fr-fryer">
        <div class="fr-fryer-svg">
          <span class="smoke"></span>
          <span class="smoke s2"></span>
          <span class="smoke s3"></span>
          <span class="basket"></span>
          <span class="body"></span>
          <span class="led"></span>
        </div>
        <div class="fr-tag">FRYER #2 · ALARM</div>
        <div class="fr-loc">Not heating · oil at 38°C</div>
      </div>
      <div class="fr-pipe">
        <div class="fr-step s1">
          <span class="dot"></span>
          <span class="t">Reported</span>
          <span class="ts">19:14</span>
        </div>
        <div class="fr-step s2">
          <span class="dot"></span>
          <span class="t">Allocated</span>
          <span class="ts">+3m</span>
        </div>
        <div class="fr-step s3">
          <span class="dot"></span>
          <span class="t">On site</span>
          <span class="ts">+47m</span>
        </div>
        <div class="fr-step s4">
          <span class="dot"></span>
          <span class="t">Trading again</span>
          <span class="ts">+1h 36m</span>
        </div>
      </div>
    </div>
    <div class="fr-foot">
      <span>✓ Network-wide SLA met</span>
      <span>0 missed services</span>
    </div>
  </div>
</div>`;

  return `
${SolHero(
  'franchises',
  'Standardise maintenance across every location.',
  'One system for every location. Maintain brand standards, ensure operational continuity, and give franchisees the tools they need.',
  heroMock
)}

${VictorQuote()}

${ChallengeBlock('A broken fryer is a broken sale.', [
  'Maintaining brand consistency across all locations.',
  'Different franchisees, different maintenance approaches.',
  'No central visibility on critical equipment.',
  'Equipment failures = lost revenue, every minute.',
  'Compliance varies by location — risk varies with it.'
])}

${FeatureBlock(
  'One operating standard. Every location, every shift.',
  'Same SLA, same vetted trade network, same compliance protocols — tailored to each site’s assets, priorities and regional vendor mix.',
  [
    {t:'Brand consistency',d:'Standardised checklists. Approved vendor network. Uniform SLA across sites. Equipment-specific templates.'},
    {t:'Franchisee portal',d:'Self-service job logging, real-time status, spend visibility per location, full historical data.'},
    {t:'Franchisor dashboard',d:'Network-wide overview. Performance benchmarking between locations. Compliance status across the portfolio.'},
    {t:'Emergency protocols',d:'Critical equipment flagged: fryers, refrigeration, HVAC. P1 response for revenue-critical failures. 24/7 coverage.'},
    {t:'Equipment templates',d:'Pre-loaded routes — “Fryer not heating” → certified commercial kitchen engineer. “Walk-in alarm” → 2h SLA, P1.'},
    {t:'Brand-grade kit',d:'Approved parts, approved finishes. Trades arrive on site already aligned with your spec.'}
  ]
)}

${UseCaseBlock([
  {
    title:'Equipment outage · peak hour',
    scenario:'Walk-in fridge alarm at Manchester Trafford, Friday 6:17 PM.',
    steps:[
      'Sensor pings Fixfy via integration · job auto-created',
      'P1 priority · 2h SLA · refrigeration specialist dispatched',
      'On site within 1h 20m · seal replaced, temp verified',
      'Stock saved · franchisee notified · evidence filed'
    ],
    outcome:'Service uninterrupted · zero stock loss'
  },
  {
    title:'Multi-site rollout · seasonal',
    scenario:'Switching all 50 outlets to summer menu — fryer recalibration, signage, deep clean.',
    steps:[
      'Single batch request raised by franchisor',
      'Jobs auto-allocated by region across 4 weekends',
      'Same trade spec everywhere · same close criteria',
      'Audit pack generated for the whole network'
    ],
    outcome:'50 sites switched · zero missed openings · one report'
  }
])}

${ROIBlock([
  {n:'73',u:'%',l:'Equipment downtime reduction'},
  {n:'6.2',u:'h',l:'Average repair time vs 2.3 days before'},
  {n:'9.1',u:'/10',l:'Franchisee satisfaction'},
  {n:'0',l:'Missed health inspections, year to date'}
])}

${FinalCTA('Same standard. Every location.', 'See the system on five of your locations. We’ll mock up the supply network and SLAs in 30 minutes.')}
`;
}

/* ============================================================
   3. ENTERPRISE OPERATIONS
   ============================================================ */
export function PageEnterprise(){
  const heroMock = `
<div class="sol-mo en-mo">
  <div class="sol-mo-h">
    <span>› Enterprise · all sites</span>
    <span class="live"><span class="d"></span>20 sites · 1 view</span>
  </div>
  <div class="sol-mo-body">
    <div class="en-ctrl">
      <span>SITES IN VIEW</span>
      <span><span class="v">20</span> / 380</span>
    </div>
    <div class="en-grid">
      <div class="en-cell" style="animation-delay:0s"><div class="label">SITE</div><div class="name">Camden HQ</div><div class="stat"><span>SLA</span><span class="pct">99%</span></div></div><div class="en-cell" style="animation-delay:0.05s"><div class="label">SITE</div><div class="name">Canary Wf</div><div class="stat"><span>SLA</span><span class="pct">97%</span></div></div><div class="en-cell" style="animation-delay:0.1s"><div class="label">SITE</div><div class="name">Kings X</div><div class="stat"><span>SLA</span><span class="pct">98%</span></div></div><div class="en-cell warn" style="animation-delay:0.15s"><div class="label">SITE</div><div class="name">Old Street</div><div class="stat"><span>SLA</span><span class="pct">94%</span></div></div><div class="en-cell" style="animation-delay:0.2s"><div class="label">SITE</div><div class="name">Liv. St</div><div class="stat"><span>SLA</span><span class="pct">99%</span></div></div><div class="en-cell" style="animation-delay:0.25s"><div class="label">SITE</div><div class="name">Soho 12</div><div class="stat"><span>SLA</span><span class="pct">98%</span></div></div><div class="en-cell" style="animation-delay:0.3s"><div class="label">SITE</div><div class="name">Mayfair</div><div class="stat"><span>SLA</span><span class="pct">99%</span></div></div><div class="en-cell" style="animation-delay:0.35s"><div class="label">SITE</div><div class="name">Shoredtch</div><div class="stat"><span>SLA</span><span class="pct">96%</span></div></div><div class="en-cell" style="animation-delay:0.4s"><div class="label">SITE</div><div class="name">Bermondsy</div><div class="stat"><span>SLA</span><span class="pct">97%</span></div></div><div class="en-cell" style="animation-delay:0.45s"><div class="label">SITE</div><div class="name">Hackney</div><div class="stat"><span>SLA</span><span class="pct">99%</span></div></div><div class="en-cell warn" style="animation-delay:0.5s"><div class="label">SITE</div><div class="name">Battersea</div><div class="stat"><span>SLA</span><span class="pct">92%</span></div></div><div class="en-cell" style="animation-delay:0.55s"><div class="label">SITE</div><div class="name">Vauxhall</div><div class="stat"><span>SLA</span><span class="pct">98%</span></div></div><div class="en-cell" style="animation-delay:0.6s"><div class="label">SITE</div><div class="name">Pimlico</div><div class="stat"><span>SLA</span><span class="pct">97%</span></div></div><div class="en-cell" style="animation-delay:0.65s"><div class="label">SITE</div><div class="name">Marylebn</div><div class="stat"><span>SLA</span><span class="pct">99%</span></div></div><div class="en-cell" style="animation-delay:0.7s"><div class="label">SITE</div><div class="name">Holborn</div><div class="stat"><span>SLA</span><span class="pct">98%</span></div></div><div class="en-cell" style="animation-delay:0.75s"><div class="label">SITE</div><div class="name">Farringd</div><div class="stat"><span>SLA</span><span class="pct">96%</span></div></div><div class="en-cell" style="animation-delay:0.8s"><div class="label">SITE</div><div class="name">Spitalfds</div><div class="stat"><span>SLA</span><span class="pct">97%</span></div></div><div class="en-cell" style="animation-delay:0.85s"><div class="label">SITE</div><div class="name">Whitech</div><div class="stat"><span>SLA</span><span class="pct">99%</span></div></div><div class="en-cell" style="animation-delay:0.9s"><div class="label">SITE</div><div class="name">Aldgate</div><div class="stat"><span>SLA</span><span class="pct">95%</span></div></div><div class="en-cell" style="animation-delay:0.95s"><div class="label">SITE</div><div class="name">Bank</div><div class="stat"><span>SLA</span><span class="pct">99%</span></div></div>
    </div>
    <div class="en-foot">
      <span>› Compliance across portfolio</span>
      <span><span class="v">99.7%</span> · all regions</span>
    </div>
  </div>
</div>`;

  return `
${SolHero(
  'enterprise operations',
  'From a single office to a network of twenty — one view, one team, one standard.',
  'Whether you operate one HQ or twenty offices across the UK, Fixfy gives you compliance, control and reporting in a single view. No more switching between FMs, vendors or spreadsheets — every site, on the same operating standard.',
  heroMock
)}

${ChallengeBlock('Scaling offices means scaling chaos — unless every site runs on the same rails.', [
  'One office is manageable. Twenty across the UK is operational chaos.',
  'Every site has its own FM, its own vendors, its own spreadsheet.',
  'Compliance drifts site-by-site — Gas Safe, EICR, fire risk, PAT, Legionella all on different calendars.',
  'No way to compare performance, spend or risk across locations.',
  'Board asks "how are all our offices doing?" — answer takes a week.'
])}

${FeatureBlock(
  'One office or twenty. Same dashboard, same control.',
  'Built for businesses that grow site-by-site. Add an office, it shows up in the same view — same SLAs, same compliance engine, same vendor network behind it.',
  [
    {t:'Single-pane portfolio',d:'1 site or 20 — every office in one grid. SLA, MTTR, spend and compliance live, side by side.'},
    {t:'Add a site in minutes',d:'New office? Drop the address, link the assets, the network is already vetted. Live the same day.'},
    {t:'Network-wide compliance',d:'Gas Safe, EICR, PAT, fire, Legionella — synced across every site. Audit pack ready in one click.'},
    {t:'Cross-site benchmarking',d:'See which offices run hot. Where SLA slips. Where spend creeps. Fix the outlier, not the average.'},
    {t:'Role-based access',d:'Office managers see their site. Regional leads see their cluster. The board sees the network.'},
    {t:'Built-in reporting',d:'Executive dashboards, ERP exports, BI feeds (Power BI, Tableau, Looker) — out of the box.'}
  ]
)}

${UseCaseBlock([
  {
    title:'Office move · finance team',
    scenario:'45 desks, 12 phone lines, 8 meeting rooms — relocating to a new floor.',
    steps:[
      'Batch request raised · auto-categorised by trade',
      'Electricians, IT, movers and decorators coordinated',
      'Completion deadline: Friday 5 PM · all parties briefed',
      'Move complete · zero Monday disruption · evidence filed'
    ],
    outcome:'On time · on budget · auditable end-to-end'
  },
  {
    title:'Quarterly board pack',
    scenario:'CFO needs spend, SLA and compliance figures for 380 sites.',
    steps:[
      'Pull the canned executive dashboard',
      'Filter by region, cost centre, vendor mix',
      'Drill into outliers · attach root-cause notes',
      'Export to PDF · ship to board in one click'
    ],
    outcome:'90 minutes saved · numbers everyone trusts'
  }
])}

${ROIBlock([
  {n:'60',u:'%',l:'FM admin time reduction'},
  {n:'8m 4s',l:'Average acknowledgement time'},
  {n:'97.4',u:'%',l:'SLA compliance month-to-date'},
  {n:'1',l:'Source of truth · across 380 sites'}
])}

${FinalCTA('Run enterprise FM like an operating system.', 'We’ll mirror your top three regions in a sandbox and walk through executive reporting, vendor mix and ERP exports.')}
`;
}

/* ============================================================
   4. SERVICE PLATFORMS
   ============================================================ */
export function PageServicePlatforms(){
  const heroMock = `
<div class="sol-mo sp-mo">
  <div class="sol-mo-h">
    <span>› API · v2.4 · live</span>
    <span class="live"><span class="d"></span>connected</span>
  </div>
  <div class="sol-mo-body" style="display:flex;flex-direction:column">
    <div class="sp-tabs">
      <div class="sp-tab active">jobs.create</div>
      <div class="sp-tab">webhook.received</div>
    </div>
    <div class="sp-code">
<span class="sp-line"><span class="sp-c-com">// 1. Quote a job from your platform</span></span>
<span class="sp-line"><span class="sp-c-verb">POST</span> <span class="sp-c-path">https://api.fixfy.com/v2/jobs</span></span>
<span class="sp-line">{</span>
<span class="sp-line">  <span class="sp-c-key">"trade"</span>: <span class="sp-c-str">"plumbing"</span>,</span>
<span class="sp-line">  <span class="sp-c-key">"priority"</span>: <span class="sp-c-str">"P1"</span>,</span>
<span class="sp-line">  <span class="sp-c-key">"site_id"</span>: <span class="sp-c-str">"ste_8af2"</span>,</span>
<span class="sp-line">  <span class="sp-c-key">"sla_minutes"</span>: <span class="sp-c-num">240</span>,</span>
<span class="sp-line">  <span class="sp-c-key">"webhook"</span>: <span class="sp-c-str">"https://you.io/hooks"</span></span>
<span class="sp-line">}</span>
<span class="sp-line"><span class="sp-c-ok">→ 201 created · job_3f1c · 8.2s</span></span>
<span class="sp-line"></span>
<span class="sp-line"><span class="sp-c-com">// 2. Updates stream back, live</span></span>
<span class="sp-line"><span class="sp-c-event">◉</span> <span class="sp-c-key">job.allocated</span>   <span class="sp-c-str">"B. Whitaker · 1.2 mi"</span></span>
<span class="sp-line"><span class="sp-c-event">◉</span> <span class="sp-c-key">job.en_route</span>    <span class="sp-c-str">"ETA 12 min"</span></span>
<span class="sp-line"><span class="sp-c-event">◉</span> <span class="sp-c-key">job.on_site</span>     <span class="sp-c-str">"+ 1h 14m"</span></span>
<span class="sp-line"><span class="sp-c-event">◉</span> <span class="sp-c-key">job.completed</span>  <span class="sp-c-str">"cert + invoice attached"</span><span class="sp-cursor"></span></span>
    </div>
    <div class="sp-status">
      <span class="ping"><span class="d"></span>200 OK · 4 events</span>
      <span>p99 · 11ms</span>
    </div>
  </div>
</div>`;

  return `
${SolHero(
  'service platforms',
  'Plug into our infrastructure to manage jobs, suppliers and reporting at scale.',
  'API-first maintenance for digital platforms. White-label capabilities, full integration, your brand.',
  heroMock
)}

${ChallengeBlock('Building maintenance in-house is expensive and slow.', [
  'Your customers need maintenance solutions — yesterday.',
  'Vetting trades at scale is operationally complex.',
  'You want to focus on your core platform, not field operations.',
  'Compliance, insurance and certifications are non-negotiable.',
  'Time-to-launch matters — months, not quarters.'
])}

${FeatureBlock(
  'Your brand. Your customers. Our infrastructure.',
  'We provide the trade network, job workflows, SLA engine, compliance docs, payments and reporting. You provide brand, UI and customer relationships.',
  [
    {t:'Full REST API',d:'Comprehensive endpoints. Webhook notifications. OAuth 2.0. Sandbox environment with seeded data.'},
    {t:'White-label portal',d:'Embeddable iframe. Your colours, logo, domain. Pre-built UI components. Mobile-responsive.'},
    {t:'Vetted trade network',d:'Nationwide coverage from day one. Gas Safe, NICEIC, OFTEC, NAPIT — all live.'},
    {t:'Job lifecycle',d:'Create, assign, track, evidence, close, invoice — every state exposed via API and webhook.'},
    {t:'Payment rails',d:'Customer collection. Trade payouts within 7 days. VAT and reconciliation handled.'},
    {t:'Reporting & analytics',d:'White-label exports. Customer-level dashboards. Revenue-share tracking built in.'}
  ]
)}

${UseCaseBlock([
  {
    title:'PropTech adds maintenance',
    scenario:'A property management platform launches a maintenance module via API.',
    steps:[
      'Integration kicked off in sandbox · core endpoints in 5 days',
      'White-label portal embedded under their brand',
      'Revenue-share model · 15% markup on jobs',
      'Live with national coverage in under 6 weeks'
    ],
    outcome:'40% of customers adopt · £2.3M ARR uplift'
  },
  {
    title:'Marketplace expands services',
    scenario:'A home-services marketplace adds maintenance jobs without growing supply ops.',
    steps:[
      'Webhook flow wired into their existing job lifecycle',
      'Trade network exposed to their customers under their brand',
      'SLAs and compliance enforced by Fixfy in the background',
      'They stay focused on growth · we run the field'
    ],
    outcome:'Launched in 4 weeks · zero new ops headcount'
  }
])}

${ROIBlock([
  {n:'4–6',u:'wks',l:'Time to launch with national coverage'},
  {n:'0',l:'Trade network to build or vet'},
  {n:'15',u:'%',l:'Typical markup partners run on jobs'},
  {n:'24/7',l:'SLA engine, insurance and compliance — handled'}
])}

${FinalCTA('Launch maintenance in weeks, not quarters.', 'Show us your platform. We’ll map an integration plan and a sandbox in one call.')}
`;
}
