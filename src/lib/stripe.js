// Stripe integration utilities

import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn('Stripe publishable key not found in environment variables');
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

/**
 * Create a payment intent on the server
 * This should be called from a backend endpoint (Supabase Edge Function or API route)
 * @param {Object} paymentData - Payment information
 * @param {number} paymentData.amount - Amount in pence (GBP)
 * @param {string} paymentData.currency - Currency code (default: 'gbp')
 * @param {Object} paymentData.metadata - Additional metadata
 * @returns {Promise<Object>} Payment intent with client secret
 */
export async function createPaymentIntent(paymentData) {
  try {
    // This should call your backend endpoint
    // For now, we'll use a Supabase Edge Function or API route
    const backendUrl = import.meta.env.VITE_API_URL || '/api';
    
    const response = await fetch(`${backendUrl}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        currency: paymentData.currency || 'gbp',
        metadata: paymentData.metadata || {}
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const data = await response.json();
    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.id
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Alternative: Create payment intent via Supabase Edge Function
 * @param {Object} paymentData - Payment information
 * @returns {Promise<Object>} Payment intent with client secret
 */
export async function createPaymentIntentViaSupabase(paymentData) {
  try {
    const { supabase } = await import('./supabase');
    
    // Try Supabase Edge Function first
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: paymentData.amount,
          currency: paymentData.currency || 'gbp',
          metadata: paymentData.metadata || {}
        }
      });

      if (!error && data) {
        return {
          clientSecret: data.clientSecret,
          paymentIntentId: data.id
        };
      }
    } catch (supabaseError) {
      console.warn('Supabase Edge Function not available, trying API endpoint:', supabaseError);
    }

    // Fallback to API endpoint
    return await createPaymentIntent(paymentData);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}
