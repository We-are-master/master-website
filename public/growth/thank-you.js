(function () {
  'use strict';

  const STORAGE_KEY = 'fx_growth_thanks';

  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function readData() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
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

    const emailSummary = document.getElementById('ty-email-summary');
    if (emailSummary && email) {
      emailSummary.innerHTML = `📧 We've emailed your confirmation to <strong>${esc(email)}</strong>, tap to preview`;
    }

    const emailBody = document.getElementById('ty-email-body');
    if (emailBody) {
      const addonLine = addons.length
        ? `<br><br><b>Add-ons noted:</b> ${addons.map((a) => esc(a.name)).join(', ')}.`
        : '';
      emailBody.innerHTML = `
        <b>Subject:</b> You're in, ${esc(first)} 🎉 Your Fixfy Growth build starts now<br><br>
        Hi ${esc(first)}, welcome to Fixfy Growth, you just took the step that gets ${esc(biz)} off the lead-rental treadmill for good.<br><br>
        <b>Your onboarding call is locked in:</b> ${esc(slot)}.<br>
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
