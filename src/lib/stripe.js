// Stripe integration utilities

import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey || !publishableKey.startsWith('pk_')) {
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
    throw error;
  }
}

/**
 * Create payment intent via Supabase Edge Function
 * This also creates a pending booking record in booking_website table
 * @param {Object} paymentData - Payment information
 * @param {number} paymentData.amount - Amount in pence (GBP)
 * @param {string} paymentData.currency - Currency code (default: 'gbp')
 * @param {Object} paymentData.metadata - Additional metadata for Stripe
 * @param {Object} paymentData.booking_data - Booking details to save in database
 * @returns {Promise<Object>} Payment intent with client secret
 */
export async function createPaymentIntentViaSupabase(paymentData) {
  try {
    const { supabase } = await import('./supabase');
    
    // Prepare metadata with source identifier for webhook
    const metadata = {
      ...paymentData.metadata,
      source: 'website', // Important: webhook uses this to identify website payments
    };

    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount: paymentData.amount,
        currency: paymentData.currency || 'gbp',
        metadata: metadata,
        customer_email: paymentData.metadata?.customer_email,
        booking_data: paymentData.booking_data || null, // Optional: pre-create booking record
      }
    });


    if (error) {
      if (error.message?.includes('not found') || error.message?.includes('404')) {
        throw new Error('Payment service not available. Please contact support. (Edge Function not deployed)');
      }
      throw new Error(error.message || 'Failed to create payment intent');
    }

    if (!data || !data.clientSecret) {
      throw new Error('Invalid response from payment service. Please try again.');
    }

    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.id
    };
  } catch (error) {
    if (error.message?.includes('FunctionsHttpError') || error.message?.includes('FunctionsRelayError')) {
      throw new Error('Payment service error. Please try again or contact support.');
    }
    throw error;
  }
}
