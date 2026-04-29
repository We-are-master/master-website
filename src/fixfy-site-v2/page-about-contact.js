/* ============================================================
   Fixfy V2 — Platform · About · Contact
   ============================================================ */

/* ============================================================
   ABOUT — mission · victor quote · team · values
   ============================================================ */
export function PageAbout(){
  return `
<section class="v2-section dark v2-page-hero">
  <div class="v2-container">
    <div style="max-width:920px">
      <div class="v2-eyebrow lg">About Fixfy</div>
      <h1 style="font-size:clamp(40px,5.4vw,76px);line-height:1.02;letter-spacing:-0.03em;font-weight:500;margin:18px 0 0;color:#fff;text-wrap:balance">Building the future of maintenance infrastructure.</h1>
      <p class="lede" style="font-size:18px;color:rgba(255,255,255,0.7);margin-top:24px;max-width:60ch;line-height:1.55">Our mission is simple: keep British businesses running, no matter what. Downtime is the silent tax on every estate, every chain, every shop. We exist to make it disappear.</p>
    </div>
  </div>
</section>

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
</section>

<section class="v2-section dark">
  <div class="v2-container">
    <div class="v2-eyebrow">Why this matters</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:22ch">Downtime is revenue loss. We treat it like one.</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:36px">
      <p style="font-size:16px;line-height:1.6;color:rgba(255,255,255,0.75);margin:0">A fryer down at lunch is not a maintenance issue — it is a closed restaurant. A boiler down on a winter weekend is not a ticket — it is twelve cold flats and four formal complaints. A faulty till on a Saturday afternoon is not an inconvenience — it is the queue your customer never came back to.</p>
      <p style="font-size:16px;line-height:1.6;color:rgba(255,255,255,0.75);margin:0">Fixfy is built around that reality. We treat maintenance like infrastructure: vetted, instrumented, measured against an SLA. The trades are real, the engineers are real, the certificates are real — and so is the clock.</p>
    </div>
  </div>
</section>

<section class="v2-section dark">
  <div class="v2-container">
    <div class="v2-eyebrow">Leadership</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:22ch">The team behind Fixfy.</h2>
    <div class="v2-team">
      <div class="v2-team-card">
        <div class="ava">VB</div>
        <h4>Victor Braz</h4>
        <div class="role">Founder · CEO</div>
        <p>Operator-turned-founder. Spent a decade running facilities and franchise operations across the UK before realising the only way to fix maintenance was to rebuild the rails underneath it.</p>
        <a class="li">LinkedIn ›</a>
      </div>
      <div class="v2-team-card">
        <div class="ava">GD</div>
        <h4>Guilherme Dantas</h4>
        <div class="role">Co-founder · CTO</div>
        <p>Builder of high-throughput systems. Brings a platform mindset to a famously analogue industry — APIs, observability and SLAs at every layer of the stack.</p>
        <a class="li">LinkedIn ›</a>
      </div>
      <div class="v2-team-card">
        <div class="ava">OF</div>
        <h4>Orlando Favaretto</h4>
        <div class="role">Co-founder · CMO</div>
        <p>Brand and growth lead. Spent his career turning complex categories into simple, trusted products. Owns how Fixfy shows up — to operators, trades and partners alike.</p>
        <a class="li">LinkedIn ›</a>
      </div>
    </div>
  </div>
</section>

<section class="v2-section dark">
  <div class="v2-container">
    <div class="v2-eyebrow">What we stand for</div>
    <h2 class="v2-h2" style="margin-top:18px;max-width:22ch">Values, in one line each.</h2>
    <div class="v2-values">
      <div class="v2-value"><div class="n">01</div><h5>Speed</h5><p>We understand urgency — and we measure it.</p></div>
      <div class="v2-value"><div class="n">02</div><h5>Reliability</h5><p>Promises kept. Every job, every time.</p></div>
      <div class="v2-value"><div class="n">03</div><h5>Transparency</h5><p>Real-time visibility. Pre-fixed pricing. No surprises.</p></div>
      <div class="v2-value"><div class="n">04</div><h5>Excellence</h5><p>Certified professionals only. No exceptions.</p></div>
      <div class="v2-value"><div class="n">05</div><h5>Innovation</h5><p>Technology-first. Operations-grade.</p></div>
    </div>
  </div>
</section>

<section class="v2-section dark" style="text-align:center">
  <div class="v2-narrow">
    <div class="v2-eyebrow" style="display:inline-flex">Join us</div>
    <h2 class="v2-h2" style="margin-top:18px">Build the rails for British business.</h2>
    <p class="v2-lede" style="margin:24px auto 0;max-width:60ch">We&rsquo;re hiring across engineering, operations and design. If you want to ship infrastructure with measurable impact, talk to us.</p>
    <div style="margin-top:36px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <a href="/careers" class="v2-btn v2-btn-primary">Open roles <span class="arr">→</span></a>
      <a href="/contact" class="v2-btn v2-btn-outline">Say hello</a>
    </div>
  </div>
</section>
`;
}

/* ============================================================
   CONTACT — form + side info
   ============================================================ */
export function PageContact(){
  return `
<section class="v2-section dark v2-page-hero">
  <div class="v2-container">
    <div style="max-width:760px">
      <div class="v2-eyebrow lg">Talk to us</div>
      <h1 style="font-size:clamp(40px,5vw,68px);line-height:1.05;letter-spacing:-0.03em;font-weight:500;margin:18px 0 0;color:#fff;text-wrap:balance">Let&rsquo;s talk about your maintenance needs.</h1>
      <p class="lede" style="font-size:18px;color:rgba(255,255,255,0.7);margin-top:24px;max-width:60ch;line-height:1.55">Quick response guaranteed — usually within a working day. For emergencies, use the priority line below.</p>
    </div>

    <div class="v2-contact" style="margin-top:48px">
      <form class="v2-form" id="v2-contact-form">
        <div class="v2-form-row">
          <label><span class="l">Name</span><input type="text" required placeholder="Your name"/></label>
          <label><span class="l">Email</span><input type="email" required placeholder="you@company.co.uk"/></label>
        </div>
        <div class="v2-form-row">
          <label><span class="l">Company</span><input type="text" placeholder="Company name"/></label>
          <label><span class="l">Phone</span><input type="tel" placeholder="+44"/></label>
        </div>
        <label><span class="l">Industry</span>
          <select>
            <option>Real Estate · landlords, BTR, agencies</option>
            <option>Franchises · multi-site brand operators</option>
            <option>Enterprise · corporate facilities</option>
            <option>Service Platforms · API + white-label</option>
            <option>Other</option>
          </select>
        </label>
        <label><span class="l">Message</span>
          <textarea placeholder="Tell us about your portfolio, what you&rsquo;re using today, and what you&rsquo;d like to fix."></textarea>
        </label>
        <button type="submit">Send message →</button>
      </form>

      <div class="v2-contact-side">
        <div class="v2-contact-block">
          <div class="l">Book a demo</div>
          <div class="v">30-minute walkthrough<small>We&rsquo;ll load three of your sites into a sandbox.</small></div>
        </div>
        <div class="v2-contact-block">
          <div class="l">Email</div>
          <div class="v">hello@getfixfy.com<small>For all general enquiries.</small></div>
        </div>
        <div class="v2-contact-block">
          <div class="l">Phone</div>
          <div class="v">+44 20 7946 0188<small>Monday–Friday · 09:00–18:00 GMT</small></div>
        </div>
        <div class="v2-contact-block" style="border-color:rgba(237,75,0,0.4);background:rgba(237,75,0,0.04)">
          <div class="l">Emergency · existing customers</div>
          <div class="v">+44 20 7946 0190<small>24/7 P1 line · SLA-bound response.</small></div>
        </div>
        <div class="v2-contact-block">
          <div class="l">Partner inquiries</div>
          <div class="v">partners@getfixfy.com<small>API · white-label · revenue share.</small></div>
        </div>
      </div>
    </div>
  </div>
</section>
`;
}
