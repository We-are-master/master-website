import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

const B2CLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'success'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

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
      backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#020034',
        padding: '1.25rem 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <div className="container">
          <button
            onClick={() => navigate('/')}
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
          >
            <ArrowLeft size={20} />
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
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          maxWidth: '450px',
          width: '100%',
          border: '1px solid #e5e7eb'
        }}>
          {/* Logo/Icon */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: step === 'success' ? '#10b981' : '#020034',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              transition: 'all 0.3s ease'
            }}>
              {step === 'email' && <Mail size={36} style={{ color: 'white' }} />}
              {step === 'code' && <KeyRound size={36} style={{ color: 'white' }} />}
              {step === 'success' && <CheckCircle size={36} style={{ color: 'white' }} />}
            </div>

            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              {step === 'email' && 'Access Your Orders'}
              {step === 'code' && 'Check Your Email'}
              {step === 'success' && 'Welcome Back!'}
            </h1>

            <p style={{
              color: '#6b7280',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              {step === 'email' && 'Enter your email to view your booking history and order status.'}
              {step === 'code' && (
                <>
                  We sent a 6-digit code to<br />
                  <strong style={{ color: '#111827' }}>{email}</strong>
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
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#dc2626'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem' }}>{error}</span>
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleSendCode}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
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
                      padding: '1rem 1rem 1rem 3rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Code
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Code Verification Step */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem',
                  textAlign: 'center'
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
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '2rem',
                    fontWeight: '700',
                    textAlign: 'center',
                    letterSpacing: '0.75rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    fontFamily: 'monospace'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              {/* Resend Code */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: resendCooldown > 0 ? '#9ca3af' : '#2001AF',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  {resendCooldown > 0 
                    ? `Resend in ${resendCooldown}s` 
                    : 'Resend Code'}
                </button>
              </div>

              {/* Back to Email */}
              <div style={{ 
                marginTop: '1.5rem', 
                paddingTop: '1.5rem', 
                borderTop: '1px solid #e5e7eb',
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
                    color: '#6b7280',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
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
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: '#f0f4ff',
              borderRadius: '0.75rem',
              fontSize: '0.85rem',
              color: '#4b5563',
              textAlign: 'center'
            }}>
              <strong style={{ color: '#2001AF' }}>No account needed!</strong><br />
              We'll use the same email you provided during booking.
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
