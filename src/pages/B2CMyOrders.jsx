import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  LogOut, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  MapPin,
  Loader2,
  RefreshCw,
  ChevronRight,
  Phone,
  Mail,
  User,
  Crown,
  Shield,
  Infinity,
  ArrowRight,
  X
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import SubscriptionManagement from '../components/b2c/SubscriptionManagement';
import { checkSubscription } from '../lib/subscription';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const B2CMyOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(true);

  const heroRef = useRef(null);
  const ordersRef = useRef(null);
  const helpRef = useRef(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Scroll to top when loading finishes
  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && orders.length > 0) {
      const ctx = gsap.context(() => {
        // Animate orders
        const orderCards = ordersRef.current?.querySelectorAll('.order-card');
        if (orderCards && orderCards.length > 0) {
          gsap.fromTo(orderCards,
            { opacity: 0, y: 30, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: ordersRef.current,
                start: 'top 80%'
              }
            }
          );
        }

        // Animate help section
        if (helpRef.current) {
          gsap.fromTo(helpRef.current,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: helpRef.current,
                start: 'top 85%'
              }
            }
          );
        }
      });

      return () => ctx.revert();
    }
  }, [loading, orders]);

  const checkAuth = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!session) {
        navigate('/customer-login');
        return;
      }

      setUser(session.user);
      await fetchOrders(session.user.email);
      await checkUserSubscription(session.user.email);
    } catch (err) {
      navigate('/customer-login');
    }
  };

  const fetchOrders = async (email) => {
    setLoading(true);
    setError('');

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('booking_website')
        .select('*')
        .eq('customer_email', email.toLowerCase())
        .order('created_at', { ascending: false });

      if (ordersError) {
        setOrders([]);
        setError('Failed to load your bookings. Please try again.');
      } else {
        setOrders(ordersData || []);
      }
    } catch (err) {
      setError('Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user?.email) return;
    setRefreshing(true);
    await fetchOrders(user.email);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const checkUserSubscription = async (email) => {
    if (!email) return;
    
    try {
      setCheckingSubscription(true);
      const result = await checkSubscription(email);
      setHasSubscription(result.has_subscription || false);
    } catch (err) {
      console.error('[MyBookings] Error checking subscription:', err);
      setHasSubscription(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fef3c7', icon: Clock },
      confirmed: { label: 'Confirmed', color: '#3b82f6', bgColor: '#dbeafe', icon: CheckCircle },
      assigned: { label: 'Assigned', color: '#8b5cf6', bgColor: '#ede9fe', icon: Package },
      in_progress: { label: 'In Progress', color: '#8b5cf6', bgColor: '#ede9fe', icon: Package },
      completed: { label: 'Completed', color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle },
      cancelled: { label: 'Cancelled', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
      canceled: { label: 'Cancelled', color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
      refunded: { label: 'Refunded', color: '#6b7280', bgColor: '#f3f4f6', icon: XCircle },
      paid: { label: 'Paid', color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle },
      succeeded: { label: 'Paid', color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle },
    };
    return statusMap[status?.toLowerCase()] || statusMap.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `£${parseFloat(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} style={{ 
            animation: 'spin 1s linear infinite', 
            color: '#E94A02', 
            margin: '0 auto' 
          }} />
          <p style={{ 
            marginTop: '1rem', 
            color: '#86868b',
            fontSize: '1rem',
            fontWeight: '400'
          }}>
            Loading your bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      overflowX: 'hidden',
      width: '100%',
      maxWidth: '100vw'
    }}>
      {/* Header */}
      <div 
        ref={heroRef}
        style={{
          backgroundColor: '#020034',
          padding: '1.5rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
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

        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
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
            Home
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              padding: '0.625rem 1.125rem',
              fontSize: '0.875rem',
              fontWeight: '400',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              letterSpacing: '-0.01em'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.15)'
              e.target.style.borderColor = 'rgba(255,255,255,0.3)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'
              e.target.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ padding: '3rem 0' }}>
        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '600',
              color: '#1d1d1f',
              marginBottom: '0.75rem',
              letterSpacing: '-0.03em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              My Bookings
            </h1>
            <p style={{ 
              color: '#86868b',
              fontSize: '0.9375rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '400'
            }}>
              <Mail size={16} />
              {user?.email}
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'white',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: '8px',
              color: '#1d1d1f',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              padding: '0.75rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              letterSpacing: '-0.01em',
              opacity: refreshing ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!refreshing) {
                e.target.style.backgroundColor = '#f5f5f7'
                e.target.style.borderColor = 'rgba(0,0,0,0.2)'
              }
            }}
            onMouseLeave={(e) => {
              if (!refreshing) {
                e.target.style.backgroundColor = 'white'
                e.target.style.borderColor = 'rgba(0,0,0,0.15)'
              }
            }}
          >
            <RefreshCw size={18} style={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none' 
            }} />
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#dc2626'
          }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9375rem', fontWeight: '400' }}>{error}</span>
          </div>
        )}

        {/* Master Club Subscription Management */}
        {user?.email && (
          <SubscriptionManagement 
            userEmail={user.email} 
            customerName={user.user_metadata?.full_name || user.email}
            onSubscriptionChange={(hasSub) => {
              setHasSubscription(hasSub);
              if (hasSub) {
                setShowSubscriptionBanner(false);
              }
            }}
          />
        )}

        {/* Subscription Missing Banner */}
        {user?.email && !hasSubscription && !checkingSubscription && showSubscriptionBanner && (
          <div style={{
            backgroundColor: '#020034',
            borderRadius: '16px',
            padding: '2.5rem',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid rgba(233, 74, 2, 0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              zIndex: 1
            }}></div>

            {/* Close Button */}
            <button
              onClick={() => setShowSubscriptionBanner(false)}
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
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.color = 'rgba(255,255,255,0.8)';
              }}
            >
              <X size={18} />
            </button>

            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(233, 74, 2, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E94A02',
                  border: '2px solid rgba(233, 74, 2, 0.4)'
                }}>
                  <Crown size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0.25rem',
                    letterSpacing: '-0.02em',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
                  }}>
                    You're missing out on Master Club benefits
                  </h3>
                  <p style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9375rem',
                    fontWeight: '400',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
                  }}>
                    Join now and save up to 30% on every booking
                  </p>
                </div>
              </div>

              {/* Benefits Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {[
                  { icon: <Crown size={20} />, text: 'Up to 30% discount', color: '#E94A02' },
                  { icon: <Clock size={20} />, text: 'Priority booking', color: '#E94A02' },
                  { icon: <Shield size={20} />, text: 'Reduced emergency fees', color: '#E94A02' },
                  { icon: <Infinity size={20} />, text: 'Unlimited use', color: '#E94A02' }
                ].map((benefit, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ color: benefit.color, flexShrink: 0 }}>
                      {benefit.icon}
                    </div>
                    <span style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
                    }}>
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing & CTA */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                flexWrap: 'wrap',
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '2rem',
                      fontWeight: '900',
                      color: 'white',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
                    }}>
                      £9.99
                    </span>
                    <span style={{
                      fontSize: '1rem',
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: '500',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
                    }}>
                      / month
                    </span>
                  </div>
                  <p style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.875rem',
                    margin: 0,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
                  }}>
                    Cancel anytime. No long-term commitment.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/#master-club')}
                  style={{
                    backgroundColor: '#E94A02',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s ease',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    gsap.to(e.target, {
                      backgroundColor: '#d13d00',
                      scale: 1.05,
                      boxShadow: '0 8px 24px rgba(233, 74, 2, 0.4)',
                      duration: 0.3
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.target, {
                      backgroundColor: '#E94A02',
                      scale: 1,
                      boxShadow: 'none',
                      duration: 0.3
                    });
                  }}
                >
                  <span>Join Master Club</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {orders.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <Package size={64} style={{ color: '#d1d5db', margin: '0 auto 1.5rem' }} />
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#1d1d1f', 
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em'
            }}>
              No bookings yet
            </h2>
            <p style={{ 
              color: '#86868b', 
              marginBottom: '2rem', 
              maxWidth: '400px', 
              margin: '0 auto 2rem',
              fontSize: '1rem',
              lineHeight: '1.5',
              fontWeight: '400'
            }}>
              You haven't made any bookings with us yet. Browse our services and book your first service today!
            </p>
            <button
              onClick={() => navigate('/booking')}
              style={{
                backgroundColor: '#E94A02',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                letterSpacing: '-0.01em'
              }}
              onMouseEnter={(e) => {
                gsap.to(e.target, {
                  backgroundColor: '#d13d00',
                  scale: 1.02,
                  duration: 0.3
                })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.target, {
                  backgroundColor: '#E94A02',
                  scale: 1,
                  duration: 0.3
                })
              }}
            >
              Book a Service
            </button>
          </div>
        ) : (
          <div ref={ordersRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div
                  key={order.id}
                  className="order-card"
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      y: -4,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
                      duration: 0.3,
                      ease: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    })
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      y: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                      duration: 0.3
                    })
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1d1d1f',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.02em'
                      }}>
                        {order.service_name || order.service || 'Service Booking'}
                      </h3>
                      <p style={{
                        color: '#86868b',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '400'
                      }}>
                        <Calendar size={14} />
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: statusInfo.bgColor,
                      color: statusInfo.color,
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      letterSpacing: '-0.01em'
                    }}>
                      <StatusIcon size={16} />
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1.5rem',
                    padding: '1.5rem 0',
                    borderTop: '1px solid rgba(0,0,0,0.08)',
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    {/* Price */}
                    <div>
                      <p style={{ 
                        color: '#86868b', 
                        fontSize: '0.8125rem', 
                        marginBottom: '0.5rem',
                        fontWeight: '400'
                      }}>
                        Amount
                      </p>
                      <p style={{ 
                        fontWeight: '600', 
                        color: '#1d1d1f', 
                        fontSize: '1.5rem',
                        letterSpacing: '-0.02em'
                      }}>
                        {formatPrice(order.amount || order.total || order.price)}
                      </p>
                    </div>

                    {/* Location */}
                    {(order.postcode || order.address) && (
                      <div>
                        <p style={{ 
                          color: '#86868b', 
                          fontSize: '0.8125rem', 
                          marginBottom: '0.5rem',
                          fontWeight: '400'
                        }}>
                          Location
                        </p>
                        <p style={{ 
                          fontWeight: '500', 
                          color: '#1d1d1f',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9375rem'
                        }}>
                          <MapPin size={16} style={{ color: '#86868b', flexShrink: 0 }} />
                          {order.postcode || order.address}
                        </p>
                      </div>
                    )}

                    {/* Order ID / Booking Ref */}
                    <div>
                      <p style={{ 
                        color: '#86868b', 
                        fontSize: '0.8125rem', 
                        marginBottom: '0.5rem',
                        fontWeight: '400'
                      }}>
                        Booking Ref
                      </p>
                      <p style={{ 
                        fontWeight: '500', 
                        color: '#1d1d1f',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}>
                        {order.booking_ref || `#${order.id?.slice(0, 8)}` || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Job Description if available */}
                  {order.job_description && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <p style={{ 
                        color: '#86868b', 
                        fontSize: '0.8125rem', 
                        marginBottom: '0.5rem',
                        fontWeight: '400'
                      }}>
                        Description
                      </p>
                      <p style={{ 
                        color: '#1d1d1f', 
                        fontSize: '0.9375rem', 
                        lineHeight: '1.6',
                        fontWeight: '400'
                      }}>
                        {order.job_description.length > 150 
                          ? order.job_description.substring(0, 150) + '...'
                          : order.job_description}
                      </p>
                    </div>
                  )}

                  {/* Footer with Contact Info */}
                  <div style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1.5rem',
                      flexWrap: 'wrap'
                    }}>
                      {order.customer_name && (
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: '#86868b',
                          fontSize: '0.875rem',
                          fontWeight: '400'
                        }}>
                          <User size={16} />
                          {order.customer_name}
                        </span>
                      )}
                      {order.customer_phone && (
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: '#86868b',
                          fontSize: '0.875rem',
                          fontWeight: '400'
                        }}>
                          <Phone size={16} />
                          {order.customer_phone}
                        </span>
                      )}
                    </div>
                    
                    <ChevronRight size={20} style={{ color: '#86868b' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div 
          ref={helpRef}
          style={{
            marginTop: '4rem',
            backgroundColor: '#020034',
            borderRadius: '12px',
            padding: '3rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'default'
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const glowEffect = e.currentTarget.querySelector('.grid-glow-orange');
            if (glowEffect) {
              glowEffect.style.left = `${x}px`;
              glowEffect.style.top = `${y}px`;
              gsap.to(glowEffect, {
                opacity: 1,
                duration: 0.2,
                ease: 'power2.out'
              });
            }
          }}
          onMouseEnter={(e) => {
            const glowEffect = e.currentTarget.querySelector('.grid-glow-orange');
            if (glowEffect) {
              gsap.to(glowEffect, {
                opacity: 1,
                duration: 0.2,
                ease: 'power2.out'
              });
            }
          }}
          onMouseLeave={(e) => {
            const glowEffect = e.currentTarget.querySelector('.grid-glow-orange');
            if (glowEffect) {
              gsap.to(glowEffect, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out'
              });
            }
          }}
        >
          {/* Background Pattern - Base (white/grey) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            zIndex: 1
          }}></div>
          
          {/* Localized glow effect that follows mouse */}
          <div 
            className="grid-glow-orange"
            style={{
              position: 'absolute',
              width: '160px',
              height: '160px',
              background: 'radial-gradient(circle, rgba(233, 74, 2, 0.25) 0%, rgba(233, 74, 2, 0.1) 40%, transparent 70%)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              opacity: 0,
              pointerEvents: 'none',
              willChange: 'opacity, transform'
            }}
          ></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em'
            }}>
              Need help with your booking?
            </h3>
            <p style={{ 
              color: 'rgba(255,255,255,0.7)', 
              marginBottom: '2rem',
              fontSize: '1rem',
              fontWeight: '400'
            }}>
              Contact us and we'll be happy to assist you.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <a
                href="mailto:hello@wearemaster.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#E94A02',
                  color: 'white',
                  padding: '0.875rem 1.75rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '0.9375rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    backgroundColor: '#d13d00',
                    scale: 1.02,
                    duration: 0.3
                  })
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    backgroundColor: '#E94A02',
                    scale: 1,
                    duration: 0.3
                  })
                }}
              >
                <Mail size={18} />
                Email Support
              </a>
              <a
                href="tel:+447983182332"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'transparent',
                  color: 'white',
                  padding: '0.875rem 1.75rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '0.9375rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.5)',
                    duration: 0.3
                  })
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,0.3)',
                    duration: 0.3
                  })
                }}
              >
                <Phone size={18} />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 640px) {
          .container {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default B2CMyOrders;
