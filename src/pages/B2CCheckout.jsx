import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Shield, Loader2, AlertCircle, Clock, Upload, X, Plus, Minus, Calendar, ChevronLeft, ChevronRight, Lock, Sparkles, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntentViaSupabase } from '../lib/stripe';
import { trackAbandonedCheckout } from '../lib/email';
import SubscriptionUpsell from '../components/b2c/SubscriptionUpsell';

// Master Club subscription price - updated to match new design
const SUBSCRIPTION_PRICE = 12.99;
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

  // Normalise API response: has_subscription can be boolean true or string "true"
  const hasActiveSubscription = hasSubscription === true || hasSubscription === 'true';
  // Existing member: 10% discount (no checkbox, no add-on)
  const existingMemberDiscount = Boolean(customerDetails.email && hasActiveSubscription)
    ? totalPrice * 0.1
    : 0;
  // New sign-up offer: 27% discount + Master Club add-on when checkbox checked (updated to match new design)
  const subscriptionOfferActive = Boolean(
    customerDetails.email &&
    !hasActiveSubscription &&
    addSubscriptionToOrder
  );
  const newMemberDiscount = subscriptionOfferActive ? totalPrice * 0.27 : 0;
  const memberDiscount = existingMemberDiscount > 0 ? existingMemberDiscount : newMemberDiscount;
  const orderTotal =
    hasActiveSubscription
      ? totalPrice - existingMemberDiscount
      : subscriptionOfferActive
        ? totalPrice * 0.73 + SUBSCRIPTION_PRICE
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
        setHasSubscription(has === true || has === 'true');
        if (has === true || has === 'true') setAddSubscriptionToOrder(false);
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
      if (addSubscriptionToOrder && (!customerDetails?.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email))) {
        setPaymentError('Please enter a valid email address to add Master Club.');
        setCreatingPaymentIntent(false);
        return;
      }

      const amount = Math.round((orderTotal || totalPrice || service.price || 0) * 100);
      console.log('[Checkout] create-payment-intent iniciado', { amount_pence: amount, amount_gbp: (amount / 100).toFixed(2), currency: 'gbp', add_subscription: addSubscriptionToOrder });
      
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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format date for display
  const formatBookingDate = () => {
    if (selectedDates.length > 0) {
      const firstDate = selectedDates[0];
      return firstDate.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'Oct 24, 10:00 AM';
  };

  // Calculate savings display
  const savingsAmount = memberDiscount > 0 ? memberDiscount : 0;
  const serviceTotal = totalPrice;
  const finalTotal = orderTotal;

  return (
    <div style={{ 
      minHeight: 'max(884px, 100dvh)', 
      backgroundColor: 'white', 
      overflowX: 'hidden',
      fontFamily: "'Manrope', sans-serif"
    }}>
      {/* Load Material Symbols and Manrope fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: isMobile ? '16px 20px' : '16px 40px',
        justifyContent: 'space-between',
        borderBottom: '1px solid #F1F5F9',
        maxWidth: isMobile ? '100%' : '1200px',
        margin: '0 auto'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#020034',
            padding: 0
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>arrow_back_ios</span>
        </button>
        <h2 style={{
          color: '#020034',
          fontSize: '13px',
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          margin: 0
        }}>
          One-Step Checkout
        </h2>
        <div style={{ width: '44px' }}></div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        paddingBottom: isMobile ? '280px' : '24px',
        padding: isMobile ? '32px 20px' : '32px 40px',
        paddingTop: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '40px' : '40px',
        maxWidth: isMobile ? '100%' : '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Booking For Section */}
        <section>
          <h3 style={{
            color: '#020034',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            opacity: 0.4,
            marginBottom: '16px',
            padding: '0 4px'
          }}>
            Booking For
          </h3>
          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '20px',
            border: '1px solid #F1F5F9',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <input
              type="text"
              placeholder="Full Name"
              value={customerDetails.fullName}
              onChange={(e) => {
                setCustomerDetails(prev => ({ ...prev, fullName: e.target.value }));
                if (formErrors.fullName) {
                  setFormErrors(prev => ({ ...prev, fullName: '' }));
                }
              }}
              style={{
                width: '100%',
                backgroundColor: 'white',
                border: formErrors.fullName ? '2px solid #ef4444' : '1px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                height: '52px',
                padding: '0 16px',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: "'Manrope', sans-serif"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ED4B00';
                e.target.style.boxShadow = '0 0 0 3px rgba(237, 75, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = formErrors.fullName ? '#ef4444' : '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <input
              type="email"
              placeholder="Email"
              value={customerDetails.email}
              onChange={(e) => {
                setCustomerDetails(prev => ({ ...prev, email: e.target.value }));
                if (formErrors.email) {
                  setFormErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              style={{
                width: '100%',
                backgroundColor: 'white',
                border: formErrors.email ? '2px solid #ef4444' : '1px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                height: '52px',
                padding: '0 16px',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: "'Manrope', sans-serif"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ED4B00';
                e.target.style.boxShadow = '0 0 0 3px rgba(237, 75, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = formErrors.email ? '#ef4444' : '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={customerDetails.phone}
              onChange={(e) => {
                setCustomerDetails(prev => ({ ...prev, phone: e.target.value }));
                if (formErrors.phone) {
                  setFormErrors(prev => ({ ...prev, phone: '' }));
                }
              }}
              style={{
                width: '100%',
                backgroundColor: 'white',
                border: formErrors.phone ? '2px solid #ef4444' : '1px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                height: '52px',
                padding: '0 16px',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: "'Manrope', sans-serif"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ED4B00';
                e.target.style.boxShadow = '0 0 0 3px rgba(237, 75, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = formErrors.phone ? '#ef4444' : '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </section>

        {/* Service Location Section */}
        <section>
          <h3 style={{
            color: '#020034',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            opacity: 0.4,
            marginBottom: '16px',
            padding: '0 4px'
          }}>
            Service Location
          </h3>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #F1F5F9',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="material-symbols-outlined" style={{ color: '#94A3B8', fontSize: '24px' }}>
                location_on
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#020034' }}>
                {customerDetails.postcode || postcode || 'SW1A 1AA, London'}
              </span>
            </div>
            <button 
              onClick={() => navigate('/booking')}
              style={{
                color: '#ED4B00',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Change
            </button>
          </div>
        </section>

        {/* AI Verified Badge */}
        <section style={{ display: 'flex', justifyContent: 'center', padding: '0 8px' }}>
          <div style={{
            background: 'linear-gradient(90deg, #FFFFFF 0%, #FFF7F2 100%)',
            width: '100%',
            maxWidth: isMobile ? '100%' : '400px',
            borderRadius: '9999px',
            padding: '12px 24px',
            border: '1px solid rgba(237, 75, 0, 0.2)',
            boxShadow: '0 2px 10px rgba(237, 75, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(237, 75, 0, 0.1)'
              }}>
                <span style={{ color: '#ED4B00', fontSize: '14px' }}>✨</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? '4px' : '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#020034' }}>AI Verified</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>
                Best market rate secured: -£{savingsAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Service Breakdown Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px' }}>
            <h3 style={{
              color: '#020034',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              opacity: 0.4
            }}>
              Service Breakdown
            </h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>
              {formatBookingDate()}
            </span>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #F1F5F9',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ color: '#10B981', fontSize: '20px', flexShrink: 0 }}>
                check_circle
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: '1.4', color: '#020034' }}>
                Labour & Boiler Maintenance
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ color: '#10B981', fontSize: '20px', flexShrink: 0 }}>
                check_circle
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: '1.4', color: '#020034' }}>
                £5M Public Liability Insurance
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ color: '#10B981', fontSize: '20px', flexShrink: 0 }}>
                check_circle
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, lineHeight: '1.4', color: '#020034' }}>
                All Equipment Provided
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
              <span className="material-symbols-outlined" style={{ color: '#94A3B8', fontSize: '18px', flexShrink: 0 }}>
                info
              </span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8', fontStyle: 'italic' }}>
                Materials quoted separately
              </span>
            </div>
          </div>
        </section>

        {/* Membership Section */}
        {!hasActiveSubscription && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 4px' }}>
              <h3 style={{
                color: '#020034',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                opacity: 0.4
              }}>
                Membership
              </h3>
              <span style={{
                backgroundColor: 'rgba(237, 75, 0, 0.1)',
                color: '#ED4B00',
                fontSize: '10px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                border: '1px solid rgba(237, 75, 0, 0.1)'
              }}>
                Recommended
              </span>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              boxShadow: '0 0 20px -5px rgba(255, 215, 0, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              ring: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-48px',
                right: '-48px',
                width: '128px',
                height: '128px',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderRadius: '50%',
                filter: 'blur(48px)'
              }}></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(to bottom right, #FBBF24, #FFD700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '32px', fontVariationSettings: '"FILL" 1' }}>
                      stars
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: 800, lineHeight: '1.2', color: '#020034', margin: 0 }}>
                      Master Club
                    </p>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#059669',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      backgroundColor: '#D1FAE5',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginTop: '6px'
                    }}>
                      27% Discount Active
                    </span>
                  </div>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'flex',
                  height: '58px',
                  width: '96px',
                  cursor: 'pointer',
                  alignItems: 'center',
                  borderRadius: '9999px',
                  backgroundColor: addSubscriptionToOrder ? '#ED4B00' : '#F1F5F9',
                  transition: 'background-color 0.2s',
                  flexShrink: 0,
                  border: '2px solid #F1F5F9'
                }}>
                  <input
                    type="checkbox"
                    checked={addSubscriptionToOrder}
                    onChange={(e) => handleAddSubscriptionChange(e.target.checked)}
                    className="peer"
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  />
                  <div style={{
                    height: '50px',
                    width: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transform: addSubscriptionToOrder ? 'translateX(41px)' : 'translateX(4px)',
                    transition: 'transform 0.2s'
                  }}></div>
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#ED4B00', fontSize: '22px' }}>
                    payments
                  </span>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#020034', margin: 0 }}>
                    Pay in 3x interest-free
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Member Rate
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#020034', margin: 0 }}>
                    £{SUBSCRIPTION_PRICE.toFixed(2)}
                  </p>
                  <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.4, color: '#020034' }}>
                    /mo
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Price Summary Section */}
        <section style={{
          backgroundColor: '#F8FAFC',
          padding: '24px',
          borderRadius: '20px',
          border: '1px solid #F1F5F9',
          margin: '0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', marginBottom: '20px' }}>
            <span style={{ opacity: 0.6, fontWeight: 600, color: '#020034' }}>Service Total</span>
            <span style={{ fontWeight: 700, color: '#020034' }}>£{serviceTotal.toFixed(2)}</span>
          </div>
          {subscriptionOfferActive && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', marginBottom: '20px' }}>
              <span style={{ opacity: 0.6, fontWeight: 600, color: '#020034' }}>Master Club Monthly</span>
              <span style={{ fontWeight: 700, color: '#020034' }}>£{SUBSCRIPTION_PRICE.toFixed(2)}</span>
            </div>
          )}
          {savingsAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', fontSize: '15px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: '#059669', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                  Master Club Savings
                </span>
                <span style={{
                  backgroundColor: '#D1FAE5',
                  color: '#047857',
                  fontSize: '8px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  width: 'fit-content'
                }}>
                  AI-MATCHED BEST VALUE
                </span>
              </div>
              <span style={{ fontWeight: 700, color: '#059669', fontSize: '18px' }}>
                -£{savingsAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', marginTop: '8px', borderTop: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#020034' }}>Total Amount</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: '#020034', display: 'block', lineHeight: '1' }}>
                £{finalTotal.toFixed(2)}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.4, textTransform: 'uppercase', color: '#020034' }}>
                Vat Included
              </span>
            </div>
          </div>
        </section>

        {/* Terms Checkbox */}
        <section style={{ paddingBottom: isMobile ? '64px' : '16px', padding: '0 4px' }}>
          <label style={{ display: 'flex', gap: '16px', cursor: 'pointer' }}>
            <div style={{ paddingTop: '2px' }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{
                  height: '24px',
                  width: '24px',
                  borderRadius: '4px',
                  border: '1px solid #CBD5E1',
                  accentColor: '#020034'
                }}
              />
            </div>
            <p style={{
              fontSize: '13px',
              fontWeight: 600,
              lineHeight: '1.6',
              opacity: 0.5,
              color: '#020034',
              margin: 0
            }}>
              I confirm my booking and agree to the <span style={{ textDecoration: 'underline' }}>Terms of Service</span>. Membership auto-renews until cancelled.
            </p>
          </label>
        </section>
      </div>

      {/* Footer with Payment Button */}
      <div style={{
        position: isMobile ? 'fixed' : 'sticky',
        bottom: isMobile ? 0 : 'auto',
        left: 0,
        right: 0,
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: isMobile ? '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))' : '20px 40px',
        zIndex: 60,
        borderTop: '1px solid #F1F5F9',
        boxShadow: '0 -15px 40px rgba(2,0,52,0.1)',
        maxWidth: isMobile ? '100%' : '1200px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#ED4B00', fontSize: '16px', fontVariationSettings: '"FILL" 1' }}>
              verified
            </span>
            <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#020034', margin: 0 }}>
              Stripe Secure
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', color: '#FBBF24' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: '"FILL" 1' }}>
                star
              </span>
            </div>
            <p style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#020034', margin: 0 }}>
              4.9/5 Rating
            </p>
          </div>
        </div>
        {stripePromise && clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm onSuccess={handlePaymentSuccess} clientSecret={clientSecret} />
          </Elements>
        ) : (
          <button
            onClick={async () => {
              if (!isFormValid()) {
                toast.error('Please fill in all required fields');
                return;
              }
              await createPaymentIntent();
            }}
            disabled={creatingPaymentIntent || !isFormValid()}
            style={{
              width: '100%',
              backgroundColor: '#ED4B00',
              color: 'white',
              fontWeight: 800,
              height: '74px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(237, 75, 0, 0.25)',
              border: 'none',
              cursor: creatingPaymentIntent || !isFormValid() ? 'not-allowed' : 'pointer',
              fontSize: '20px',
              letterSpacing: '-0.02em',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              opacity: creatingPaymentIntent || !isFormValid() ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!creatingPaymentIntent && isFormValid()) {
                e.target.style.transform = 'scale(0.98)';
                e.target.style.backgroundColor = '#ff5a00';
              }
            }}
            onMouseLeave={(e) => {
              if (!creatingPaymentIntent && isFormValid()) {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = '#ED4B00';
              }
            }}
          >
            <span>{creatingPaymentIntent ? 'Processing...' : 'Confirm & Pay Now'}</span>
            {!creatingPaymentIntent && (
              <span className="material-symbols-outlined" style={{ fontSize: '24px', fontWeight: 700 }}>
                arrow_forward
              </span>
            )}
          </button>
        )}
        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '10px',
          fontWeight: 700,
          opacity: 0.3,
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          color: '#020034',
          marginBottom: 0
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
          Encrypted Checkout
        </p>
      </div>

      {/* Styles */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
        }
        .material-symbols-fill {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
        }
        
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
        
        @media (max-width: 768px) {
          html, body {
            overflow-x: hidden;
            max-width: 100vw;
          }
        }
        
        @media (min-width: 768px) {
          html, body {
            overflow-x: hidden;
          }
        }
        
        /* Prevent horizontal scroll */
        * {
          max-width: 100%;
        }
      `}</style>
    </div>
  );
};

export default B2CCheckout;
