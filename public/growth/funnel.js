/* Fixfy Growth, funnel engine. Renders into #fn-root. */
(function () {
  const PLANS = {
    monthly:  { id:'monthly',  name:'Monthly',  amt:'£79', per:'/mo', old:'£199/mo', desc:'Cancel anytime. No contracts.', full:'£79 (first month now)' },
    onetime:  { id:'onetime',  name:'One-time', amt:'£499', per:'', old:'£2,299', desc:'No recurring. Ever. You own it.', full:'£499 one-time' }
  };

  // Flow order: lead(contact) → trade → about → source → website → goal → summary.
  // Contact is captured first (chosen order). "Services" question removed; plan choice
  // is folded into the summary screen.
  const Q = {
    trade:   { id:'trade', kicker:'Question 1 of 5', q:'What type of business do you run?', type:'single', cols:2,
      options:['Plumbing','Electrical','HVAC','Roofing','Landscaping','Cleaning','Remodeling','Handyman','Other'] },
    about:   { id:'about', kicker:'Question 2 of 5', q:'Tell us about your business', type:'form',
      fields:[ {k:'bizname',label:'Business name',ph:'e.g. Rivington Plumbing'},
               {k:'country',label:'Country',type:'select',options:['United Kingdom','United States','Canada','Ireland','Australia','Other']} ] },
    source:  { id:'source', kicker:'Question 3 of 5', q:'How do you get most of your jobs today?', type:'single',
      options:['Referrals','Lead-gen platforms (Angi, Thumbtack…)','Word of mouth',"I don't have a steady source"] },
    website: { id:'website', kicker:'Question 4 of 5', q:'Do you have a website right now?', type:'single',
      options:['No',"Yes, but it's outdated","Yes, but it doesn't bring me jobs"] },
    goal:    { id:'goal', kicker:'Question 5 of 5', q:"What's your #1 goal?", type:'single',
      options:['Get more bookings','Stop paying for leads','Look more professional','Rank on Google'] }
  };

  const RAIL = ['Your details','Your trade','Your business','How you get jobs','Current website','Your goal','Your plan','Book onboarding','Payment'];

  // Country-specific lead-gen platforms for the "how do you get jobs" question
  const LEADGEN = {
    'United Kingdom': 'Checkatrade, Bark, MyBuilder…',
    'United States': 'Angi, Thumbtack, HomeAdvisor…',
    'Canada': 'HomeStars, Bark, Jiffy…',
    'Ireland': 'Tradesmen.ie, Bark…',
    'Australia': 'hipages, Airtasker…'
  };
  function sourceQuestion() {
    const ex = LEADGEN[(S.biz.country || '').trim()] || 'Angi, Bark, Thumbtack…';
    return Object.assign({}, Q.source, { options: ['Referrals', 'Lead-gen platforms (' + ex + ')', 'Word of mouth', "I don't have a steady source"] });
  }

  const ADDONS = {
    crm:    { name:'Full UK CRM access', price:99, per:'/mo', ico:'📊', tag:'Most added',
              desc:'The complete Fixfy CRM, pipeline, jobs, invoicing and customer history all in one place, built for UK trades.' },
    brand:  { name:'Professional brand manual', price:199, ico:'🎨', tag:'',
              desc:'Logo, colours, fonts and usage rules, a consistent, professional brand across everything you put out.' },
    social: { name:'Social media, 12-month plan', price:109, ico:'📱', tag:'Best value',
              desc:'A full year of done-for-you social content to keep <b>your business top of mind</b> in your area.' }
  };
  const addonTotal = () => Object.keys(ADDONS).reduce((t,k)=> t + (S.addons[k] ? ADDONS[k].price : 0), 0);
  const addonsChosen = () => Object.keys(ADDONS).filter(k => S.addons[k]);

  const HOLD_SEC = 600; // 10-minute slot hold

  let S = {
    dir: document.body.dataset.fn || 'conversational',
    i: 0,                // 0 intro/welcome; 1 lead, 2 trade, 3 about, 4 source, 5 website, 6 goal, 7 summary, 8 booking, 9 payment, 10 downsell
    answers: {},
    plan: new URLSearchParams(location.search).get('plan') || 'monthly',
    lead: { name:'', email:'', phone:'' },
    biz: { bizname:'', area:'', country:'' },
    slot: null, day: null, time: null, slotIso: null,
    availabilityDays: [],
    availabilityLoading: false,
    bookingId: null,
    payMode: 'full',   // 'full' | 'deposit'
    addons: { crm:false, brand:false, social:false },
    holdT: null, holdLeft: HOLD_SEC
  };

  const root = () => document.getElementById('fn-root');
  const esc = s => (s||'').replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const firstName = () => (S.lead.name||'').trim().split(/\s+/)[0] || 'there';
  const bizName = () => S.biz.bizname.trim() || 'your business';

  // total quiz/flow steps for progress (intro excluded)
  function progress() {
    const total = 9;             // lead, 5 questions, summary, booking, payment
    const done = Math.min(Math.max(S.i, 0), total);
    return Math.round((done / (total + 1)) * 100);
  }

  function setDir(dir) { S.dir = dir; document.body.dataset.fn = dir; render(); }
  window.__fnSetDir = setDir;

  // ---------- navigation ----------
  function go(n) {
    S.i = n;
    if (S.i === 8) {
      startHold();
      loadAvailability();
    }
    if (S.i === 9) {
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
      go(10);
    }
  }
  function next() { go(S.i + 1); }
  function back() { if (S.i > 0) go(S.i - 1); }

  function answer(qid, val) {
    S.answers[qid] = val;
    // auto-advance on single-select
    setTimeout(next, 180);
    render();
  }

  // ---------- hold timer ----------
  function startHold() {
    clearInterval(S.holdT); S.holdLeft = HOLD_SEC;
    S.holdT = setInterval(() => {
      S.holdLeft--; const el = document.getElementById('fn-hold-clock');
      if (el) el.textContent = fmtClock(S.holdLeft);
      if (S.holdLeft <= 0) clearInterval(S.holdT);
    }, 1000);
  }
  function fmtClock(s){ const m=Math.floor(s/60), x=s%60; return m+':'+String(x).padStart(2,'0'); }

  // ---------- screens ----------
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
      <p class="sub" style="font-size:17px;max-width:50ch;margin:16px auto 0">Everything you need to generate more enquiries and win more jobs, without relying on referrals or lead-gen companies.</p>
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
    } else if (q.type === 'plan') {
      body = `<div class="fn-plans">${Object.values(PLANS).map(p=>{
        const sel = S.plan===p.id;
        return `<button class="fn-plan ${sel?'sel':''}" onclick="__fn.setPlan('${p.id}')">
          ${p.id==='monthly'?'<span class="badge">Most popular</span>':''}
          <h3>${p.name}</h3>
          <div class="amt">${p.amt}<small>${p.per}</small></div>
          <div class="old">${p.old}</div>
          <div class="desc">${p.desc}</div>
        </button>`; }).join('')}</div>
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

  function screenLead() {
    return `<div class="fn-q fn-stage">
      <div class="fn-q-kicker">First, let's get you set up</div>
      <h2>Tell us a bit about you</h2>
      <p class="sub">So we can build your tailored plan and send it over, takes 20 seconds.</p>
      <div class="fn-fields">
        <div class="fn-field"><label>Your name</label><input id="ld-name" value="${esc(S.lead.name)}" placeholder="Jordan Smith" oninput="__fn.setLead('name',this.value)"/></div>
        <div class="fn-row2">
          <div class="fn-field"><label>Email</label><input id="ld-email" type="email" value="${esc(S.lead.email)}" placeholder="you@business.co.uk" oninput="__fn.setLead('email',this.value)"/></div>
          <div class="fn-field"><label>Phone <span style="color:var(--fx-mute);font-weight:400">(optional)</span></label><input id="ld-phone" type="tel" value="${esc(S.lead.phone)}" placeholder="07700 900000" oninput="__fn.setLead('phone',this.value)"/></div>
        </div>
      </div>
      <div class="fn-nav"><button class="fn-back" onclick="__fn.back()">← Back</button><span class="fn-spacer"></span>
        <button class="g-btn g-btn-primary g-btn-lg" onclick="__fn.next()">Continue <span class="arr">→</span></button></div>
    </div>`;
  }

  function screenSummary() {
    const p = PLANS[S.plan];
    const trade = S.answers.trade || 'home service';
    const goal = S.answers.goal || 'more bookings';
    // niche jobs/month shown in the live AI badge (placeholder figures, verify before launch)
    const NICHE_JOBS = { Plumbing:64, Electrical:63, HVAC:66, Roofing:61, Landscaping:60, Cleaning:62, Remodeling:59, Handyman:65 };
    const jobsNum = NICHE_JOBS[S.answers.trade] || 62;
    const planPick = Object.values(PLANS).map(pl=>{
      const sel = S.plan===pl.id;
      return `<button onclick="__fn.setPlan('${pl.id}')" class="fn-plan-pick" style="flex:1;text-align:left;cursor:pointer;border-radius:14px;padding:14px 16px;border:2px solid ${sel?'var(--g-coral)':'var(--fx-line)'};background:${sel?'rgba(237,75,0,.06)':'var(--g-card)'};transition:border-color .15s,background .15s">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;row-gap:5px">
          <strong style="font-size:15px;white-space:nowrap">${pl.name}</strong>
          ${pl.id==='monthly'?'<span style="font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;flex:none;color:var(--g-green-press);background:var(--g-green-50);padding:3px 8px;border-radius:20px">Popular</span>':'<span style="font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;flex:none;color:var(--g-coral);background:rgba(237,75,0,.08);padding:3px 8px;border-radius:20px">Own it</span>'}
        </div>
        <div style="margin-top:6px"><s style="color:var(--fx-mute);font-size:13px">${pl.old}</s> <b style="font-size:21px">${pl.amt}</b><small style="color:var(--fx-mute)">${pl.per||' once'}</small></div>
        <div class="fn-plan-desc" style="margin-top:4px;color:var(--fx-mute);font-size:12px">${pl.desc}</div>
      </button>`;
    }).join('');
    return `<div class="fn-summary fn-stage">
      <h2 style="text-align:center;font:var(--fx-w-semi) clamp(24px,3.2vw,34px)/1.05 var(--fx-sans);letter-spacing:-.02em">Your plan's ready, ${esc(firstName())}. 🎉</h2>
      <p class="sub fn-sum-sub" style="text-align:center;max-width:42ch;margin:8px auto 0">Built around your jobs — yours to keep.</p>
      <div class="fn-sum-card">
        <div class="fn-sum-hd">
          <div class="fn-sum-hd-row">
            <div class="fn-sum-built">Get more <b>bookings</b>. Do less <b>chasing</b>.</div>
            <div class="fn-sum-price"><s>${p.old}</s> <b>${p.amt}</b><span>${p.per || ' one-time'}</span></div>
          </div>
          <div class="fn-sum-stat"><svg class="fn-ai" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l1.7 5.1L19 9l-5.3 1.9L12 16l-1.7-5.1L5 9l5.3-1.9L12 2z" fill="currentColor"/><path d="M18.6 13.6l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" fill="currentColor" opacity=".7"/></svg><span><b>${esc(trade)}</b> is getting <b class="g">${jobsNum}+</b> more jobs a month</span></div>
        </div>
        <div class="fn-guarantee"><span class="ic">🛡️</span><div class="g"><b>100% risk-free.</b> Fully refunded on the spot if you're not happy.</div></div>
        <div class="fn-sum-body">
          ${[
            ['🌐','Professional website','Up to 10 pages, built to convert.'],
            ['📅','Job-based booking','Customers book the right job and pay a deposit.'],
            ['⚡','CRM + WhatsApp','Every booking in one place, pinged to your WhatsApp.'],
            ['🤖','AI lead scoring','Spots your best leads so you never waste a trip.'],
            ['🔍','Local Google SEO','Rank for "'+esc(String(trade).toLowerCase())+' near me".'],
            ['🔁','Automations + reviews','Follow-ups and a 5-star review engine.']
          ].map(([ic,h,p2])=>`<div class="fn-sum-item"><span class="ic">${ic}</span><div><h4>${h}</h4><p>${p2}</p></div></div>`).join('')}
        </div>
      </div>
      <div style="margin-top:18px"><div class="g-mono" style="font-size:12px;color:var(--fx-mute);margin-bottom:8px">CHOOSE HOW YOU PAY</div>
        <div style="display:flex;gap:12px">${planPick}</div></div>
      <div class="g-faq fn-pricehint" style="margin-top:10px">
        <details><summary>What's the difference between the prices? <span class="pm"></span></summary><div class="ans">Nothing about what you get changes — exact same website, booking system, local SEO, automations and support either way. The only difference is <b>how you pay</b>: <b>Monthly</b> spreads the cost (${PLANS.monthly.amt}/mo, cancel anytime), <b>One-time</b> you pay once and own it forever (${PLANS.onetime.amt}, nothing recurring).</div></details>
      </div>
      <p class="fn-sum-anchor" style="text-align:center;margin-top:14px;font-size:15px;color:var(--fx-ink)">Agencies charge <s>£2,000+</s> upfront and bill you every month. Your price: <b>${p.amt}${p.per||' once'}</b> — and you own everything.</p>
      <p class="fn-sum-reassure g-mono">No payment until you pick a time · Fully refundable before work begins · You own everything</p>
      <p class="g-center g-mute" style="margin-top:10px;font-size:13px"><span style="color:var(--g-coral)">★★★★★</span> Joining 5,000+ home-service businesses</p>
      <div class="fn-nav fn-nav--sticky" style="justify-content:center"><button class="fn-back" onclick="__fn.back()">← Back</button>
        <button class="g-btn g-btn-primary g-btn-lg" onclick="__fn.next()">Book my onboarding <span class="arr">→</span></button></div>
    </div>`;
  }

  function screenBooking() {
    const days = S.availabilityDays.length ? S.availabilityDays : bookingDaysFallback();
    const day = S.day !== null ? days[S.day] : null;
    const times = day ? day.times : [];
    return `<div class="fn-q fn-stage" style="max-width:720px">
      <div class="fn-q-kicker">Book your onboarding</div>
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
        <button class="g-btn g-btn-primary g-btn-lg" ${(S.day!==null&&S.time)?'':'disabled style="opacity:.4;pointer-events:none"'} onclick="__fn.next()">Continue to payment <span class="arr">→</span></button></div>
    </div>`;
  }

  function screenPayment() {
    const p = PLANS[S.plan];
    const payAmt = S.payMode==='deposit' ? '£99' : (S.plan==='onetime' ? '£499' : '£79');
    const balance = S.plan==='onetime' ? '£400' : 'first month';
    return `<div class="fn-stage">
      <div class="fn-q-kicker" style="text-align:center">Secure your build slot</div>
      <h2 style="text-align:center;font:var(--fx-w-semi) clamp(24px,3vw,34px)/1.1 var(--fx-sans);letter-spacing:-.02em">You're 7 days from a site that books jobs for you.</h2>
      <p class="sub" style="text-align:center;max-width:48ch;margin:8px auto 0">Confirm your onboarding slot now. Fully refundable before work begins, and you own everything we build.</p>
      <div class="fn-hold fn-hold--pay">
        <span class="fn-hold-ic">⏳</span>
        <span>Slot held for <b id="fn-hold-clock">${fmtClock(S.holdLeft)}</b></span>
      </div>
      <div class="fn-pay-grid">
        <div class="fn-paybox">
          <h3 class="g-h3" style="margin-bottom:4px">How would you like to pay?</h3>
          <div class="fn-payopts">
            <div class="fn-payopt ${S.payMode==='full'?'sel':''}" onclick="__fn.setPay('full')">
              <span class="radio"></span>
              <div><div class="lbl">Pay in full now</div><div class="hint">${S.plan==='onetime'?'Own it outright, nothing recurring.':'First month now, then £79/mo. Cancel anytime.'}</div></div>
              <span class="price">${S.plan==='onetime'?'£499':'£79'}</span>
            </div>
            <div class="fn-payopt ${S.payMode==='deposit'?'sel':''}" onclick="__fn.setPay('deposit')">
              <span class="radio"></span>
              <div><div class="lbl">Reserve with a £99 deposit</div><div class="hint">Lock your slot now; ${S.plan==='onetime'?'balance settled at onboarding':'subscription starts at go-live'}.</div></div>
              <span class="price">£99</span>
            </div>
          </div>
          <h3 class="g-h3" style="margin:22px 0 10px">Payment</h3>
          <div id="fn-stripe-element" class="fn-card-fields"></div>
          <p id="fn-pay-error" class="g-mono" style="color:#c0392b;text-align:center;margin-top:10px;font-size:12px"></p>
          <button id="fn-pay-btn" class="g-btn g-btn-green g-btn-block g-btn-lg" style="margin-top:18px" onclick="__fn.pay()">
            <span class="fn-lock">🔒</span> Pay ${payAmt} &amp; confirm slot</button>
          <p class="g-mono g-mute" style="text-align:center;margin-top:12px;font-size:11px">Secure payment via Stripe · Google Calendar invite sent on confirmation</p>
        </div>
        <div class="fn-recap">
          <h4 class="g-h3" style="margin-bottom:14px">Your order</h4>
          <div class="row"><span>Plan</span><b>${p.name}, ${p.amt}${p.per}</b></div>
          <div class="row"><span>Business</span><b>${esc(bizName())}</b></div>
          <div class="row"><span>Onboarding</span><b>${slotLabel()}</b></div>
          <div class="row"><span>${S.payMode==='deposit'?'Deposit now':'Pay now'}</span><b>${payAmt}</b></div>
          ${S.payMode==='deposit'?`<div class="row"><span>Balance</span><b>${balance}${S.plan==='onetime'?' at onboarding':''}</b></div>`:''}
          <div class="row total"><span>Due today</span><span>${payAmt}</span></div>
          <div class="fn-trust-badges">
            <span><span class="fn-lock">🔒</span> Secure payment via Stripe</span>
            <span>✓ Refundable on onboarding before work begins</span>
            <span>✓ Slot confirmed only after payment succeeds</span>
          </div>
        </div>
      </div>
      <div class="fn-nav" style="max-width:none"><button class="fn-back" onclick="__fn.back()">← Back to booking</button></div>
    </div>`;
  }

  function screenConfirm() {
    const p = PLANS[S.plan];
    const when = slotLabel() || 'your selected time';
    const deposit = S.payMode==='deposit';
    return `<div class="fn-confirm fn-stage">
      <div class="fn-confirm-ico"><svg width="40" height="40" viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <h2 style="font:var(--fx-w-semi) clamp(28px,3.6vw,40px)/1.1 var(--fx-sans);letter-spacing:-.02em">You're in, ${esc(firstName())}! 🎉</h2>
      <p class="sub" style="font-size:18px">Your onboarding is locked and your 7-day build for ${esc(bizName())} starts now. Check your inbox.</p>
      <div class="fn-locked">
        <span class="cal-ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></span>
        <div><div style="font-weight:600">Onboarding call, locked in</div><div class="g-mute" style="font-size:15px">${when} · 15 min · video link in your email</div></div>
      </div>
      ${addonsChosen().length ? `<div class="fn-addon-recap"><div class="har">Added to your build, charged to your card on file</div>${addonsChosen().map(k=>`<div class="row"><span>${ADDONS[k].ico} ${ADDONS[k].name}</span><b>£${ADDONS[k].price}</b></div>`).join('')}<div class="row tot"><span>Add-ons total</span><b>£${addonTotal()}</b></div></div>`:''}
      <div class="fn-prep">
        <h3 class="g-h3">To make your call fast, have these ready:</h3>
        <ul><li>Your logo (if you have one)</li><li>5–10 photos of your work</li><li>Your list of services and typical pricing</li><li>Your business hours and service area</li></ul>
      </div>
      <div class="fn-email">
        <div class="fn-email-hd">📧 Welcome email, sent to ${esc(S.lead.email||'your inbox')}</div>
        <div class="fn-email-bd">
          <b>Subject:</b> You're in, ${esc(firstName())} 🎉 Your Fixfy Growth build starts now<br><br>
          Hi ${esc(firstName())}, welcome to Fixfy Growth, you just took the step that gets ${esc(bizName())} off the lead-rental treadmill for good.<br><br>
          <b>Your onboarding call is locked in:</b> ${when}.<br>
          Next: onboarding call (15 min) → we build (7 days) → you review &amp; go live.
          ${deposit?`<br><br>Balance of ${S.plan==='onetime'?'£400':'your subscription'} will be settled at ${S.plan==='onetime'?'your onboarding call':'go-live'}.`:''}
          ${addonsChosen().length?`<br><br><b>Add-ons confirmed:</b> ${addonsChosen().map(k=>ADDONS[k].name).join(', ')}, £${addonTotal()} charged to your card on file.`:''}
        </div>
      </div>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:26px;flex-wrap:wrap">
        <a href="index.html" class="g-btn g-btn-ghost">Back to home</a>
        <button class="g-btn g-btn-primary" onclick="__fn.restart()">Run the flow again</button>
      </div>
      <p class="g-mono g-mute" style="margin-top:18px;font-size:11px">On payment success this also fires: Google Calendar event on your calendar · CRM record (stage: Onboarding Booked) · 24h + 1h reminders.</p>
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
            <span class="fn-addon-price">£${a.price} <small>${a.per || 'one-off'}</small></span>
            <button class="fn-addon-btn ${on?'on':''}" onclick="__fn.toggleAddon('${k}')">${on?'✓ Added':'+ Add'}</button>
          </div>
        </div>
      </div>`;
    }).join('');
    const total = addonTotal();
    return `<div class="fn-q fn-stage" style="max-width:720px">
      <div class="fn-q-kicker" style="text-align:center;color:var(--g-green-press)">✓ Payment confirmed, slot locked</div>
      <h2 style="text-align:center;font:var(--fx-w-semi) clamp(24px,3vw,34px)/1.1 var(--fx-sans);letter-spacing:-.02em">Want to go live even stronger, ${esc(firstName())}?</h2>
      <p class="sub" style="text-align:center;max-width:52ch;margin-inline:auto">Your card is already on file, add any of these with one tap. No re-entering details. Skip if you'd rather not.</p>
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

  // booking day helpers
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
    try {
      sessionStorage.setItem('fx_growth_thanks', JSON.stringify({
        firstName: firstName(),
        businessName: bizName(),
        email: S.lead.email,
        slotLabel: slotLabel(),
        slotIso: S.slotIso,
        addons: chosen,
        payMode: S.payMode,
        plan: S.plan,
        bookingId: S.bookingId,
      }));
    } catch (e) {
      console.warn('[funnel] could not save thanks data', e);
    }
  }

  function goThankYou() {
    saveThanksData();
    window.location.href = '/growth/thank-you.html';
  }

  // ---------- rail (sidebar direction) ----------
  function railHtml() {
    // map flow index to rail position
    const railIdx = (S.i>=1 && S.i<=9) ? S.i-1 : -1;
    const steps = RAIL.map((label,k)=>{
      const cls = k<railIdx?'done':k===railIdx?'cur':'';
      const mark = k<railIdx?'<svg width="12" height="12" viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>':(k+1);
      return `<li class="${cls}"><span class="n">${mark}</span>${label}</li>`;
    }).join('');
    const p = PLANS[S.plan];
    const rows = [];
    if (S.answers.trade) rows.push(['Trade', S.answers.trade]);
    if (S.biz.bizname) rows.push(['Business', S.biz.bizname]);
    if (S.answers.goal) rows.push(['Goal', S.answers.goal]);
    rows.push(['Plan', p.name+' · '+p.amt+p.per]);
    if (S.day!==null && S.time) rows.push(['Onboarding', slotLabel()]);
    const sum = rows.length ? rows.map(([k,v])=>`<div class="row"><span class="g-mute">${k}</span><b>${esc(String(v))}</b></div>`).join('')
                            : '<div class="empty">Your answers will appear here as you go.</div>';
    return `<aside class="fn-rail">
      ${window.GrowthBrand ? window.GrowthBrand.html('style="margin-bottom:24px"') : '<a href="index.html" class="g-brand" style="margin-bottom:24px"><span class="g-mark">F</span> Fixfy <span class="g-brand-tag">Growth</span></a>'}
      <ul class="fn-rail-steps">${steps}</ul>
      <div class="fn-rail-summary"><h4>Your plan</h4>${sum}</div>
    </aside>`;
  }

  // ---------- render ----------
  function render() {
    let stage;
    if (S.i===0) stage = screenIntro();
    else if (S.i===1) stage = screenLead();
    else if (S.i===2) stage = quizScreen(Q.trade);
    else if (S.i===3) stage = quizScreen(Q.about);
    else if (S.i===4) stage = quizScreen(sourceQuestion());
    else if (S.i===5) stage = quizScreen(Q.website);
    else if (S.i===6) stage = quizScreen(Q.goal);
    else if (S.i===7) stage = screenSummary();
    else if (S.i===8) stage = screenBooking();
    else if (S.i===9) stage = screenPayment();
    else stage = screenDownsell();

    const showRail = S.dir==='sidebar' && S.i>=1 && S.i<=9;
    const inner = showRail ? `<div class="fn-with-rail">${railHtml()}<div>${stage}</div></div>` : stage;
    root().innerHTML = `<div class="fn-shell">${inner}</div>`;

    // progress bar
    const bar = document.getElementById('fn-bar');
    if (bar) bar.style.width = (S.i===0?0:progress())+'%';
    const lbl = document.getElementById('fn-step-label');
    if (lbl) lbl.textContent = S.i===0 ? 'Start' : S.i<=9 ? 'Step '+Math.min(S.i,9)+' / 9' : '';
  }

  // ---------- public ----------
  window.__fn = {
    next, back, answer,
    setBiz:(k,v)=>{ S.biz[k]=v; },
    setLead:(k,v)=>{ S.lead[k]=v; },
    toggleSelect:(k)=>{ const el=document.querySelector('.fn-select[data-key="'+k+'"]'); if(!el) return; const wasOpen=el.classList.contains('open'); document.querySelectorAll('.fn-select.open').forEach(e=>e.classList.remove('open')); if(!wasOpen) el.classList.add('open'); },
    pickSelect:(k,v)=>{ S.biz[k]=v; render(); },
    setPlan:(id)=>{ S.plan=id; render(); },
    setPay:(m)=>{ S.payMode=m; if(window.GrowthCheckout) window.GrowthCheckout.reset(); render(); },
    pickDay:(i)=>{ S.day=i; S.time=null; S.slotIso=null; render(); },
    pickTime:(t,iso)=>{ S.time=t; S.slotIso=iso||null; startHold(); render(); },
    pay:()=>{ doPay(); },
    toggleAddon:(k)=>{ S.addons[k]=!S.addons[k]; render(); },
    finish:()=>{ goThankYou(); },
    restart:()=>{ S={ dir:S.dir, i:0, answers:{}, plan:S.plan, lead:{name:'',email:'',phone:''}, biz:{bizname:'',area:'',country:''}, slot:null, day:null, time:null, slotIso:null, availabilityDays:[], availabilityLoading:false, bookingId:null, payMode:'full', addons:{crm:false,brand:false,social:false}, holdT:null, holdLeft:HOLD_SEC }; render(); }
  };

  window.__fnSaveThanks = saveThanksData;

  // close any open custom dropdown when clicking outside it
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.fn-select')) {
      document.querySelectorAll('.fn-select.open').forEach((el) => el.classList.remove('open'));
    }
  });

  render();
})();
