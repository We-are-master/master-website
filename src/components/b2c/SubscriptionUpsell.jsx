import React from 'react';
import { Crown, CheckCircle, X } from 'lucide-react';

const SUBSCRIPTION_PRICE = 9.99;

/**
 * Checkbox-style Master Club upsell for checkout.
 * Controlled: parent passes checked + onChange. When checked, parent adds SUBSCRIPTION_PRICE to order total.
 */
const SubscriptionUpsell = ({ checked, onChange, onDismiss, disabled = false }) => {
  return (
    <div style={{
      backgroundColor: '#020034',
      borderRadius: '16px',
      padding: '1.5rem 2rem',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden',
      border: `2px solid ${checked ? 'rgba(233, 74, 2, 0.5)' : 'rgba(255,255,255,0.1)'}`,
      boxShadow: checked ? '0 8px 32px rgba(233, 74, 2, 0.15)' : '0 8px 32px rgba(0,0,0,0.2)',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
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
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
          }}
        >
          <X size={18} />
        </button>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        style={{
          position: 'relative',
          zIndex: 2,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.7 : 1
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          {/* Checkbox */}
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '8px',
            border: `2px solid ${checked ? '#E94A02' : 'rgba(255,255,255,0.4)'}`,
            backgroundColor: checked ? '#E94A02' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            {checked && <CheckCircle size={16} style={{ color: 'white' }} />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'rgba(233, 74, 2, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E94A02',
                border: '1px solid rgba(233, 74, 2, 0.4)'
              }}>
                <Crown size={20} />
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'white',
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}>
                  Join Master Club
                </h3>
                <p style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem',
                  margin: 0,
                  fontWeight: '400'
                }}>
                  Get up to 30% off on every booking
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginTop: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              {['Priority booking', 'Up to 30% discount', 'Exclusive member pricing', 'Cancel anytime'].map((benefit, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.875rem'
                }}>
                  <CheckCircle size={14} style={{ color: '#E94A02', flexShrink: 0 }} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.35rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white' }}>
                £{SUBSCRIPTION_PRICE.toFixed(2)}
              </span>
              <span style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                / month
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', marginLeft: '0.5rem' }}>
                — Cancel anytime. No long-term commitment.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionUpsell;
export { SUBSCRIPTION_PRICE };
