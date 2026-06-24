(function () {
  'use strict';

  const STORAGE_KEY = 'fx_growth_thanks';

  const Q = {
    website: {
      id: 'website',
      label: 'Do you have a website right now?',
      options: ['No', "Yes, but it's outdated", "Yes, but it doesn't bring me jobs"],
    },
    goal: {
      id: 'goal',
      label: "What's your #1 goal?",
      options: ['Get more bookings', 'Stop paying for leads', 'Look more professional', 'Rank on Google'],
    },
  };

  const LEADGEN = {
    'United Kingdom': 'Checkatrade, Bark, MyBuilder…',
    'United States': 'Angi, Thumbtack, HomeAdvisor…',
    'Canada': 'HomeStars, Bark, Jiffy…',
    'Ireland': 'Tradesmen.ie, Bark…',
    'Australia': 'hipages, Airtasker…',
  };

  function sourceOptions(country) {
    const ex = LEADGEN[country] || 'Angi, Bark, Thumbtack…';
    return ['Referrals', 'Lead-gen platforms (' + ex + ')', 'Word of mouth', "I don't have a steady source"];
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function cfg() {
    return window.GROWTH_CONFIG || {};
  }

  function readData() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveData(patch) {
    const data = readData();
    if (!data) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign({}, data, patch)));
    } catch {
      /* ignore */
    }
  }

  function optGrid(qid, options, selected) {
    return `<div class="fn-brief-q">
      <label class="fn-brief-lbl">${esc(Q[qid] ? Q[qid].label : '')}</label>
      <div class="fn-opts cols2">${options.map((o) => {
        const sel = selected === o;
        return `<button type="button" class="fn-opt${sel ? ' sel' : ''}" data-q="${qid}">${esc(o)}</button>`;
      }).join('')}</div>
    </div>`;
  }

  function formatTrades(trade) {
    if (Array.isArray(trade)) return trade.filter(Boolean).join(' & ');
    return String(trade || '');
  }

  function renderBrief(data) {
    const wrap = document.getElementById('ty-brief-wrap');
    if (!wrap) return;

    if (data.quizComplete) {
      wrap.innerHTML = `<div class="fn-brief-done">
        <span class="fn-brief-check">✓</span>
        <div><strong>Build brief saved</strong><p class="g-mute" style="margin:6px 0 0;font-size:14px">We'll use this to prep your onboarding call.</p></div>
      </div>`;
      return;
    }

    const answers = data.briefAnswers || {};
    const srcOpts = sourceOptions(data.country || 'United Kingdom');
    const tradeLabel = formatTrades(data.trades || data.trade);
    const tradeKnown = !!tradeLabel;

    wrap.innerHTML = `<div class="fn-brief-card" id="ty-brief-form">
      <div class="fn-brief-hd">
        <p class="fn-q-kicker" style="margin:0 0 8px">Final questions · 2 minutes</p>
        <h3 class="g-h3" style="margin:0">Help us prep your build</h3>
        <p class="g-mute" style="margin:8px 0 0;font-size:14px">Three quick answers so we can tailor your site before the onboarding call.</p>
      </div>
      ${tradeKnown ? `<p class="g-mono" style="font-size:12px;color:var(--g-green-press);margin:0 0 16px">Trade on file: <strong>${esc(tradeLabel)}</strong></p>` : ''}
      <div class="fn-brief-q">
        <label class="fn-brief-lbl">How do you get most of your jobs today?</label>
        <div class="fn-opts">${srcOpts.map((o) => {
          const sel = answers.source === o;
          return `<button type="button" class="fn-opt${sel ? ' sel' : ''}" data-q="source">${esc(o)}</button>`;
        }).join('')}</div>
      </div>
      ${optGrid('website', Q.website.options, answers.website)}
      ${optGrid('goal', Q.goal.options, answers.goal)}
      <p id="ty-brief-error" class="g-mono" style="color:#c0392b;text-align:center;margin:12px 0 0;font-size:12px;min-height:16px"></p>
      <div class="fn-brief-actions">
        <button type="button" class="g-btn g-btn-primary g-btn-lg g-btn-block" id="ty-brief-submit">Save build brief <span class="arr">→</span></button>
        <button type="button" class="fn-back" id="ty-brief-skip">Skip for now</button>
      </div>
    </div>`;

    const answersState = Object.assign({}, answers);

    wrap.querySelectorAll('.fn-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qid = btn.getAttribute('data-q');
        const val = btn.textContent.trim();
        if (!qid) return;
        answersState[qid] = val;
        saveData({ briefAnswers: answersState });
        wrap.querySelectorAll('.fn-opt[data-q="' + qid + '"]').forEach((b) => b.classList.remove('sel'));
        btn.classList.add('sel');
      });
    });

    const skipBtn = document.getElementById('ty-brief-skip');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        wrap.style.display = 'none';
      });
    }

    const submitBtn = document.getElementById('ty-brief-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => void submitBrief(data, answersState, submitBtn));
    }
  }

  async function submitBrief(data, answers, btn) {
    const errEl = document.getElementById('ty-brief-error');
    const merged = Object.assign({}, answers, { trade: answers.trade || data.trades || data.trade });
    const tradeVal = merged.trade;
    const hasTrade = Array.isArray(tradeVal) ? tradeVal.length > 0 : !!tradeVal;
    if (!hasTrade || !merged.source || !merged.website || !merged.goal) {
      if (errEl) errEl.textContent = 'Please answer all three questions, or tap Skip for now.';
      return;
    }
    if (!data.bookingId || !data.email) {
      if (errEl) errEl.textContent = 'Booking reference missing — check your confirmation email.';
      return;
    }

    const c = cfg();
    if (!c.supabaseUrl || !c.supabaseAnonKey) {
      if (errEl) errEl.textContent = 'Could not save right now — we\'ll cover this on your call.';
      return;
    }

    btn.disabled = true;
    btn.style.opacity = '0.6';
    if (errEl) errEl.textContent = '';

    try {
      const res = await fetch(c.supabaseUrl + '/functions/v1/update-growth-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: c.supabaseAnonKey,
          Authorization: 'Bearer ' + c.supabaseAnonKey,
        },
        body: JSON.stringify({
          bookingId: data.bookingId,
          email: data.email,
          answers: merged,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Save failed');

      saveData({ quizComplete: true, briefAnswers: merged });
      renderBrief(Object.assign({}, data, { quizComplete: true, briefAnswers: merged }));
    } catch (e) {
      if (errEl) errEl.textContent = e.message || 'Could not save — try again or skip.';
      btn.disabled = false;
      btn.style.opacity = '';
    }
  }

  function render() {
    const data = readData();
    const root = document.getElementById('ty-root');
    if (!data) {
      if (root) {
        root.innerHTML = '<p style="text-align:center;padding:48px 0">No booking found. <a href="start.html">Start the funnel</a> or check your email for confirmation.</p>';
      }
      return;
    }

    const first = data.firstName || 'there';
    const biz = data.businessName || 'your business';
    const slot = data.slotLabel || 'your scheduled time';
    const email = data.email || '';

    const headline = document.getElementById('ty-headline');
    if (headline) headline.textContent = `You're in, ${first}! 🎉`;

    const sub = document.getElementById('ty-sub');
    if (sub) {
      sub.textContent = `${biz} is officially off the lead-rental treadmill. Your 7-day build starts now, here's exactly what happens next.`;
    }

    renderBrief(data);

    const slotEl = document.getElementById('ty-slot');
    if (slotEl) slotEl.textContent = `${slot} · 15 minutes, by video.`;

    const addonsEl = document.getElementById('ty-addons');
    const addons = Array.isArray(data.addons) ? data.addons : [];
    if (addonsEl && addons.length) {
      const total = addons.reduce((t, a) => t + (a.price || 0), 0);
      addonsEl.style.display = '';
      addonsEl.innerHTML = `
        <div class="har">Added to your build, we'll confirm charges separately</div>
        ${addons.map((a) => `<div class="row"><span>${a.ico || ''} ${esc(a.name)}</span><b>£${a.price}</b></div>`).join('')}
        <div class="row tot"><span>Add-ons total</span><b>£${total}</b></div>`;
    }

    const tradeLabel = formatTrades(data.trades || data.trade);

    const emailSummary = document.getElementById('ty-email-summary');
    if (emailSummary && email) {
      emailSummary.innerHTML = `📧 We've emailed your confirmation to <strong>${esc(email)}</strong>, tap to preview`;
    }

    const attendant = data.attendant ? ` Your specialist <strong>${esc(data.attendant)}</strong> will be on the call.` : '';
    const tradeLine = tradeLabel ? `<br><b>Trade:</b> ${esc(tradeLabel)}.` : '';
    const emailBody = document.getElementById('ty-email-body');
    if (emailBody) {
      const addonLine = addons.length
        ? `<br><br><b>Add-ons noted:</b> ${addons.map((a) => esc(a.name)).join(', ')}.`
        : '';
      emailBody.innerHTML = `
        <b>Subject:</b> You're in, ${esc(first)} — your Fixfy Growth order is confirmed<br><br>
        Hi ${esc(first)}, your Fixfy Growth order for ${esc(biz)} is confirmed — <b>£379 one-off</b>.${tradeLine}<br><br>
        <b>Your onboarding call is locked in:</b> ${esc(slot)}.${attendant}<br>
        Next: onboarding call (15 min) → we build (7 days) → you review &amp; go live.${addonLine}`;
    }

    const cal = document.getElementById('ty-calendar');
    if (cal && data.calendarLink) {
      cal.href = data.calendarLink;
      cal.style.display = '';
    } else if (cal && data.slotIso) {
      const start = new Date(data.slotIso);
      const end = new Date(start.getTime() + 15 * 60_000);
      const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      cal.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Fixfy Growth onboarding, ' + biz)}&dates=${fmt(start)}/${fmt(end)}`;
      cal.style.display = '';
    }
  }

  render();
})();
