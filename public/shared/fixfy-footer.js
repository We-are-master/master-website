/* Fixfy — unified footer markup (Network, Growth chrome) */
(function () {
  'use strict';

  function html(opts) {
    opts = opts || {};
    var ctaHref = opts.ctaHref || 'https://partners.getfixfy.com/get-started';
    var ctaLabel = opts.ctaLabel || 'Join now';
    return (
      '<footer class="fx-foot">' +
        '<div class="fx-foot-in">' +
          '<div class="fx-foot-top">' +
            '<div class="fx-foot-brand">' +
              '<img src="/network/fixfy-white.png" alt="fixfy" width="120" height="24"/>' +
              '<p>The operating system behind modern maintenance in the UK. Recurring work, commercial clients and real operational infrastructure — built for trades.</p>' +
            '</div>' +
            '<div class="fx-foot-cta">' +
              '<span class="fx-foot-price">From <b>£99</b>/mo · <b>£499</b>/yr</span>' +
              '<a class="fx-foot-btn" href="' + ctaHref + '">' + ctaLabel + ' <span class="arr">→</span></a>' +
            '</div>' +
          '</div>' +
          '<div class="fx-foot-bot">' +
            '<span>© 2026 Fixfy Ltd · United Kingdom · All rights reserved.</span>' +
            '<span class="fx-foot-mono">Fixfy Partners · partner.getfixfy.com</span>' +
          '</div>' +
        '</div>' +
      '</footer>'
    );
  }

  window.FixfyFooter = { html: html };
})();
