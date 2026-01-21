import React, { useState, useEffect } from 'react';
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
  User
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const B2CMyOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (!session) {
        // Not logged in, redirect to login
        navigate('/customer-login');
        return;
      }

      setUser(session.user);
      await fetchOrders(session.user.email);
    } catch (err) {
      console.error('Auth error:', err);
      navigate('/customer-login');
    }
  };

  const fetchOrders = async (email) => {
    setLoading(true);
    setError('');

    try {
      // Fetch orders from booking_website table (main B2C bookings table)
      const { data: ordersData, error: ordersError } = await supabase
        .from('booking_website')
        .select('*')
        .eq('customer_email', email.toLowerCase())
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.log('booking_website table error:', ordersError);
        setOrders([]);
        setError('Failed to load your orders. Please try again.');
      } else {
        setOrders(ordersData || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
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

  // Get status info for display
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

  // Format date nicely
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

  // Format price
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
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#2001AF', margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#020034',
        padding: '1.25rem 0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
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
              fontWeight: '500'
            }}
          >
            <ArrowLeft size={20} />
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
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              My Orders
            </h1>
            <p style={{ color: '#6b7280' }}>
              <Mail size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
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
              border: '2px solid #e5e7eb',
              borderRadius: '0.5rem',
              color: '#374151',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              padding: '0.75rem 1.25rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
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
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#dc2626'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <Package size={64} style={{ color: '#d1d5db', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
              No orders yet
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
              You haven't made any bookings with us yet. Browse our services and book your first service today!
            </p>
            <button
              onClick={() => navigate('/booking')}
              style={{
                backgroundColor: '#E94A02',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Book a Service
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div
                  key={order.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '0.25rem'
                      }}>
                        {order.service_name || order.service || 'Service Booking'}
                      </h3>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
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
                      borderRadius: '2rem',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      <StatusIcon size={16} />
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    padding: '1rem 0',
                    borderTop: '1px solid #e5e7eb',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    {/* Price */}
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        Amount
                      </p>
                      <p style={{ 
                        fontWeight: '700', 
                        color: '#111827', 
                        fontSize: '1.25rem' 
                      }}>
                        {formatPrice(order.amount || order.total || order.price)}
                      </p>
                    </div>

                    {/* Location */}
                    {(order.postcode || order.address) && (
                      <div>
                        <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                          Location
                        </p>
                        <p style={{ 
                          fontWeight: '500', 
                          color: '#111827',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <MapPin size={14} style={{ color: '#6b7280' }} />
                          {order.postcode || order.address}
                        </p>
                      </div>
                    )}

                    {/* Order ID / Booking Ref */}
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        Booking Ref
                      </p>
                      <p style={{ 
                        fontWeight: '500', 
                        color: '#111827',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace'
                      }}>
                        {order.booking_ref || `#${order.id?.slice(0, 8)}` || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Job Description if available */}
                  {order.job_description && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        Description
                      </p>
                      <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {order.job_description.length > 150 
                          ? order.job_description.substring(0, 150) + '...'
                          : order.job_description}
                      </p>
                    </div>
                  )}

                  {/* Footer with Contact Info */}
                  <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      {order.customer_name && (
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.25rem',
                          color: '#6b7280',
                          fontSize: '0.85rem'
                        }}>
                          <User size={14} />
                          {order.customer_name}
                        </span>
                      )}
                      {order.customer_phone && (
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.25rem',
                          color: '#6b7280',
                          fontSize: '0.85rem'
                        }}>
                          <Phone size={14} />
                          {order.customer_phone}
                        </span>
                      )}
                    </div>
                    
                    <ChevronRight size={20} style={{ color: '#9ca3af' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div style={{
          marginTop: '3rem',
          backgroundColor: '#f0f4ff',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#2001AF',
            marginBottom: '0.5rem'
          }}>
            Need help with your order?
          </h3>
          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
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
                backgroundColor: '#2001AF',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.9rem'
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
                backgroundColor: 'white',
                color: '#2001AF',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.9rem',
                border: '2px solid #2001AF'
              }}
            >
              <Phone size={18} />
              Call Us
            </a>
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
