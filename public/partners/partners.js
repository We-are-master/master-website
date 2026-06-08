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

  /* ---- Floating notifications: staggered entrance, then gentle loop ---- */
  function runNotifications() {
    var notifs = Array.prototype.slice.call(document.querySelectorAll('.notif'));
    if (!notifs.length) return;

    function show(n) {
      n.classList.add('show');
    }
    function cycle() {
      notifs.forEach(function (n) { n.classList.remove('show'); });
      // brief gap then re-enter in sequence
      setTimeout(function () {
        notifs.forEach(function (n) {
          var delay = parseInt(n.getAttribute('data-delay') || '0', 10);
          setTimeout(function () { show(n); }, delay);
        });
      }, 400);
    }

    // first run
    notifs.forEach(function (n) {
      var delay = parseInt(n.getAttribute('data-delay') || '0', 10);
      setTimeout(function () { show(n); }, delay);
    });
    // loop every ~9s
    setInterval(cycle, 9000);
  }
  window.addEventListener('load', runNotifications);

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

  /* ---- System showcase tabs ---- */
  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.sys-tab'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.sys-panel'));
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
        panels.forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-panel') === key);
        });
        initIcons();
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    initTabs();
  }

  /* ---- Mobile nav ---- */
  function initMobileNav() {
    var nav = document.getElementById('p-nav');
    var toggle = document.getElementById('p-nav-toggle');
    if (!nav || !toggle) return;

    function closeMenu() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('p-nav-open');
    }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('p-nav-open', open);
    });

    nav.querySelectorAll('.nav-link, .nav-right a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
