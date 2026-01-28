// Subscription management utilities for Master Club

import { getStripe } from './stripe';

/**
 * Check if a customer has an active Master Club subscription
 * @param {string} email - Customer email
 * @returns {Promise<Object>} Subscription status
 */
export async function checkSubscription(email) {
  try {
    const { supabase } = await import('./supabase');
    
    const { data, error } = await supabase.functions.invoke('check-subscription', {
      body: { email },
    });

    if (error) {
      console.error('[Subscription] Error checking subscription:', error);
      return { has_subscription: false };
    }

    return data || { has_subscription: false };
  } catch (error) {
    console.error('[Subscription] Error checking subscription:', error);
    return { has_subscription: false };
  }
}

/**
 * Create a Master Club subscription
 * @param {Object} subscriptionData - Subscription data
 * @param {string} subscriptionData.email - Customer email
 * @param {string} subscriptionData.customer_name - Customer name
 * @param {string} subscriptionData.payment_method_id - Stripe payment method ID
 * @returns {Promise<Object>} Subscription with client secret
 */
export async function createSubscription(subscriptionData) {
  try {
    const { supabase } = await import('./supabase');
    
    const { data, error } = await supabase.functions.invoke('create-subscription', {
      body: {
        email: subscriptionData.email,
        customer_name: subscriptionData.customer_name,
        payment_method_id: subscriptionData.payment_method_id,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to create subscription');
    }

    return data;
  } catch (error) {
    console.error('[Subscription] Error creating subscription:', error);
    throw error;
  }
}

/**
 * Manage subscription (pause, cancel, resume, update payment method)
 * @param {Object} manageData - Management data
 * @param {string} manageData.action - Action: 'pause', 'cancel', 'resume', 'update_payment_method', 'get_subscription'
 * @param {string} manageData.email - Customer email
 * @param {string} manageData.subscription_id - Optional subscription ID
 * @param {string} manageData.payment_method_id - Required for 'update_payment_method'
 * @returns {Promise<Object>} Result of the action
 */
export async function manageSubscription(manageData) {
  try {
    const { supabase } = await import('./supabase');
    
    const { data, error } = await supabase.functions.invoke('manage-subscription', {
      body: {
        action: manageData.action,
        email: manageData.email,
        subscription_id: manageData.subscription_id,
        payment_method_id: manageData.payment_method_id,
      },
    });

    if (error) {
      // If it's a 404 (not found), return null instead of throwing for 'get_subscription'
      if (manageData.action === 'get_subscription' && 
          (error.message?.includes('404') || error.message?.includes('not found') || error.message?.includes('No active subscription'))) {
        return null;
      }
      throw new Error(error.message || 'Failed to manage subscription');
    }

    return data;
  } catch (error) {
    console.error('[Subscription] Error managing subscription:', error);
    
    // For 'get_subscription', if it's a 404 or "not found", return null instead of throwing
    if (manageData.action === 'get_subscription' && 
        (error.message?.includes('404') || error.message?.includes('not found') || error.message?.includes('No active subscription'))) {
      return null;
    }
    
    throw error;
  }
}

/**
 * Confirm subscription payment with Stripe
 * @param {string} clientSecret - Subscription client secret
 * @returns {Promise<Object>} Confirmed subscription
 */
export async function confirmSubscriptionPayment(clientSecret) {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);

    if (error) {
      throw new Error(error.message || 'Payment confirmation failed');
    }

    return paymentIntent;
  } catch (error) {
    console.error('[Subscription] Error confirming payment:', error);
    throw error;
  }
}
