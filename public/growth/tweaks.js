/* Fixfy Growth — tiny Tweaks panel engine (host protocol + persistence).
   A page sets window.GROWTH_TWEAKS = { defaults, controls, apply } BEFORE loading this,
   where defaults is the parsed EDITMODE JSON, controls describe the UI, and apply(state)
   mutates the page. We persist via __edit_mode_set_keys. */
(function () {
  const cfg = window.GROWTH_TWEAKS;
  if (!cfg) return;
  let state = Object.assign({}, cfg.defaults);

  function persist(patch) {
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
  }
  function set(key, val) {
    state[key] = val;
    cfg.apply(state);
    persist({ [key]: val });
    render();
  }

  const panel = document.createElement('div');
  panel.id = 'g-tweaks';
  panel.style.cssText = `position:fixed;top:84px;right:18px;z-index:200;width:264px;display:none;
    background:#fff;border:1px solid var(--fx-line);border-radius:14px;box-shadow:var(--fx-elev-3);
    font-family:var(--fx-sans);overflow:hidden`;

  function render() {
    const rows = cfg.controls.map(c => {
      if (c.type === 'radio') {
        const opts = c.options.map(o =>
          `<button data-k="${c.key}" data-v="${o.value}" class="g-tw-seg ${state[c.key] === o.value ? 'on' : ''}">${o.label}</button>`).join('');
        return `<div class="g-tw-row"><div class="g-tw-lbl">${c.label}</div><div class="g-tw-seg-wrap">${opts}</div></div>`;
      }
      if (c.type === 'toggle') {
        return `<div class="g-tw-row g-tw-row--flex"><div class="g-tw-lbl">${c.label}</div>
          <button data-k="${c.key}" data-toggle class="g-tw-switch ${state[c.key] ? 'on' : ''}"><span></span></button></div>`;
      }
      if (c.type === 'color') {
        const sw = c.options.map(o =>
          `<button data-k="${c.key}" data-v="${o}" class="g-tw-sw ${state[c.key] === o ? 'on' : ''}" style="background:${o}"></button>`).join('');
        return `<div class="g-tw-row"><div class="g-tw-lbl">${c.label}</div><div class="g-tw-seg-wrap">${sw}</div></div>`;
      }
      return '';
    }).join('');
    panel.innerHTML = `
      <div class="g-tw-head"><strong>Tweaks</strong><button id="g-tw-close" aria-label="Close">✕</button></div>
      <div class="g-tw-body">${rows}</div>`;
    panel.querySelector('#g-tw-close').onclick = hide;
    panel.querySelectorAll('[data-toggle]').forEach(b => b.onclick = () => set(b.dataset.k, !state[b.dataset.k]));
    panel.querySelectorAll('.g-tw-seg,.g-tw-sw').forEach(b => b.onclick = () => {
      let v = b.dataset.v; if (v === 'true') v = true; else if (v === 'false') v = false;
      set(b.dataset.k, v);
    });
  }
  function show() { panel.style.display = 'block'; }
  function hide() { panel.style.display = 'none'; window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); }

  window.addEventListener('message', (e) => {
    const t = e.data && e.data.type;
    if (t === '__activate_edit_mode') show();
    else if (t === '__deactivate_edit_mode') hide();
  });

  const style = document.createElement('style');
  style.textContent = `
    #g-tweaks .g-tw-head{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:1px solid var(--fx-line)}
    #g-tweaks .g-tw-head strong{font-size:14px;font-weight:600}
    #g-tweaks #g-tw-close{border:none;background:none;cursor:pointer;color:var(--fx-mute);font-size:13px;padding:4px}
    #g-tweaks .g-tw-body{padding:14px 16px;display:flex;flex-direction:column;gap:18px}
    #g-tweaks .g-tw-lbl{font-size:12px;font-weight:500;color:var(--fx-slate);margin-bottom:9px}
    #g-tweaks .g-tw-row--flex{display:flex;align-items:center;justify-content:space-between}
    #g-tweaks .g-tw-row--flex .g-tw-lbl{margin:0}
    #g-tweaks .g-tw-seg-wrap{display:flex;gap:6px;flex-wrap:wrap}
    #g-tweaks .g-tw-seg{flex:1;min-width:0;padding:8px 6px;border:1px solid var(--fx-line);background:#fff;border-radius:8px;font:500 12px/1.2 var(--fx-sans);color:var(--fx-slate);cursor:pointer}
    #g-tweaks .g-tw-seg.on{border-color:var(--g-green);background:var(--g-green-50);color:var(--g-green-press)}
    #g-tweaks .g-tw-sw{width:26px;height:26px;border-radius:7px;border:2px solid #fff;outline:1px solid var(--fx-line);cursor:pointer}
    #g-tweaks .g-tw-sw.on{outline:2px solid var(--fx-ink)}
    #g-tweaks .g-tw-switch{width:40px;height:23px;border-radius:99px;border:none;background:var(--fx-line-strong);position:relative;cursor:pointer;transition:background .15s}
    #g-tweaks .g-tw-switch.on{background:var(--g-green)}
    #g-tweaks .g-tw-switch span{position:absolute;top:2px;left:2px;width:19px;height:19px;border-radius:50%;background:#fff;transition:transform .15s}
    #g-tweaks .g-tw-switch.on span{transform:translateX(17px)}`;
  document.head.appendChild(style);
  document.body.appendChild(panel);
  render();
  cfg.apply(state);
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');
})();
