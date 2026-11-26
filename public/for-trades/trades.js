/* Fixfy for Trades: hero chat loop, 6-step flow, counters, calculator, demo booking. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
  /* hero só anda com o celular na tela: começa quando o trade chega nele e pausa se ele sair */
  let phoneOn = false, phoneWake = [];
  const whenPhoneOn = () => phoneOn ? Promise.resolve() : new Promise((r) => phoneWake.push(r));
  const heroWait = async (ms) => { await whenPhoneOn(); await wait(ms); await whenPhoneOn(); };
  document.documentElement.classList.add('js');

  /* ---------- hero: one customer, start to finish, on a loop ---------- */
  const chat = $('#hero-chat');
  const status = $('#hero-status');
  const hfloat = $('#hero-float');
  const TICK = '<svg class="tk" viewBox="0 0 16 11" aria-hidden="true"><path d="M1 6l3 3 6-7M6 9l1 .9 6.5-7.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="9.5" rx="2" fill="currentColor"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const STRIPE = '<span class="mc-stripe">' + LOCK + 'Secure payment with <b>Stripe</b></span>';
  const IC = {
    web: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    google: '<svg viewBox="0 0 24 24"><path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5a4.3 4.3 0 0 1-1.9 2.8v2.3h3c1.8-1.6 2.9-4 2.9-6.8z" fill="#4285F4"/><path d="M12 21.5c2.5 0 4.6-.8 6.1-2.3l-3-2.3c-.8.6-1.9.9-3.1.9a5.4 5.4 0 0 1-5.1-3.7H3.8v2.4A9.5 9.5 0 0 0 12 21.5z" fill="#34A853"/><path d="M6.9 14.1a5.7 5.7 0 0 1 0-3.7V8H3.8a9.5 9.5 0 0 0 0 8.5z" fill="#FBBC05"/><path d="M12 6.3c1.4 0 2.6.5 3.6 1.4l2.7-2.7A9.5 9.5 0 0 0 3.8 8l3.1 2.4A5.4 5.4 0 0 1 12 6.3z" fill="#EA4335"/></svg>',
    lead: '<svg viewBox="0 0 24 24"><path d="M12 2.5l7.5 3v6c0 4.6-3.2 8.6-7.5 10-4.3-1.4-7.5-5.4-7.5-10v-6z" fill="currentColor"/><path d="M8.5 12l2.5 2.5 4.5-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M6 2.5h8l4 4v15H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 12h6M9 16h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    xero: '<img src="/for-trades/logos/xero.png" alt="">',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z" fill="currentColor"/></svg>',
    cam: '<svg viewBox="0 0 24 24"><rect x="3" y="6.5" width="18" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 6.5L10 4h4l1.5 2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  };
  const CASES = [
    { full: 'Sarah Mitchell', talk: ["Hi, my kitchen tap is leaking under the sink. Can someone come this week?", "Hi Sarah, Harvey here from Rivington Plumbing 👋 Sorry to hear that! Is it dripping from the tap itself or from the pipe underneath?", "The pipe underneath, there's a little puddle in the cupboard", "Sounds like the tap connector, that's a quick fix. Could you do Thursday, 8 to 10am?", "Thursday's great. How much would it be?", "£95 all in, parts and labour. Here's your quote. A £30 deposit locks in Thursday for you:"], ini: 'SM', av: '#7C5CFF', src: 'web', srcName: 'your website', app: 'Your Website', srcLabel: 'New enquiry from your website', name: 'Sarah', ask: 'Hi, my kitchen tap is leaking under the sink. Can someone come this week?', slot: 'Thursday 8 to 10am', day: 'Thu 26 Nov', job: 'Replace tap connector', price: 95, dep: 30, ref: '1047', t0: '21:47', t1: '21:49', done: 'Thu 26 Nov · 09:40' },
    { full: 'James Okafor', talk: ["Hi, our bathroom radiator is stone cold. Are you free Friday?", "Morning James, Harvey from Rivington Plumbing 👋 Is it just that one radiator, or the whole house?", "Just the bathroom one, the rest are fine", "Probably a stuck valve then. I can get someone to you Friday, 1 to 3pm. Does that work?", "Yes please. What's the cost?", "£140 to replace the valve, parts and labour included. Here's the quote, £40 deposit books Friday:"], ini: 'JO', av: '#0EA5A4', src: 'google', srcName: 'Google', app: 'Google Business', srcLabel: 'New message from Google', name: 'James', ask: 'Hi, our radiator in the bathroom is stone cold. Are you free Friday?', slot: 'Friday 1 to 3pm', day: 'Fri 27 Nov', job: 'Replace radiator valve', price: 140, dep: 40, ref: '1052', t0: '07:12', t1: '07:15', done: 'Fri 27 Nov · 14:25' },
    { full: 'Priya Shah', talk: ["Hi, I need an outside tap fitted before winter. How much would that be?", "Hi Priya, Harvey from Rivington Plumbing 👋 Happy to help. Is the kitchen sink on the same wall where you'd like the tap?", "Yes, it's right behind the sink", "Perfect, that keeps it simple. We could do Monday, 10am to 12pm?", "Monday works. Can you send me a price?", "Of course. £120 all in, including a frost-proof tap. Here's your quote, £40 deposit holds Monday:"], ini: 'PS', av: '#E0679A', src: 'lead', srcName: 'Checkatrade', app: 'Checkatrade', srcLabel: 'New lead from Checkatrade', name: 'Priya', ask: 'Hi, I need an outside tap fitted before winter. How much would that be?', slot: 'Monday 10am to 12pm', day: 'Mon 30 Nov', job: 'Fit outside tap', price: 120, dep: 40, ref: '1058', t0: '18:31', t1: '18:34', done: 'Mon 30 Nov · 11:50' },
  ];
  const gbp = (n) => '£' + n.toFixed(2);
  function talkSteps(c) {
    const out = [];
    c.talk.forEach((line, i) => {
      if (i % 2 === 0) out.push({ t: 'in', html: line, at: c.t0, pause: i === 0 ? 900 : 1000 });
      else {
        out.push({ t: 'typing', pause: i === 1 ? 1100 : 900 });
        out.push({ t: 'out', html: line, at: c.t0, pause: 1100, float: i === 1 ? { pos: 'b', ic: 'bolt', tone: 'coral', b: 'Replied in 38 seconds', s: 'While you were on a job' } : null });
      }
    });
    return out;
  }
  function script(c) {
    const bal = c.price - c.dep;
    return [
      { t: 'src', html: '<span class="src-ic src-ic--' + c.src + '">' + IC[c.src] + '</span>' + c.srcLabel, pause: 1300, notif: { app: c.src, name: c.app, t: 'New enquiry', b: c.full + ': ' + c.talk[0] } },
      ...talkSteps(c),
      { t: 'card', html: '<div class="mc"><span class="mc-tag">Quote · Q-' + c.ref + '</span><div class="mc-row"><span>' + c.job + '<br><em>Parts and labour</em></span><b>' + gbp(c.price) + '</b></div><div class="mc-dep">Deposit today <b>' + gbp(c.dep) + '</b></div></div><span class="mc-btn">Accept · Pay ' + gbp(c.dep).replace('.00', '') + ' deposit</span>' + STRIPE, at: c.t0, pause: 1800 },
      { t: 'in', html: 'Perfect, paying now 👍', at: c.t1, pause: 800 },
      { t: 'paid', html: gbp(c.dep).replace('.00', '') + ' deposit paid via Stripe · Booked ' + c.day, pause: 2200, notif: { app: 'stripe', name: 'Stripe', t: 'Payment received', b: gbp(c.dep) + ' from ' + c.full + ' · Deposit Q-' + c.ref }, float: { pos: 'a', ic: 'check', tone: 'green', b: 'Job booked', s: c.day + ' · in your diary' } },
      { t: 'time', html: c.done, pause: 2000, done: c.job },
      { t: 'out', html: 'All done ✅ Here is your job report and the invoice for the balance.', at: c.done.split('· ')[1], pause: 800, float: { pos: 'b', ic: 'cam', tone: 'blue', b: 'Job report sent', s: 'Before and after photos' } },
      { t: 'report', html: '<div class="mc"><span class="mc-tag">Job report · JOB-' + c.ref + '</span><div class="hrp"><span class="hrp-ph hrp-ph--b"><i>Before</i></span><span class="hrp-ph hrp-ph--a"><i>After</i></span></div></div>', at: c.done.split('· ')[1], pause: 1300 },
      { t: 'card', html: '<div class="mc"><span class="mc-tag mc-tag--navy">Invoice · INV-' + c.ref + '</span><div class="mc-row"><span>' + c.job + '<br><em>Less deposit ' + gbp(c.dep) + '</em></span><b>' + gbp(bal) + '</b></div></div><span class="mc-btn">Pay ' + gbp(bal).replace('.00', '') + ' now</span>' + STRIPE, at: c.done.split('· ')[1], pause: 1700, float: { pos: 'a', ic: 'doc', tone: 'navy', b: 'Invoice sent', s: 'Balance ' + gbp(bal).replace('.00', '') + ', pay by card' } },
      { t: 'in', html: 'Paid. Great job, thanks! 🙌', at: c.done.split('· ')[1], pause: 800 },
      { t: 'paid', html: gbp(bal).replace('.00', '') + ' paid via Stripe · Invoice settled', pause: 2400, notif: { app: 'stripe', name: 'Stripe', t: 'Payment received', b: gbp(bal) + ' from ' + c.full + ' · INV-' + c.ref }, float: { pos: 'b', ic: 'xero', tone: 'xero', b: 'Reconciled in Xero', s: 'INV-' + c.ref + ' marked as paid' } },
      { t: 'typing', pause: 900 },
      { t: 'out', html: 'Thanks ' + c.name + '! Would you mind leaving us a quick Google review? ⭐', at: c.done.split('· ')[1], pause: 2600, float: { pos: 'c', ic: 'star', tone: 'amber', b: 'Review request sent', s: 'More 5-star reviews on Google' } },
    ];
  }
  function bubble(step) {
    const el = document.createElement('div');
    if (step.t === 'typing') { el.className = 'msg out typing'; el.innerHTML = '<span class="by">Harvey</span><span class="dots"><i></i><i></i><i></i></span>'; return el; }
    const cls = { card: 'out card', report: 'out card', src: 'sys src', time: 'sys time', paid: 'paid' }[step.t] || step.t;
    el.className = 'msg ' + cls;
    const mine = step.t === 'out' || step.t === 'card' || step.t === 'report';
    el.innerHTML = (mine ? '<span class="by">Harvey</span>' : '') + step.html + (step.at ? '<small>' + step.at + (mine ? TICK : '') + '</small>' : '');
    return el;
  }
  const clock = $('.ios-time');
  const notif = $('#hero-notif'), hName = $('#hero-name'), hAv = $('#hero-av');
  function setContact(c) {
    if (hName) hName.textContent = c.full;
    if (hAv) { hAv.textContent = c.ini; hAv.style.background = c.av; }
    if (status) status.textContent = 'via ' + c.srcName;
    if (clock) clock.textContent = c.t0;
  }
  const doneEl = $('#hero-done');
  function showDone(job, when) {
    if (!doneEl) return;
    doneEl.querySelector('small').textContent = job + ' · ' + when;
    doneEl.classList.remove('show'); void doneEl.offsetWidth; doneEl.classList.add('show');
    setTimeout(() => doneEl.classList.remove('show'), 1700);
  }
  let notifTimer = null;
  function showNotif(n) {
    if (!notif) return;
    clearTimeout(notifTimer);
    notif.innerHTML = '<span class="n-ic n-ic--' + n.app + '">' + (n.app === 'stripe' ? 'S' : IC[n.app]) + '</span><div class="n-txt"><div class="n-top"><b>' + n.name + '</b><span>now</span></div><div class="n-t">' + n.t + '</div><div class="n-b">' + n.b + '</div></div>';
    notif.classList.remove('show'); void notif.offsetWidth; notif.classList.add('show');
    notifTimer = setTimeout(() => notif.classList.remove('show'), 2600);
  }
  let floatTimer = null;
  function flashFloat(f) {
    if (!hfloat || !f) return;
    clearTimeout(floatTimer);
    hfloat.classList.remove('show');
    setTimeout(() => {
      hfloat.className = 'float pos-' + f.pos;
      hfloat.innerHTML = '<span class="f-ic f-ic--' + f.tone + '">' + IC[f.ic] + '</span><div><b>' + f.b + '</b><small>' + f.s + '</small></div>';
      void hfloat.offsetWidth;
      hfloat.classList.add('show');
      floatTimer = setTimeout(() => hfloat.classList.remove('show'), 2000);
    }, 120);
  }
  /* como no WhatsApp: a conversa comeca no topo e, quando enche a tela, rola para cima ate a ultima mensagem */
  const follow = () => chat.scrollTo({ top: chat.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  async function heroLoop() {
    if (!chat) return;
    const phoneEl = chat.closest('.phone') || chat;
    new IntersectionObserver(([e]) => {
      phoneOn = e.isIntersecting;
      if (phoneOn) { phoneWake.forEach((r) => r()); phoneWake = []; }
    }, { threshold: 0.6 }).observe(phoneEl);
    if (reduced) { script(CASES[0]).filter((s) => s.t !== 'typing').slice(0, 7).forEach((s) => chat.appendChild(bubble(s))); return; }
    for (let n = 0; ; n++) {
      const c = CASES[n % CASES.length];
      await whenPhoneOn();
      chat.classList.remove('fade');
      chat.innerHTML = '';
      setContact(c);
      for (const step of script(c)) {
        const el = bubble(step);
        chat.appendChild(el);
        follow();
        if (step.t === 'typing') {
          await heroWait(step.pause);
          el.remove();
          continue;
        }
        if (step.float) flashFloat(step.float);
        if (step.notif) showNotif(step.notif);
        if (step.done) showDone(step.done, step.html);
        if (step.t === 'time' && clock) clock.textContent = step.html.split('· ')[1];
        await heroWait(step.pause);
      }
      chat.classList.add('fade');
      await heroWait(700);
    }
  }
  heroLoop();

  /* ---------- flow: 6 scenes, auto-advance while in view ---------- */
  const flow = $('.flow');
  const steps = $$('.fs');
  const scenes = $$('.scene');
  const DUR = 4600;
  let cur = 0, timer = null, inView = false, hover = false;
  $$('.money-bars i').forEach((b, i) => b.style.setProperty('--i', i));
  function show(i) {
    cur = (i + scenes.length) % scenes.length;
    steps.forEach((s, k) => {
      s.classList.toggle('on', k === cur);
      s.classList.toggle('done', k < cur);
      s.style.setProperty('--dur', DUR + 'ms');
      const bar = s.querySelector('.fs-bar i');
      if (k === cur && bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
    scenes.forEach((sc, k) => {
      if (k === cur) { sc.classList.remove('on'); void sc.offsetWidth; sc.classList.add('on'); }
      else sc.classList.remove('on');
    });
    if (cur === 3) countMoney();
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (reduced || !inView || hover) return;
    timer = setTimeout(() => show(cur + 1), DUR);
  }
  steps.forEach((s, k) => s.addEventListener('click', () => { show(k); }));
  if (flow) {
    flow.addEventListener('mouseenter', () => { hover = true; flow.classList.add('paused'); clearTimeout(timer); });
    flow.addEventListener('mouseleave', () => { hover = false; flow.classList.remove('paused'); show(cur); });
    new IntersectionObserver((es) => {
      es.forEach((e) => {
        const was = inView; inView = e.isIntersecting;
        if (inView && !was) show(cur); else if (!inView) clearTimeout(timer);
      });
    }, { threshold: 0.35 }).observe(flow);
  }
  function countMoney() {
    const el = $('#money-n');
    if (!el) return;
    animateNumber(el, 1210, 1240, 900, true);
  }

  /* ---------- counters ---------- */
  function fmt(n, sep) { return sep ? Math.round(n).toLocaleString('en-GB') : String(Math.round(n)); }
  function animateNumber(el, from, to, ms, sep) {
    if (reduced) { el.textContent = fmt(to, sep); return; }
    const t0 = performance.now();
    function tick(t) {
      const p = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e, sep);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counters = $$('.countup');
  counters.forEach((c) => { c.textContent = fmt(Number(c.dataset.to), c.dataset.sep); });
  const cio = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const c = e.target; cio.unobserve(c);
      animateNumber(c, 0, Number(c.dataset.to), 1400, c.dataset.sep);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => cio.observe(c));

  /* ---------- reveal + compare bars ---------- */
  const rvTargets = $$('.pain, .feat, .tl li, .pn, .plan, .calc, .book, .int, .how-card, .week, .prod, .wf, .hub');
  rvTargets.forEach((el) => el.classList.add('rv'));
  const rio = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  rvTargets.forEach((el) => rio.observe(el));
  // Anything already on screen at load shows straight away.
  requestAnimationFrame(() => rvTargets.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); }));
  const cmp = $('.compare');
  if (cmp) new IntersectionObserver((es, o) => { es.forEach((e) => { if (e.isIntersecting) { cmp.classList.add('seen'); o.disconnect(); } }); }, { threshold: 0.4 }).observe(cmp);

  /* ---------- sticky CTA on phones ---------- */
  const sticky = $('.sticky-cta');
  const hero = $('.hero');
  const book = $('#book');
  if (sticky && hero && book) {
    let pastHero = false, atBook = false;
    const upd = () => sticky.classList.toggle('show', pastHero && !atBook);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(([e]) => { atBook = e.isIntersecting; upd(); }, { threshold: 0.05 }).observe(book);
  }

  /* ---------- calculator ---------- */
  const mIn = $('#calc-margin'), mRange = $('#calc-range'), jobsOut = $('#calc-jobs'), gainOut = $('#calc-gain');
  function calc(v) {
    const m = Math.max(1, Number(v) || 0);
    jobsOut.textContent = String(Math.max(1, Math.ceil(197 / m)));
    gainOut.textContent = '£' + Math.round(m * 4).toLocaleString('en-GB');
  }
  if (mIn && mRange) {
    mIn.addEventListener('input', () => { mRange.value = mIn.value; calc(mIn.value); });
    mRange.addEventListener('input', () => { mIn.value = mRange.value; calc(mRange.value); });
    calc(mIn.value);
  }

})();

/* agendamento pelo Cal.com: evento "Fixfy for Trades demo" (20 min, seg a sex 8h a 12h UK, 6 horários por dia).
   O embed escolhe o dia e depois mostra os horários; detalhes do evento (nome, descrição) ficam escondidos. */
const CAL_LINK = 'victor-braz-ecpidj/fixfy-for-trades-demo';
function calBoot() {
  if (window.Cal) return;
  (function (C, A, L) { const p = (a, ar) => a.q.push(ar); const d = C.document;
    C.Cal = C.Cal || function () { const cal = C.Cal; const ar = arguments;
      if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; }
      if (ar[0] === L) { const api = function () { p(api, arguments); }; const ns = ar[1]; api.q = api.q || [];
        if (typeof ns === 'string') { cal.ns[ns] = cal.ns[ns] || api; p(cal.ns[ns], ar); p(cal, ['initNamespace', ns]); } else p(cal, ar); return; }
      p(cal, ar); };
  })(window, 'https://app.cal.com/embed/embed.js', 'init');
}
function calMount(ns, el) {
  calBoot();
  Cal('init', ns, { origin: 'https://app.cal.com' });
  Cal.ns[ns]('inline', { elementOrSelector: el, calLink: CAL_LINK, config: { layout: 'month_view', theme: 'light' } });
  Cal.ns[ns]('ui', { theme: 'light', hideEventTypeDetails: true, layout: 'month_view',
    cssVarsPerTheme: { light: { 'cal-brand': '#ED4B00', 'cal-brand-emphasis': '#F26527', 'cal-brand-text': '#FFFFFF' } } });
  Cal.ns[ns]('on', { action: 'linkReady', callback: () => { const l = el.querySelector('.cal-load'); if (l) l.remove(); } });
  Cal.ns[ns]('on', { action: 'bookingSuccessfulV2', callback: (e) => trackBooked(e && e.detail && e.detail.data && e.detail.data.uid) });
}

/* Meta: Schedule no navegador e no servidor com o mesmo event id (Schedule-<uid da reserva>),
   para a Meta contar uma vez só. Só com o sim de marketing; sem ele a reserva não leva nada da Meta. */
function adConsent() { const c = window.fixfyConsent && window.fixfyConsent.saved(); return !!(c && c.marketing); }
function cookie(name) { const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; }
function adMeta() {
  if (!adConsent()) return {};
  const out = { mc: '1', cua: navigator.userAgent.slice(0, 490) };
  const fbp = cookie('_fbp'); let fbc = cookie('_fbc');
  if (!fbc) { const id = new URLSearchParams(location.search).get('fbclid'); if (id) fbc = 'fb.1.' + Date.now() + '.' + id.slice(0, 180); }
  if (fbp) out.fbp = fbp.slice(0, 200);
  if (fbc) out.fbc = fbc.slice(0, 200);
  return out;
}
function trackBooked(uid) {
  if (window.gtag) gtag('event', 'demo_booked');
  if (window.fbq && adConsent()) fbq('track', 'Schedule', { content_name: 'Fixfy for Trades demo' }, uid ? { eventID: 'Schedule-' + uid } : undefined);
}
(function cookieChoice() {
  const box = document.getElementById('ck');
  if (!box || !window.fixfyConsent || window.fixfyConsent.saved()) return;
  box.hidden = false;
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ck]'); if (!b) return;
    const yes = b.dataset.ck === '1';
    const prefs = { necessary: true, analytics: yes, marketing: yes, functional: yes };
    try { localStorage.setItem('cookieConsent', JSON.stringify(prefs)); localStorage.setItem('cookieConsentDate', new Date().toISOString()); } catch (_) {}
    window.fixfyConsent.apply(prefs);
    box.hidden = true;
  });
})();

/* booking em 3 passos (dia, horário, detalhes) direto na API pública do Cal.com.
   Sem chave: lê os horários livres e cria a reserva do evento público. Se a API falhar, cai no embed do Cal. */
const CAL_API = 'https://api.cal.com/v2';
const CAL_EVENT = { id: 8046185, slug: 'fixfy-for-trades-demo', user: 'victor-braz-ecpidj' };
function booker(el, ns) {
  const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'Europe/London';
  const tzLabel = tz === 'Europe/London' ? 'UK time' : tz.replace(/_/g, ' ').split('/').pop() + ' time';
  const st = { days: [], day: null, slot: null };
  const fDay = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', timeZone: tz });
  const fNum = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', timeZone: tz });
  const fMon = (d) => d.toLocaleDateString('en-GB', { month: 'short', timeZone: tz });
  const fLong = (d) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz });
  const fTime = (d) => d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).replace(' ', '').toLowerCase();
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const steps = (n) => `<ol class="bk-steps" aria-label="Step ${n} of 3">${['Day', 'Time', 'Details'].map((t, i) =>
    `<li class="${i + 1 < n ? 'done' : i + 1 === n ? 'on' : ''}"><span>${i + 1}</span>${t}</li>`).join('')}</ol>`;
  const render = (html) => { el.innerHTML = `<div class="bk">${html}</div>`; const f = el.querySelector('[data-focus]'); if (f && el.offsetParent) f.focus({ preventScroll: true }); };

  async function load() {
    el.innerHTML = '<div class="cal-load">Loading times…</div>';
    const start = new Date(); const end = new Date(Date.now() + 30 * 864e5);
    const q = new URLSearchParams({ eventTypeSlug: CAL_EVENT.slug, username: CAL_EVENT.user, start: start.toISOString(), end: end.toISOString(), timeZone: tz });
    const r = await fetch(`${CAL_API}/slots?${q}`, { headers: { 'cal-api-version': '2024-09-04' } });
    if (!r.ok) throw new Error('slots ' + r.status);
    const j = await r.json();
    st.days = Object.keys(j.data || {}).sort().map((k) => ({ key: k, slots: j.data[k].map((x) => new Date(x.start)) })).filter((d) => d.slots.length).slice(0, 8);
    if (!st.days.length) throw new Error('no slots');
    stepDay();
  }
  function stepDay() {
    render(`${steps(1)}<h4 class="bk-h">Pick a day</h4><p class="bk-sub">Times in ${esc(tzLabel)}.</p>
      <div class="bk-days">${st.days.map((d, i) => { const t = d.slots[0]; return `<button type="button" class="bk-day" data-i="${i}" ${i === 0 ? 'data-focus' : ''}>
        <span>${fDay(t)}</span><b>${fNum(t)}</b><span>${fMon(t)}</span><em>${d.slots.length} left</em></button>`; }).join('')}</div>`);
    el.querySelectorAll('.bk-day').forEach((b) => b.addEventListener('click', () => { st.day = st.days[+b.dataset.i]; stepTime(); }));
  }
  function stepTime() {
    const d = st.day.slots[0];
    render(`${steps(2)}<button type="button" class="bk-back">← ${esc(fLong(d))}</button><h4 class="bk-h">Pick a time</h4><p class="bk-sub">Times in ${esc(tzLabel)}.</p>
      <div class="bk-times">${st.day.slots.map((t, i) => `<button type="button" class="bk-time" data-i="${i}" ${i === 0 ? 'data-focus' : ''}>${fTime(t)}</button>`).join('')}</div>`);
    el.querySelector('.bk-back').addEventListener('click', stepDay);
    el.querySelectorAll('.bk-time').forEach((b) => b.addEventListener('click', () => { st.slot = st.day.slots[+b.dataset.i]; stepDetails(); }));
  }
  function stepDetails(err) {
    const t = st.slot;
    render(`${steps(3)}<button type="button" class="bk-back">← ${esc(fLong(t))}, ${fTime(t)}</button><h4 class="bk-h">Your details</h4>
      <form class="bk-form" novalidate>
        <label>Your name<input name="name" autocomplete="name" required data-focus/></label>
        <label>Email<input name="email" type="email" autocomplete="email" required/></label>
        <label>WhatsApp number<input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="07123 456789" required/></label>
        <label><span>Your trade <small>optional</small></span><input name="trade" placeholder="e.g. plumber, electrician"/></label>
        ${err ? `<p class="bk-err" role="alert">${esc(err)}</p>` : ''}
        <button class="btn btn-primary bk-go" type="submit">Book my demo <span class="arr">→</span></button>
        <p class="bk-note">You get the Google Meet link by email straight away.</p>
      </form>`);
    el.querySelector('.bk-back').addEventListener('click', stepTime);
    const form = el.querySelector('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(form));
      let ph = String(v.phone || '').replace(/[^\d+]/g, '');
      if (ph.startsWith('00')) ph = '+' + ph.slice(2);
      else if (ph.startsWith('0')) ph = '+44' + ph.slice(1);
      else if (ph.startsWith('44')) ph = '+' + ph;
      const bad = !String(v.name || '').trim() ? 'Please add your name.'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v.email || '').trim()) ? 'Please check your email.'
        : !/^\+\d{9,15}$/.test(ph) ? 'Please check your WhatsApp number.' : '';
      if (bad) { const p = form.querySelector('.bk-err') || form.insertBefore(document.createElement('p'), form.querySelector('.bk-go')); p.className = 'bk-err'; p.setAttribute('role', 'alert'); p.textContent = bad; return; }
      const go = form.querySelector('.bk-go'); go.disabled = true; go.textContent = 'Booking…';
      try {
        const r = await fetch(`${CAL_API}/bookings`, { method: 'POST', headers: { 'cal-api-version': '2024-08-13', 'Content-Type': 'application/json' },
          body: JSON.stringify({ start: t.toISOString(), eventTypeId: CAL_EVENT.id,
            attendee: { name: String(v.name).trim(), email: String(v.email).trim(), timeZone: tz, phoneNumber: ph, language: 'en' },
            bookingFieldsResponses: { attendeePhoneNumber: ph, trade: String(v.trade || '').trim() },
            metadata: { source: 'for-trades', ns, ...adMeta() } }) });
        if (!r.ok) throw new Error(String(r.status));
        const j = await r.json().catch(() => ({}));
        trackBooked(j && j.data && j.data.uid);
        done(String(v.email).trim());
      } catch (_) {
        stepDetails('That time was just taken or something went wrong. Please pick another time.');
        load().catch(() => {});
      }
    });
  }
  function done(email) {
    const t = st.slot;
    render(`<div class="bk-ok"><span class="bk-tick">✓</span><h4 class="bk-h">You're booked</h4>
      <p><b>${esc(fLong(t))}, ${fTime(t)}</b> (${esc(tzLabel)})<br/>20 minutes on Google Meet.</p>
      <p class="bk-sub">The Meet link is on its way to ${esc(email)}. See you there.</p></div>`);
  }
  load().catch(() => { el.innerHTML = '<div class="cal-load">Loading times…</div>'; calMount(ns, el); });
}

/* calendário da seção #book: monta quando chega perto da tela */
(function () {
  const el = document.getElementById('book-cal');
  if (!el) return;
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); booker(el, 'demoInline'); } }, { rootMargin: '600px 0px' });
  io.observe(el);
})();

/* modal de agendamento: todo botão que leva a #book abre o calendário por cima da página */
(function () {
  const m = document.getElementById('book-modal');
  const el = document.getElementById('bm-cal');
  if (!m || !el) return;
  let last = null, mounted = false;
  function open(e) {
    e.preventDefault();
    last = document.activeElement;
    if (!mounted) { mounted = true; booker(el, 'demo'); }
    m.hidden = false;
    document.body.classList.add('bm-lock');
    requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add('open')));
    m.querySelector('.bm-x').focus();
    if (window.gtag) gtag('event', 'demo_modal_open');
  }
  function close() {
    m.classList.remove('open');
    document.body.classList.remove('bm-lock');
    setTimeout(() => { m.hidden = true; }, 260);
    if (last) last.focus();
  }
  document.querySelectorAll('a[href="#book"]').forEach((a) => a.addEventListener('click', open));
  m.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !m.hidden) close(); });
})();

/* "Watch Harvey work" centraliza o celular da hero */
document.querySelectorAll('a[href="#watch"]').forEach((a) => a.addEventListener('click', (e) => {
  const ph = document.querySelector('#watch .phone') || document.getElementById('watch');
  if (!ph) return;
  e.preventDefault();
  ph.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
}));

/* risca o destaque da headline quando ela entra na tela */
(function () {
  const hs = document.querySelectorAll('.h2 .hl');
  if (!hs.length) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }), { threshold: 0.6 });
  hs.forEach((h) => io.observe(h.closest('.h2')));
})();

/* workflow steps light up as you scroll */
(() => {
  const list = document.querySelector('.wf-steps');
  if (!list || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = [...list.children];
  const loop = document.querySelector('.wf-loop');
  list.classList.add('wf-anim');
  if (loop) loop.classList.add('wf-anim-loop');
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    const r = list.getBoundingClientRect();
    const vertical = matchMedia('(max-width: 980px)').matches;
    let p;
    if (vertical) {
      const point = vh * 0.62;
      p = (point - r.top) / r.height;
    } else {
      p = (vh * 0.85 - r.top) / (vh * 0.45);
    }
    p = Math.max(0, Math.min(1, p));
    list.style.setProperty('--p', p.toFixed(3));
    items.forEach((li, i) => {
      let on;
      if (vertical) {
        const ic = li.querySelector('.wf-ic').getBoundingClientRect();
        on = ic.top + ic.height / 2 <= r.top + p * r.height + 2;
      } else {
        on = p >= (i / (items.length - 1)) * 0.98;
      }
      li.classList.toggle('is-on', on);
    });
    if (loop) loop.classList.toggle('is-on', p >= 0.98);
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
})();


/* Black Friday: a barra e o cartao de preco contam ate o prazo fixo; depois tudo que e da oferta some */
(() => {
  const bar = document.querySelector('.promo');
  if (!bar) return;
  const end = Date.parse(bar.dataset.ends);
  const outs = document.querySelectorAll('[data-cd]');
  const pad = (n) => String(n).padStart(2, '0');
  let t = 0;
  const tick = () => {
    const ms = end - Date.now();
    if (!(ms > 0)) { document.body.classList.add('promo-off'); clearInterval(t); return; }
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400), h = Math.floor(s / 3600) % 24, m = Math.floor(s / 60) % 60, sec = s % 60;
    const u = (v, l) => '<span class="cd-u"><b>' + v + '</b><small>' + l + '</small></span>';
    const html = (d ? u(d, 'd') : '') + u(pad(h), 'h') + u(pad(m), 'm') + u(pad(sec), 's');
    outs.forEach((o) => { o.innerHTML = html; });
  };
  if (Date.now() < end) t = setInterval(tick, 1000);
  tick();
})();


/* hero partner faces: hover (or tap) opens their review */
(() => {
  const wrap = document.querySelector('.hero-proof');
  if (!wrap) return;
  const pop = wrap.querySelector('.hp-pop');
  const faces = [...wrap.querySelectorAll('.hp-face')];
  const R = [
    ['01-plumber', 'Mark Bennett', 'Plumber', 'While I\u2019m under a sink, Harvey handles the first customer messages and collects the job details. I can pick things up when I\u2019m ready.'],
    ['02-electrician', 'Daniel Brooks', 'Electrician', 'Harvey keeps enquiries moving while I\u2019m on site. I finish the job knowing which customers need a quote or a callback.'],
    ['03-builder', 'Paul Henderson', 'Builder', 'Harvey helps keep quotes, deposit requests and invoices moving. There\u2019s less paperwork waiting for me when I get home.'],
    ['04-handyman', 'Adam Shah', 'Handyman', 'Customers message at all hours. Harvey handles routine questions on WhatsApp, so every reply doesn\u2019t have to come from me.'],
  ];
  const canHover = matchMedia('(hover: hover)').matches;
  const hint = wrap.querySelector('.hp-hint');
  let cur = -1, t = 0;
  const esc = (x) => x.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const open = (i) => {
    clearTimeout(t);
    if (cur === i && !pop.hidden) return;
    cur = i;
    const [f, n, trade, q] = R[i];
    pop.innerHTML = `<div class="hp-pop-top"><img src="/for-trades/partners/${f}.jpg" alt=""/><div><b>${esc(n)}</b><small>${esc(trade)} <i>\u00b7</i> London</small></div></div><blockquote>\u201c${esc(q)}\u201d</blockquote><span class="hp-pop-tag">Fixfy partner</span>`;
    faces.forEach((b, k) => b.classList.toggle('is-on', k === i));
    pop.hidden = false;
    pop.style.animation = 'none'; void pop.offsetWidth; pop.style.animation = '';
    const fr = faces[i].getBoundingClientRect(), pr = pop.getBoundingClientRect();
    pop.style.setProperty('--ox', Math.max(18, Math.min(pr.width - 18, fr.left + fr.width / 2 - pr.left)) + 'px');
  };
  const close = () => { pop.hidden = true; cur = -1; faces.forEach((b) => b.classList.remove('is-on')); };
  const later = () => { clearTimeout(t); t = setTimeout(close, 180); };
  faces.forEach((b, i) => {
    if (canHover) { b.addEventListener('mouseenter', () => open(i)); b.addEventListener('mouseleave', later); }
    b.addEventListener('focus', () => open(i));
    b.addEventListener('click', (e) => { e.stopPropagation(); if (cur === i && !pop.hidden && !canHover) close(); else open(i); });
  });
  if (canHover) { pop.addEventListener('mouseenter', () => clearTimeout(t)); pop.addEventListener('mouseleave', later); }
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();
