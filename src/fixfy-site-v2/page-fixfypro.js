/* ============================================================
   Fixfy V2 — FixfyPro page (10 sections)
   ============================================================ */
const PageFixfyPro = () => `

<!-- 1 · HERO -->
<section class="v2-fp-hero">
  <div class="v2-container">
    <div class="v2-hero-grid">
      <div class="v2-hero-copy">
        <span class="v2-fp-badge">FixfyPro &middot; For Trades</span>
        <h1 class="v2-hero-h1" style="margin-top:24px">The £49 operating system every trade in the UK has been waiting for.</h1>
        <p class="v2-hero-lede">Quote, schedule, dispatch, invoice and get paid &mdash; from your phone. Every job, whether from Fixfy or your own clients, runs through one app.</p>

        <div class="v2-fp-price">
          <div class="num">£49<span class="u">/mo</span></div>
          <div class="sub">Flat. No per-job fees. Cancel anytime.</div>
        </div>

        <div class="v2-hero-cta">
          <a href="/fixfypro/start" class="v2-btn v2-btn-primary">Start FixfyPro <span class="arr">→</span></a>
          <a href="/fixfypro/demo" class="v2-btn v2-btn-coral-outline">Book a 10-min demo</a>
        </div>
      </div>

      <!-- 3D Phone mock with motion -->
      <div class="v2-3d-canvas">
        <div class="v2-3d-glow"></div>
        <div class="layer">
          <div class="v2-3d-card coral-edge v2-3d-stack panel-1" style="width:60%;height:380px;left:8%">
            <div class="v2-3d-card-hdr"><span>FixfyPro · Today</span><span class="led">3 active</span></div>
            <div class="v2-mock-row"><span class="id">JOB-208</span><span class="what">Boiler service · Mile End<small>09:30 · M. Thompson · £180</small></span><span class="badge ok">En route</span></div>
            <div class="v2-mock-row"><span class="id">JOB-207</span><span class="what">Lock change · Hackney<small>11:00 · S. Patel · £95</small></span><span class="badge run">Confirmed</span></div>
            <div class="v2-mock-row"><span class="id">JOB-206</span><span class="what">Roof inspection · Camden<small>14:00 · own client · £140</small></span><span class="badge run">Quoted</span></div>
            <div class="v2-mock-row"><span class="id">JOB-205</span><span class="what">PAT testing · Soho<small>Closed · invoice sent</small></span><span class="badge ok">Paid</span></div>
            <div style="display:flex;justify-content:space-between;padding-top:14px;border-top:1px dashed rgba(255,255,255,0.1);margin-top:12px">
              <div class="v2-mock-stat"><span class="k">This week</span><span class="v">£2,840</span></div>
              <div class="v2-mock-stat"><span class="k">Paid in 7d</span><span class="v" style="color:#4ade80">100%</span></div>
            </div>
          </div>

          <div class="v2-3d-card v2-3d-stack panel-2" style="width:42%;right:0;top:30px">
            <div class="v2-3d-card-hdr"><span>New job</span><span style="color:#4ade80;font-family:var(--fx-mono)">+ £180</span></div>
            <div style="font-size:13px;color:#fff;font-weight:500">Boiler service</div>
            <div style="font-size:11.5px;color:rgba(255,255,255,0.55);margin-top:4px">Mile End · 0.8mi · 4h SLA</div>
            <button style="margin-top:12px;width:100%;padding:8px;background:var(--fx-coral);color:#fff;border-radius:6px;font-family:var(--fx-mono);font-size:11px;letter-spacing:0.1em;text-transform:uppercase">Accept</button>
          </div>

          <div class="v2-3d-card v2-3d-stack panel-3" style="width:44%;left:0;bottom:0">
            <div class="v2-3d-card-hdr"><span>Invoice · auto</span><span style="font-family:var(--fx-mono);color:#4ade80">Sent</span></div>
            <div style="font-size:13px;color:#fff">JOB-205 · PAT Testing</div>
            <div style="font-size:11.5px;color:rgba(255,255,255,0.55);margin-top:4px">£140 &middot; paid in 4 days</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 2 · WHY THIS EXISTS / PAINS -->
<section class="v2-section light">
  <div class="v2-container">
    <div style="max-width:680px">
      <span class="v2-eyebrow">Why FixfyPro exists</span>
      <h2 class="v2-h2" style="margin-top:14px;color:var(--fx-ink)">Trades aren&rsquo;t lazy. Their tools are.</h2>
      <p class="v2-lede" style="margin-top:18px">Most trades juggle WhatsApp, paper invoices, three calendars and a glove-box of receipts. The day-rate disappears into admin. We built FixfyPro to give every trade the operating system the big chains have &mdash; for £49/month.</p>
    </div>

    <div class="v2-pains">
      <div class="v2-pain">
        <div class="ico">⏱</div>
        <h4>2hrs/day on admin</h4>
        <p>Quotes, invoices, chasing payment. Two billable hours, gone.</p>
      </div>
      <div class="v2-pain">
        <div class="ico">£</div>
        <h4>30+ days to get paid</h4>
        <p>Money sits in someone else&rsquo;s account while your van runs on credit.</p>
      </div>
      <div class="v2-pain">
        <div class="ico">↯</div>
        <h4>Missed jobs &amp; double-bookings</h4>
        <p>Scribbled diary in a glove-box. Same Tuesday, three customers.</p>
      </div>
      <div class="v2-pain">
        <div class="ico">⊘</div>
        <h4>No data, no leverage</h4>
        <p>Hard to grow when you can&rsquo;t see margins, repeat customers or kit costs.</p>
      </div>
    </div>
  </div>
</section>

<!-- 3 · WHAT IT DOES (6 features) -->
<section class="v2-section dark">
  <div class="v2-container">
    <div style="max-width:680px">
      <span class="v2-eyebrow">What it does</span>
      <h2 class="v2-h2" style="margin-top:14px">Six tools every trade needs. One subscription.</h2>
    </div>

    <div class="v2-feats">
      <div class="v2-feat">
        <div class="ico">Q</div>
        <h4>Quote</h4>
        <p>Pre-built templates by trade. Customer signs on phone. Quote → won → scheduled, in one tap.</p>
      </div>
      <div class="v2-feat">
        <div class="ico">S</div>
        <h4>Schedule</h4>
        <p>One calendar across every job &mdash; from Fixfy or your own clients. No double-bookings, ever.</p>
      </div>
      <div class="v2-feat">
        <div class="ico">D</div>
        <h4>Dispatch</h4>
        <p>Have a team? Assign jobs to mates, track who&rsquo;s where, and see who&rsquo;s booked when.</p>
      </div>
      <div class="v2-feat">
        <div class="ico">I</div>
        <h4>Invoice</h4>
        <p>Auto-generated when the job is signed off. VAT-ready. Tap to send, customer pays in-app.</p>
      </div>
      <div class="v2-feat">
        <div class="ico">£</div>
        <h4>Get paid</h4>
        <p>Cards, Apple Pay, Open Banking. 7-day median for jobs paid through the ledger.</p>
      </div>
      <div class="v2-feat">
        <div class="ico">↗</div>
        <h4>Grow</h4>
        <p>See your margins, repeat customers, kit costs. The data the big chains have &mdash; on your phone.</p>
      </div>
    </div>
  </div>
</section>

<!-- 4 · FIXFY ↔ OWN CLIENTS -->
<section class="v2-section light">
  <div class="v2-container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center">
      <div>
        <span class="v2-eyebrow">Fixfy or your own clients</span>
        <h2 class="v2-h2" style="margin-top:14px;color:var(--fx-ink)">Bring your own work. We&rsquo;ll add ours on top.</h2>
        <p class="v2-lede" style="margin-top:18px;color:var(--fx-slate)">FixfyPro is yours, full-stop &mdash; even for jobs we never see. Use it for your existing customers. When you&rsquo;ve got capacity, accept work from Fixfy too. Both flow into the same calendar, the same invoices, the same ledger.</p>
        <ul style="list-style:none;padding:0;margin:24px 0 0;display:flex;flex-direction:column;gap:10px;font-size:14.5px;color:var(--fx-ink)">
          <li style="display:flex;gap:10px"><span style="color:var(--fx-coral);font-weight:600">✓</span> Use it standalone for £49/mo</li>
          <li style="display:flex;gap:10px"><span style="color:var(--fx-coral);font-weight:600">✓</span> Optionally accept Fixfy jobs &mdash; you choose the SLA</li>
          <li style="display:flex;gap:10px"><span style="color:var(--fx-coral);font-weight:600">✓</span> No per-job platform fees, ever</li>
          <li style="display:flex;gap:10px"><span style="color:var(--fx-coral);font-weight:600">✓</span> Your customers, your data &mdash; you own the relationship</li>
        </ul>
      </div>
      <div style="background:#fff;border:1px solid var(--fx-line);border-radius:14px;padding:32px;box-shadow:var(--fx-elev-2)">
        <div style="font-family:var(--fx-mono);font-size:11px;letter-spacing:0.16em;color:var(--fx-mute);text-transform:uppercase;margin-bottom:18px;display:flex;justify-content:space-between"><span>Calendar · This week</span><span style="color:var(--fx-coral)">3 own · 2 fixfy</span></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--fx-paper);border-radius:6px;border-left:3px solid var(--fx-ink)">
            <span style="font-family:var(--fx-mono);font-size:11px;color:var(--fx-mute);width:64px">Mon · 09:00</span>
            <div style="flex:1"><div style="font-size:13.5px;color:var(--fx-ink);font-weight:500">Boiler service</div><div style="font-size:11.5px;color:var(--fx-slate)">Own client &middot; Mrs Coombs &middot; £180</div></div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(237,75,0,0.06);border-radius:6px;border-left:3px solid var(--fx-coral)">
            <span style="font-family:var(--fx-mono);font-size:11px;color:var(--fx-coral);width:64px">Mon · 14:00</span>
            <div style="flex:1"><div style="font-size:13.5px;color:var(--fx-ink);font-weight:500">Lift fault &middot; Shoreditch HQ</div><div style="font-size:11.5px;color:var(--fx-slate)">Fixfy job &middot; SLA 4h &middot; £220</div></div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--fx-paper);border-radius:6px;border-left:3px solid var(--fx-ink)">
            <span style="font-family:var(--fx-mono);font-size:11px;color:var(--fx-mute);width:64px">Tue · 10:00</span>
            <div style="flex:1"><div style="font-size:13.5px;color:var(--fx-ink);font-weight:500">EICR · 3-bed flat</div><div style="font-size:11.5px;color:var(--fx-slate)">Own client &middot; Hackney &middot; £290</div></div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(237,75,0,0.06);border-radius:6px;border-left:3px solid var(--fx-coral)">
            <span style="font-family:var(--fx-mono);font-size:11px;color:var(--fx-coral);width:64px">Wed · 09:30</span>
            <div style="flex:1"><div style="font-size:13.5px;color:var(--fx-ink);font-weight:500">HVAC service &middot; Soho store</div><div style="font-size:11.5px;color:var(--fx-slate)">Fixfy job &middot; SLA 24h &middot; £165</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 5 · WHO IT'S FOR -->
<section class="v2-section dark">
  <div class="v2-container">
    <div style="max-width:680px">
      <span class="v2-eyebrow">Who it&rsquo;s for</span>
      <h2 class="v2-h2" style="margin-top:14px">Every trade, from sole-trader to small firm.</h2>
    </div>

    <div class="v2-who">
      <div class="v2-who-card">
        <div class="ico">⚡</div>
        <h4>Electricians</h4>
        <p>EICRs, PAT testing, fault-finding. Certificates auto-generated and emailed.</p>
      </div>
      <div class="v2-who-card">
        <div class="ico">⛟</div>
        <h4>Plumbers &amp; Heating</h4>
        <p>Boiler services, leaks, gas safety. Gas Safe register linked to your profile.</p>
      </div>
      <div class="v2-who-card">
        <div class="ico">⌂</div>
        <h4>Builders &amp; Carpenters</h4>
        <p>Refurb, joinery, kitchens. Stage payments, photo logs, sign-off in-app.</p>
      </div>
      <div class="v2-who-card">
        <div class="ico">✦</div>
        <h4>HVAC &amp; Specialists</h4>
        <p>Refrigeration, ventilation, lifts. Compliance docs and PPM schedules built in.</p>
      </div>
    </div>
  </div>
</section>

<!-- 6 · TOUR / TABS -->
<section class="v2-section light" id="tour">
  <div class="v2-container">
    <div style="max-width:680px">
      <span class="v2-eyebrow">A look inside</span>
      <h2 class="v2-h2" style="margin-top:14px;color:var(--fx-ink)">Built for thumbs, not desktops.</h2>
      <p class="v2-lede" style="margin-top:18px;color:var(--fx-slate)">FixfyPro is a phone-first app. Every screen is one-handed. Quote in the van, invoice on the kitchen step.</p>
    </div>

    <div class="v2-tour">
      <div class="v2-tour-tabs" role="tablist">
        <button class="v2-tour-tab active" data-tab="quote">Quote</button>
        <button class="v2-tour-tab" data-tab="schedule">Schedule</button>
        <button class="v2-tour-tab" data-tab="invoice">Invoice</button>
        <button class="v2-tour-tab" data-tab="dashboard">Dashboard</button>
      </div>

      <div class="v2-tour-frame">
        <div class="v2-tour-frame-bar"><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><span style="margin-left:auto">fixfypro.app · <span id="tour-name">Quote</span></span></div>
        <div class="v2-tour-mock" id="tour-mock">
          ${tourMock('quote')}
        </div>
      </div>

      <p class="v2-tour-cap" id="tour-cap">A signed quote in 60 seconds. Templates by trade, customer signs on phone, scheduled the moment they accept.</p>
    </div>
  </div>
</section>

<!-- 7 · INTEGRATION (Fixfy <-> FixfyPro flywheel) -->
<section class="v2-int">
  <div class="v2-container">
    <div style="max-width:680px">
      <span class="v2-eyebrow">The flywheel</span>
      <h2 class="v2-h2" style="margin-top:14px">FixfyPro and Fixfy run on the same rails.</h2>
      <p style="margin-top:18px">Every trade running FixfyPro is a node in the Fixfy network. Every job that flows through Fixfy lands in a real trade&rsquo;s app. Two products, one operating system &mdash; that&rsquo;s the moat.</p>
    </div>

    <div class="v2-int-steps">
      <div class="v2-int-step"><div class="n">01</div><h5>Trade installs FixfyPro</h5><p>£49/mo. Phone in 5 minutes. Vetted, insured, ready.</p></div>
      <div class="v2-int-step"><div class="n">02</div><h5>Business reports an issue</h5><p>Tenant, manager, head office. One link. Triaged in 12s.</p></div>
      <div class="v2-int-step"><div class="n">03</div><h5>Fixfy dispatches</h5><p>Best trade by SLA, distance, rating. Lands in their FixfyPro.</p></div>
      <div class="v2-int-step"><div class="n">04</div><h5>One ledger</h5><p>Photos, sign-off, invoice, payment &mdash; both sides. Closed loop.</p></div>
    </div>

    <div style="margin-top:48px;display:flex;gap:12px;flex-wrap:wrap">
      <a href="/contact" class="v2-btn v2-btn-outline" style="background:#fff;color:var(--fx-coral);border-color:#fff">For Business <span class="arr">→</span></a>
      <a href="/fixfypro/start" class="v2-btn v2-btn-outline">Start FixfyPro · £49/mo</a>
    </div>
  </div>
</section>

<!-- 8 · PRICING -->
<section class="v2-section dark" id="pricing">
  <div class="v2-container">
    <div style="text-align:center;max-width:560px;margin:0 auto">
      <span class="v2-eyebrow">Pricing</span>
      <h2 class="v2-h2" style="margin-top:14px">One number. No surprises.</h2>
    </div>

    <div class="v2-pricing-card">
      <h3>FixfyPro · monthly</h3>
      <div class="price">£49<span class="u">/mo</span></div>
      <p class="sub">Everything below. Cancel anytime.</p>
      <ul>
        <li>Quote, schedule, dispatch, invoice</li>
        <li>Customer-facing payment links (cards, Apple Pay, Open Banking)</li>
        <li>Up to 3 dispatchable team members</li>
        <li>Optional: accept Fixfy jobs (no per-job fees)</li>
        <li>Compliance docs &amp; certificate library</li>
        <li>Bookkeeping export · Xero / QuickBooks / FreeAgent</li>
      </ul>
      <a href="/fixfypro/start" class="v2-btn v2-btn-primary" style="width:100%;justify-content:center">Start FixfyPro <span class="arr">→</span></a>
      <p class="small-print">Payment processing fees apply at standard rates. Annual billing saves 15%.</p>
    </div>
  </div>
</section>

<!-- 9 · FAQ -->
<section class="v2-section darker">
  <div class="v2-container">
    <div style="text-align:center;max-width:560px;margin:0 auto">
      <span class="v2-eyebrow">FAQ</span>
      <h2 class="v2-h2" style="margin-top:14px">The straight answers.</h2>
    </div>

    <div class="v2-faq">
      <details><summary>Do I have to accept Fixfy jobs?</summary><div>No. FixfyPro works perfectly as a standalone trade OS for your own customers. Accepting Fixfy jobs is optional &mdash; turn it on when you want extra work, off when you&rsquo;re full.</div></details>
      <details><summary>How do I get paid?</summary><div>Customers pay through the FixfyPro link &mdash; cards, Apple Pay or Open Banking. Median payout is in 7 days for jobs paid through the ledger. Bank transfers and cash still work too &mdash; you log them and the books balance.</div></details>
      <details><summary>Are there hidden fees per job?</summary><div>No platform fees. Just standard payment-processor charges (the same rates Stripe / GoCardless publish). £49/mo is £49/mo.</div></details>
      <details><summary>Can I add my mates / team?</summary><div>Up to 3 dispatchable team members on the standard plan. Need more? FixfyPro Crew adds unlimited team for £29/mo extra.</div></details>
      <details><summary>What if I already use Xero / QuickBooks?</summary><div>FixfyPro exports to Xero, QuickBooks and FreeAgent &mdash; invoices, payments, expenses. Don&rsquo;t change your bookkeeping; we feed it.</div></details>
      <details><summary>Is my customer data mine?</summary><div>Yes. Your customers, your data, your relationship. We never market to them or hand them to anyone &mdash; including other trades on Fixfy. Export anytime.</div></details>
    </div>
  </div>
</section>

<!-- 10 · FINAL CTA -->
${FINAL_CTA(
  'Take back your two billable hours.',
  '£49/mo. Cancel anytime. Built by people who&rsquo;ve been in the van.'
)}
`;

/* ---------- Tour mock content ---------- */
function tourMock(tab){
  if(tab==='quote'){
    return `
      <div style="max-width:380px;margin:0 auto">
        <div style="font-family:var(--fx-mono);font-size:11px;color:var(--fx-mute);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:14px">New Quote · Boiler service</div>
        <div style="background:var(--fx-paper);border:1px solid var(--fx-line);border-radius:8px;padding:18px">
          <div style="font-size:14px;color:var(--fx-ink);font-weight:500">Mrs J. Coombs · 14 Linden Rd</div>
          <div style="font-size:12px;color:var(--fx-slate);margin-top:2px">Annual boiler service · combi · Worcester</div>
          <div style="margin-top:18px;display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--fx-ink)">
            <div style="display:flex;justify-content:space-between"><span>Service · 1hr</span><span>£120</span></div>
            <div style="display:flex;justify-content:space-between"><span>Filter clean</span><span>£25</span></div>
            <div style="display:flex;justify-content:space-between"><span>Travel</span><span>£15</span></div>
            <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid var(--fx-line);font-weight:500"><span>VAT 20%</span><span>£32</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:600;font-size:15px"><span>Total</span><span>£192</span></div>
          </div>
          <button style="width:100%;margin-top:18px;padding:12px;background:var(--fx-coral);color:#fff;border-radius:6px;font-size:14px;font-weight:500">Send to customer →</button>
        </div>
      </div>`;
  }
  if(tab==='schedule'){
    return `
      <div style="max-width:560px;margin:0 auto">
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;font-family:var(--fx-mono);font-size:10px;color:var(--fx-mute);text-align:center">
          <div>Mon 14</div><div>Tue 15</div><div>Wed 16</div><div>Thu 17</div><div>Fri 18</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:8px">
          <div style="height:160px;background:var(--fx-paper);border-radius:6px;padding:8px;display:flex;flex-direction:column;gap:6px;font-size:10px">
            <div style="background:var(--fx-coral);color:#fff;padding:6px;border-radius:4px">09:00 Fixfy · Lift</div>
            <div style="background:var(--fx-ink);color:#fff;padding:6px;border-radius:4px">14:00 Mrs Coombs</div>
          </div>
          <div style="height:160px;background:var(--fx-paper);border-radius:6px;padding:8px;display:flex;flex-direction:column;gap:6px;font-size:10px">
            <div style="background:var(--fx-ink);color:#fff;padding:6px;border-radius:4px">10:00 EICR</div>
          </div>
          <div style="height:160px;background:var(--fx-paper);border-radius:6px;padding:8px;display:flex;flex-direction:column;gap:6px;font-size:10px">
            <div style="background:var(--fx-coral);color:#fff;padding:6px;border-radius:4px">09:30 Fixfy · HVAC</div>
            <div style="background:var(--fx-ink);color:#fff;padding:6px;border-radius:4px">15:00 Boiler swap</div>
          </div>
          <div style="height:160px;background:var(--fx-paper);border-radius:6px;padding:8px;display:flex;flex-direction:column;gap:6px;font-size:10px">
            <div style="background:var(--fx-ink);color:#fff;padding:6px;border-radius:4px">11:00 Refurb</div>
          </div>
          <div style="height:160px;background:var(--fx-paper);border-radius:6px;padding:8px;display:flex;flex-direction:column;gap:6px;font-size:10px;border:1px dashed var(--fx-line)">
            <div style="color:var(--fx-mute);text-align:center;margin-top:auto;margin-bottom:auto">Free</div>
          </div>
        </div>
        <div style="margin-top:18px;display:flex;justify-content:space-between;font-size:12px;color:var(--fx-slate)"><span>5 jobs · 3 own · 2 fixfy</span><span>£1,240 booked</span></div>
      </div>`;
  }
  if(tab==='invoice'){
    return `
      <div style="max-width:380px;margin:0 auto">
        <div style="font-family:var(--fx-mono);font-size:11px;color:var(--fx-mute);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:14px">Invoice · INV-208 · Auto-generated</div>
        <div style="background:#fff;border:1px solid var(--fx-line);border-radius:8px;padding:18px">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <div><div style="font-weight:600;color:var(--fx-ink)">M. Thompson Heating Ltd</div><div style="font-size:11px;color:var(--fx-mute)">Gas Safe · 543210 · VAT GB123456789</div></div>
            <div style="font-family:var(--fx-mono);font-size:11px;color:var(--fx-mute);text-align:right">14 Mar 2025<br/>Due: 21 Mar 2025</div>
          </div>
          <div style="margin-top:18px;font-size:12px;color:var(--fx-ink);background:var(--fx-paper);padding:14px;border-radius:6px"><span style="color:var(--fx-mute)">Bill to</span><br/>Mrs J. Coombs · 14 Linden Rd · Hackney E8</div>
          <div style="margin-top:14px;display:flex;flex-direction:column;gap:6px;font-size:13px">
            <div style="display:flex;justify-content:space-between"><span>Boiler service · annual</span><span>£160</span></div>
            <div style="display:flex;justify-content:space-between"><span>Subtotal</span><span>£160</span></div>
            <div style="display:flex;justify-content:space-between"><span>VAT 20%</span><span>£32</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:600;font-size:14px;padding-top:8px;border-top:1px solid var(--fx-line)"><span>Total</span><span>£192</span></div>
          </div>
          <div style="margin-top:14px;padding:10px;background:rgba(74,222,128,0.10);color:#16a34a;border-radius:6px;font-size:12px;display:flex;align-items:center;gap:8px"><span style="font-weight:600">●</span> Paid · Open Banking · 4 days</div>
        </div>
      </div>`;
  }
  // dashboard
  return `
    <div style="max-width:680px;margin:0 auto">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
        <div style="background:var(--fx-paper);border-radius:8px;padding:18px"><div style="font-family:var(--fx-mono);font-size:10px;color:var(--fx-mute);letter-spacing:0.14em;text-transform:uppercase">This month</div><div style="font-size:32px;font-weight:500;letter-spacing:-0.02em;color:var(--fx-ink);margin-top:6px">£8,420</div></div>
        <div style="background:var(--fx-paper);border-radius:8px;padding:18px"><div style="font-family:var(--fx-mono);font-size:10px;color:var(--fx-mute);letter-spacing:0.14em;text-transform:uppercase">Jobs</div><div style="font-size:32px;font-weight:500;letter-spacing:-0.02em;color:var(--fx-ink);margin-top:6px">42</div></div>
        <div style="background:rgba(237,75,0,0.06);border:1px solid rgba(237,75,0,0.2);border-radius:8px;padding:18px"><div style="font-family:var(--fx-mono);font-size:10px;color:var(--fx-coral);letter-spacing:0.14em;text-transform:uppercase">Paid in 7d</div><div style="font-size:32px;font-weight:500;letter-spacing:-0.02em;color:var(--fx-ink);margin-top:6px">96<span style="color:var(--fx-coral);font-size:18px">%</span></div></div>
      </div>
      <div style="margin-top:18px;background:var(--fx-paper);border-radius:8px;padding:18px">
        <div style="font-family:var(--fx-mono);font-size:10px;color:var(--fx-mute);letter-spacing:0.14em;text-transform:uppercase;margin-bottom:14px">Top customers · this month</div>
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--fx-ink)">
          <div style="display:flex;justify-content:space-between"><span>Fixfy (network)</span><span style="color:var(--fx-coral);font-weight:500">£3,840 · 18 jobs</span></div>
          <div style="display:flex;justify-content:space-between"><span>Mrs J. Coombs</span><span>£840 · 4 jobs</span></div>
          <div style="display:flex;justify-content:space-between"><span>Hackney Lettings</span><span>£640 · 6 jobs</span></div>
          <div style="display:flex;justify-content:space-between"><span>Linden Co-op</span><span>£420 · 3 jobs</span></div>
        </div>
      </div>
    </div>`;
}

export { PageFixfyPro, tourMock };
