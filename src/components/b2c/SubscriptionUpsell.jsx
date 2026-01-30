import React from 'react';

const SUBSCRIPTION_PRICE = 9.99;

/**
 * Clean checkbox-style Master Club upsell for checkout.
 * Matches the privacy/terms style: simple label + checkbox + text.
 * Controlled: parent passes checked + onChange. When checked, parent adds SUBSCRIPTION_PRICE to order total.
 */
const SubscriptionUpsell = ({ checked, onChange, onDismiss, disabled = false }) => {
  return (
    <div style={{
      marginBottom: '1.5rem',
      padding: '1rem 1.25rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          flex: 1,
          minWidth: 0,
          opacity: disabled ? 0.7 : 1
        }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => !disabled && onChange(e.target.checked)}
            disabled={disabled}
            style={{
              width: '20px',
              height: '20px',
              marginTop: '2px',
              accentColor: '#E94A02',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          />
          <span style={{
            fontSize: '0.875rem',
            color: '#374151',
            lineHeight: '1.5'
          }}>
            Add <strong>Master Club</strong> — £{SUBSCRIPTION_PRICE.toFixed(2)}/month. Up to 30% off on every booking.{' '}
            <a href="/" style={{ color: '#2001AF', textDecoration: 'underline' }}>Learn more</a>. Cancel anytime.
          </span>
        </label>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Remove offer"
            style={{
              flexShrink: 0,
              padding: '0.25rem 0',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '0.8125rem',
              color: '#6b7280',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionUpsell;
export { SUBSCRIPTION_PRICE };
