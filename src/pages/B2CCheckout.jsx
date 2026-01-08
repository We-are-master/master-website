import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Shield } from 'lucide-react';

const B2CCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { service, postcode, jobDescription } = location.state || {};

  if (!service) {
    navigate('/');
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0'
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
              color: '#2001AF',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '2rem'
        }}>
          {/* Left: Service Details */}
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#2001AF',
              marginBottom: '1.5rem'
            }}>
              Your booking summary
            </h1>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1rem'
              }}>
                {service.title}
              </h2>
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
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1rem'
              }}>
                Why book with Master Express?
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
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
                    gap: '0.75rem'
                  }}>
                    <CheckCircle size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                    <span style={{ color: '#374151' }}>{item}</span>
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
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1.5rem'
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
                  paddingTop: '0.75rem',
                  marginTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#111827'
                  }}>
                    Total
                  </span>
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#2001AF'
                  }}>
                    £{service.price}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  // Here you would integrate with payment processing
                  alert('Booking confirmed! (This is a demo - integrate with your payment system)');
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#E94A02',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginBottom: '1rem'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#d13d00'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#E94A02'}
              >
                Continue to Checkout
              </button>

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

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 400px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default B2CCheckout;
