/**
 * Fixfy Growth funnel — Stripe Payment Element checkout.
 */
(function () {
  'use strict';

  let stripe = null;
  let elements = null;
  let paymentElement = null;
  let paying = false;
  let clientSecret = null;
  let bookingId = null;

  function cfg() {
    return window.GROWTH_CONFIG || {};
  }

  function apiBase() {
    const c = cfg();
    if (c.apiBase) return c.apiBase.replace(/\/$/, '');
    if (c.supabaseUrl) return `${c.supabaseUrl.replace(/\/$/, '')}/functions/v1`;
    return '';
  }

  function headers() {
    const c = cfg();
    const h = { 'Content-Type': 'application/json' };
    // Local /api/growth routes do not need Supabase JWT (Railway edge returns 401).
    if (!c.apiBase || c.apiBase.includes('/functions/v1')) {
      h.apikey = c.supabaseAnonKey || '';
      h.Authorization = `Bearer ${c.supabaseAnonKey || ''}`;
    }
    return h;
  }

  async function invoke(name, body) {
    const c = cfg();
    const base = apiBase();
    if (!base) throw new Error('Booking service not configured');
    const path = c.apiBase
      ? `${base}/${name === 'create-growth-checkout' ? 'create-checkout' : name.replace('growth-', '')}`
      : `${base}/${name}`;
    const res = await fetch(path, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  }

  async function loadAvailability() {
    const c = cfg();
    const base = apiBase();
    if (!base) return { days: [], fallback: true };
    const path = c.apiBase ? `${base}/availability` : `${base}/growth-availability`;
    const res = await fetch(path, { headers: headers() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Failed to load availability');
    }
    return data;
  }

  async function loadStripe() {
    if (stripe) return stripe;
    const pk = cfg().stripePublishableKey;
    if (!pk) throw new Error('Stripe not configured');
    if (!window.Stripe) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://js.stripe.com/v3/';
        s.onload = resolve;
        s.onerror = () => reject(new Error('Failed to load Stripe'));
        document.head.appendChild(s);
      });
    }
    stripe = window.Stripe(pk);
    return stripe;
  }

  async function prepareCheckout(state) {
    if (clientSecret) return clientSecret;
    const checkout = await invoke('create-growth-checkout', {
      slot: state.slotIso,
      lead: state.lead,
      biz: state.biz,
      answers: Object.assign({}, state.answers, {
        attendant_name: state.attendant || '',
      }),
      attendantName: state.attendant || '',
      addons: [],
    });
    clientSecret = checkout.clientSecret;
    bookingId = checkout.bookingId;
    state.bookingId = bookingId;
    return clientSecret;
  }

  async function mountPaymentElement(container, state) {
    const secret = await prepareCheckout(state);
    await loadStripe();
    unmount();
    elements = stripe.elements({
      clientSecret: secret,
      appearance: { theme: 'stripe', variables: { colorPrimary: '#ED4B00' } },
    });
    paymentElement = elements.create('payment');
    container.innerHTML = '';
    paymentElement.mount(container);
  }

  async function pay(state) {
    if (paying) return { ok: false };
    paying = true;
    const errEl = document.getElementById('fn-pay-error');
    if (errEl) errEl.textContent = '';

    try {
      if (!clientSecret) await prepareCheckout(state);
      await loadStripe();
      if (typeof window.__fnSaveThanks === 'function') window.__fnSaveThanks();
      const returnUrl = `${window.location.origin}/growth/thank-you.html`;
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: returnUrl,
          receipt_email: state.lead.email,
          payment_method_data: {
            billing_details: {
              name: state.lead.name,
              email: state.lead.email,
              phone: state.lead.phone || undefined,
            },
          },
        },
      });

      if (error) throw new Error(error.message || 'Payment failed');
      if (paymentIntent && paymentIntent.status !== 'succeeded') {
        throw new Error('Payment was not completed. Please try again.');
      }

      paying = false;
      return { ok: true, bookingId };
    } catch (err) {
      paying = false;
      if (errEl) errEl.textContent = err.message || 'Payment failed';
      return { ok: false, error: err.message };
    }
  }

  function unmount() {
    if (paymentElement) {
      try { paymentElement.unmount(); } catch (_) { /* empty */ }
    }
    elements = null;
    paymentElement = null;
  }

  function reset() {
    unmount();
    clientSecret = null;
    bookingId = null;
    paying = false;
  }

  window.GrowthCheckout = {
    loadAvailability,
    mountPaymentElement,
    pay,
    unmount,
    reset,
  };
})();
