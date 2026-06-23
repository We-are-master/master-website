/* Fixfy Growth, shared chrome: nav, footer, sticky CTA, scroll reveal.
   Each page calls Growth.chrome({active:'home'}). Pages live flat in this folder. */
(function () {
  const NAV = [
    ['index.html#how', 'How it works', 'how'],
    ['index.html#features', "What's included", 'features'],
    ['index.html#trades', 'Industries', 'industries'],
    ['index.html#pricing', 'Pricing', 'pricing'],
    ['index.html#faq', 'FAQ', 'faq'],
  ];
  const BUSINESS_SOLUTIONS = [
    ['https://getfixfy.com/solutions/real-estate', 'Real Estate', 'Portfolios · compliance · multi-asset'],
    ['https://getfixfy.com/solutions/franchises', 'Franchises', 'Multi-site standards · revenue uptime'],
    ['https://getfixfy.com/solutions/enterprise-operations', 'Enterprise Operations', 'High-volume · complex compliance'],
    ['https://getfixfy.com/solutions/service-platforms', 'Service Platforms', 'API + white-label our trade engine'],
  ];
  const TRADES_SOLUTIONS = [
    ['https://getfixfy.com/network', 'Fixfy Network', 'Access quote requests, recurring work and pre-booked jobs from London (UK) businesses.'],
    ['https://getfixfy.com/growth', 'Fixfy Growth', 'Professional website, booking system and lead capture for trades.'],
    ['https://getfixfy.com/fixfypro', 'Fixfy Pro', 'Manage jobs, quotes, customers, invoices and payments.'],
  ];
  function richDropdown(label, items) {
    return `<div class="g-nav-dd">
        <button type="button" class="g-nav-dd-btn">${label} <svg class="g-dd-arrow" width="12" height="12" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="g-nav-dd-menu g-nav-dd-menu--rich">${items.map(([h, l, d]) =>
          `<a href="${h}" class="g-dd-item"><span class="g-dd-lbl">${l}</span><span class="g-dd-desc">${d}</span></a>`).join('')}</div>
      </div>`;
  }
  function richDropdownMobile(label, items) {
    return `<div class="g-mobile-products"><span class="g-mobile-label">${label}</span>${items.map(([h, l, d]) =>
      `<a href="${h}" class="g-mobile-dd-item"><span class="g-dd-lbl">${l}</span><span class="g-dd-desc">${d}</span></a>`).join('')}</div>`;
  }
  const businessDD = richDropdown('Business Solutions', BUSINESS_SOLUTIONS);
  const tradesDD = richDropdown('Trades Solutions', TRADES_SOLUTIONS);
  const businessMobile = richDropdownMobile('Business Solutions', BUSINESS_SOLUTIONS);
  const tradesMobile = richDropdownMobile('Trades Solutions', TRADES_SOLUTIONS);
  const MARK = window.GrowthBrand ? window.GrowthBrand.html() : '<a href="index.html" class="g-brand"><span class="g-mark">F</span> Fixfy <span class="g-brand-tag">Growth</span></a>';

  function nav(active) {
    const links = NAV.map(([href, label, key]) =>
      `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`).join('');
    const brand = window.GrowthBrand ? window.GrowthBrand.html() : MARK;
    return `
    <nav class="g-nav">
      <div class="g-nav-inner">
        ${brand}
        <div class="g-nav-links">${businessDD}${tradesDD}${links}</div>
        <div class="g-nav-cta">
          <button class="g-theme-btn" aria-label="Toggle dark mode" onclick="Growth.toggleTheme()">
            <svg class="moon" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
            <svg class="sun" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.7"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          </button>
          <a href="#" class="login">Log in</a>
          <a href="start.html" class="g-btn g-btn-primary" style="padding:11px 18px;font-size:15px">Get More Bookings <span class="arr">→</span></a>
        </div>
        <button class="g-burger" aria-label="Menu" onclick="document.getElementById('g-mobile').classList.toggle('open')">
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div id="g-mobile" class="g-mobile-menu">
        ${businessMobile}
        ${tradesMobile}
        ${NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}
        <a href="start.html" class="g-btn g-btn-primary g-btn-block" style="margin-top:8px">Get More Bookings →</a>
      </div>
    </nav>`;
  }

  function footer() {
    if (window.FixfyFooter) {
      return window.FixfyFooter.html({ ctaHref: '/network/start' });
    }
    return `
    <footer class="fx-foot">
      <div class="fx-foot-in">
        <div class="fx-foot-top">
          <div class="fx-foot-brand">
            <img src="/network/fixfy-white.png" alt="fixfy" width="120" height="24"/>
            <p>The operating system behind modern maintenance in the UK. Recurring work, commercial clients and real operational infrastructure — built for trades.</p>
          </div>
          <div class="fx-foot-cta">
            <span class="fx-foot-price">From <b>£99</b>/mo · <b>£499</b>/yr</span>
            <a class="fx-foot-btn" href="/network/start">Join now <span class="arr">→</span></a>
          </div>
        </div>
        <div class="fx-foot-bot">
          <span>© 2026 Fixfy Ltd · United Kingdom · All rights reserved.</span>
          <span class="fx-foot-mono">Fixfy Partners · partner.getfixfy.com</span>
        </div>
      </div>
    </footer>`;
  }

  function reveal() {
    const els = document.querySelectorAll('.g-reveal');
    els.forEach((el) => {
      const parent = el.parentElement;
      if (parent) {
        const sibs = [...parent.children].filter(c => c.classList.contains('g-reveal'));
        const idx = sibs.indexOf(el);
        if (idx >= 0) el.style.setProperty('--reveal-i', idx);
      }
    });
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(e => e.classList.add('in')); return;
    }
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    els.forEach(e => io.observe(e));
  }

  // Localise currency: GBP by default, swap to USD/CAD ($) for North American visitors.
  function currency() {
    try {
      const roots = document.querySelectorAll('[data-cur]');
      if (!roots.length) return;
      // Resolve the visitor's country: £ (GBP) by default, $ only for US/CA.
      let region = '';
      const lang = (navigator.language || navigator.userLanguage || '');
      try { region = (new Intl.Locale(lang)).region || ''; } catch (e) {}
      if (!region) { const m = lang.match(/[-_]([A-Za-z]{2})(?:$|[-_])/); region = m ? m[1].toUpperCase() : ''; }
      let tz = '';
      try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
      const usCaTz = /^America\/(New_York|Detroit|Chicago|Denver|Phoenix|Los_Angeles|Anchorage|Adak|Boise|Juneau|Sitka|Nome|Menominee|Indiana|Kentucky|North_Dakota|Toronto|Montreal|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Glace_Bay|Goose_Bay|Iqaluit|Whitehorse|Yellowknife|Dawson|Cambridge_Bay|Rankin_Inlet|Resolute|Atikokan|Blanc-Sablon|Creston|Fort_Nelson|Swift_Current|Thunder_Bay|Dawson_Creek)/.test(tz) || tz === 'Pacific/Honolulu';
      let isDollar;
      if (region === 'GB') isDollar = false;          // UK → £
      else if (region === 'US' || region === 'CA') isDollar = true;  // US/CA → $
      else isDollar = usCaTz;                          // unknown locale → trust US/CA timezone, else £
      if (!isDollar) return; // keep £
      const map = {
        '£2,299': '$2,999', '£2,000+': '$2,500+', '£2,000': '$2,500',
        '£499': '$649', '£199/mo': '$249/mo', '£199': '$249', '£99': '$129', '£79': '$99'
      };
      const keys = Object.keys(map).sort((a, b) => b.length - a.length);
      roots.forEach((root) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        const nodes = [];
        let n; while ((n = walker.nextNode())) nodes.push(n);
        nodes.forEach((node) => {
          let t = node.nodeValue;
          if (t.indexOf('£') === -1) return;
          keys.forEach((k) => { if (t.indexOf(k) > -1) t = t.split(k).join(map[k]); });
          if (t !== node.nodeValue) node.nodeValue = t;
        });
      });
    } catch (e) {}
  }

  function restoreTheme() {
    try {
      const root = document.documentElement;
      if (localStorage.getItem('fx-theme') === 'light') root.dataset.theme = 'light';
      else delete root.dataset.theme;
    } catch (e) {}
  }
  restoreTheme();

  window.Growth = {
    toggleTheme() {
      const root = document.documentElement;
      const light = root.dataset.theme === 'light';
      if (light) delete root.dataset.theme;
      else root.dataset.theme = 'light';
      try { localStorage.setItem('fx-theme', light ? 'dark' : 'light'); } catch (e) {}
    },
    setTheme(t) {
      const root = document.documentElement;
      if (t === 'light') root.dataset.theme = 'light';
      else delete root.dataset.theme;
      try { localStorage.setItem('fx-theme', t === 'light' ? 'light' : 'dark'); } catch (e) {}
    },
    chrome(opts = {}) {
      restoreTheme();
      const h = document.getElementById('g-nav-slot');
      const f = document.getElementById('g-footer-slot');
      if (h) h.outerHTML = nav(opts.active || '');
      if (f) f.outerHTML = footer();
      // sticky mobile CTA — reveals only after the user scrolls past the hero
      if (opts.sticky !== false) {
        const s = document.createElement('div');
        s.className = 'g-sticky';
        s.innerHTML = '<a href="start.html" class="g-btn g-btn-primary g-btn-block g-btn-lg">Get More Bookings →</a>';
        document.body.appendChild(s);
        let ticking = false;
        const sync = () => {
          ticking = false;
          const past = window.scrollY > Math.min(window.innerHeight * 0.7, 560);
          s.classList.toggle('show', past);
        };
        window.addEventListener('scroll', () => {
          if (!ticking) { ticking = true; requestAnimationFrame(sync); }
        }, { passive: true });
        sync();
      }
      reveal();
      currency();
    }
  };
})();
