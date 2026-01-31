import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Shield, Loader2, AlertCircle, Clock, Upload, X, Plus, Minus, Calendar, ChevronLeft, ChevronRight, Lock, Sparkles, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntentViaSupabase } from '../lib/stripe';
import { trackAbandonedCheckout } from '../lib/email';
import SubscriptionUpsell, { SUBSCRIPTION_PRICE } from '../components/b2c/SubscriptionUpsell';
import { checkSubscription } from '../lib/subscription';

// Enhanced Payment Form Component with premium UX
const PaymentForm = ({ onSuccess, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout-success`,
        },
        redirect: 'if_required', // Only redirect when needed (e.g. 3DS, Klarna); otherwise stay on page
      });

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      // CRITICAL: Verify payment status before showing success
      // When Klarna redirects and user closes, paymentIntent may exist but status is not 'succeeded'
      if (!paymentIntent) {
        // No paymentIntent returned - payment was likely cancelled
        setError('Payment was not completed. Please try again.');
        setLoading(false);
        return;
      }

      // Verify the actual status - only proceed if payment is actually succeeded
      if (paymentIntent.status === 'succeeded') {
        // Double-check by retrieving the latest status from Stripe
        try {
          const { paymentIntent: verifiedIntent, error: verifyError } = await stripe.retrievePaymentIntent(clientSecret);
          
          if (verifyError) {
            setError('Unable to verify payment status. Please contact support.');
            setLoading(false);
            return;
          }

          // Only show success if verified status is succeeded
          if (verifiedIntent.status === 'succeeded') {
            console.log('[Payment] pagamento confirmado', { paymentIntentId: verifiedIntent.id, status: verifiedIntent.status });
            onSuccess(verifiedIntent);
          } else {
            setError(`Payment status: ${verifiedIntent.status}. Payment was not completed.`);
            setLoading(false);
          }
        } catch (verifyErr) {
          console.error('[Payment] Verification error:', verifyErr);
          setError('Unable to verify payment status. Please contact support.');
          setLoading(false);
        }
      } else if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'processing') {
        // Payment is still processing or requires action - don't show success yet
        setError('Payment is being processed. Please wait...');
        setLoading(false);
        // Optionally: poll for status update
        setTimeout(async () => {
          try {
            const { paymentIntent: updatedIntent } = await stripe.retrievePaymentIntent(clientSecret);
            if (updatedIntent?.status === 'succeeded') {
              console.log('[Payment] pagamento confirmado (após polling)', { paymentIntentId: updatedIntent.id, status: updatedIntent.status });
              onSuccess(updatedIntent);
            } else {
              setError(`Payment status: ${updatedIntent?.status || 'unknown'}. Please check back in a moment or contact support.`);
            }
          } catch (err) {
            setError('Unable to verify payment status. Please contact support.');
          }
        }, 3000);
      } else {
        // Payment failed, cancelled, or other non-success status
        setError(`Payment was not completed. Status: ${paymentIntent.status}. Please try again.`);
        setLoading(false);
      }
    } catch (err) {
      const msg = err?.message || 'An unexpected error occurred. Please try again.';
      setError(msg);
      console.error('[Payment] Confirm error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#dc2626',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{error}</span>
        </div>
      )}
      
      <div style={{ 
        marginBottom: '1.5rem',
        padding: '1.5rem',
        backgroundColor: '#fafafa',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodTypes: ['card', 'klarna'],
            // Try to keep Klarna inline - some flows may still redirect for authentication
            business: {
              name: 'Master'
            },
            terms: {
              card: 'always',
              klarna: 'always'
            },
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
                phone: 'auto',
                address: {
                  line1: 'auto',
                  line2: 'auto',
                  city: 'auto',
                  state: 'auto',
                  postalCode: 'auto',
                  country: 'auto'
                }
              }
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto'
            }
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          width: '100%',
          background: loading 
            ? '#9ca3af' 
            : 'linear-gradient(135deg, #E94A02 0%, #d13d00 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '1.125rem 1.5rem',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          boxShadow: loading ? 'none' : '0 4px 12px rgba(233, 74, 2, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(233, 74, 2, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(233, 74, 2, 0.3)';
          }
        }}
      >
        {loading ? (
          <>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Processing payment...</span>
          </>
        ) : (
          <>
            <Lock size={18} />
            <span>Complete Payment</span>
          </>
        )}
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.75rem',
        color: '#6b7280',
        marginTop: '0.75rem'
      }}>
        <Shield size={14} />
        <span>Secured by Stripe • Your payment is encrypted</span>
      </div>
    </form>
  );
};

const B2CCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { service: serviceFromState, postcode, jobDescription, services: servicesFromState } = location.state || {};

  // Hide Zoho SalesIQ chat widget on checkout so "We're offline" popup doesn't cover the Continue button
  useEffect(() => {
    const hideZohoWidget = () => {
      try {
        if (typeof window !== 'undefined' && window.$zoho?.salesiq?.floatwindow) {
          window.$zoho.salesiq.floatwindow.visible = 'hidden';
        }
        document.querySelectorAll('[id^="zsiq"], .zsiq_float, .zsiq_theme').forEach((el) => {
          if (el?.style) el.style.setProperty('display', 'none', 'important');
        });
      } catch (_) {}
    };
    const showZohoWidget = () => {
      try {
        if (typeof window !== 'undefined' && window.$zoho?.salesiq?.floatwindow) {
          window.$zoho.salesiq.floatwindow.visible = 'show';
        }
        document.querySelectorAll('[id^="zsiq"], .zsiq_float, .zsiq_theme').forEach((el) => {
          if (el?.style) el.style.removeProperty('display');
        });
      } catch (_) {}
    };
    hideZohoWidget();
    const t = setTimeout(hideZohoWidget, 1500);
    return () => {
      clearTimeout(t);
      showZohoWidget();
    };
  }, []);

  // Support multiple services from booking page cart; fallback to single service
  const servicesList = servicesFromState?.length
    ? servicesFromState
    : (serviceFromState ? [{ service: serviceFromState, quantity: 1 }] : []);
  const service = servicesList[0]?.service ?? serviceFromState; // first service for hourly/metadata
  const BOOKING_FEE = 5;
  const [stripePromise, setStripePromise] = useState(null);
  const [stripeInstance, setStripeInstance] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [creatingPaymentIntent, setCreatingPaymentIntent] = useState(false);
  const fileInputRef = useRef(null);
  const paymentSectionRef = useRef(null);
  const [hasScrolledToPayment, setHasScrolledToPayment] = useState(false);
  
  // Customer details form
  const [customerDetails, setCustomerDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: postcode || '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToHourlyTerms, setAgreedToHourlyTerms] = useState(false);

  // Hourly service specific state
  const [selectedHours, setSelectedHours] = useState(1);
  const [hourlyJobDescription, setHourlyJobDescription] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Date and time slot state
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Subscription upsell: show checkbox when user has no subscription; checked = add £9.99 to total
  const [hasSubscription, setHasSubscription] = useState(null); // null = loading, true/false = from API
  const [addSubscriptionToOrder, setAddSubscriptionToOrder] = useState(true); // default checked when no subscription
  const [showSubscriptionUpsell, setShowSubscriptionUpsell] = useState(true); // dismiss banner

  // Check if (single) service is hourly — only for single-service bookings
  const isHourlyService = servicesList.length === 1 && (
    service?.priceType === 'hourly' ||
    service?.priceUnit?.toLowerCase().includes('hour') ||
    service?.title?.toLowerCase().includes('hourly')
  );

  // Time slots configuration
  const timeSlots = [
    { id: 'morning-early', label: '8:00 - 10:00', period: 'Morning' },
    { id: 'morning-late', label: '10:00 - 12:00', period: 'Morning' },
    { id: 'afternoon-early', label: '12:00 - 14:00', period: 'Afternoon' },
    { id: 'afternoon-late', label: '14:00 - 16:00', period: 'Afternoon' },
    { id: 'evening-early', label: '16:00 - 18:00', period: 'Evening' },
    { id: 'evening-late', label: '18:00 - 20:00', period: 'Evening' },
  ];

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate <= today;
  };

  const formatDateShort = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short'
    });
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isDateSelected = (date) => {
    return selectedDates.some(d => isSameDay(d, date));
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateDisabled(newDate)) {
      setSelectedDates(prev => {
        const alreadySelected = prev.some(d => isSameDay(d, newDate));
        if (alreadySelected) {
          return prev.filter(d => !isSameDay(d, newDate));
        } else {
          if (prev.length >= 5) {
            return prev;
          }
          return [...prev, newDate].sort((a, b) => a - b);
        }
      });
      if (formErrors.date) {
        setFormErrors(prev => ({ ...prev, date: '' }));
      }
    }
  };

  const removeSelectedDate = (dateToRemove) => {
    setSelectedDates(prev => prev.filter(d => !isSameDay(d, dateToRemove)));
  };

  // Calculate total: multiple services (subtotal + booking fee) or single (price or hourly) + booking fee
  const cartSubtotal = servicesList.reduce((sum, item) => sum + (parseFloat(item.service?.price) || 0) * (item.quantity || 1), 0);
  const totalPrice = isHourlyService
    ? parseFloat(service?.price || 0) * selectedHours + BOOKING_FEE
    : cartSubtotal + BOOKING_FEE;

  // Subscription offer (discount + Master Club) only applies when email is entered and upsell checkbox is visible and checked
  const subscriptionOfferActive = Boolean(
    customerDetails.email &&
    hasSubscription === false &&
    addSubscriptionToOrder
  );
  const memberDiscount = subscriptionOfferActive ? totalPrice * 0.3 : 0;
  const orderTotal = subscriptionOfferActive
    ? totalPrice * 0.7 + SUBSCRIPTION_PRICE
    : totalPrice;

  // Check subscription status when email is available
  useEffect(() => {
    if (!customerDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      setHasSubscription(null);
      return;
    }
    let cancelled = false;
    setHasSubscription(null);
    checkSubscription(customerDetails.email)
      .then((result) => {
        if (cancelled) return;
        const has = result?.has_subscription ?? false;
        setHasSubscription(has);
        if (has) setAddSubscriptionToOrder(false);
      })
      .catch(() => {
        if (!cancelled) setHasSubscription(false);
      });
    return () => { cancelled = true; };
  }, [customerDetails.email]);

  // When subscription add-on is toggled, clear payment intent so amount is recalculated
  const handleAddSubscriptionChange = (checked) => {
    setAddSubscriptionToOrder(checked);
    if (clientSecret) setClientSecret(null);
  };

  useEffect(() => {
    const initStripe = async () => {
      try {
        const stripe = await getStripe();
        if (!stripe) {
          setPaymentError('Stripe is not configured. Please contact support.');
          return;
        }
        setStripePromise(stripe);
        setStripeInstance(stripe);
      } catch (error) {
        console.error('[Checkout] Error initializing Stripe:', error);
        setPaymentError('Failed to load payment system. Please refresh the page.');
      }
    };
    initStripe();
  }, []);

  // Create payment intent when form is valid
  const createPaymentIntent = async () => {
    if (creatingPaymentIntent || clientSecret) return;
    
    setCreatingPaymentIntent(true);
    setPaymentError(null);

    try {
      const amount = Math.round((orderTotal || totalPrice || service.price || 0) * 100);
      console.log('[Checkout] create-payment-intent iniciado', { amount_pence: amount, amount_gbp: (amount / 100).toFixed(2), currency: 'gbp' });
      
      if (amount <= 0) {
        setPaymentError('Invalid service price');
        setCreatingPaymentIntent(false);
        return;
      }

      let fullJobDescription = jobDescription || '';
      if (isHourlyService) {
        fullJobDescription = `[${selectedHours} hour(s) booked] ${hourlyJobDescription || jobDescription || ''}`;
        if (uploadedPhotos && uploadedPhotos.length > 0) {
          fullJobDescription += ` [${uploadedPhotos.length} photo(s) attached]`;
        }
      }

      const paymentData = await createPaymentIntentViaSupabase({
        amount: amount,
        currency: 'gbp',
        metadata: {
          source: 'website',
          add_subscription: addSubscriptionToOrder ? 'true' : 'false',
          service_id: service.id || service.originalService?.id,
          service_name: service.title,
          service_category: service.category || '',
          services_count: servicesList.length.toString(),
          services_names: servicesList.map(({ service: s, quantity }) => `${quantity}× ${s?.title}`).join('; '),
          postcode: customerDetails?.postcode || postcode || '',
          job_description: fullJobDescription,
          hours_booked: isHourlyService ? selectedHours.toString() : '',
          hourly_rate: isHourlyService ? service.price.toString() : '',
          photos_count: uploadedPhotos?.length?.toString() || '0',
          customer_name: customerDetails?.fullName || '',
          customer_email: customerDetails?.email || '',
          customer_phone: customerDetails?.phone || '',
          scheduled_dates: selectedDates.map(d => d.toISOString().split('T')[0]).join(', '),
          scheduled_time_slots: selectedTimeSlots.join(', '),
        },
        booking_data: {
          customer_name: customerDetails?.fullName || '',
          customer_email: customerDetails?.email || '',
          customer_phone: customerDetails?.phone || '',
          address_line1: customerDetails?.addressLine1 || '',
          address_line2: customerDetails?.addressLine2 || '',
          city: customerDetails?.city || '',
          postcode: customerDetails?.postcode || postcode || '',
          service_id: service.id || service.originalService?.id || null,
          service_name: service.title,
          service_category: service.category || null,
          job_description: fullJobDescription,
          property_type: null,
          bedrooms: null,
          bathrooms: null,
          cleaning_addons: [],
          scheduled_dates: selectedDates.map(d => d.toISOString().split('T')[0]),
          scheduled_time_slots: selectedTimeSlots,
        }
      });

      setClientSecret(paymentData.clientSecret);
      console.log('[Checkout] create-payment-intent ok', { paymentIntentId: paymentData.paymentIntentId, hasClientSecret: !!paymentData.clientSecret });
    } catch (err) {
      console.error('[Checkout] Payment intent creation error:', err);
      
      // Use the error message from the function if available
      const errorMessage = err.message || 'Failed to initialize payment. Please try again.';
      setPaymentError(errorMessage);
      
      // Log to console in development for debugging
      if (import.meta.env.DEV) {
        console.error('[Checkout] Full error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
      }
    } finally {
      setCreatingPaymentIntent(false);
    }
  };

  useEffect(() => {
    if (postcode) {
      setCustomerDetails(prev => ({ ...prev, postcode }));
    }
  }, [postcode]);

  if (!servicesList.length) {
    navigate('/');
    return null;
  }

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (uploadedPhotos.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 photos');
      return;
    }

    setUploading(true);

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload only image files');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Each photo must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhotos(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          preview: reader.result,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (photoId) => {
    setUploadedPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!customerDetails.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!customerDetails.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!customerDetails.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\d\s\+\-\(\)]{10,}$/.test(customerDetails.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid UK phone number';
    }
    
    if (!customerDetails.addressLine1.trim()) {
      errors.addressLine1 = 'Address is required';
    }
    
    if (!customerDetails.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!customerDetails.postcode.trim()) {
      errors.postcode = 'Postcode is required';
    }
    
    if (!agreedToTerms) {
      errors.terms = 'You must agree to the terms and conditions';
    }
    
    if (isHourlyService && !agreedToHourlyTerms) {
      errors.hourlyTerms = 'You must acknowledge the hourly rate terms';
    }

    if (isHourlyService && !hourlyJobDescription.trim()) {
      errors.hourlyJobDescription = 'Please describe the work you need done';
    }

    if (selectedDates.length < 2) {
      errors.date = 'Please select at least 2 preferred dates';
    }
    
    if (selectedTimeSlots.length === 0) {
      errors.timeSlot = 'Please select at least one time slot';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('[Checkout] pagamento concluído', { paymentIntentId: paymentIntent.id, status: paymentIntent.status });
    // Only show success if payment is verified as succeeded
    if (paymentIntent.status !== 'succeeded') {
      setPaymentError(`Payment status: ${paymentIntent.status}. Payment was not completed.`);
      return;
    }

    setPaymentSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      navigate('/checkout-success', {
        state: {
          service,
          postcode,
          jobDescription,
          customerDetails,
          paymentIntentId: paymentIntent.id,
          clientSecret: clientSecret, // Pass clientSecret for verification
          scheduledDates: selectedDates.map(d => d.toISOString()),
          scheduledTimeSlots: selectedTimeSlots,
          timeSlotLabels: selectedTimeSlots.map(id => timeSlots.find(s => s.id === id)?.label).filter(Boolean)
        }
      });
    }, 2000);
  };

  const isFormValid = () => {
    return customerDetails.fullName && 
           customerDetails.email && 
           customerDetails.phone && 
           customerDetails.addressLine1 && 
           customerDetails.city && 
           customerDetails.postcode &&
           selectedDates.length >= 2 &&
           selectedTimeSlots.length > 0 &&
           agreedToTerms &&
           (!isHourlyService || (agreedToHourlyTerms && hourlyJobDescription.trim()));
  };

  useEffect(() => {
    const formValid = isFormValid();
    if (formValid && !hasScrolledToPayment && !clientSecret) {
      setHasScrolledToPayment(true);
    }
    if (!formValid && hasScrolledToPayment) {
      setHasScrolledToPayment(false);
    }
  }, [customerDetails, selectedDates, selectedTimeSlots, agreedToTerms, agreedToHourlyTerms, hourlyJobDescription, hasScrolledToPayment, clientSecret]);

  // Track abandoned checkout when user leaves without completing payment
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only track if user has started checkout (has email and clientSecret but payment not succeeded)
      if (customerDetails.email && clientSecret && !paymentSuccess) {
        // Use sendBeacon for reliable tracking even when page is closing
        const checkoutData = {
          email: customerDetails.email,
          name: customerDetails.fullName,
          service: service.title,
          amount: orderTotal,
          clientSecret: clientSecret,
          paymentIntentId: clientSecret.split('_secret_')[0],
        };
        
        // Track asynchronously (fire and forget)
        trackAbandonedCheckout(checkoutData).catch(err => {
          console.warn('[Checkout] Failed to track abandoned checkout:', err);
        });
      }
    };

    // Track on page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Also track when navigating away (React Router)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Track on component unmount if checkout was started but not completed
      if (customerDetails.email && clientSecret && !paymentSuccess) {
        const checkoutData = {
          email: customerDetails.email,
          name: customerDetails.fullName,
          service: service.title,
          amount: orderTotal,
          clientSecret: clientSecret,
          paymentIntentId: clientSecret.split('_secret_')[0],
        };
        
        trackAbandonedCheckout(checkoutData).catch(err => {
          console.warn('[Checkout] Failed to track abandoned checkout:', err);
        });
      }
    };
  }, [customerDetails.email, customerDetails.fullName, clientSecret, paymentSuccess, service.title, orderTotal]);

  if (paymentSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '4rem 3rem',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          animation: 'fadeInUp 0.5s ease-out'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle size={48} style={{ color: 'white' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
            Payment Successful!
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Redirecting to confirmation page...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', overflowX: 'hidden' }}>
      {/* Minimalist Header */}
      <div style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
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
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              padding: '0.5rem 0'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#020034';
              e.target.style.transform = 'translateX(-4px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#6b7280';
              e.target.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </div>

      <div className="container checkout-page-container" style={{ padding: '2rem 0 4rem', overflowX: 'hidden' }}>
        <div
          className="checkout-grid"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 400px)',
            gap: '3rem',
            alignItems: 'start',
            position: 'relative'
          }}
        >
          {/* Left: Main Form — minWidth 0 so content can shrink on mobile */}
          <div style={{ minWidth: 0 }}>
            {/* Progress Indicator — fits in viewport on mobile, label below */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '2rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              boxSizing: 'border-box'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: '1 1 auto',
                minWidth: 0,
                maxWidth: '100%'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: isFormValid() ? '#10b981' : '#e5e7eb',
                  color: isFormValid() ? 'white' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '0.8125rem',
                  transition: 'all 0.3s ease'
                }}>
                  {isFormValid() ? <CheckCircle size={16} /> : '1'}
                </div>
                <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: '100%', height: '2px', backgroundColor: '#e5e7eb', position: 'relative' }}>
                  <div style={{
                    width: isFormValid() ? '100%' : '0%',
                    height: '100%',
                    backgroundColor: '#10b981',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <div style={{
                  width: '28px',
                  height: '28px',
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: clientSecret ? '#10b981' : '#e5e7eb',
                  color: clientSecret ? 'white' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '0.8125rem',
                  transition: 'all 0.3s ease'
                }}>
                  {clientSecret ? <CheckCircle size={16} /> : '2'}
                </div>
              </div>
              <span style={{
                flexBasis: '100%',
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500',
                marginTop: '0.25rem'
              }}>
                Details → Payment
              </span>
            </div>

            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#020034',
              marginBottom: '0.5rem',
              lineHeight: '1.2',
              letterSpacing: '-0.02em'
            }}>
              Complete your booking
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              marginBottom: '2.5rem'
            }}>
              Just a few details to finalize your service
            </p>

            {/* Service Summary - Compact */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              {servicesList.length === 1 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#f0f4ff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2001AF',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    {service.title?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0,
                      marginBottom: '0.25rem'
                    }}>
                      {service.title}
                    </h3>
                    {service.category && (
                      <span style={{
                        fontSize: '0.8125rem',
                        color: '#6b7280'
                      }}>
                        {service.category}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#020034'
                }}>
                  £{totalPrice.toFixed(2)}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {servicesList.map(({ service: s, quantity }, index) => {
                  const lineTotal = (parseFloat(s?.price) || 0) * (quantity || 1);
                  return (
                    <div
                      key={s?.id || index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: '#f0f4ff',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2001AF',
                          fontSize: '1rem',
                          fontWeight: '700'
                        }}>
                          {s.title?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.9375rem' }}>{s.title}</div>
                          {s.category && (
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.category}</span>
                          )}
                          <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                            {quantity} × £{(parseFloat(s?.price) || 0).toFixed(2)} = £{lineTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #e5e7eb',
                  marginTop: '0.25rem'
                }}>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Booking fee</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>£{BOOKING_FEE.toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#020034'
                }}>
                  <span>Total</span>
                  <span>£{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            </div>

            {/* Hourly Service Form */}
            {isHourlyService && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                marginBottom: '2rem',
                border: '1px solid #fef3c7',
                background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  <Clock size={24} style={{ color: '#d97706' }} />
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#92400e',
                    margin: 0
                  }}>
                    Hourly Rate Service
                  </h3>
                </div>

                {/* Hours Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.75rem'
                  }}>
                    How many hours do you need? *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <button
                      type="button"
                      onClick={() => setSelectedHours(prev => Math.max(1, prev - 1))}
                      disabled={selectedHours <= 1}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        backgroundColor: selectedHours <= 1 ? '#f9fafb' : 'white',
                        color: selectedHours <= 1 ? '#9ca3af' : '#374151',
                        cursor: selectedHours <= 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Minus size={18} />
                    </button>
                    <div style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '1rem',
                      backgroundColor: '#fef3c7',
                      borderRadius: '12px',
                      border: '2px solid #f59e0b'
                    }}>
                      <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#92400e'
                      }}>
                        {selectedHours}
                      </span>
                      <span style={{
                        fontSize: '1rem',
                        color: '#b45309',
                        marginLeft: '0.5rem'
                      }}>
                        {selectedHours === 1 ? 'hour' : 'hours'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedHours(prev => Math.min(8, prev + 1))}
                      disabled={selectedHours >= 8}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        backgroundColor: selectedHours >= 8 ? '#f9fafb' : 'white',
                        color: selectedHours >= 8 ? '#9ca3af' : '#374151',
                        cursor: selectedHours >= 8 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Job Description */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Describe the work you need done *
                  </label>
                  <textarea
                    value={hourlyJobDescription}
                    onChange={(e) => {
                      setHourlyJobDescription(e.target.value);
                      if (formErrors.hourlyJobDescription) {
                        setFormErrors(prev => ({ ...prev, hourlyJobDescription: '' }));
                      }
                    }}
                    placeholder="Please describe in detail what you need help with..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      padding: '0.875rem',
                      border: `2px solid ${formErrors.hourlyJobDescription ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      fontSize: '0.9375rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      backgroundColor: 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                    onBlur={(e) => e.target.style.borderColor = formErrors.hourlyJobDescription ? '#ef4444' : '#e5e7eb'}
                  />
                  {formErrors.hourlyJobDescription && (
                    <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                      {formErrors.hourlyJobDescription}
                    </p>
                  )}
                </div>

                {/* Photo Upload */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Upload photos (optional)
                  </label>
                  {uploadedPhotos.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      {uploadedPhotos.map(photo => (
                        <div
                          key={photo.id}
                          style={{
                            position: 'relative',
                            aspectRatio: '1',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '2px solid #e5e7eb'
                          }}
                        >
                          <img
                            src={photo.preview}
                            alt={photo.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {uploadedPhotos.length < 5 && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.75rem',
                          padding: '1rem',
                          border: '2px dashed #d1d5db',
                          borderRadius: '12px',
                          backgroundColor: '#fafafa',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#2001AF';
                          e.currentTarget.style.backgroundColor = '#f0f4ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.backgroundColor = '#fafafa';
                        }}
                      >
                        <Upload size={20} style={{ color: '#6b7280' }} />
                        <span style={{ color: '#6b7280', fontWeight: '500', fontSize: '0.875rem' }}>
                          Click to upload photos
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Details Form */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                Your Details
              </h3>

              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {/* Full Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={customerDetails.fullName}
                    onChange={handleInputChange}
                    placeholder="John Smith"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: `2px solid ${formErrors.fullName ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      backgroundColor: 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                    onBlur={(e) => e.target.style.borderColor = formErrors.fullName ? '#ef4444' : '#e5e7eb'}
                  />
                  {formErrors.fullName && (
                    <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Email & Phone Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={customerDetails.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: `2px solid ${formErrors.email ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                      onBlur={(e) => e.target.style.borderColor = formErrors.email ? '#ef4444' : '#e5e7eb'}
                    />
                    {formErrors.email && (
                      <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={customerDetails.phone}
                      onChange={handleInputChange}
                      placeholder="07123 456789"
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: `2px solid ${formErrors.phone ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '12px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                      onBlur={(e) => e.target.style.borderColor = formErrors.phone ? '#ef4444' : '#e5e7eb'}
                    />
                    {formErrors.phone && (
                      <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address Section */}
                <div style={{
                  marginTop: '0.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <h4 style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '1rem'
                  }}>
                    Service Address
                  </h4>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={customerDetails.addressLine1}
                        onChange={handleInputChange}
                        placeholder="123 High Street"
                        style={{
                          width: '100%',
                          padding: '0.875rem 1rem',
                          border: `2px solid ${formErrors.addressLine1 ? '#ef4444' : '#e5e7eb'}`,
                          borderRadius: '12px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          backgroundColor: 'white'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                        onBlur={(e) => e.target.style.borderColor = formErrors.addressLine1 ? '#ef4444' : '#e5e7eb'}
                      />
                      {formErrors.addressLine1 && (
                        <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                          {formErrors.addressLine1}
                        </p>
                      )}
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Address Line 2 <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span>
                      </label>
                      <input
                        type="text"
                        name="addressLine2"
                        value={customerDetails.addressLine2}
                        onChange={handleInputChange}
                        placeholder="Flat 2, Building A"
                        style={{
                          width: '100%',
                          padding: '0.875rem 1rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          backgroundColor: 'white'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}>
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={customerDetails.city}
                          onChange={handleInputChange}
                          placeholder="London"
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            border: `2px solid ${formErrors.city ? '#ef4444' : '#e5e7eb'}`,
                            borderRadius: '12px',
                            fontSize: '0.9375rem',
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                            backgroundColor: 'white'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                          onBlur={(e) => e.target.style.borderColor = formErrors.city ? '#ef4444' : '#e5e7eb'}
                        />
                        {formErrors.city && (
                          <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                            {formErrors.city}
                          </p>
                        )}
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}>
                          Postcode *
                        </label>
                        <input
                          type="text"
                          name="postcode"
                          value={customerDetails.postcode}
                          onChange={handleInputChange}
                          placeholder="SW1A 1AA"
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            border: `2px solid ${formErrors.postcode ? '#ef4444' : '#e5e7eb'}`,
                            borderRadius: '12px',
                            fontSize: '0.9375rem',
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                            backgroundColor: 'white',
                            textTransform: 'uppercase'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                          onBlur={(e) => e.target.style.borderColor = formErrors.postcode ? '#ef4444' : '#e5e7eb'}
                        />
                        {formErrors.postcode && (
                          <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                            {formErrors.postcode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time Selection */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Calendar size={20} style={{ color: '#E94A02' }} />
                Select Date & Time
              </h3>

              {/* Calendar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Preferred Dates * <span style={{ fontWeight: '400', color: '#6b7280' }}>(select at least 2)</span>
                </label>
                
                <div style={{
                  border: `2px solid ${formErrors.date ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: 'white'
                }}>
                  {/* Calendar Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: '#020034',
                    color: 'white'
                  }}>
                    <button
                      type="button"
                      onClick={() => navigateMonth(-1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span style={{ fontWeight: '600', fontSize: '0.9375rem' }}>
                      {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigateMonth(1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Day Labels */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#6b7280'
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    padding: '0.5rem'
                  }}>
                    {(() => {
                      const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
                      const days = [];
                      
                      for (let i = 0; i < startingDay; i++) {
                        days.push(<div key={`empty-${i}`} style={{ padding: '0.5rem' }} />);
                      }
                      
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                        const disabled = isDateDisabled(date);
                        const isSelected = isDateSelected(date);
                        const canSelectMore = selectedDates.length < 5;
                        
                        days.push(
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDateSelect(day)}
                            disabled={disabled || (!isSelected && !canSelectMore)}
                            style={{
                              padding: '0.75rem',
                              textAlign: 'center',
                              border: isSelected ? '2px solid #E94A02' : 'none',
                              borderRadius: '8px',
                              cursor: disabled || (!isSelected && !canSelectMore) ? 'not-allowed' : 'pointer',
                              backgroundColor: isSelected ? '#E94A02' : disabled ? '#f9fafb' : 'transparent',
                              color: isSelected ? 'white' : disabled ? '#d1d5db' : '#374151',
                              fontWeight: isSelected ? '600' : '400',
                              transition: 'all 0.2s ease',
                              fontSize: '0.875rem'
                            }}
                            onMouseEnter={(e) => {
                              if (!disabled && !isSelected && canSelectMore) {
                                e.target.style.backgroundColor = '#f0f4ff';
                                e.target.style.color = '#2001AF';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!disabled && !isSelected) {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#374151';
                              }
                            }}
                          >
                            {day}
                          </button>
                        );
                      }
                      
                      return days;
                    })()}
                  </div>
                </div>

                {formErrors.date && (
                  <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                    {formErrors.date}
                  </p>
                )}

                {/* Selected Dates Display */}
                {selectedDates.length > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: selectedDates.length >= 2 ? '#f0fdf4' : '#fef3c7',
                    borderRadius: '12px',
                    border: `1px solid ${selectedDates.length >= 2 ? '#bbf7d0' : '#fcd34d'}`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ 
                        color: selectedDates.length >= 2 ? '#166534' : '#92400e', 
                        fontSize: '0.8125rem', 
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {selectedDates.length >= 2 ? (
                          <CheckCircle size={16} style={{ color: '#10b981' }} />
                        ) : (
                          <AlertCircle size={16} style={{ color: '#f59e0b' }} />
                        )}
                        {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
                        {selectedDates.length < 2 && ' (select at least 2)'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {selectedDates.map((date, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.8125rem'
                          }}
                        >
                          <Calendar size={14} style={{ color: '#E94A02' }} />
                          <span style={{ color: '#374151', fontWeight: '500' }}>
                            {formatDateShort(date)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSelectedDate(date)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '0.125rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#9ca3af',
                              borderRadius: '50%',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#ef4444';
                              e.target.style.backgroundColor = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#9ca3af';
                              e.target.style.backgroundColor = 'transparent';
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Time Slots */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Preferred Time Slots * <span style={{ fontWeight: '400', color: '#6b7280' }}>(select all that work)</span>
                </label>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem'
                }}>
                  {timeSlots.map(slot => {
                    const isSelected = selectedTimeSlots.includes(slot.id);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setSelectedTimeSlots(prev => {
                            if (isSelected) {
                              return prev.filter(id => id !== slot.id);
                            } else {
                              return [...prev, slot.id];
                            }
                          });
                          if (formErrors.timeSlot) {
                            setFormErrors(prev => ({ ...prev, timeSlot: '' }));
                          }
                        }}
                        style={{
                          padding: '1rem',
                          border: `2px solid ${isSelected ? '#E94A02' : '#e5e7eb'}`,
                          borderRadius: '12px',
                          backgroundColor: isSelected ? '#fff5f0' : 'white',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#E94A02';
                            e.currentTarget.style.backgroundColor = '#fef7f5';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '0.7rem',
                              color: isSelected ? '#E94A02' : '#9ca3af',
                              fontWeight: '500',
                              marginBottom: '0.25rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              {slot.period}
                            </div>
                            <div style={{
                              fontSize: '0.9375rem',
                              fontWeight: '600',
                              color: isSelected ? '#E94A02' : '#374151'
                            }}>
                              {slot.label}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle size={20} style={{ color: '#E94A02' }} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {formErrors.timeSlot && (
                  <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                    {formErrors.timeSlot}
                  </p>
                )}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              {isHourlyService && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={agreedToHourlyTerms}
                      onChange={(e) => {
                        setAgreedToHourlyTerms(e.target.checked);
                        if (formErrors.hourlyTerms) {
                          setFormErrors(prev => ({ ...prev, hourlyTerms: '' }));
                        }
                      }}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        accentColor: '#E94A02',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      lineHeight: '1.5'
                    }}>
                      <strong style={{ color: '#d97706' }}>I understand</strong> that I am booking <strong>{selectedHours} {selectedHours === 1 ? 'hour' : 'hours'}</strong> at <strong>£{service.price}/hour</strong> (total: £{totalPrice.toFixed(2)}). 
                      If additional time is needed, I will be informed and charged at the same hourly rate.
                    </span>
                  </label>
                  {formErrors.hourlyTerms && (
                    <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem', marginLeft: '28px' }}>
                      {formErrors.hourlyTerms}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (formErrors.terms) {
                        setFormErrors(prev => ({ ...prev, terms: '' }));
                      }
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      marginTop: '2px',
                      accentColor: '#E94A02',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#374151',
                    lineHeight: '1.5'
                  }}>
                    I agree to the <a href="/terms" style={{ color: '#2001AF', textDecoration: 'underline' }}>Terms & Conditions</a> and 
                    <a href="/privacy" style={{ color: '#2001AF', textDecoration: 'underline' }}> Privacy Policy</a>. 
                    I understand that my payment will be processed securely.
                  </span>
                </label>
                {formErrors.terms && (
                  <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.5rem', marginLeft: '28px' }}>
                    {formErrors.terms}
                  </p>
                )}
              </div>
            </div>

            {/* Trust Indicators */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem'
              }}>
                {[
                  { icon: <Sparkles size={18} />, text: 'Instant pricing' },
                  { icon: <Shield size={18} />, text: 'Vetted professionals' },
                  { icon: <Lock size={18} />, text: 'Secure payment' },
                  { icon: <Star size={18} />, text: 'Satisfaction guaranteed' }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: '#fafafa',
                    borderRadius: '12px',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ color: '#2001AF' }}>
                      {item.icon}
                    </div>
                    <span style={{ color: '#374151', fontWeight: '500' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sticky Order Summary */}
          <div ref={paymentSectionRef}>
            {/* Master Club checkbox upsell: add £9.99 to total when checked */}
            {showSubscriptionUpsell && customerDetails.email && hasSubscription === false && (
              <SubscriptionUpsell
                checked={addSubscriptionToOrder}
                onChange={handleAddSubscriptionChange}
                onDismiss={() => setShowSubscriptionUpsell(false)}
                disabled={!!clientSecret}
              />
            )}
            
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              position: 'sticky',
              top: '5rem',
              maxHeight: 'calc(100vh - 6rem)',
              overflowY: 'auto',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #f3f4f6'
              }}>
                Order Summary
              </h2>

              {/* Service Details */}
              <div style={{ marginBottom: '1.5rem' }}>
                {servicesList.length === 1 ? (
                  <>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Service</span>
                      <span style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem', textAlign: 'right', maxWidth: '180px' }}>
                        {service.title}
                      </span>
                    </div>
                    {isHourlyService ? (
                      <>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Rate</span>
                          <span style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>
                            £{parseFloat(service.price).toFixed(2)}/hour
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Hours</span>
                          <span style={{ fontWeight: '600', color: '#d97706', fontSize: '0.875rem' }}>
                            {selectedHours} {selectedHours === 1 ? 'hour' : 'hours'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Price</span>
                        <span style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>
                          {service.priceType === 'from' && 'From '}
                          £{parseFloat(service.price).toFixed(2)}
                          {service.priceUnit && <span style={{ fontWeight: '400', color: '#6b7280' }}> {service.priceUnit}</span>}
                        </span>
                      </div>
                    )}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Location</span>
                      <span style={{ color: '#111827', fontSize: '0.875rem' }}>{customerDetails.postcode || postcode}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {servicesList.map(({ service: s, quantity }, index) => {
                      const lineTotal = (parseFloat(s?.price) || 0) * (quantity || 1);
                      return (
                        <div
                          key={s?.id || index}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          <span style={{ color: '#111827', maxWidth: '180px' }}>
                            {quantity}× {s.title}
                          </span>
                          <span style={{ fontWeight: '600', color: '#111827' }}>£{lineTotal.toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <span>Subtotal</span>
                      <span>£{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <span>Booking fee</span>
                      <span>£{BOOKING_FEE.toFixed(2)}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      <span style={{ color: '#6b7280' }}>Location</span>
                      <span style={{ color: '#111827' }}>{customerDetails.postcode || postcode}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Date & Time Summary */}
              {(selectedDates.length > 0 || selectedTimeSlots.length > 0) && (
                <div style={{
                  backgroundColor: selectedDates.length >= 2 && selectedTimeSlots.length > 0 ? '#f0fdf4' : '#fef3c7',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  border: `1px solid ${selectedDates.length >= 2 && selectedTimeSlots.length > 0 ? '#bbf7d0' : '#fcd34d'}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    <Calendar size={16} style={{ color: selectedDates.length >= 2 ? '#16a34a' : '#d97706' }} />
                    <span style={{ fontWeight: '600', color: selectedDates.length >= 2 ? '#166534' : '#92400e', fontSize: '0.8125rem' }}>
                      Preferred Dates ({selectedDates.length})
                    </span>
                  </div>
                  {selectedDates.length > 0 && (
                    <div style={{ marginBottom: selectedTimeSlots.length > 0 ? '0.75rem' : 0 }}>
                      {selectedDates.slice(0, 3).map((date, index) => (
                        <p key={index} style={{ color: selectedDates.length >= 2 ? '#166534' : '#92400e', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>
                          • {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      ))}
                      {selectedDates.length > 3 && (
                        <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: 0, fontStyle: 'italic' }}>
                          +{selectedDates.length - 3} more date{selectedDates.length - 3 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                  {selectedTimeSlots.length > 0 && (
                    <div style={{
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Clock size={14} style={{ color: selectedDates.length >= 2 ? '#16a34a' : '#d97706' }} />
                        <span style={{ fontWeight: '600', color: selectedDates.length >= 2 ? '#166534' : '#92400e', fontSize: '0.75rem' }}>
                          Time Slots ({selectedTimeSlots.length})
                        </span>
                      </div>
                      {selectedTimeSlots.map((slotId, index) => (
                        <p key={index} style={{ color: selectedDates.length >= 2 ? '#15803d' : '#b45309', fontSize: '0.75rem', margin: '0 0 0.15rem 0' }}>
                          • {timeSlots.find(s => s.id === slotId)?.label}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Member discount (30%) — only after email entered and upsell checkbox checked */}
              {subscriptionOfferActive && memberDiscount > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  padding: '0.5rem 0'
                }}>
                  <span style={{ color: '#15803d', fontSize: '0.875rem', fontWeight: '500' }}>
                    Member discount (30%)
                  </span>
                  <span style={{ fontWeight: '600', color: '#15803d', fontSize: '0.9375rem' }}>
                    -£{memberDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Master Club add-on line — only when subscription offer is active */}
              {subscriptionOfferActive && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(233, 74, 2, 0.08)',
                  borderRadius: '12px',
                  border: '1px solid rgba(233, 74, 2, 0.2)'
                }}>
                  <span style={{ color: '#92400e', fontSize: '0.875rem', fontWeight: '500' }}>
                    Master Club (first month)
                  </span>
                  <span style={{ fontWeight: '600', color: '#b45309', fontSize: '0.9375rem' }}>
                    £{SUBSCRIPTION_PRICE.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Total */}
              <div style={{
                borderTop: '2px solid #f3f4f6',
                paddingTop: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#020034',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  color: 'white'
                }}>
                  <span style={{
                    fontSize: '0.9375rem',
                    fontWeight: '600'
                  }}>
                    {isHourlyService ? `Total (${selectedHours}h)` : 'Total'}
                  </span>
                  <span style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    letterSpacing: '-0.02em'
                  }}>
                    £{orderTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Form Validation Message */}
              {!isFormValid() && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  fontSize: '0.8125rem',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} />
                  Please fill in all required fields above
                </div>
              )}

              {/* Payment Error */}
              {paymentError && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#dc2626',
                  fontSize: '0.8125rem'
                }}>
                  <AlertCircle size={16} />
                  {paymentError}
                </div>
              )}

              {/* Payment Section */}
              {stripeInstance && isFormValid() && clientSecret ? (
                <>
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <CheckCircle size={20} style={{ color: '#16a34a' }} />
                    <span style={{ color: '#166534', fontSize: '0.8125rem', fontWeight: '500' }}>
                      Details confirmed! Complete your payment below.
                    </span>
                  </div>
                  
                  <Elements 
                    stripe={stripeInstance} 
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#E94A02',
                          borderRadius: '12px',
                        },
                      },
                      locale: 'en-GB'
                    }}
                  >
                    <PaymentForm
                      onSuccess={handlePaymentSuccess}
                      clientSecret={clientSecret}
                    />
                  </Elements>
                </>
              ) : stripeInstance && isFormValid() && !clientSecret ? (
                <button
                  onClick={createPaymentIntent}
                  disabled={creatingPaymentIntent}
                  style={{
                    width: '100%',
                    background: creatingPaymentIntent 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #E94A02 0%, #d13d00 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1.125rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: creatingPaymentIntent ? 'not-allowed' : 'pointer',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    boxShadow: creatingPaymentIntent ? 'none' : '0 4px 12px rgba(233, 74, 2, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!creatingPaymentIntent) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(233, 74, 2, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!creatingPaymentIntent) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(233, 74, 2, 0.3)';
                    }
                  }}
                >
                  {creatingPaymentIntent ? (
                    <>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      Preparing secure payment...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Proceed to Payment
                    </>
                  )}
                </button>
              ) : stripeInstance && !isFormValid() ? (
                <button
                  onClick={validateForm}
                  style={{
                    width: '100%',
                    backgroundColor: '#e5e7eb',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1.125rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Complete all fields to continue
                </button>
              ) : (
                <div style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>Loading payment system...</p>
                </div>
              )}

              {/* Trust Badge */}
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                alignItems: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  <Shield size={14} />
                  <span>Secure payment • No hidden fees</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  <Lock size={14} />
                  <span>256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 968px) {
          div[style*="grid-template-columns: 1fr 400px"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="position: sticky"] {
            position: relative !important;
            top: 0 !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
        }
        
        /* Fix scroll issues on desktop */
        @media (min-width: 969px) {
          html, body {
            overflow-x: hidden;
          }
          div[style*="maxHeight: calc(100vh - 6rem)"] {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db transparent;
          }
          div[style*="maxHeight: calc(100vh - 6rem)"]::-webkit-scrollbar {
            width: 6px;
          }
          div[style*="maxHeight: calc(100vh - 6rem)"]::-webkit-scrollbar-track {
            background: transparent;
          }
          div[style*="maxHeight: calc(100vh - 6rem)"]::-webkit-scrollbar-thumb {
            background-color: #d1d5db;
            border-radius: 3px;
          }
          div[style*="maxHeight: calc(100vh - 6rem)"]::-webkit-scrollbar-thumb:hover {
            background-color: #9ca3af;
          }
        }
      `}</style>
    </div>
  );
};

export default B2CCheckout;
