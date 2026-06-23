/* ============================================================
   Fixfy Partners — landing page interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---- Lucide icons ---- */
  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ attrs: { 'stroke-width': 1.6 } });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIcons);
  } else {
    initIcons();
  }

  /* ---- UK proof cards marquee ---- */
  var UK_PROOF = [
    ['Tom Hale', 'Hale Roofing', '+£40k jobs', 'uk-roofer', '🇬🇧 UK'],
    ['Priya Shah', 'BrightSpark Electric', '+60% calls', 'uk-electrician', '🇬🇧 UK'],
    ['Dan Whitmore', 'Whitmore Plumbing', '15 jobs / mo', 'uk-plumber', '🇬🇧 UK'],
    ['Sophie Bennett', 'Bennett Home Cleaning', 'Booked solid', 'uk-cleaner', '🇬🇧 UK']
  ];

  function ukProofCardHtml(row) {
    return '<div class="rev-card"><div class="photo" style="background-image:linear-gradient(transparent 45%, rgba(2,0,64,.2)),url(\'/growth/images/generated/' + row[3] + '.png\')">' +
      '<div class="res"><span class="rg">' + row[4] + '</span><b>' + row[2] + '</b></div>' +
      '<div class="ov"><div class="nm">' + row[0] + '</div><div class="bz">' + row[1] + '</div></div></div></div>';
  }

  var MARQUEE_COPIES = 4;

  function fillProofTrack(id) {
    var track = document.getElementById(id);
    if (!track) return;
    var cards = [];
    for (var i = 0; i < MARQUEE_COPIES; i++) {
      cards = cards.concat(UK_PROOF);
    }
    track.innerHTML = cards.map(ukProofCardHtml).join('');
    track.style.setProperty('--marquee-shift', (100 / MARQUEE_COPIES) + '%');
  }

  function initProofMarquees() {
    fillProofTrack('network-proof-track');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProofMarquees);
  } else {
    initProofMarquees();
  }

  /* ---- Floating notifications: staggered entrance, then gentle loop ---- */
  function runNotifications() {
    var notifs = Array.prototype.slice.call(document.querySelectorAll('.notif'));
    if (!notifs.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      notifs.forEach(function (n) { n.classList.add('show'); });
      return;
    }

    function show(n) {
      n.classList.add('show');
    }
    function cycle() {
      notifs.forEach(function (n) { n.classList.remove('show'); });
      window.setTimeout(function () {
        notifs.forEach(function (n) {
          var delay = parseInt(n.getAttribute('data-delay') || '0', 10);
          window.setTimeout(function () { show(n); }, delay);
        });
      }, 400);
    }

    notifs.forEach(function (n) {
      var delay = parseInt(n.getAttribute('data-delay') || '0', 10);
      window.setTimeout(function () { show(n); }, delay);
    });
    window.setInterval(cycle, 9000);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runNotifications);
  } else {
    runNotifications();
  }

  /* ---- Hero live opportunities ticker (£) ---- */
  var OPPS_STEPS = [389, 412, 428, 445, 467, 478, 491, 500, 512, 524];

  function formatOpps(n) {
    return '£' + n.toLocaleString('en-GB');
  }

  function initHeroOpportunities() {
    var countEl = document.getElementById('hero-opps-count');
    var pill = document.getElementById('hero-opps-pill');
    if (!countEl || !pill) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var min = 17200;
    var max = 19850;
    var stored = parseInt(sessionStorage.getItem('nw_opps'), 10);
    var value = !isNaN(stored) ? Math.max(min, Math.min(max, stored)) : 18426;

    countEl.textContent = formatOpps(value);

    function tick() {
      var step = OPPS_STEPS[Math.floor(Math.random() * OPPS_STEPS.length)];
      if (Math.random() < 0.5) step = -step;
      value = Math.max(min, Math.min(max, value + step));
      sessionStorage.setItem('nw_opps', String(value));
      if (!reduce) pill.classList.add('is-tick');
      countEl.textContent = formatOpps(value);
      if (!reduce) {
        window.setTimeout(function () { pill.classList.remove('is-tick'); }, 450);
      }
    }

    function schedule() {
      var delay = 1400 + Math.floor(Math.random() * 2600);
      window.setTimeout(function () {
        tick();
        schedule();
      }, delay);
    }

    schedule();
  }

  /* ---- Hero partner applications remaining ---- */
  function initHeroApplications() {
    var countEl = document.getElementById('hero-apps-count');
    var pill = document.getElementById('hero-apps-pill');
    if (!countEl || !pill) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var min = 3;
    var slowThreshold = 14;
    var fastIntervalMs = 6000;
    var slowIntervalMs = 14000;
    var stored = parseInt(sessionStorage.getItem('nw_apps'), 10);
    var count = !isNaN(stored) ? Math.max(min, Math.min(16, stored)) : 16;
    var timer = null;

    countEl.textContent = String(count);

    function appsIntervalMs() {
      return count <= slowThreshold ? slowIntervalMs : fastIntervalMs;
    }

    function lockAtMin() {
      count = min;
      countEl.textContent = String(min);
      pill.classList.add('is-low', 'is-locked');
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      sessionStorage.setItem('nw_apps', String(min));
    }

    function updateLowState() {
      pill.classList.toggle('is-low', count <= 5);
      pill.classList.toggle('is-locked', count <= min);
    }

    function scheduleDrop() {
      if (count <= min) return;
      timer = window.setTimeout(function () {
        dropApp();
        scheduleDrop();
      }, appsIntervalMs());
    }

    function dropApp() {
      if (count <= min) {
        lockAtMin();
        return;
      }
      count -= 1;
      sessionStorage.setItem('nw_apps', String(count));
      if (!reduce) pill.classList.add('is-drop');
      countEl.textContent = String(count);
      updateLowState();
      if (count <= min) lockAtMin();
      if (!reduce) {
        window.setTimeout(function () { pill.classList.remove('is-drop'); }, 550);
      }
    }

    if (count <= min) {
      lockAtMin();
      return;
    }

    updateLowState();
    scheduleDrop();
  }

  function initHeroCounters() {
    initHeroOpportunities();
    initHeroApplications();
  }

  /* ---- Pricing toggle (monthly / yearly) ---- */
  function initPricingToggle() {
    var band = document.querySelector('.price-band');
    var btns = Array.prototype.slice.call(document.querySelectorAll('.price-toggle-btn'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.price-card'));
    if (!band || !btns.length) return;

    band.setAttribute('data-billing', 'annual');

    function setBilling(plan) {
      band.setAttribute('data-billing', plan);
      btns.forEach(function (btn) {
        var on = btn.getAttribute('data-plan') === plan;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      cards.forEach(function (card) {
        var featured = card.getAttribute('data-plan') === plan;
        card.classList.toggle('price-card--featured', featured);
      });
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setBilling(btn.getAttribute('data-plan') || 'annual');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroCounters);
    document.addEventListener('DOMContentLoaded', initPricingToggle);
  } else {
    initHeroCounters();
    initPricingToggle();
  }

  /* ---- How it works — stagger reveal ---- */
  function initHowFlow() {
    var list = document.querySelector('.hiw-list');
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('.hiw-item'));
    if (!items.length || !('IntersectionObserver' in window)) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      items.forEach(function (item) { item.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var index = items.indexOf(e.target);
        window.setTimeout(function () {
          e.target.classList.add('in');
        }, index * 120);
        io.unobserve(e.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (item) { io.observe(item); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHowFlow);
  } else {
    initHowFlow();
  }

  /* ---- Ambient scroll background (matches home cinematic) ---- */
  function initAmbientScroll() {
    var ambient = document.querySelector('.p-ambient');
    var lightStart = document.getElementById('requirements');
    if (!ambient) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    var ticking = false;

    function applyParallax() {
      if (reduce) return;
      var vh = window.innerHeight;
      pxEls.forEach(function (el) {
        var f = parseFloat(el.getAttribute('data-parallax')) || 0;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var delta = center - vh / 2;
        el.style.transform = 'translate3d(0, ' + (-delta * f).toFixed(1) + 'px, 0)';
      });
    }

    function update() {
      ticking = false;
      var y = window.scrollY || 0;
      ambient.style.setProperty('--p-scroll-y', y + 'px');

      if (lightStart) {
        var top = lightStart.getBoundingClientRect().top;
        var fade = Math.min(1, Math.max(0, (top - 60) / (window.innerHeight * 0.42)));
        ambient.style.setProperty('--p-ambient-opacity', String(fade));
      }

      applyParallax();
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAmbientScroll);
  } else {
    initAmbientScroll();
  }

  /* ---- Scroll reveal ---- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (i) { i.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (i) { io.observe(i); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

  /* ---- Mobile nav ---- */
  function initMobileNav() {
    var nav = document.getElementById('p-nav');
    var toggle = document.getElementById('p-nav-toggle');
    if (!nav || !toggle) return;

    var mq = window.matchMedia('(max-width: 920px)');

    function closeMenu() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('p-nav-open');
      nav.querySelectorAll('.nav-dd.is-open').forEach(function (dd) {
        dd.classList.remove('is-open');
        var btn = dd.querySelector('.nav-dd-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('p-nav-open', open);
      if (!open) {
        nav.querySelectorAll('.nav-dd.is-open').forEach(function (dd) {
          dd.classList.remove('is-open');
          var btn = dd.querySelector('.nav-dd-btn');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    });

    nav.querySelectorAll('.nav-dd-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (!mq.matches) return;
        e.preventDefault();
        e.stopPropagation();
        var dd = btn.closest('.nav-dd');
        if (!dd) return;
        var wasOpen = dd.classList.contains('is-open');
        nav.querySelectorAll('.nav-dd.is-open').forEach(function (other) {
          if (other !== dd) {
            other.classList.remove('is-open');
            var otherBtn = other.querySelector('.nav-dd-btn');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });
        if (wasOpen) {
          dd.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          dd.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    nav.querySelectorAll('a.nav-link:not(.nav-dd-btn), .nav-dd-item, .nav-right a, .nav-login-mobile').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
