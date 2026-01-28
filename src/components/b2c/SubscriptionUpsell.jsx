import React, { useState, useEffect } from 'react';
import { Crown, X, CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { checkSubscription, createSubscription } from '../../lib/subscription';
import { getStripe } from '../../lib/stripe';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const SubscriptionUpsell = ({ customerEmail, customerName, onDismiss, onSuccess }) => {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [stripeInstance, setStripeInstance] = useState(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
    initStripe();
  }, [customerEmail]);

  const initStripe = async () => {
    try {
      const stripe = await getStripe();
      if (stripe) {
        setStripeInstance(stripe);
      }
    } catch (error) {
      console.error('[Subscription] Error initializing Stripe:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!customerEmail) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await checkSubscription(customerEmail);
      setHasSubscription(result.has_subscription || false);
    } catch (err) {
      console.error('[Subscription] Error checking subscription:', err);
      setHasSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClick = async () => {
    if (!stripeInstance) {
      setError('Payment system not ready. Please try again.');
      return;
    }

    try {
      setShowPaymentForm(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to initialize subscription. Please try again.');
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    if (onSuccess) {
      onSuccess();
    }
    // Refresh subscription status
    checkSubscriptionStatus();
  };

  // Don't show if user already has subscription or email is not provided
  if (loading || hasSubscription || !customerEmail) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: '#020034',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden',
      border: '2px solid rgba(233, 74, 2, 0.3)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        zIndex: 1
      }}></div>

      {/* Close Button */}
      <button
        onClick={onDismiss}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '8px',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.8)',
          zIndex: 3,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
          e.target.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
          e.target.style.color = 'rgba(255,255,255,0.8)';
        }}
      >
        <X size={18} />
      </button>

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'rgba(233, 74, 2, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#E94A02',
            border: '2px solid rgba(233, 74, 2, 0.4)'
          }}>
            <Crown size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'white',
              marginBottom: '0.25rem',
              letterSpacing: '-0.02em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              Join Master Club
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.9375rem',
              fontWeight: '400',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              Get up to 30% off on every booking
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div style={{
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {[
            'Priority booking',
            'Up to 30% discount',
            'Exclusive member pricing',
            'Cancel anytime'
          ].map((benefit, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9375rem',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              <CheckCircle size={18} style={{ color: '#E94A02', flexShrink: 0 }} />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              color: 'white',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              £9.99
            </span>
            <span style={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: '500',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              / month
            </span>
          </div>
          <p style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.875rem',
            margin: 0,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
          }}>
            Cancel anytime. No long-term commitment.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#fecaca'
          }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.875rem' }}>{error}</span>
          </div>
        )}

        {/* Payment Form or Join Button */}
        {showPaymentForm && stripeInstance ? (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Elements stripe={stripeInstance} options={{ mode: 'subscription', currency: 'gbp' }}>
              <SubscriptionPaymentForm
                customerEmail={customerEmail}
                customerName={customerName}
                onSuccess={handlePaymentSuccess}
                onError={(err) => setError(err)}
              />
            </Elements>
          </div>
        ) : (
          <button
            onClick={handleJoinClick}
            disabled={processing}
            style={{
              width: '100%',
              backgroundColor: '#E94A02',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: processing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.3s ease',
              opacity: processing ? 0.6 : 1,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}
            onMouseEnter={(e) => {
              if (!processing) {
                e.target.style.backgroundColor = '#d13d00';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(233, 74, 2, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!processing) {
                e.target.style.backgroundColor = '#E94A02';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {processing ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Processing...
              </>
            ) : (
              <>
                <span>Join the Master Club</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Subscription Payment Form Component
const SubscriptionPaymentForm = ({ customerEmail, customerName, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        onError(submitError.message);
        setLoading(false);
        return;
      }

      // Get payment method
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        elements,
      });

      if (pmError) {
        setError(pmError.message);
        onError(pmError.message);
        setLoading(false);
        return;
      }

      // Create subscription
      const subscriptionData = await createSubscription({
        email: customerEmail,
        customer_name: customerName,
        payment_method_id: paymentMethod.id,
      });

      // Confirm payment using Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        subscriptionData.client_secret
      );

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment confirmation failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        // Payment might be processing - subscription will be activated via webhook
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create subscription. Please try again.';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1.5rem' }}>
        <PaymentElement />
      </div>
      {error && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '8px',
          color: '#fecaca',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          width: '100%',
          backgroundColor: '#E94A02',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: !stripe || loading ? 'not-allowed' : 'pointer',
          opacity: !stripe || loading ? 0.6 : 1,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
        }}
      >
        {loading ? (
          <>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Processing...
          </>
        ) : (
          <>
            Complete Subscription
            <ArrowRight size={20} />
          </>
        )}
      </button>
    </form>
  );
};

export default SubscriptionUpsell;
