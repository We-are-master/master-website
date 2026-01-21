import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Mail, Phone, ArrowRight, Home, FileText, Clock } from 'lucide-react';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [bookingDetails, setBookingDetails] = useState(null);

  // Get booking details from location state or URL params
  useEffect(() => {
    const stateData = location.state;
    
    if (stateData) {
      setBookingDetails({
        service: stateData.service,
        postcode: stateData.postcode,
        jobDescription: stateData.jobDescription,
        customerDetails: stateData.customerDetails,
        paymentIntentId: stateData.paymentIntentId,
        scheduledDates: stateData.scheduledDates,
        scheduledTimeSlots: stateData.scheduledTimeSlots,
        timeSlotLabels: stateData.timeSlotLabels,
      });
    } else {
      // If no state, try to get payment_intent from URL (Stripe redirect)
      const paymentIntent = searchParams.get('payment_intent');
      const redirectStatus = searchParams.get('redirect_status');
      
      if (paymentIntent && redirectStatus === 'succeeded') {
        setBookingDetails({
          paymentIntentId: paymentIntent,
          fromRedirect: true,
        });
      }
    }
  }, [location.state, searchParams]);

  // Generate a booking reference
  const bookingRef = bookingDetails?.paymentIntentId 
    ? `MAS-${bookingDetails.paymentIntentId.slice(-8).toUpperCase()}`
    : `MAS-${Date.now().toString(36).toUpperCase()}`;

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
