import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Shield, Loader2, AlertCircle } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntentViaSupabase } from '../lib/stripe';

// Payment Form Component
const PaymentForm = ({ service, postcode, jobDescription, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createIntent = async () => {
      try {
        const amount = Math.round((service.price || 0) * 100); // Convert to pence
        
        if (amount <= 0) {
          setError('Invalid service price');
          return;
        }

        const paymentData = await createPaymentIntentViaSupabase({
          amount: amount,
          currency: 'gbp',
          metadata: {
            service_id: service.id || service.originalService?.id,
            service_name: service.title,
            postcode: postcode || '',
            job_description: jobDescription || ''
          }
        });

        setClientSecret(paymentData.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again.');
      }
    };

    createIntent();
  }, [service, postcode, jobDescription]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
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

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout-success`,
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        setError(confirmError.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Loading payment form...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#dc2626'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      
      <div style={{ marginBottom: '1.5rem' }}>
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          width: '100%',
          backgroundColor: loading ? '#9ca3af' : '#E94A02',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '1.125rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
        onMouseOver={(e) => {
          if (!loading) e.target.style.backgroundColor = '#d13d00';
        }}
        onMouseOut={(e) => {
          if (!loading) e.target.style.backgroundColor = '#E94A02';
        }}
      >
        {loading ? (
          <>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Processing...
          </>
        ) : (
          'Pay now'
        )}
      </button>
    </form>
  );
};

const B2CCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { service, postcode, jobDescription } = location.state || {};
  const [stripePromise, setStripePromise] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const initStripe = async () => {
      const stripe = await getStripe();
      setStripePromise(stripe);
    };
    initStripe();
  }, []);

  if (!service) {
    navigate('/');
    return null;
  }

  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentSuccess(true);
    // Redirect to success page after a short delay
    setTimeout(() => {
      navigate('/checkout-success', {
        state: {
          service,
          postcode,
          jobDescription,
          paymentIntentId: paymentIntent.id
        }
      });
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <CheckCircle size={64} style={{ color: '#10b981', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
            Payment Successful!
          </h2>
          <p style={{ color: '#6b7280' }}>Redirecting to confirmation page...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#020034',
        padding: '1.25rem 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <div className="container">
          <button
            onClick={() => navigate('/booking')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 0' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 420px',
          gap: '2.5rem'
        }}>
          {/* Left: Service Details */}
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#020034',
              marginBottom: '2rem',
              lineHeight: '1.2'
            }}>
              Your booking summary
            </h1>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#020034',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {service.title?.charAt(0) || 'S'}
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#111827',
                  margin: 0
                }}>
                  {service.title}
                </h2>
              </div>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                {service.description}
              </p>
              {jobDescription && (
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginTop: '1rem'
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Your job description:
                  </p>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '0.95rem',
                    margin: 0
                  }}>
                    {jobDescription}
                  </p>
                </div>
              )}
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.875rem'
              }}>
                <Shield size={16} />
                <span>Vetted and insured professional</span>
              </div>
            </div>

            {/* Trust indicators */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1.5rem'
              }}>
                Why book with Master?
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}>
                {[
                  'Instant pricing - no hidden fees',
                  'Vetted and insured professionals',
                  'Secure payment processing',
                  'Satisfaction guaranteed'
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                  >
                    <CheckCircle size={24} style={{ color: '#10b981', flexShrink: 0 }} />
                    <span style={{ color: '#374151', fontSize: '1rem', fontWeight: '500' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Summary */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '2rem',
              border: '2px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #e5e7eb'
              }}>
                Your summary
              </h2>

              <div style={{
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ color: '#6b7280' }}>Service</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>
                    £{service.price}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ color: '#6b7280' }}>Location</span>
                  <span style={{ color: '#111827' }}>{postcode}</span>
                </div>
                <div style={{
                  borderTop: '2px solid #e5e7eb',
                  paddingTop: '1rem',
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginTop: '1rem'
                }}>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#111827'
                  }}>
                    Total
                  </span>
                  <span style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#020034'
                  }}>
                    £{service.price}
                  </span>
                </div>
              </div>

              {stripePromise ? (
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    service={service}
                    postcode={postcode}
                    jobDescription={jobDescription}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <div style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  <p style={{ marginTop: '0.5rem' }}>Loading payment form...</p>
                </div>
              )}

              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                textAlign: 'center',
                margin: 0
              }}>
                Secure payment • No hidden fees
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 968px) {
          div[style*="grid-template-columns: 1fr 420px"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="position: sticky"] {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default B2CCheckout;
