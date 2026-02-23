import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

/**
 * Página mínima para copiar código de cupom (ex: /c/HOME20).
 * Usada no email: o link "Copy" abre esta página; o utilizador clica em Copy e o código vai para a área de transferência.
 */
const CopyCode = () => {
  const { code } = useParams();
  const [copied, setCopied] = useState(false);
  const codeStr = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'HOME20';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select and execCommand
      const el = document.getElementById('code-text');
      if (el) {
        el.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const goToSite = () => {
    window.location.href = `https://wearemaster.com?coupon=${codeStr}`;
  };

  useEffect(() => {
    document.title = `Copy code ${codeStr} – Master`;
  }, [codeStr]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#020034',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      }}
    >
      <p style={{ margin: '0 0 8px 0', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
        Your discount code
      </p>
      <input
        id="code-text"
        type="text"
        readOnly
        value={codeStr}
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textAlign: 'center',
          padding: '16px 24px',
          border: '2px solid rgba(233,74,2,0.5)',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.08)',
          color: '#fff',
          marginBottom: 20,
          width: '100%',
          maxWidth: 280,
        }}
      />
      <button
        type="button"
        onClick={handleCopy}
        style={{
          width: '100%',
          maxWidth: 280,
          padding: '16px 24px',
          background: copied ? '#059669' : '#E94A02',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontSize: 17,
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: 12,
        }}
      >
        {copied ? 'Copied!' : 'Copy code'}
      </button>
      <button
        type="button"
        onClick={goToSite}
        style={{
          width: '100%',
          maxWidth: 280,
          padding: '14px 24px',
          background: 'transparent',
          color: '#E94A02',
          border: '2px solid #E94A02',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Go to wearemaster.com
      </button>
    </div>
  );
};

export default CopyCode;
