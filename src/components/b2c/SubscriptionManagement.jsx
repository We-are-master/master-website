import React, { useState, useEffect } from 'react';
import { Crown, Pause, Play, X, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { manageSubscription, checkSubscription } from '../../lib/subscription';
import { getStripe } from '../../lib/stripe';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const SubscriptionManagement = ({ userEmail, customerName, onSubscriptionChange }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [showUpdatePayment, setShowUpdatePayment] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [stripeInstance, setStripeInstance] = useState(null);

  useEffect(() => {
    fetchSubscription();
    initStripe();
  }, [userEmail]);

  // Notify parent when subscription status changes
  useEffect(() => {
    if (!loading && onSubscriptionChange) {
      onSubscriptionChange(!!subscription?.subscription_id);
    }
  }, [subscription, loading, onSubscriptionChange]);

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

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await manageSubscription({
        action: 'get_subscription',
        email: userEmail,
      });
      
      // If result is null or doesn't have subscription_id, no subscription exists
      if (!result || !result.subscription_id) {
        setSubscription(null);
        if (onSubscriptionChange) {
          onSubscriptionChange(false);
        }
      } else {
        setSubscription(result);
        if (onSubscriptionChange) {
          onSubscriptionChange(true);
        }
      }
    } catch (err) {
      console.error('[Subscription] Error fetching subscription:', err);
      
      // If error is 404 or "not found", it's expected (no subscription)
      if (err.message?.includes('404') || 
          err.message?.includes('not found') || 
          err.message?.includes('No active subscription') ||
          err.message?.includes('Edge Function returned a non-2xx')) {
        // Check if it's actually a 404 or just a server error
        // If it's a 500, it might be because table doesn't exist - treat as no subscription
        setSubscription(null);
        setError(''); // Don't show error for "no subscription" - it's expected
      } else {
        setError(err.message || 'Failed to load subscription. Please try again.');
      }
      
      // Always notify parent that no subscription exists on error
      if (onSubscriptionChange) {
        onSubscriptionChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setActionLoading('pause');
      setError('');
      await manageSubscription({
        action: 'pause',
        email: userEmail,
        subscription_id: subscription?.subscription_id,
      });
      await fetchSubscription();
    } catch (err) {
      setError(err.message || 'Failed to pause subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading('resume');
      setError('');
      await manageSubscription({
        action: 'resume',
        email: userEmail,
        subscription_id: subscription?.subscription_id,
      });
      await fetchSubscription();
    } catch (err) {
      setError(err.message || 'Failed to resume subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your Master Club subscription? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading('cancel');
      setError('');
      await manageSubscription({
        action: 'cancel',
        email: userEmail,
        subscription_id: subscription?.subscription_id,
      });
      await fetchSubscription();
    } catch (err) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '3rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.06)',
        textAlign: 'center'
      }}>
        <Loader2 size={32} style={{ 
          animation: 'spin 1s linear infinite', 
          color: '#E94A02', 
          margin: '0 auto' 
        }} />
      </div>
    );
  }

  if (!subscription || !subscription.subscription_id) {
    return null; // No subscription to manage
  }

  const isPaused = subscription.paused || subscription.status === 'paused';
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.06)',
      marginBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: '#E94A0215',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#E94A02'
        }}>
          <Crown size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1d1d1f',
            marginBottom: '0.25rem',
            letterSpacing: '-0.02em'
          }}>
            Master Club Subscription
          </h3>
          <p style={{
            color: '#86868b',
            fontSize: '0.875rem',
            fontWeight: '400'
          }}>
            {isPaused ? 'Paused' : isActive ? 'Active' : subscription.status}
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: isActive ? '#d1fae5' : isPaused ? '#fef3c7' : '#fee2e2',
          color: isActive ? '#10b981' : isPaused ? '#f59e0b' : '#ef4444',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontSize: '0.8125rem',
          fontWeight: '500'
        }}>
          {isActive && <CheckCircle size={16} />}
          {isPaused && <Pause size={16} />}
          {!isActive && !isPaused && <AlertCircle size={16} />}
          {isPaused ? 'Paused' : isActive ? 'Active' : subscription.status}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#dc2626'
        }}>
          <AlertCircle size={16} />
          <span style={{ fontSize: '0.875rem' }}>{error}</span>
        </div>
      )}

      {/* Subscription Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1.5rem',
        padding: '1.5rem 0',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        marginBottom: '1.5rem'
      }}>
        <div>
          <p style={{
            color: '#86868b',
            fontSize: '0.8125rem',
            marginBottom: '0.5rem',
            fontWeight: '400'
          }}>
            Current Period End
          </p>
          <p style={{
            fontWeight: '600',
            color: '#1d1d1f',
            fontSize: '1rem'
          }}>
            {formatDate(subscription.current_period_end)}
          </p>
        </div>
        <div>
          <p style={{
            color: '#86868b',
            fontSize: '0.8125rem',
            marginBottom: '0.5rem',
            fontWeight: '400'
          }}>
            Status
          </p>
          <p style={{
            fontWeight: '500',
            color: '#1d1d1f',
            fontSize: '0.9375rem'
          }}>
            {isPaused ? 'Paused' : isActive ? 'Active' : subscription.status}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        {isPaused ? (
          <button
            onClick={handleResume}
            disabled={actionLoading === 'resume'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: actionLoading === 'resume' ? 'not-allowed' : 'pointer',
              opacity: actionLoading === 'resume' ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (actionLoading !== 'resume') {
                e.target.style.backgroundColor = '#059669';
              }
            }}
            onMouseLeave={(e) => {
              if (actionLoading !== 'resume') {
                e.target.style.backgroundColor = '#10b981';
              }
            }}
          >
            {actionLoading === 'resume' ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Play size={16} />
            )}
            Resume Subscription
          </button>
        ) : isActive ? (
          <button
            onClick={handlePause}
            disabled={actionLoading === 'pause'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: actionLoading === 'pause' ? 'not-allowed' : 'pointer',
              opacity: actionLoading === 'pause' ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (actionLoading !== 'pause') {
                e.target.style.backgroundColor = '#d97706';
              }
            }}
            onMouseLeave={(e) => {
              if (actionLoading !== 'pause') {
                e.target.style.backgroundColor = '#f59e0b';
              }
            }}
          >
            {actionLoading === 'pause' ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Pause size={16} />
            )}
            Pause Subscription
          </button>
        ) : null}

        <button
          onClick={() => setShowUpdatePayment(!showUpdatePayment)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'white',
            color: '#1d1d1f',
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f5f5f7';
            e.target.style.borderColor = 'rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = 'rgba(0,0,0,0.15)';
          }}
        >
          <CreditCard size={16} />
          Update Payment Method
        </button>

        <button
          onClick={handleCancel}
          disabled={actionLoading === 'cancel'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'white',
            color: '#ef4444',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: actionLoading === 'cancel' ? 'not-allowed' : 'pointer',
            opacity: actionLoading === 'cancel' ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (actionLoading !== 'cancel') {
              e.target.style.backgroundColor = '#fef2f2';
              e.target.style.borderColor = '#fca5a5';
            }
          }}
          onMouseLeave={(e) => {
            if (actionLoading !== 'cancel') {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#fecaca';
            }
          }}
        >
          {actionLoading === 'cancel' ? (
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <X size={16} />
          )}
          Cancel Subscription
        </button>
      </div>

      {/* Update Payment Method Form */}
      {showUpdatePayment && stripeInstance && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1.5rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.08)'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#1d1d1f',
            marginBottom: '1rem',
            fontWeight: '500'
          }}>
            Update your payment method
          </p>
          <Elements stripe={stripeInstance} options={{ mode: 'setup', currency: 'gbp' }}>
            <PaymentElementForm 
              subscriptionId={subscription.subscription_id}
              onSuccess={() => {
                setShowUpdatePayment(false);
                fetchSubscription();
              }}
            />
          </Elements>
        </div>
      )}
    </div>
  );
};

// Payment Element Form Component
const PaymentElementForm = ({ subscriptionId, onSuccess }) => {
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
        setLoading(false);
        return;
      }

      const { setupIntent, error: confirmError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      if (setupIntent && setupIntent.status === 'succeeded') {
        // Update subscription with new payment method
        const { manageSubscription } = await import('../../lib/subscription');
        await manageSubscription({
          action: 'update_payment_method',
          subscription_id: subscriptionId,
          payment_method_id: setupIntent.payment_method,
        });
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to update payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          marginTop: '1rem',
          width: '100%',
          backgroundColor: '#E94A02',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.875rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: !stripe || loading ? 'not-allowed' : 'pointer',
          opacity: !stripe || loading ? 0.6 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        {loading ? 'Updating...' : 'Update Payment Method'}
      </button>
    </form>
  );
};

export default SubscriptionManagement;
