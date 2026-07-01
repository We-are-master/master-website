/* Fixfy Network — gamified trade quiz funnel */
(function () {
  'use strict';

  var PLANS = {
    monthly: {
      id: 'monthly', name: 'Monthly', amt: '£99', per: '/mo',
      feats: ['Unlimited leads & quote requests', 'Recurring & pre-booked jobs', 'Fixfy Partner Portal & App', 'Cancel anytime'],
    },
    annual: {
      id: 'annual', name: 'Annual', amt: '£499', per: '/yr', badge: 'Most popular',
      feats: ['Immediate leads via the platform', 'Everything in Monthly', 'B2B work from London businesses', 'Risk-free guarantee'],
    },
  };

  var TRADES = [
    { id: 'handyman', label: 'Handyman', icon: '🔧' },
    { id: 'plumber', label: 'Plumber', icon: '🔩' },
    { id: 'electrician', label: 'Electrician', icon: '⚡' },
    { id: 'painter', label: 'Painter', icon: '🎨' },
    { id: 'carpenter', label: 'Carpenter', icon: '🪚' },
    { id: 'compliance', label: 'Compliance', icon: '✅' },
  ];

  var REVIEWS = [
    { name: 'James M.', trade: 'Handyman', text: 'First quote request within 48 hours. Already booked £4.2k in month one.', stars: 5 },
    { name: 'Priya S.', trade: 'Electrician', text: 'Recurring PPM contracts changed my business. Less chasing, more paid work.', stars: 5 },
    { name: 'Dan W.', trade: 'Plumber', text: 'Worth every penny on annual. Leads are real and from proper commercial clients.', stars: 5 },
  ];

  // Fixfy Network is a no-payment, 7-days-free flow: the trade onboards on the Trade Portal
  // (/get-started) where the free trial + document upload happens. `?pay=1` restores the legacy
  // paid checkout; `?access=`/`?invite=` keeps the legacy tokened access flow.
  function portalGetStartedUrl() {
    var c = cfg();
    return (c && c.partnerPortalGetStartedUrl) || 'https://partners.getfixfy.com/get-started';
  }
  var qs = new URLSearchParams(location.search);
  var accessToken = (qs.get('access') || qs.get('invite') || '').trim();
  var skipPayment = qs.get('pay') !== '1';
  var planParam = qs.get('plan');
  var initialPlan = planParam === 'monthly' ? 'monthly' : 'annual';

  var STEP_LABELS = skipPayment
    ? ['Your trades', 'Your plan', 'Your details']
    : ['Your trades', 'Your plan', 'Your details', 'Payment'];
  var TOTAL_STEPS = STEP_LABELS.length;

  var S = {
    i: 0,
    plan: initialPlan,
    trades: [],
    trade: '',
    lead: { name: '', email: '', phone: '' },
    biz: { bizname: '', trade: '', trades: '' },
    signupId: null,
    accessToken: accessToken,
    skipPayment: skipPayment,
  };

  var root = function () { return document.getElementById('nw-root'); };
  var esc = function (s) {
    return (s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  function cfg() {
    return window.NETWORK_CONFIG || window.GROWTH_CONFIG || {};
  }

  function invoke(name, body) {
    var c = cfg();
    if (!c.supabaseUrl || !c.supabaseAnonKey) {
      return Promise.reject(new Error('Service not configured'));
    }
    return fetch(c.supabaseUrl + '/functions/v1/' + name, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: c.supabaseAnonKey,
        Authorization: 'Bearer ' + c.supabaseAnonKey,
      },
      body: JSON.stringify(body),
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
      });
    });
  }

  function tradeLabel(id) {
    for (var i = 0; i < TRADES.length; i++) {
      if (TRADES[i].id === id) return TRADES[i].label;
    }
    return '';
  }

  function tradesLabel() {
    return S.trades.map(tradeLabel).join(', ');
  }

  function tradesHeadline() {
    if (!S.trades.length) return 'trade';
    if (S.trades.length === 1) return tradeLabel(S.trades[0]).toLowerCase();
    return 'multi-trade';
  }

  function syncTrades() {
    S.trade = S.trades[0] || '';
    S.biz.trade = S.trades.join(',');
    S.biz.trades = S.biz.trade;
  }

  var activeTickTimer = null;

  var MONTHLY_PER_TRADE = 5000;

  function computeOpportunityStats(trades) {
    var monthly = trades.length * MONTHLY_PER_TRADE;
    var active = Math.round(monthly * 0.5);
    return { monthly: monthly, active: active };
  }

  function formatOppMoney(n) {
    return '£' + n.toLocaleString('en-GB');
  }

  var LIVE_TICK_STEPS = [389, 412, 428, 445, 467, 478, 491, 500, 512, 524];

  function stopActiveTick() {
    if (activeTickTimer) {
      clearTimeout(activeTickTimer);
      activeTickTimer = null;
    }
  }

  function startLiveTick(baseActive) {
    stopActiveTick();
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var min = Math.max(400, baseActive - 1400);
    var max = baseActive + 1400;
    var value = baseActive;

    function tick() {
      var el = document.getElementById('nw-opp-active');
      var band = document.getElementById('nw-opp-band');
      if (!el || S.i !== 1) {
        stopActiveTick();
        return;
      }
      var step = LIVE_TICK_STEPS[Math.floor(Math.random() * LIVE_TICK_STEPS.length)];
      if (Math.random() < 0.5) step = -step;
      value = Math.max(min, Math.min(max, value + step));
      if (!reduce && band) band.classList.add('is-tick');
      el.textContent = formatOppMoney(value);
      if (!reduce && band) {
        window.setTimeout(function () { band.classList.remove('is-tick'); }, 450);
      }
    }

    function schedule() {
      if (reduce) return;
      var delay = 1400 + Math.floor(Math.random() * 2600);
      activeTickTimer = window.setTimeout(function () {
        tick();
        schedule();
      }, delay);
    }

    schedule();
  }

  function oppBandHtml() {
    var stats = computeOpportunityStats(S.trades);
    return '<div class="nw-opp-band" id="nw-opp-band" role="status">' +
      '<div class="nw-opp-stat nw-opp-stat--monthly">' +
      '<span class="nw-opp-val">' + formatOppMoney(stats.monthly) + '</span>' +
      '<span class="nw-opp-lbl">monthly opportunities</span>' +
      '</div>' +
      '<span class="nw-opp-sep" aria-hidden="true">·</span>' +
      '<div class="nw-opp-stat nw-opp-stat--live">' +
      '<span class="nw-opp-dot" aria-hidden="true"></span>' +
      '<span class="nw-opp-val" id="nw-opp-active">' + formatOppMoney(stats.active) + '</span>' +
      '<span class="nw-opp-lbl">live now</span>' +
      '</div>' +
      '</div>';
  }

  function progressPct() {
    if (TOTAL_STEPS <= 1) return 100;
    return Math.round((S.i / (TOTAL_STEPS - 1)) * 100);
  }

  function setProgress() {
    var bar = document.getElementById('nw-bar');
    var lbl = document.getElementById('nw-step-label');
    if (bar) bar.style.width = progressPct() + '%';
    if (lbl) lbl.textContent = 'Step ' + (S.i + 1) + ' of ' + TOTAL_STEPS;
  }

  function dots() {
    return '<div class="nw-dots" aria-hidden="true">' +
      STEP_LABELS.map(function (_, idx) {
        var cls = idx < S.i ? ' done' : idx === S.i ? ' cur' : '';
        return '<span class="nw-dot' + cls + '"></span>';
      }).join('') +
      '</div>';
  }

  function accessBanner() {
    if (!S.skipPayment) return '';
    return '<div class="nw-access-banner">' +
      '<span aria-hidden="true">✓</span>' +
      '<span>Partner access link — no payment required. Complete your profile on Fixfy Pro.</span>' +
      '</div>';
  }

  function shell(inner, extraClass) {
    return '<div class="nw-step fn-stage' + (extraClass ? ' ' + extraClass : '') + '">' + inner + '</div>';
  }

  function foot(back, nextHtml) {
    return '<div class="nw-step-foot fn-nav fn-nav--sticky">' +
      (back ? '<button type="button" class="fn-back" onclick="__nw.back()">← Back</button>' : '<span class="fn-spacer"></span>') +
      (nextHtml || '') +
      '</div>';
  }

  function planCard(key) {
    var p = PLANS[key];
    var sel = S.plan === key ? ' sel' : '';
    var featured = key === 'annual' ? ' nw-plan--featured' : '';
    var badge = p.badge
      ? '<span class="nw-plan-badge">' + p.badge + '</span>'
      : '<span class="nw-plan-badge nw-plan-badge--ghost">Flexible</span>';
    var save = key === 'annual'
      ? '<p class="nw-plan-save">Save £289 · just £41/mo</p>'
      : '<p class="nw-plan-save nw-plan-save--muted">Billed monthly</p>';
    var feats = p.feats.map(function (f) {
      return '<li>' + f + '</li>';
    }).join('');

    return '<button type="button" class="nw-plan' + featured + sel + '" onclick="__nw.setPlan(\'' + key + '\')">' +
      '<div class="nw-plan-head">' +
      '<span class="nw-plan-name">' + p.name + '</span>' + badge +
      '</div>' +
      '<div class="nw-plan-price"><span class="amt">' + p.amt + '</span><span class="per">' + p.per + '</span></div>' +
      save +
      '<ul class="nw-plan-feats">' + feats + '</ul>' +
      '<span class="nw-plan-check" aria-hidden="true"></span>' +
      '</button>';
  }

  function screenTrade() {
    var grid = TRADES.map(function (t) {
      var sel = S.trades.indexOf(t.id) !== -1 ? ' sel' : '';
      return '<button type="button" class="nw-trade' + sel + '" onclick="__nw.toggleTrade(\'' + t.id + '\')">' +
        '<span class="nw-trade-check" aria-hidden="true"></span>' +
        '<span class="nw-trade-ico">' + t.icon + '</span>' +
        '<span class="nw-trade-lbl">' + t.label + '</span>' +
        '</button>';
    }).join('');

    var hint = S.trades.length
      ? S.trades.length + ' trade' + (S.trades.length > 1 ? 's' : '') + ' selected'
      : 'Select all that apply';

    return shell(
      accessBanner() +
      '<div class="nw-step-top">' + dots() +
      '<p class="nw-kicker">Step 1 · Pick your trades</p>' +
      '<h2>What work do you do?</h2>' +
      '<p class="sub">Select every trade you cover — we match you with the right jobs.</p>' +
      '</div>' +
      '<div class="nw-step-body">' +
      '<p class="nw-trade-hint" id="nw-trade-hint">' + hint + '</p>' +
      '<div class="nw-trade-grid">' + grid + '</div>' +
      '<p id="nw-trade-error" class="nw-error"></p>' +
      '</div>' +
      foot(false,
        '<button type="button" class="g-btn g-btn-primary g-btn-lg g-btn-block" onclick="__nw.next()">Continue <span class="arr">→</span></button>')
    );
  }

  function screenPlan() {
    var payNote = S.skipPayment
      ? 'Access link active — payment waived.'
      : 'Charged today · Docs approved = account live.';
    var headline = S.trades.length > 1
      ? 'Start winning more jobs'
      : 'Start winning ' + esc(tradesHeadline()) + ' jobs';

    return shell(
      '<div class="nw-step-top">' + dots() +
      '<p class="nw-kicker">Step 2 · Choose your plan</p>' +
      '<h2>' + headline + '</h2>' +
      '<p class="sub">' + payNote + '</p>' +
      '</div>' +
      '<div class="nw-step-body">' +
      oppBandHtml() +
      '<div class="nw-plans">' + planCard('annual') + planCard('monthly') + '</div>' +
      '</div>' +
      foot(true,
        '<button type="button" class="g-btn g-btn-primary g-btn-lg g-btn-block" onclick="__nw.next()">Continue <span class="arr">→</span></button>'),
      'nw-step--plan'
    );
  }

  function screenDetails() {
    var cta = S.skipPayment
      ? 'Continue to Fixfy Pro <span class="arr">→</span>'
      : 'Continue to payment <span class="arr">→</span>';

    return shell(
      '<div class="nw-step-top">' + dots() +
      '<p class="nw-kicker">Step 3 · Almost there</p>' +
      '<h2>Your business details</h2>' +
      '<p class="sub">' + (S.skipPayment ? 'Last step — then straight to your partner profile.' : '30 seconds — then pay and join.') + '</p>' +
      '</div>' +
      '<div class="nw-step-body">' +
      '<div class="nw-fields">' +
      '<div class="fn-field"><label>Your name</label><input id="nw-name" type="text" placeholder="James Mitchell" autocomplete="name" value="' + esc(S.lead.name) + '"/></div>' +
      '<div class="fn-field"><label>Business name</label><input id="nw-biz" type="text" placeholder="Mitchell Maintenance Ltd" autocomplete="organization" value="' + esc(S.biz.bizname) + '"/></div>' +
      '<div class="fn-field"><label>Email</label><input id="nw-email" type="email" placeholder="you@company.co.uk" autocomplete="email" inputmode="email" value="' + esc(S.lead.email) + '"/></div>' +
      '<div class="fn-field"><label>Phone</label><input id="nw-phone" type="tel" placeholder="07…" autocomplete="tel" inputmode="tel" value="' + esc(S.lead.phone) + '"/></div>' +
      '</div>' +
      '<p id="nw-details-error" class="nw-error"></p>' +
      '</div>' +
      foot(true,
        '<button type="button" id="nw-details-btn" class="g-btn g-btn-primary g-btn-lg g-btn-block" onclick="__nw.next()">' + cta + '</button>')
    );
  }

  function payLabel() {
    var pl = PLANS[S.plan];
    return 'Pay ' + pl.amt + ' now';
  }

  function reviewsHtml() {
    return '<div class="nw-reviews">' +
      '<p class="nw-reviews-label">Trusted by UK trades</p>' +
      REVIEWS.map(function (r) {
        var stars = '★★★★★'.slice(0, r.stars);
        return '<blockquote class="nw-review">' +
          '<span class="nw-review-stars" aria-hidden="true">' + stars + '</span>' +
          '<p>"' + esc(r.text) + '"</p>' +
          '<footer><b>' + esc(r.name) + '</b> · ' + esc(r.trade) + '</footer>' +
          '</blockquote>';
      }).join('') +
      '</div>';
  }

  function screenPayment() {
    var pl = PLANS[S.plan];
    return shell(
      '<div class="nw-step-top nw-step-top--tight">' + dots() +
      '<p class="nw-kicker">Step 4 · Secure checkout</p>' +
      '<h2>You\'re one step away</h2>' +
      '<p class="sub">Pay now, upload docs on Fixfy Pro &amp; go live today.</p>' +
      '</div>' +
      '<div class="nw-step-body nw-step-body--pay">' +
      '<div class="nw-pay-order">' +
      '<div class="nw-pay-order-row"><span>Trades</span><b>' + esc(tradesLabel()) + '</b></div>' +
      '<div class="nw-pay-order-row"><span>Plan</span><b>' + pl.name + ' · ' + pl.amt + pl.per + '</b></div>' +
      '<div class="nw-pay-order-row nw-pay-order-total"><span>Due today</span><b>' + pl.amt + '</b></div>' +
      '</div>' +
      '<div class="nw-pay-trust">' +
      '<span>🔒 Secure Stripe payment</span>' +
      '<span>✓ Cancel anytime</span>' +
      '</div>' +
      '<div class="fn-paybox nw-paybox">' +
      '<p class="nw-paybox-label">Card details</p>' +
      '<div id="nw-stripe-element" class="fn-card-fields"></div>' +
      '<p id="nw-pay-error" class="nw-error nw-error--center"></p>' +
      '<button id="nw-pay-btn" type="button" class="g-btn g-btn-primary g-btn-block g-btn-lg" onclick="__nw.pay()">' +
      '<span class="fn-lock">🔒</span> ' + payLabel() + '</button>' +
      '</div>' +
      reviewsHtml() +
      '</div>' +
      foot(true, ''),
      'nw-step--pay'
    );
  }

  function readDetails() {
    var nameEl = document.getElementById('nw-name');
    var bizEl = document.getElementById('nw-biz');
    var emailEl = document.getElementById('nw-email');
    var phoneEl = document.getElementById('nw-phone');
    S.lead.name = nameEl ? nameEl.value.trim() : '';
    S.lead.email = emailEl ? emailEl.value.trim() : '';
    S.lead.phone = phoneEl ? phoneEl.value.trim() : '';
    S.biz.bizname = bizEl ? bizEl.value.trim() : '';
    syncTrades();
  }

  function validateTrade() {
    var err = document.getElementById('nw-trade-error');
    if (!S.trades.length) {
      if (err) err.textContent = 'Pick at least one trade to continue.';
      return false;
    }
    if (err) err.textContent = '';
    return true;
  }

  function validateDetails() {
    readDetails();
    var err = document.getElementById('nw-details-error');
    if (!S.lead.name) { if (err) err.textContent = 'Enter your name.'; return false; }
    if (!S.biz.bizname) { if (err) err.textContent = 'Enter your business name.'; return false; }
    if (!S.lead.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(S.lead.email)) {
      if (err) err.textContent = 'Enter a valid email.'; return false;
    }
    if (!S.lead.phone || S.lead.phone.length < 8) {
      if (err) err.textContent = 'Enter a valid phone number.'; return false;
    }
    if (err) err.textContent = '';
    return true;
  }

  function saveThanks(extra) {
    sessionStorage.setItem('nw_thanks', JSON.stringify(Object.assign({
      lead: S.lead,
      biz: S.biz,
      plan: S.plan,
      trade: S.trade,
      trades: S.trades,
      signupId: S.signupId,
      paymentWaived: S.skipPayment,
    }, extra || {})));
  }

  function completeAccessSignup() {
    var btn = document.getElementById('nw-details-btn');
    var err = document.getElementById('nw-details-error');
    if (btn) { btn.disabled = true; btn.textContent = 'Setting up…'; }
    if (err) err.textContent = '';
    syncTrades();

    return invoke('redeem-network-access', {
      accessToken: S.accessToken,
      plan: S.plan,
      lead: S.lead,
      biz: S.biz,
    }).then(function (data) {
      S.signupId = data.signupId;
      saveThanks({ onboardingUrl: data.onboardingUrl });
      window.location.href = 'thank-you.html';
    }).catch(function (e) {
      if (err) err.textContent = e.message || 'Could not verify access link';
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Continue to Fixfy Pro <span class="arr">→</span>';
      }
    });
  }

  // Public 7-days-free path: no payment, hand straight off to the Trade Portal onboarding
  // (/get-started) with the collected details prefilled. The portal creates the account,
  // starts the free trial and collects the mandatory documents.
  function goToPortal() {
    var btn = document.getElementById('nw-details-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Setting up…'; }
    syncTrades();
    var p = new URLSearchParams();
    if (S.lead.name) p.set('name', S.lead.name);
    if (S.lead.email) p.set('email', S.lead.email);
    if (S.lead.phone) p.set('phone', S.lead.phone);
    if (S.biz.bizname) p.set('business', S.biz.bizname);
    if (S.trades.length) p.set('trades', S.trades.join(','));
    window.location.href = portalGetStartedUrl() + '?' + p.toString();
  }

  function render() {
    var el = root();
    if (!el) return;
    stopActiveTick();
    if (window.NetworkCheckout) window.NetworkCheckout.reset();

    if (S.i === 0) el.innerHTML = screenTrade();
    else if (S.i === 1) {
      el.innerHTML = screenPlan();
      startLiveTick(computeOpportunityStats(S.trades).active);
    }
    else if (S.i === 2) el.innerHTML = screenDetails();
    else if (S.i === 3 && !S.skipPayment) {
      el.innerHTML = screenPayment();
      var mount = document.getElementById('nw-stripe-element');
      if (mount && window.NetworkCheckout) {
        readDetails();
        window.NetworkCheckout.mountPaymentElement(mount, S).catch(function (e) {
          var pe = document.getElementById('nw-pay-error');
          if (pe) pe.textContent = e.message || 'Could not load payment form';
        });
      }
    }

    setProgress();
  }

  window.__nwSaveThanks = function () { saveThanks(); };

  window.__nw = {
    toggleTrade: function (id) {
      var idx = S.trades.indexOf(id);
      if (idx === -1) S.trades.push(id);
      else S.trades.splice(idx, 1);
      syncTrades();
      render();
    },
    setPlan: function (key) {
      S.plan = key;
      render();
    },
    next: function () {
      if (S.i === 0 && !validateTrade()) return;
      if (S.i === 2) {
        if (!validateDetails()) return;
        if (S.skipPayment) {
          if (S.accessToken) completeAccessSignup();
          else goToPortal();
          return;
        }
      }
      if (S.i < TOTAL_STEPS - 1) { S.i += 1; render(); }
    },
    back: function () {
      if (S.i > 0) { S.i -= 1; render(); }
    },
    pay: function () {
      if (!window.NetworkCheckout) return;
      var btn = document.getElementById('nw-pay-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Processing…'; }
      readDetails();
      window.NetworkCheckout.pay(S).then(function (r) {
        if (r.ok) window.location.href = 'thank-you.html';
        else if (btn) { btn.disabled = false; btn.innerHTML = '<span class="fn-lock">🔒</span> ' + payLabel(); }
      });
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
