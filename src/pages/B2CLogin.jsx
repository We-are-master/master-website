import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { gsap } from 'gsap';
import { supabase } from '../lib/supabase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin();
}

const B2CLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'success'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const cardRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
      );
    }
    if (iconRef.current) {
      gsap.fromTo(iconRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, delay: 0.2, ease: 'back.out(1.7)' }
      );
    }
  }, [step]);

  // Validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Send OTP code to email
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true, // Allow new users
        }
      });

      if (signInError) {
        throw signInError;
      }

      setStep('code');
      startResendCooldown();
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!code.trim() || code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code.trim(),
        type: 'email'
      });

      if (verifyError) {
        throw verifyError;
      }

      if (data?.session) {
        setStep('success');
        // Redirect to my orders page after short delay
        setTimeout(() => {
          navigate('/my-orders');
        }, 1500);
      }
    } catch (err) {
      if (err.message?.includes('expired')) {
        setError('Code has expired. Please request a new one.');
      } else if (err.message?.includes('invalid')) {
        setError('Invalid code. Please check and try again.');
      } else {
        setError(err.message || 'Failed to verify code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend code with cooldown
  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
      });

      if (signInError) {
        throw signInError;
      }

      startResendCooldown();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle code input - auto move to next field and only allow numbers
  const handleCodeChange = (value) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fbfbfd',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden',
      width: '100%',
      maxWidth: '100vw'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#020034',
        padding: '1.5rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          zIndex: 1
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: '400',
              transition: 'color 0.2s ease',
              letterSpacing: '-0.01em'
            }}
            onMouseEnter={(e) => e.target.style.color = 'white'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem'
      }}>
        <div 
          ref={cardRef}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '3rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)',
            maxWidth: '480px',
            width: '100%'
          }}
        >
          {/* Logo/Icon */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2.5rem'
          }}>
            <div 
              ref={iconRef}
              style={{
                width: '72px',
                height: '72px',
                backgroundColor: step === 'success' ? '#10b981' : step === 'code' ? '#8b5cf6' : '#020034',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {step === 'email' && <Mail size={32} style={{ color: 'white' }} />}
              {step === 'code' && <KeyRound size={32} style={{ color: 'white' }} />}
              {step === 'success' && <CheckCircle size={32} style={{ color: 'white' }} />}
            </div>

            <h1 style={{
              fontSize: 'clamp(1.75rem, 3vw, 2rem)',
              fontWeight: '600',
              color: '#1d1d1f',
              marginBottom: '0.75rem',
              letterSpacing: '-0.03em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              {step === 'email' && 'Access Your Orders'}
              {step === 'code' && 'Check Your Email'}
              {step === 'success' && 'Welcome Back!'}
            </h1>

            <p style={{
              color: '#86868b',
              fontSize: '1rem',
              lineHeight: '1.5',
              fontWeight: '400'
            }}>
              {step === 'email' && 'Enter your email to view your booking history and order status.'}
              {step === 'code' && (
                <>
                  We sent a 6-digit code to<br />
                  <strong style={{ color: '#1d1d1f', fontWeight: '600' }}>{email}</strong>
                </>
              )}
              {step === 'success' && 'Redirecting you to your orders...'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#dc2626'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.9375rem', fontWeight: '400' }}>{error}</span>
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleSendCode}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#1d1d1f',
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.01em'
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#86868b',
                    zIndex: 1
                  }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="your@email.com"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 3rem',
                      border: '1px solid rgba(0,0,0,0.2)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'white',
                      color: '#1d1d1f'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#E94A02'
                      e.target.style.boxShadow = '0 0 0 3px rgba(233, 74, 2, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0,0,0,0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#9ca3af' : '#E94A02',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '-0.01em',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#d13d00'
                    e.target.style.transform = 'scale(1.01)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#E94A02'
                    e.target.style.transform = 'scale(1)'
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Code
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Code Verification Step */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#1d1d1f',
                  marginBottom: '0.75rem',
                  textAlign: 'center',
                  letterSpacing: '-0.01em'
                }}>
                  Enter 6-digit code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="000000"
                  autoFocus
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    fontSize: '1.75rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    letterSpacing: '0.5rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'monospace',
                    backgroundColor: 'white',
                    color: '#1d1d1f'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#E94A02'
                    e.target.style.boxShadow = '0 0 0 3px rgba(233, 74, 2, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0,0,0,0.2)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                style={{
                  width: '100%',
                  backgroundColor: (loading || code.length !== 6) ? '#9ca3af' : '#E94A02',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '-0.01em',
                  opacity: (loading || code.length !== 6) ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading && code.length === 6) {
                    e.target.style.backgroundColor = '#d13d00'
                    e.target.style.transform = 'scale(1.01)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && code.length === 6) {
                    e.target.style.backgroundColor = '#E94A02'
                    e.target.style.transform = 'scale(1)'
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Resend Code */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{ color: '#86868b', fontSize: '0.9375rem', marginBottom: '0.5rem', fontWeight: '400' }}>
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: resendCooldown > 0 ? '#9ca3af' : '#E94A02',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    padding: '0.5rem',
                    transition: 'color 0.2s ease',
                    letterSpacing: '-0.01em'
                  }}
                  onMouseEnter={(e) => {
                    if (resendCooldown === 0 && !loading) {
                      e.target.style.color = '#d13d00'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (resendCooldown === 0 && !loading) {
                      e.target.style.color = '#E94A02'
                    }
                  }}
                >
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : 'Resend Code'}
                </button>
              </div>

              {/* Back to Email */}
              <div style={{ 
                paddingTop: '1.5rem', 
                borderTop: '1px solid rgba(0,0,0,0.08)',
                textAlign: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setCode('');
                    setError('');
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#86868b',
                    fontSize: '0.9375rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'color 0.2s ease',
                    fontWeight: '400'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#1d1d1f'}
                  onMouseLeave={(e) => e.target.style.color = '#86868b'}
                >
                  <ArrowLeft size={16} />
                  Use a different email
                </button>
              </div>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <Loader2 size={32} style={{ 
                animation: 'spin 1s linear infinite',
                color: '#10b981',
                margin: '0 auto'
              }} />
            </div>
          )}

          {/* Info Box */}
          {step !== 'success' && (
            <div style={{
              marginTop: '2.5rem',
              padding: '1.25rem',
              backgroundColor: '#020034',
              borderRadius: '12px',
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
                zIndex: 1
              }}></div>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <strong style={{ color: 'white', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                  No account needed!
                </strong>
                <span style={{ fontWeight: '400' }}>
                  We'll use the same email you provided during booking.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default B2CLogin;
