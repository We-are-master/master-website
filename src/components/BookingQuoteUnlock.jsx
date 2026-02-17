import React from 'react';
import { Lock, MapPin, Mail, ArrowRight, Check } from 'lucide-react';

/**
 * Shared footer block for all booking pages.
 * "Your Custom Quote is Ready" style — enter email & postcode to unlock price.
 */
const BookingQuoteUnlock = ({
  postcode,
  onPostcodeChange,
  email,
  onEmailChange,
  postcodeError,
  emailError,
  onPostcodeBlur,
  onEmailBlur,
  canShowPrice,
  estimatedPrice,
  onContinue,
  discountPercent = 27,
  isMobile = false,
}) => {
  return (
    <footer
      className="bkp-footer"
      style={{
        background: 'var(--bkp-bg-deep)',
        borderTop: '1px solid var(--bkp-border-subtle)',
        padding: isMobile ? '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))' : '32px 24px 40px',
        width: '100%',
      }}
    >
      <div className="bkp-footer-inner">
        {/* Header: Your Custom Quote is Ready */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--bkp-radius-md)',
              background: 'var(--bkp-primary-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Lock size={24} color="var(--bkp-primary)" aria-hidden />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 'var(--bkp-text-xl)', fontWeight: 900, color: 'var(--bkp-text)', lineHeight: 1.2 }}>
              Your Custom Quote is Ready
            </h3>
            <p style={{ margin: '6px 0 0', color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-sm)', lineHeight: 1.4 }}>
              Enter details to unlock the guaranteed lowest rate for your area.
            </p>
          </div>
        </div>

        {/* Inputs: Email, Postcode */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--bkp-text-xs)', fontWeight: 700, color: 'var(--bkp-text)', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={onEmailChange}
                onBlur={onEmailBlur}
                className="bkp-input"
                style={{ paddingLeft: 44 }}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              <Mail size={20} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none', zIndex: 1 }} aria-hidden />
            </div>
            {emailError && <p id="email-error" style={{ color: '#f87171', fontSize: 'var(--bkp-text-sm)', margin: '6px 0 0' }}>{emailError}</p>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--bkp-text-xs)', fontWeight: 700, color: 'var(--bkp-text)', marginBottom: 6 }}>
              Postcode
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="E.g. SW1A 1AA"
                value={postcode}
                onChange={onPostcodeChange}
                onBlur={onPostcodeBlur}
                className="bkp-input"
                style={{ paddingLeft: 44 }}
                aria-describedby={postcodeError ? 'postcode-error' : undefined}
              />
              <MapPin size={20} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none', zIndex: 1 }} aria-hidden />
            </div>
            {postcodeError && <p id="postcode-error" style={{ color: '#f87171', fontSize: 'var(--bkp-text-sm)', margin: '6px 0 0' }}>{postcodeError}</p>}
          </div>
        </div>

        {/* AI Analysis block — shown when canShowPrice */}
        {canShowPrice && (
          <div
            className="bkp-card bkp-ai-card"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              borderRadius: 'var(--bkp-radius-md)',
              padding: 14,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--bkp-radius-full)',
                background: 'rgba(34, 197, 94, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Check size={20} color="#22c55e" strokeWidth={3} aria-hidden />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 'var(--bkp-text-xs)', fontWeight: 800, color: '#86efac', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                AI Analysis Complete
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--bkp-text-sm)', color: 'var(--bkp-text)', lineHeight: 1.4 }}>
                Compared to the London market, your quote is <strong style={{ color: '#86efac' }}>17% cheaper</strong>.
              </p>
            </div>
          </div>
        )}

        {/* CTA row: Estimated total + Book Now Pay Later */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            padding: '16px 0 0',
            borderTop: '1px solid var(--bkp-border-subtle)',
          }}
        >
          <div style={{ flex: 1, minWidth: 120 }}>
            <span className="bkp-label" style={{ fontSize: 'var(--bkp-text-xs)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Estimated total
            </span>
            <div style={{ marginTop: 4 }}>
              {canShowPrice ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                  <span className="bkp-price">£{typeof estimatedPrice === 'number' ? estimatedPrice.toFixed(0) : estimatedPrice}</span>
                  <span style={{ color: 'var(--bkp-text-quaternary)', fontSize: 'var(--bkp-text-sm)', fontWeight: 700 }}>.00</span>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 'var(--bkp-text-lg)', fontWeight: 800, color: 'var(--bkp-text)' }}>
                  Calculated after info
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={canShowPrice ? onContinue : undefined}
            className="bkp-btn-primary"
            aria-label="Book now and pay later"
            style={{
              opacity: canShowPrice ? 1 : 0.7,
              cursor: canShowPrice ? 'pointer' : 'not-allowed',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minWidth: 160,
              position: 'relative',
            }}
            disabled={!canShowPrice}
          >
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              <span style={{ lineHeight: 1.2 }}>Book Now</span>
              <span style={{ fontSize: 'var(--bkp-text-xs)', fontWeight: 700, opacity: 0.9 }}>Pay Later</span>
            </span>
            <ArrowRight size={18} strokeWidth={2.5} aria-hidden />
          </button>
        </div>

        {!canShowPrice && (
          <p style={{ margin: '12px 0 0', color: 'var(--bkp-text-tertiary)', fontSize: 'var(--bkp-text-xs)', textAlign: 'center' }}>
            Enter your postcode and email above to see your personalised price.
          </p>
        )}
      </div>
    </footer>
  );
};

export default BookingQuoteUnlock;
