/**
 * Fixfy Network funnel — Stripe checkout (immediate subscription payment).
 */
(function () {
  'use strict';

  var stripe = null;
  var elements = null;
  var paymentElement = null;
  var paying = false;
  var clientSecret = null;
  var intentType = 'payment';
  var signupId = null;

  function cfg() {
    return window.NETWORK_CONFIG || window.GROWTH_CONFIG || {};
  }

  function headers() {
    var c = cfg();
    return {
      'Content-Type': 'application/json',
      apikey: c.supabaseAnonKey || '',
      Authorization: 'Bearer ' + (c.supabaseAnonKey || ''),
    };
  }

  function invoke(name, body) {
    var c = cfg();
    if (!c.supabaseUrl || !c.supabaseAnonKey) {
      return Promise.reject(new Error('Payment service not configured'));
    }
    return fetch(c.supabaseUrl + '/functions/v1/' + name, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');
        return data;
      });
    });
  }

  function loadStripe() {
    if (stripe) return Promise.resolve(stripe);
    var pk = cfg().stripePublishableKey;
    if (!pk) return Promise.reject(new Error('Stripe not configured'));
    if (window.Stripe) return Promise.resolve((stripe = window.Stripe(pk)));
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://js.stripe.com/v3/';
      s.onload = function () { stripe = window.Stripe(pk); resolve(stripe); };
      s.onerror = function () { reject(new Error('Failed to load Stripe')); };
      document.head.appendChild(s);
    });
  }

  function prepareCheckout(state) {
    if (clientSecret) return Promise.resolve(clientSecret);
    return invoke('create-network-checkout', {
      plan: state.plan,
      lead: state.lead,
      biz: state.biz,
    }).then(function (checkout) {
      clientSecret = checkout.clientSecret;
      intentType = checkout.intentType || 'payment';
      signupId = checkout.signupId;
      state.signupId = signupId;
      return clientSecret;
    });
  }

  function mountPaymentElement(container, state) {
    return prepareCheckout(state).then(function (secret) {
      return loadStripe().then(function () {
        unmount();
        elements = stripe.elements({
          clientSecret: secret,
          appearance: { theme: 'night', variables: { colorPrimary: '#ED4B00', colorBackground: '#0A0A28' } },
        });
        paymentElement = elements.create('payment');
        container.innerHTML = '';
        paymentElement.mount(container);
      });
    });
  }

  function pay(state) {
    if (paying) return Promise.resolve({ ok: false });
    paying = true;
    var errEl = document.getElementById('nw-pay-error');
    if (errEl) errEl.textContent = '';

    return prepareCheckout(state).then(function () {
      return loadStripe();
    }).then(function () {
      if (typeof window.__nwSaveThanks === 'function') window.__nwSaveThanks();
      var returnUrl = window.location.origin + '/network/thank-you.html';
      var confirmParams = {
        return_url: returnUrl,
        payment_method_data: {
          billing_details: {
            name: state.lead.name,
            email: state.lead.email,
            phone: state.lead.phone || undefined,
          },
        },
      };

      if (intentType === 'setup') {
        return stripe.confirmSetup({
          elements: elements,
          redirect: 'if_required',
          confirmParams: confirmParams,
        });
      }
      return stripe.confirmPayment({
        elements: elements,
        redirect: 'if_required',
        confirmParams: Object.assign({ receipt_email: state.lead.email }, confirmParams),
      });
    }).then(function (result) {
      var error = result.error;
      if (error) throw new Error(error.message || 'Payment failed');
      paying = false;
      return { ok: true, signupId: signupId };
    }).catch(function (err) {
      paying = false;
      if (errEl) errEl.textContent = err.message || 'Payment failed';
      return { ok: false, error: err.message };
    });
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
    signupId = null;
    paying = false;
    intentType = 'payment';
  }

  window.NetworkCheckout = {
    mountPaymentElement: mountPaymentElement,
    pay: pay,
    unmount: unmount,
    reset: reset,
  };
})();
