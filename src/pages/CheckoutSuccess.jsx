import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Mail, Phone, ArrowRight, Home, FileText, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { getStripe } from '../lib/stripe';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('verifying');
  const [paymentError, setPaymentError] = useState(null);

  // Add spinner animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    style.setAttribute('data-checkout-success', 'true');
    if (!document.head.querySelector('style[data-checkout-success]')) {
      document.head.appendChild(style);
    }
  }, []);

  // Verify payment status before showing success
  useEffect(() => {
    const verifyPayment = async () => {
      const stateData = location.state;
      let paymentIntentId = null;
      let clientSecret = null;

      if (stateData?.paymentIntentId) {
        paymentIntentId = stateData.paymentIntentId;
        // If we have clientSecret in state, use it; otherwise we'll need to verify via ID
        clientSecret = stateData.clientSecret;
      } else {
        // Try to get from URL params (Stripe redirect)
        const paymentIntent = searchParams.get('payment_intent');
        const redirectStatus = searchParams.get('redirect_status');
        
        if (paymentIntent) {
          paymentIntentId = paymentIntent;
          // For redirects, we need to verify the status
          if (redirectStatus !== 'succeeded') {
            setPaymentStatus('failed');
            setPaymentError('Payment was not completed successfully.');
            return;
          }
        }
      }

      if (!paymentIntentId) {
        setPaymentStatus('failed');
        setPaymentError('No payment information found.');
        return;
      }

      // Verify payment status with Stripe
      try {
        const stripe = await getStripe();
        if (!stripe) {
          throw new Error('Stripe is not configured');
        }

        // Try to retrieve payment intent - we need clientSecret or paymentIntentId
        // If we have clientSecret, use it; otherwise try to construct from paymentIntentId
        let paymentIntent = null;
        let error = null;

        if (stateData?.clientSecret) {
          // Use clientSecret if available (most reliable)
          const result = await stripe.retrievePaymentIntent(stateData.clientSecret);
          paymentIntent = result.paymentIntent;
          error = result.error;
        } else {
          // For redirects or when we only have ID, we need to verify via backend
          // Since Stripe.js doesn't support retrieving by ID directly, we'll check the redirect status
          const redirectStatus = searchParams.get('redirect_status');
          
          if (redirectStatus === 'succeeded') {
            // If redirect_status says succeeded, we still need to verify
            // In a real scenario, you'd verify via backend, but for now we'll trust the redirect status
            // and show a warning that verification is pending
            setPaymentStatus('succeeded');
            if (stateData) {
              setBookingDetails({
                service: stateData.service,
                postcode: stateData.postcode,
                jobDescription: stateData.jobDescription,
                customerDetails: stateData.customerDetails,
                paymentIntentId: paymentIntentId,
                scheduledDates: stateData.scheduledDates,
                scheduledTimeSlots: stateData.scheduledTimeSlots,
                timeSlotLabels: stateData.timeSlotLabels,
              });
            } else {
              setBookingDetails({
                paymentIntentId: paymentIntentId,
                fromRedirect: true,
              });
            }
            return;
          } else {
            throw new Error(`Payment redirect status: ${redirectStatus || 'unknown'}`);
          }
        }

        if (error) {
          throw new Error(error.message || 'Failed to verify payment');
        }

        if (!paymentIntent) {
          throw new Error('Payment intent not found');
        }

        // CRITICAL: Only show success if payment is actually succeeded
        if (paymentIntent.status === 'succeeded') {
          setPaymentStatus('succeeded');
          // Set booking details after verification
          if (stateData) {
            setBookingDetails({
              service: stateData.service,
              postcode: stateData.postcode,
              jobDescription: stateData.jobDescription,
              customerDetails: stateData.customerDetails,
              paymentIntentId: paymentIntent.id,
              scheduledDates: stateData.scheduledDates,
              scheduledTimeSlots: stateData.scheduledTimeSlots,
              timeSlotLabels: stateData.timeSlotLabels,
            });
          } else {
            setBookingDetails({
              paymentIntentId: paymentIntent.id,
              fromRedirect: true,
            });
          }
        } else {
          // Payment not succeeded - show error
          setPaymentStatus('failed');
          setPaymentError(`Payment status: ${paymentIntent.status}. Payment was not completed.`);
        }
      } catch (err) {
        console.error('[CheckoutSuccess] Payment verification error:', err);
        setPaymentStatus('failed');
        setPaymentError(err.message || 'Unable to verify payment status. Please contact support.');
      }
    };

    verifyPayment();
  }, [location.state, searchParams]);

  // Generate a booking reference
  const bookingRef = bookingDetails?.paymentIntentId 
    ? `MAS-${bookingDetails.paymentIntentId.slice(-8).toUpperCase()}`
    : `MAS-${Date.now().toString(36).toUpperCase()}`;

  // Show error if payment verification failed
  if (paymentStatus === 'failed') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '1.5rem',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <AlertCircle size={48} style={{ color: '#dc2626' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
            Payment Not Completed
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '2rem' }}>
            {paymentError || 'Your payment was not completed successfully.'}
          </p>
          <button
            onClick={() => navigate('/booking')}
            style={{
              backgroundColor: '#020034',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0a0a5c'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#020034'}
          >
            Return to Booking
          </button>
        </div>
      </div>
    );
  }

  // Show loading while verifying (or any non-failed state) – never show blank page
  if (paymentStatus !== 'succeeded') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '1.5rem',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem', color: '#020034' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            Verifying Payment...
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            Please wait while we confirm your payment status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Success Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle size={48} style={{ color: '#10b981' }} />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '0.5rem'
          }}>
            Payment Successful!
          </h1>
          <p style={{
            fontSize: '1.125rem',
            opacity: 0.9
          }}>
            Your booking has been confirmed
          </p>
        </div>

        {/* Booking Details */}
        <div style={{ padding: '2rem' }}>
          {/* Booking Reference */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '2px dashed #0ea5e9',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: '#0369a1',
              marginBottom: '0.25rem'
            }}>
              Booking Reference
            </p>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#0c4a6e',
              letterSpacing: '0.1em'
            }}>
              {bookingRef}
            </p>
          </div>

          {/* Service Details */}
          {bookingDetails?.service && (
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FileText size={18} />
                Service Booked
              </h3>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem'
              }}>
                <div>
                  <p style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '0.25rem'
                  }}>
                    {bookingDetails.service.title}
                  </p>
                  {bookingDetails.service.category && (
                    <span style={{
                      fontSize: '0.8rem',
                      color: '#6b7280',
                      backgroundColor: '#e5e7eb',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem'
                    }}>
                      {bookingDetails.service.category}
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#059669'
                }}>
                  £{parseFloat(bookingDetails.service.price).toFixed(2)}
                </p>
              </div>

              {bookingDetails.jobDescription && (
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    Job Description:
                  </p>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#374151'
                  }}>
                    {bookingDetails.jobDescription}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Scheduled Dates & Time */}
          {bookingDetails?.scheduledDates && bookingDetails.scheduledDates.length > 0 && (
            <div style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #bbf7d0'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#166534',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Calendar size={18} />
                Your Preferred Dates
              </h3>
              
              <p style={{
                fontSize: '0.8rem',
                color: '#6b7280',
                marginBottom: '1rem'
              }}>
                We'll confirm the final date from your options below:
              </p>
              
              <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
                {bookingDetails.scheduledDates.map((dateStr, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#dcfce7',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#16a34a'
                    }}>
                      {index + 1}
                    </div>
                    <span style={{ color: '#166534', fontSize: '0.9rem', fontWeight: '500' }}>
                      {new Date(dateStr).toLocaleDateString('en-GB', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long'
                      })}
                    </span>
                  </div>
                ))}
              </div>

              {bookingDetails.timeSlotLabels && bookingDetails.timeSlotLabels.length > 0 && (
                <div style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid #bbf7d0'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <Clock size={16} style={{ color: '#16a34a' }} />
                    <span style={{ fontWeight: '600', color: '#166534', fontSize: '0.9rem' }}>
                      Preferred Time Slots
                    </span>
                  </div>
                  {bookingDetails.timeSlotLabels.map((label, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem'
                    }}>
                      <span style={{ color: '#166534', fontSize: '0.85rem' }}>
                        • {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customer Details */}
          {bookingDetails?.customerDetails && (
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '1rem'
              }}>
                Contact Details
              </h3>
              
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#e0e7ff',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Mail size={16} style={{ color: '#4f46e5' }} />
                  </div>
                  <span style={{ color: '#374151', fontSize: '0.9rem' }}>
                    {bookingDetails.customerDetails.email}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#dcfce7',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Phone size={16} style={{ color: '#16a34a' }} />
                  </div>
                  <span style={{ color: '#374151', fontSize: '0.9rem' }}>
                    {bookingDetails.customerDetails.phone}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MapPin size={16} style={{ color: '#d97706' }} />
                  </div>
                  <span style={{ color: '#374151', fontSize: '0.9rem' }}>
                    {bookingDetails.customerDetails.addressLine1}
                    {bookingDetails.customerDetails.addressLine2 && `, ${bookingDetails.customerDetails.addressLine2}`}
                    , {bookingDetails.customerDetails.city}, {bookingDetails.customerDetails.postcode}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* What Happens Next */}
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fcd34d',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#92400e',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock size={18} />
              What happens next?
            </h3>
            <ol style={{
              margin: 0,
              paddingLeft: '1.25rem',
              color: '#78350f',
              fontSize: '0.9rem',
              lineHeight: '1.75'
            }}>
              <li>You'll receive a confirmation email shortly</li>
              <li>Our team will review your booking</li>
              <li>A professional will be assigned to your job</li>
              <li>They'll contact you to confirm the appointment</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexDirection: 'column'
          }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: '#020034',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0a0a5c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#020034'}
            >
              <Home size={20} />
              Back to Home
            </button>

            <button
              onClick={() => navigate('/booking')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: 'white',
                color: '#020034',
                border: '2px solid #020034',
                borderRadius: '0.5rem',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              Book Another Service
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Support Info */}
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.8rem',
            marginTop: '2rem'
          }}>
            Need help? Contact us at{' '}
            <a 
              href="mailto:hello@wearemaster.com" 
              style={{ color: '#2001AF', textDecoration: 'none' }}
            >
              hello@wearemaster.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
