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
  const MARK = window.GrowthBrand ? window.GrowthBrand.html() : '<a href="index.html" class="g-brand"><span class="g-mark">F</span> Fixfy <span class="g-brand-tag">Growth</span></a>';

  function nav(active) {
    const links = NAV.map(([href, label, key]) =>
      `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`).join('');
    const brand = window.GrowthBrand ? window.GrowthBrand.html() : MARK;
    return `
    <nav class="g-nav">
      <div class="g-nav-inner">
        ${brand}
        <div class="g-nav-links">${links}</div>
        <div class="g-nav-cta">
          <button class="g-theme-btn" aria-label="Toggle dark mode" onclick="Growth.toggleTheme()">
            <svg class="moon" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
            <svg class="sun" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.7"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          </button>
          <a href="#" class="login">Log in</a>
          <a href="start.html" class="g-btn g-btn-primary" style="padding:11px 18px;font-size:15px">Build my site <span class="arr">→</span></a>
        </div>
        <button class="g-burger" aria-label="Menu" onclick="document.getElementById('g-mobile').classList.toggle('open')">
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div id="g-mobile" class="g-mobile-menu">
        ${NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}
        <a href="start.html" class="g-btn g-btn-primary g-btn-block" style="margin-top:8px">Build my site →</a>
      </div>
    </nav>`;
  }

  function footer() {
    const col = (h, items) => `<div><h5>${h}</h5><ul>${items.map(([t, href]) => `<li><a href="${href || '#'}">${t}</a></li>`).join('')}</ul></div>`;
    return `
    <footer class="g-footer">
      <div class="g-footer-in">
        <div class="g-footer-grid">
          <div>
            ${window.GrowthBrand ? window.GrowthBrand.html('style="color:#fff"') : `<a href="index.html" class="g-brand" style="color:#fff"><span class="g-mark">F</span> Fixfy <span class="g-brand-tag">Growth</span></a>`}
            <p class="g-footer-p">A professional website + booking system built around your jobs, every booking straight into your CRM. Live in 7 days.</p>
            <div class="g-trust" style="margin-top:18px"><span><span class="g-stars">★★★★★</span> Trusted by 5,000+ home service businesses</span></div>
          </div>
          ${col('Product', [['How it works', 'how-it-works.html'], ["What's included", 'features.html'], ['Pricing', 'pricing.html'], ['Results', 'results.html']])}
          ${col('Industries', [['Plumbers', 'industry-plumbers.html'], ['Electricians', 'industry-electricians.html'], ['HVAC', 'industry-hvac.html'], ['Roofers', 'industry-roofers.html']])}
          ${col('Company', [['About Fixfy', 'about.html'], ['FAQ', 'faq.html'], ['Blog', 'blog.html'], ['Build my site', 'start.html']])}
        </div>
        <div class="g-footer-bot">
          <span>© 2026 Fixfy Ltd · United Kingdom · Fixfy Growth is a product of Fixfy.</span>
          <span class="g-mono">Prototype · placeholder stats, verify before launch</span>
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
      // sticky mobile CTA
      if (opts.sticky !== false) {
        const s = document.createElement('div');
        s.className = 'g-sticky';
        s.innerHTML = '<a href="start.html" class="g-btn g-btn-primary g-btn-block g-btn-lg">Build my site →</a>';
        document.body.appendChild(s);
      }
      reveal();
      currency();
    }
  };
})();
