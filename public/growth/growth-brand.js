/* Fixfy Growth — shared brand lockup (Fixfy logo + Growth tag). */
(function () {
  const WORD_DARK = '/brand/fixfy-primary-white.png';
  const WORD_LIGHT = '/brand/fixfy-primary-navy.png';
  const ICON_DARK = '/brand/fixfy-icon-white.png';
  const ICON_LIGHT = '/brand/fixfy-icon-navy.png';

  const logos = `
    <img src="${WORD_DARK}" alt="Fixfy" class="g-brand-logo g-brand-logo--word g-on-dark"/>
    <img src="${WORD_LIGHT}" alt="Fixfy" class="g-brand-logo g-brand-logo--word g-on-light"/>
    <img src="${ICON_DARK}" alt="" class="g-brand-logo g-brand-logo--icon g-on-dark" aria-hidden="true"/>
    <img src="${ICON_LIGHT}" alt="" class="g-brand-logo g-brand-logo--icon g-on-light" aria-hidden="true"/>`;

  window.GrowthBrand = {
    html(attrs = '') {
      return `<a href="index.html" class="g-brand"${attrs ? ' ' + attrs : ''}>${logos}<span class="g-brand-tag">Growth</span></a>`;
    },
    hero() {
      return `<div class="g-brand-hero-wrap">
        <img src="${ICON_DARK}" alt="Fixfy" class="g-brand-hero g-on-dark"/>
        <img src="${ICON_LIGHT}" alt="Fixfy" class="g-brand-hero g-on-light"/>
      </div>`;
    },
  };
})();
