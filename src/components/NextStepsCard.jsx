import React from 'react';
import { Clock } from 'lucide-react';

/**
 * Reassurance card for booking pages: "After completion, our team will contact you within 30 minutes..."
 */
const NextStepsCard = () => (
  <div
    style={{
      background: 'linear-gradient(145deg, #0f0f23 0%, #1a1a3a 100%)',
      borderRadius: 'var(--bkp-radius-xl)',
      padding: '20px 24px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 'var(--bkp-radius-md)',
        background: 'rgba(237, 75, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Clock size={24} color="#ED4B00" aria-hidden />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <h4 style={{ margin: 0, fontSize: 'var(--bkp-text-lg)', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
        Next Steps
      </h4>
      <p style={{ margin: 0, fontSize: 'var(--bkp-text-sm)', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.5 }}>
        After completion, our team will contact you within <strong style={{ color: '#fff' }}>30 minutes</strong> to confirm data, validate the date, and ensure everything is okay.
      </p>
    </div>
  </div>
);

export default NextStepsCard;
