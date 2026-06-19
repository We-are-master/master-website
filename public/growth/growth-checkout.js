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

  function headers() {
    const c = cfg();
    return {
      'Content-Type': 'application/json',
      apikey: c.supabaseAnonKey || '',
      Authorization: `Bearer ${c.supabaseAnonKey || ''}`,
    };
  }

  async function invoke(name, body) {
    const c = cfg();
    if (!c.supabaseUrl || !c.supabaseAnonKey) {
      throw new Error('Booking service not configured');
    }
    const res = await fetch(`${c.supabaseUrl}/functions/v1/${name}`, {
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
    if (!c.supabaseUrl || !c.supabaseAnonKey) {
      return { days: [], fallback: true };
    }
    const res = await fetch(`${c.supabaseUrl}/functions/v1/growth-availability`, {
      headers: headers(),
    });
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
      plan: state.plan,
      payMode: state.payMode,
      slot: state.slotIso,
      lead: state.lead,
      biz: state.biz,
      answers: state.answers,
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
