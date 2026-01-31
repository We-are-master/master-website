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

    // Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log('[Payment] Creating payment intent:', {
        amount: paymentData.amount,
        currency: paymentData.currency || 'gbp',
        hasBookingData: !!paymentData.booking_data
      });
    }

    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount: paymentData.amount,
        currency: paymentData.currency || 'gbp',
        metadata: metadata,
        customer_email: paymentData.metadata?.customer_email || paymentData.booking_data?.customer_email || undefined,
        booking_data: paymentData.booking_data || null, // Optional: pre-create booking record
      }
    });

    // Enhanced error handling
    if (error) {
      console.error('[Payment] Supabase function error:', error);
      // Use backend error message when available (e.g. from response body)
      const backendMsg = error.context?.body?.error ?? error.context?.error ?? error.message;
      
      if (backendMsg?.includes('not found') || backendMsg?.includes('404') ||
          backendMsg?.includes('InvalidWorkerCreation') || backendMsg?.includes('worker boot error') ||
          backendMsg?.includes('No such file or directory')) {
        throw new Error('Payment service not available. Please contact support. (Edge Function not deployed or failed to start)');
      }
      
      if (backendMsg?.includes('503') || backendMsg?.includes('Service Unavailable')) {
        throw new Error('Payment service is temporarily unavailable. Please try again in a moment.');
      }
      
      if (backendMsg?.includes('timeout') || backendMsg?.includes('Timeout')) {
        throw new Error('Payment request timed out. Please try again.');
      }
      
      if (backendMsg?.includes('Failed to fetch') || backendMsg?.includes('NetworkError')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      if (backendMsg?.includes('STRIPE_SECRET_KEY') || backendMsg?.includes('not configured')) {
        throw new Error('Payment service is not configured on the server. Please contact support.');
      }
      if (backendMsg?.includes('SUPABASE_URL') || backendMsg?.includes('Supabase configuration')) {
        throw new Error('Server configuration error: ' + (backendMsg || 'Supabase URL/keys missing or wrong. Contact support.'));
      }
      throw new Error(backendMsg || 'Failed to create payment intent. Please try again.');
    }

    if (!data || !data.clientSecret) {
      console.error('[Payment] Invalid response:', data);
      throw new Error('Invalid response from payment service. Please try again.');
    }

    if (import.meta.env.DEV) {
      console.log('[Payment] Payment intent created successfully:', {
        id: data.id,
        hasClientSecret: !!data.clientSecret
      });
    }

    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.id
    };
  } catch (error) {
    console.error('[Payment] Error creating payment intent:', error);
    
    // Handle specific error types
    if (error.message?.includes('FunctionsHttpError') || error.message?.includes('FunctionsRelayError')) {
      throw new Error('Payment service error. Please try again or contact support.');
    }
    
    // Re-throw with user-friendly message if it's already formatted
    if (error.message && !error.message.includes('[Payment]')) {
      throw error;
    }
    
    // Default error message
    throw new Error('Failed to initialize payment. Please try again.');
  }
}

/**
 * Verify PaymentIntent status from Stripe
 * @param {string} clientSecret - PaymentIntent client secret
 * @returns {Promise<Object>} PaymentIntent with status
 */
export async function verifyPaymentIntentStatus(clientSecret) {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);
    
    if (error) {
      throw new Error(error.message || 'Failed to verify payment status');
    }

    return {
      status: paymentIntent.status,
      id: paymentIntent.id,
      paymentIntent: paymentIntent
    };
  } catch (error) {
    console.error('[Payment] Error verifying payment status:', error);
    throw error;
  }
}
