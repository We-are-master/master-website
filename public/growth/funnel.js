/* Fixfy Growth, funnel engine. Renders into #fn-root. */
(function () {
  const PRODUCT = {
    name: 'Fixfy Growth',
    amt: '£379',
    old: '£2,299',
    desc: 'One payment. No subscription. You own it.',
  };

  const ATTENDANTS = ['Cris', 'Maya', 'Sophie', 'Elena', 'Rita', 'Nina', 'Laura', 'Ana', 'Kate', 'Jo'];

  // Post-payment brief: source, website, goal (trades collected in step 1).
  // Pre-payment: intro → trade → booking → business details → plan+pay → downsell.
  const TRADE_Q = {
    id: 'trade',
    kicker: 'Step 1 of 4',
    q: 'What work do you do?',
    sub: 'Select all that apply.',
    type: 'multi',
    cols: 2,
    options: ['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Landscaping', 'Cleaning', 'Remodeling', 'Handyman', 'Other'],
  };

  const Q = {
    source:  { id:'source', kicker:'Question 1 of 3', q:'How do you get most of your jobs today?', type:'single',
      options:['Referrals','Lead-gen platforms (Angi, Thumbtack…)','Word of mouth',"I don't have a steady source"] },
    website: { id:'website', kicker:'Question 2 of 3', q:'Do you have a website right now?', type:'single',
      options:['No',"Yes, but it's outdated","Yes, but it doesn't bring me jobs"] },
    goal:    { id:'goal', kicker:'Question 3 of 3', q:"What's your #1 goal?", type:'single',
      options:['Get more bookings','Stop paying for leads','Look more professional','Rank on Google'] }
  };

  const RAIL = ['Your trade', 'Book onboarding', 'Your details', 'Pay & confirm'];

  const LEADGEN = {
    'United Kingdom': 'Checkatrade, Bark, MyBuilder…',
    'United States': 'Angi, Thumbtack, HomeAdvisor…',
    'Canada': 'HomeStars, Bark, Jiffy…',
    'Ireland': 'Tradesmen.ie, Bark…',
    'Australia': 'hipages, Airtasker…'
  };

  const ADDONS = {
    crm: {
      name: 'Fixfy Pro CRM',
      price: 99,
      was: 198,
      per: '/mo',
      ico: '📊',
      tag: '50% off',
      desc: 'Manage your <b>entire job</b> in one place — pipeline, quotes, jobs, invoicing and customer history. Built for UK trades.',
    },
    social: {
      name: 'Brand manual + 24 social posts',
      price: 127,
      was: 254,
      per: 'one-off',
      ico: '📱',
      tag: '50% off',
      desc: 'Professional brand manual plus <b>24 ready-to-post creatives</b> for Instagram &amp; LinkedIn.',
    },
  };
  const addonTotal = () => Object.keys(ADDONS).reduce((t,k)=> t + (S.addons[k] ? ADDONS[k].price : 0), 0);
  const addonsChosen = () => Object.keys(ADDONS).filter(k => S.addons[k]);

  const HOLD_SEC = 600;

  let S = {
    dir: document.body.dataset.fn || 'conversational',
    i: 0,
    answers: { trade: [] },
    lead: { name:'', email:'', phone:'' },
    biz: { bizname:'', area:'', country:'United Kingdom' },
    slot: null, day: null, time: null, slotIso: null,
    availabilityDays: [],
    availabilityLoading: false,
    bookingId: null,
    attendant: '',
    addons: { crm: false, social: false },
    holdT: null, holdLeft: HOLD_SEC
  };

  const root = () => document.getElementById('fn-root');
  const esc = s => (s||'').replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const firstName = () => (S.lead.name||'').trim().split(/\s+/)[0] || 'there';
  const bizName = () => S.biz.bizname.trim() || 'your business';

  function getTrades() {
    const t = S.answers.trade;
    if (Array.isArray(t)) return t.filter(Boolean);
    if (typeof t === 'string' && t) return [t];
    return [];
  }

  function formatTrades(trades, mode) {
    const list = Array.isArray(trades) ? trades.filter(Boolean) : getTrades();
    if (!list.length || (list.length === 1 && list[0] === 'Other')) {
      return mode === 'head' ? 'more' : 'your trade';
    }
    const use = list.filter(t => t !== 'Other').length ? list.filter(t => t !== 'Other') : list;
    if (mode === 'head') {
      if (use.length === 1) return esc(use[0].toLowerCase());
      if (use.length === 2) return esc(use[0].toLowerCase() + ' & ' + use[1].toLowerCase());
      return esc(use.slice(0, -1).map(t => t.toLowerCase()).join(', ') + ' & ' + use[use.length - 1].toLowerCase());
    }
    return esc(use.join(' & '));
  }

  function pickAttendant(email, slotIso) {
    const seed = (email || '') + (slotIso || '');
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    return ATTENDANTS[Math.abs(h) % ATTENDANTS.length];
  }

  function ensureAttendant() {
    if (!S.attendant) {
      S.attendant = pickAttendant(S.lead.email, S.slotIso);
    }
    return S.attendant;
  }

  function progress() {
    const total = 4;
    const done = Math.min(Math.max(S.i, 0), total);
    return Math.round((done / (total + 1)) * 100);
  }

  function validateLeadBiz() {
    const err = document.getElementById('fn-lead-error');
    if (!S.lead.name.trim()) {
      if (err) err.textContent = 'Enter your name.';
      return false;
    }
    if (!S.lead.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(S.lead.email)) {
      if (err) err.textContent = 'Enter a valid email.';
      return false;
    }
    if (!S.biz.bizname.trim()) {
      if (err) err.textContent = 'Enter your business name.';
      return false;
    }
    if (!S.biz.country) S.biz.country = 'United Kingdom';
    if (err) err.textContent = '';
    return true;
  }

  function quizComplete() {
    return !!(S.answers.source && S.answers.website && S.answers.goal);
  }

  function setDir(dir) { S.dir = dir; document.body.dataset.fn = dir; render(); }
  window.__fnSetDir = setDir;

  function go(n) {
    S.i = n;
    if (S.i === 2) {
      loadAvailability();
      if (S.time) startHold();
    }
    if (S.i === 4) {
      ensureAttendant();
      if (!S.holdT && S.time) startHold();
      setTimeout(mountStripe, 0);
    } else if (window.GrowthCheckout) {
      window.GrowthCheckout.reset();
    }
    window.scrollTo({ top:0, behavior:'instant' in window ? 'instant' : 'auto' });
    render();
  }

  async function loadAvailability() {
    if (!window.GrowthCheckout || S.availabilityLoading) return;
    S.availabilityLoading = true;
    try {
      const data = await window.GrowthCheckout.loadAvailability();
      S.availabilityDays = data.days || [];
    } catch (err) {
      console.warn('[funnel] availability:', err);
      S.availabilityDays = bookingDaysFallback();
    }
    S.availabilityLoading = false;
    render();
  }

  function mountStripe() {
    const el = document.getElementById('fn-stripe-element');
    if (el && window.GrowthCheckout) {
      window.GrowthCheckout.mountPaymentElement(el, S).catch((err) => {
        const errBox = document.getElementById('fn-pay-error');
        if (errBox) errBox.textContent = err.message || 'Could not load payment form';
      });
    }
  }

  async function doPay() {
    const btn = document.getElementById('fn-pay-btn');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
    const result = await window.GrowthCheckout.pay(S);
    if (btn) { btn.disabled = false; btn.style.opacity = ''; }
    if (result.ok) {
      clearInterval(S.holdT);
      saveThanksData();
      go(5);
    }
  }

  function next() {
    if (S.i === 1 && !getTrades().length) return;
    if (S.i === 3 && !validateLeadBiz()) return;
    go(S.i + 1);
  }
  function back() { if (S.i > 0) go(S.i - 1); }

  function answer(qid, val) {
    S.answers[qid] = val;
    setTimeout(next, 180);
    render();
  }

  function toggleTrade(val) {
    if (!Array.isArray(S.answers.trade)) S.answers.trade = [];
    const idx = S.answers.trade.indexOf(val);
    if (idx >= 0) S.answers.trade.splice(idx, 1);
    else S.answers.trade.push(val);
    render();
  }

  function startHold() {
    clearInterval(S.holdT); S.holdLeft = HOLD_SEC;
    S.holdT = setInterval(() => {
      S.holdLeft--; const el = document.getElementById('fn-hold-clock');
      if (el) el.textContent = fmtClock(S.holdLeft);
      if (S.holdLeft <= 0) clearInterval(S.holdT);
    }, 1000);
  }
  function fmtClock(s){ const m=Math.floor(s/60), x=s%60; return m+':'+String(x).padStart(2,'0'); }

  function screenIntro() {
    const hl = 'color:var(--g-coral);text-decoration:underline;text-underline-offset:3px';
    const chk = '<svg class="fn-chk" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return `<div class="fn-q fn-stage" style="text-align:center;max-width:620px">
      ${window.GrowthBrand ? window.GrowthBrand.hero() : '<div class="g-mark" style="margin:0 auto 22px;width:46px;height:46px;font-size:24px;border-radius:12px">F</div>'}
      <h2 style="font:var(--fx-w-semi) clamp(28px,4.6vw,44px)/1.08 var(--fx-sans);letter-spacing:-.02em">
        <span style="display:block;font-size:.6em;margin-bottom:9px">You've built the <span style="${hl}">Trade</span>.</span>
        Now let's build the<br><span style="${hl}">System behind it</span>.</h2>
      <div class="fn-feats">
        <span class="fn-feat">${chk} Website</span>
        <span class="fn-feat">${chk} Booking System</span>
        <span class="fn-feat">${chk} CRM</span>
        <span class="fn-feat">${chk} Automated Follow-ups</span>
      </div>
      <p class="sub" style="font-size:17px;max-width:50ch;margin:16px auto 0">Pick your trade, book onboarding, and pay in about 2 minutes — then we'll build your site in 7 days.</p>
      <div style="margin-top:28px"><button class="g-btn g-btn-primary g-btn-lg" onclick="__fn.next()">Get More Bookings <span class="arr">→</span></button></div>
    </div>`;
  }

  function quizScreen(q) {
    let body = '';
    if (q.type === 'single') {
      body = `<div class="fn-opts ${q.cols===2?'cols2':''}">${q.options.map(o=>{
        const sel = S.answers[q.id]===o;
        return `<button class="fn-opt ${sel?'sel':''}" onclick="__fn.answer('${q.id}',${JSON.stringify(o).replace(/"/g,'&quot;')})">
          <span>${o}</span>
          <span class="tick">${sel?'<svg width="13" height="13" viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}</span>
        </button>`; }).join('')}</div>`;
    } else if (q.type === 'multi') {
      const selected = getTrades();
      body = `<div class="fn-opts ${q.cols===2?'cols2':''}">${q.options.map(o=>{
        const sel = selected.includes(o);
        return `<button type="button" class="fn-opt ${sel?'sel':''}" onclick="__fn.toggleTrade(${JSON.stringify(o).replace(/"/g,'&quot;')})">
          <span>${o}</span>
          <span class="tick">${sel?'<svg width="13" height="13" viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}</span>
        </button>`; }).join('')}</div>
        <div class="fn-nav"><button class="fn-back" onclick="__fn.back()">← Back</button><span class="fn-spacer"></span>
          <button class="g-btn g-btn-primary g-btn-lg" ${selected.length?'':'disabled style="opacity:.4;pointer-events:none"'} onclick="__fn.next()">Continue <span class="arr">→</span></button></div>`;
    } else if (q.type === 'form') {
      body = `<div class="fn-fields">${q.fields.map(f=> f.type==='select'
        ? `<div class="fn-field"><label>${f.label}</label>
          <div class="fn-select" data-key="${f.k}">
            <button type="button" class="fn-select-btn ${S.biz[f.k]?'':'placeholder'}" onclick="__fn.toggleSelect('${f.k}')">
              <span>${S.biz[f.k] ? esc(S.biz[f.k]) : 'Select…'}</span>
              <svg class="fn-select-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="fn-select-menu">${f.options.map(o=>`<button type="button" class="fn-select-opt ${S.biz[f.k]===o?'sel':''}" onclick="__fn.pickSelect('${f.k}','${esc(o)}')">${esc(o)}</button>`).join('')}</div>
          </div></div>`
        : `<div class="fn-field"><label>${f.label}</label>
          <input id="fld-${f.k}" value="${esc(S.biz[f.k])}" placeholder="${f.ph}" oninput="__fn.setBiz('${f.k}',this.value)"/></div>`).join('')}</div>
        <div class="fn-nav"><button class="fn-back" onclick="__fn.back()">← Back</button><span class="fn-spacer"></span>
          <button class="g-btn g-btn-primary g-btn-lg" onclick="__fn.next()">Continue <span class="arr">→</span></button></div>`;
    }
    const navForSingle = q.type==='single' ? `<div class="fn-nav"><button class="fn-back" onclick="__fn.back()">← Back</button></div>` : '';
    return `<div class="fn-q fn-stage">
      <div class="fn-q-kicker">${q.kicker}</div>
      <h2>${q.q}</h2>${q.sub?`<p class="sub">${q.sub}</p>`:''}
      ${body}${navForSingle}
    </div>`;
  }

  function screenLeadBiz() {
    return `<div class="fn-q fn-stage">
      <div class="fn-q-kicker">Step 3 of 4 · Your business details</div>
      <h2>Your business details</h2>
      <p class="sub">Takes 30 seconds — then you can confirm and pay.</p>
      <div class="fn-fields">
        <div class="fn-field"><label>Your name</label><input id="ld-name" value="${esc(S.lead.name)}" placeholder="Jordan Smith" oninput="__fn.setLead('name',this.value)"/></div>
        <div class="fn-field"><label>Business name</label><input id="ld-biz" value="${esc(S.biz.bizname)}" placeholder="Rivington Plumbing Ltd" oninput="__fn.setBiz('bizname',this.value)"/></div>
        <div class="fn-row2">
          <div class="fn-field"><label>Email</label><input id="ld-email" type="email" value="${esc(S.lead.email)}" placeholder="you@business.co.uk" oninput="__fn.setLead('email',this.value)"/></div>
          <div class="fn-field"><label>Phone <span style="color:var(--fx-mute);font-weight:400">(optional)</span></label><input id="ld-phone" type="tel" value="${esc(S.lead.phone)}" placeholder="07700 900000" oninput="__fn.setLead('phone',this.value)"/></div>
        </div>
      </div>
      <p id="fn-lead-error" class="g-mono" style="color:#c0392b;text-align:center;margin-top:10px;font-size:13px;min-height:18px"></p>
      <div class="fn-nav"><button class="fn-back" onclick="__fn.back()">← Back</button><span class="fn-spacer"></span>
        <button class="g-btn g-btn-primary g-btn-lg" onclick="__fn.next()">Continue <span class="arr">→</span></button></div>
    </div>`;
  }

  function screenWinJobs() {
    const tradeHead = formatTrades(null, 'head');
    const tradeLabel = formatTrades(null, 'label');
    const attendant = ensureAttendant();
    const features = [
      ['🌐', 'Professional website', 'Up to 10 pages, built to convert ' + esc(bizName()) + '.'],
      ['📅', 'Job-based booking', 'Customers book the right job online — fewer no-shows.'],
      ['⚡', 'CRM + WhatsApp', 'Every booking in one place, pinged to your WhatsApp.'],
      ['🔍', 'Local Google SEO', 'Rank for "' + tradeLabel.toLowerCase() + ' near me" in your area.'],
    ];
    return `<div class="fn-stage fn-plan-pay">
      <div class="fn-q-kicker" style="text-align:center">Step 4 of 4 · Confirm &amp; pay</div>
      <h2 style="text-align:center;font:var(--fx-w-semi) clamp(24px,3.2vw,34px)/1.05 var(--fx-sans);letter-spacing:-.02em">Start winning ${tradeHead} jobs.</h2>
      <p class="sub" style="text-align:center;max-width:46ch;margin:8px auto 0">Everything ${esc(bizName())} needs — website, booking, CRM, local SEO and automations — built in 7 days.</p>
      <div class="fn-hold fn-hold--pay" style="margin-top:16px">
        <span class="fn-hold-ic">⏳</span>
        <span>Slot held for <b id="fn-hold-clock">${fmtClock(S.holdLeft)}</b></span>
      </div>
      <div class="fn-pay-grid" style="margin-top:20px">
        <div class="fn-paybox">
          <div class="fn-sum-card" style="margin-bottom:18px">
            <div class="fn-sum-hd-row" style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
              <div>
                <div class="fn-sum-built" style="font-size:15px">Get more <b>bookings</b>. Do less <b>chasing</b>.</div>
                <div class="fn-guarantee" style="margin-top:10px;padding:0;background:none;border:none"><span class="ic">🛡️</span><div class="g" style="font-size:13px"><b>100% risk-free.</b> Fully refunded before work begins.</div></div>
              </div>
              <div class="fn-sum-price" style="text-align:right"><s>${PRODUCT.old}</s> <b>${PRODUCT.amt}</b><span> one-off</span></div>
            </div>
            <div class="fn-sum-body" style="margin-top:14px;display:grid;gap:10px">
              ${features.map(([ic,h,p2])=>`<div class="fn-sum-item" style="padding:10px 0"><span class="ic">${ic}</span><div><h4 style="font-size:14px;margin:0">${h}</h4><p style="font-size:13px;margin:4px 0 0">${p2}</p></div></div>`).join('')}
            </div>
          </div>
          <div class="fn-attendant">
            <span class="fn-attendant-av" aria-hidden="true">${attendant.charAt(0)}</span>
            <div>
              <div style="font-weight:600;font-size:14px">Your onboarding specialist: ${esc(attendant)}</div>
              <div class="g-mute" style="font-size:13px;margin-top:4px;line-height:1.45">On your 15-minute call, ${esc(attendant)} will walk you through your 7-day build and answer any questions.</div>
            </div>
          </div>
          <p class="g-mute" style="margin:18px 0 10px;font-size:15px;line-height:1.5">Pay <b>${PRODUCT.amt}</b> today — one payment, no subscription. You own everything we build.</p>
          <h3 class="g-h3" style="margin:0 0 10px">Payment</h3>
          <div id="fn-stripe-element" class="fn-card-fields"></div>
          <p id="fn-pay-error" class="g-mono" style="color:#c0392b;text-align:center;margin-top:10px;font-size:12px"></p>
          <button id="fn-pay-btn" class="g-btn g-btn-green g-btn-block g-btn-lg" style="margin-top:18px" onclick="__fn.pay()">
            <span class="fn-lock">🔒</span> Pay ${PRODUCT.amt} &amp; confirm slot</button>
          <p class="g-mono g-mute" style="text-align:center;margin-top:12px;font-size:11px">Secure payment via Stripe · Google Calendar invite sent on confirmation</p>
        </div>
        <div class="fn-recap">
          <h4 class="g-h3" style="margin-bottom:14px">Your order</h4>
          <div class="row"><span>Plan</span><b>${PRODUCT.name}, ${PRODUCT.amt}</b></div>
          <div class="row"><span>Trade</span><b>${tradeLabel}</b></div>
          <div class="row"><span>Business</span><b>${esc(bizName())}</b></div>
          <div class="row"><span>Onboarding</span><b>${slotLabel()}</b></div>
          <div class="row"><span>Specialist</span><b>${esc(attendant)}</b></div>
          <div class="row total"><span>Due today</span><span>${PRODUCT.amt}</span></div>
          <div class="fn-trust-badges">
            <span><span class="fn-lock">🔒</span> Secure payment via Stripe</span>
            <span>✓ Refundable before work begins</span>
            <span>✓ Slot confirmed only after payment succeeds</span>
          </div>
        </div>
      </div>
      <div class="fn-nav" style="max-width:none;margin-top:18px"><button class="fn-back" onclick="__fn.back()">← Back</button></div>
    </div>`;
  }

  function screenBooking() {
    const days = S.availabilityDays.length ? S.availabilityDays : bookingDaysFallback();
    const day = S.day !== null ? days[S.day] : null;
    const times = day ? day.times : [];
    return `<div class="fn-q fn-stage" style="max-width:720px">
      <div class="fn-q-kicker">Step 2 of 4 · Book your onboarding</div>
      <h2>Pick your onboarding time.</h2>
      <p class="sub">This 15-minute call is where we learn your business and kick off your 7-day build.</p>
      ${S.availabilityLoading ? '<p class="g-mono g-mute" style="text-align:center">Loading available times…</p>' : ''}
      <div class="fn-cal">${days.map((d,idx)=>`
        <button class="${S.day===idx?'sel':''}" onclick="__fn.pickDay(${idx})">
          <div class="dow">${d.dow}</div><div class="dnum">${d.num}</div><div class="dmon">${d.mon}</div>
        </button>`).join('')}</div>
      ${S.day!==null && times.length ? `<div class="fn-times">${times.map(t=>`
        <button class="${S.time===t.time?'sel':''}" onclick="__fn.pickTime('${t.time}','${t.iso}')">${t.time}</button>`).join('')}</div>`:''}
      ${S.day!==null&&S.time?`<div class="fn-hold">⏳ Your time is held for <b id="fn-hold-clock">${fmtClock(S.holdLeft)}</b></div>`:''}
      <div class="fn-nav"><button class="fn-back" onclick="__fn.back()">← Back</button><span class="fn-spacer"></span>
        <button class="g-btn g-btn-primary g-btn-lg" ${(S.day!==null&&S.time)?'':'disabled style="opacity:.4;pointer-events:none"'} onclick="__fn.next()">Continue to your details <span class="arr">→</span></button></div>
    </div>`;
  }

  function screenDownsell() {
    const cards = Object.keys(ADDONS).map(k => {
      const a = ADDONS[k], on = S.addons[k];
      return `<div class="fn-addon ${on?'on':''}">
        <div class="fn-addon-ic">${a.ico}</div>
        <div class="fn-addon-body">
          <div class="fn-addon-top"><h3>${a.name}</h3>${a.tag?`<span class="fn-addon-tag">${a.tag}</span>`:''}</div>
          <p>${a.desc}</p>
          <div class="fn-addon-foot">
            <span class="fn-addon-price">${a.was ? `<s>£${a.was}</s> ` : ''}£${a.price} <small>${a.per || 'one-off'}</small></span>
            <button class="fn-addon-btn ${on?'on':''}" onclick="__fn.toggleAddon('${k}')">${on?'✓ Added':'+ Add'}</button>
          </div>
        </div>
      </div>`;
    }).join('');
    const total = addonTotal();
    return `<div class="fn-q fn-stage" style="max-width:720px">
      <div class="fn-q-kicker" style="text-align:center;color:var(--g-green-press)">✓ Payment confirmed, slot locked</div>
      <h2 style="text-align:center;font:var(--fx-w-semi) clamp(24px,3vw,34px)/1.1 var(--fx-sans);letter-spacing:-.02em">Exclusive add-ons — 50% off today only</h2>
      <p class="sub" style="text-align:center;max-width:52ch;margin-inline:auto">Your card is on file — add with one tap. Use our CRM to manage the entire job, or get a brand manual plus 24 posts for Instagram &amp; LinkedIn.</p>
      <div class="fn-addons">${cards}</div>
      <div class="fn-addon-bar">
        <span>${total ? `<b>£${total}</b> in add-ons · charged to your card on file` : 'No add-ons selected'}</span>
        <div class="fn-addon-actions">
          <button class="fn-back" onclick="__fn.finish()">No thanks, continue</button>
          <button class="g-btn ${total?'g-btn-green':'g-btn-primary'} g-btn-lg" onclick="__fn.finish()">${total?`Add £${total} & continue`:'Continue'} <span class="arr">→</span></button>
        </div>
      </div>
      <p class="g-mono g-mute" style="text-align:center;margin-top:14px;font-size:11px">Add-ons are noted on your booking, we'll confirm charges separately.</p>
    </div>`;
  }

  function bookingDaysFallback() {
    const out = [], d = new Date(); d.setDate(d.getDate()+2);
    const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const times = ['09:00','10:30','12:00','13:30','15:00','16:30'].map(t => ({ time: t, iso: '' }));
    let n=0;
    while (out.length<5) {
      const wd=d.getDay();
      if (wd!==0&&wd!==6){
        const full = DOW[wd]+', '+d.getDate()+' '+MON[d.getMonth()];
        out.push({ dow:DOW[wd], num:d.getDate(), mon:MON[d.getMonth()], full, times });
      }
      d.setDate(d.getDate()+1);
      if(++n>14)break;
    }
    return out;
  }

  function slotLabel() {
    if (S.day === null || !S.time) return '—';
    const days = S.availabilityDays.length ? S.availabilityDays : bookingDaysFallback();
    const day = days[S.day];
    return day ? `${day.full} · ${S.time}` : `${S.time}`;
  }

  function saveThanksData() {
    const chosen = addonsChosen().map((k) => ({
      key: k,
      name: ADDONS[k].name,
      price: ADDONS[k].price,
      ico: ADDONS[k].ico,
    }));
    const trades = getTrades();
    try {
      sessionStorage.setItem('fx_growth_thanks', JSON.stringify({
        firstName: firstName(),
        businessName: bizName(),
        email: S.lead.email,
        slotLabel: slotLabel(),
        slotIso: S.slotIso,
        addons: chosen,
        plan: 'growth',
        bookingId: S.bookingId,
        quizComplete: quizComplete(),
        trade: trades,
        trades,
        attendant: ensureAttendant(),
        country: S.biz.country || 'United Kingdom',
      }));
    } catch (e) {
      console.warn('[funnel] could not save thanks data', e);
    }
  }

  function goThankYou() {
    saveThanksData();
    window.location.href = '/growth/thank-you.html';
  }

  function railHtml() {
    const railIdx = (S.i>=1 && S.i<=4) ? S.i-1 : -1;
    const steps = RAIL.map((label,k)=>{
      const cls = k<railIdx?'done':k===railIdx?'cur':'';
      const mark = k<railIdx?'<svg width="12" height="12" viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>':(k+1);
      return `<li class="${cls}"><span class="n">${mark}</span>${label}</li>`;
    }).join('');
    const rows = [];
    const trades = getTrades();
    if (trades.length) rows.push(['Trade', formatTrades(trades, 'label')]);
    if (S.biz.bizname) rows.push(['Business', S.biz.bizname]);
    rows.push(['Plan', PRODUCT.name + ' · ' + PRODUCT.amt]);
    if (S.day!==null && S.time) rows.push(['Onboarding', slotLabel()]);
    const sum = rows.length ? rows.map(([k,v])=>`<div class="row"><span class="g-mute">${k}</span><b>${esc(String(v))}</b></div>`).join('')
                            : '<div class="empty">Your answers will appear here as you go.</div>';
    return `<aside class="fn-rail">
      ${window.GrowthBrand ? window.GrowthBrand.html('style="margin-bottom:24px"') : '<a href="index.html" class="g-brand" style="margin-bottom:24px"><span class="g-mark">F</span> Fixfy</a>'}
      <ul class="fn-rail-steps">${steps}</ul>
      <div class="fn-rail-summary"><h4>Your plan</h4>${sum}</div>
    </aside>`;
  }

  function render() {
    let stage;
    if (S.i===0) stage = screenIntro();
    else if (S.i===1) stage = quizScreen(TRADE_Q);
    else if (S.i===2) stage = screenBooking();
    else if (S.i===3) stage = screenLeadBiz();
    else if (S.i===4) stage = screenWinJobs();
    else stage = screenDownsell();

    const showRail = S.dir==='sidebar' && S.i>=1 && S.i<=4;
    const inner = showRail ? `<div class="fn-with-rail">${railHtml()}<div>${stage}</div></div>` : stage;
    root().innerHTML = `<div class="fn-shell">${inner}</div>`;

    const bar = document.getElementById('fn-bar');
    if (bar) bar.style.width = (S.i===0?0:progress())+'%';
    const lbl = document.getElementById('fn-step-label');
    if (lbl) {
      if (S.i === 0) lbl.textContent = 'Start';
      else if (S.i >= 5) lbl.textContent = 'Confirmed ✓';
      else lbl.textContent = 'Step ' + S.i + ' / 4';
    }
    if (S.i === 4) setTimeout(mountStripe, 0);
  }

  window.__fn = {
    next, back, answer,
    setBiz:(k,v)=>{ S.biz[k]=v; },
    setLead:(k,v)=>{ S.lead[k]=v; if (k === 'email') S.attendant = ''; },
    toggleSelect:(k)=>{ const el=document.querySelector('.fn-select[data-key="'+k+'"]'); if(!el) return; const wasOpen=el.classList.contains('open'); document.querySelectorAll('.fn-select.open').forEach(e=>e.classList.remove('open')); if(!wasOpen) el.classList.add('open'); },
    pickSelect:(k,v)=>{ S.biz[k]=v; render(); },
    toggleTrade,
    pickDay:(i)=>{ S.day=i; S.time=null; S.slotIso=null; render(); },
    pickTime:(t,iso)=>{ S.time=t; S.slotIso=iso||null; startHold(); render(); },
    pay:()=>{ doPay(); },
    toggleAddon:(k)=>{ S.addons[k]=!S.addons[k]; render(); },
    finish:()=>{ goThankYou(); },
    restart:()=>{ S={ dir:S.dir, i:0, answers:{ trade:[] }, lead:{name:'',email:'',phone:''}, biz:{bizname:'',area:'',country:'United Kingdom'}, slot:null, day:null, time:null, slotIso:null, availabilityDays:[], availabilityLoading:false, bookingId:null, attendant:'', addons:{crm:false,social:false}, holdT:null, holdLeft:HOLD_SEC }; render(); }
  };

  window.__fnSaveThanks = saveThanksData;

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.fn-select')) {
      document.querySelectorAll('.fn-select.open').forEach((el) => el.classList.remove('open'));
    }
  });

  render();
  window.__fnGrowthQ = { Q, LEADGEN };
})();
