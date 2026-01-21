import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Shield, Loader2, AlertCircle, Clock, Upload, X, Image, Plus, Minus } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe, createPaymentIntentViaSupabase } from '../lib/stripe';

// Payment Form Component (used inside Elements provider)
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
        redirect: 'if_required'
      });

      if (confirmError) {
        setError(confirmError.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#dc2626'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      
      <div style={{ marginBottom: '1.5rem' }}>
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        style={{
          width: '100%',
          backgroundColor: loading ? '#9ca3af' : '#E94A02',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '1.125rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
        onMouseOver={(e) => {
          if (!loading) e.target.style.backgroundColor = '#d13d00';
        }}
        onMouseOut={(e) => {
          if (!loading) e.target.style.backgroundColor = '#E94A02';
        }}
      >
        {loading ? (
          <>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Processing...
          </>
        ) : (
          'Pay now'
        )}
      </button>
    </form>
  );
};

const B2CCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { service, postcode, jobDescription } = location.state || {};
  const [stripePromise, setStripePromise] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [creatingPaymentIntent, setCreatingPaymentIntent] = useState(false);
  const fileInputRef = useRef(null);
  
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

  // Check if service is hourly
  const isHourlyService = service?.priceType === 'hourly' || 
    service?.priceUnit?.toLowerCase().includes('hour') ||
    service?.title?.toLowerCase().includes('hourly');

  // Calculate total price for hourly services
  const totalPrice = isHourlyService 
    ? parseFloat(service?.price || 0) * selectedHours 
    : parseFloat(service?.price || 0);

  useEffect(() => {
    const initStripe = async () => {
      const stripe = await getStripe();
      setStripePromise(stripe);
    };
    initStripe();
  }, []);

  // Create payment intent when form is valid
  const createPaymentIntent = async () => {
    if (creatingPaymentIntent || clientSecret) return;
    
    setCreatingPaymentIntent(true);
    setPaymentError(null);

    try {
      const amount = Math.round((totalPrice || service.price || 0) * 100); // Convert to pence
      
      if (amount <= 0) {
        setPaymentError('Invalid service price');
        setCreatingPaymentIntent(false);
        return;
      }

      // Build job description including hourly details
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
          service_id: service.id || service.originalService?.id,
          service_name: service.title,
          service_category: service.category || '',
          postcode: customerDetails?.postcode || postcode || '',
          job_description: fullJobDescription,
          hours_booked: isHourlyService ? selectedHours.toString() : '',
          hourly_rate: isHourlyService ? service.price.toString() : '',
          photos_count: uploadedPhotos?.length?.toString() || '0',
          customer_name: customerDetails?.fullName || '',
          customer_email: customerDetails?.email || '',
          customer_phone: customerDetails?.phone || '',
        },
        // Pre-create booking record in database
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
        }
      });

      setClientSecret(paymentData.clientSecret);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setPaymentError('Failed to initialize payment. Please try again.');
    } finally {
      setCreatingPaymentIntent(false);
    }
  };

  useEffect(() => {
    // Update postcode from location state
    if (postcode) {
      setCustomerDetails(prev => ({ ...prev, postcode }));
    }
  }, [postcode]);

  if (!service) {
    navigate('/');
    return null;
  }

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to 5 photos
    if (uploadedPhotos.length + files.length > 5) {
      alert('You can upload a maximum of 5 photos');
      return;
    }

    setUploading(true);

    files.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload only image files');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Each photo must be less than 5MB');
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
    // Reset input
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

    // For hourly services, require a job description
    if (isHourlyService && !hourlyJobDescription.trim()) {
      errors.hourlyJobDescription = 'Please describe the work you need done';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentSuccess(true);
    // Redirect to success page after a short delay
    setTimeout(() => {
      navigate('/checkout-success', {
        state: {
          service,
          postcode,
          jobDescription,
          customerDetails,
          paymentIntentId: paymentIntent.id
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
           agreedToTerms &&
           (!isHourlyService || (agreedToHourlyTerms && hourlyJobDescription.trim()));
  };

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
          borderRadius: '1rem',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <CheckCircle size={64} style={{ color: '#10b981', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
            Payment Successful!
          </h2>
          <p style={{ color: '#6b7280' }}>Redirecting to confirmation page...</p>
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
        <div className="container">
          <button
            onClick={() => navigate('/booking')}
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
            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 0' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 420px',
          gap: '2.5rem'
        }}>
          {/* Left: Service Details & Customer Form */}
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#020034',
              marginBottom: '2rem',
              lineHeight: '1.2'
            }}>
              Complete your booking
            </h1>

            {/* Service Summary Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#020034',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {service.title?.charAt(0) || 'S'}
                </div>
                <div>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0
                  }}>
                    {service.title}
                  </h2>
                  {service.category && (
                    <span style={{
                      fontSize: '0.8rem',
                      color: '#6b7280'
                    }}>
                      {service.category}
                    </span>
                  )}
                </div>
              </div>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '0.75rem',
                fontSize: '0.9rem'
              }}>
                {service.description}
              </p>
              {jobDescription && (
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginTop: '0.75rem'
                }}>
                  <p style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.25rem'
                  }}>
                    Your request:
                  </p>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    {jobDescription}
                  </p>
                </div>
              )}
              <div style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.8rem'
              }}>
                <Shield size={14} />
                <span>Vetted and insured professional</span>
              </div>
            </div>

            {/* Hourly Service Form */}
            {isHourlyService && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem',
                border: '2px solid #f59e0b'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem'
                }}>
                  <Clock size={24} style={{ color: '#d97706' }} />
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#92400e',
                    margin: 0
                  }}>
                    Hourly Rate Service - £{service.price}/hour
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
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: '2px solid #e5e7eb',
                        backgroundColor: selectedHours <= 1 ? '#f3f4f6' : 'white',
                        color: selectedHours <= 1 ? '#9ca3af' : '#374151',
                        cursor: selectedHours <= 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Minus size={20} />
                    </button>
                    <div style={{
                      minWidth: '120px',
                      textAlign: 'center',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#fef3c7',
                      borderRadius: '0.5rem',
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
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: '2px solid #e5e7eb',
                        backgroundColor: selectedHours >= 8 ? '#f3f4f6' : 'white',
                        color: selectedHours >= 8 ? '#9ca3af' : '#374151',
                        cursor: selectedHours >= 8 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginTop: '0.5rem'
                  }}>
                    Minimum 1 hour, maximum 8 hours per booking
                  </p>
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
                    placeholder="Please describe in detail what you need help with. Include any specific requirements, materials needed, or special considerations..."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '1rem',
                      border: `2px solid ${formErrors.hourlyJobDescription ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                    onBlur={(e) => e.target.style.borderColor = formErrors.hourlyJobDescription ? '#ef4444' : '#e5e7eb'}
                  />
                  {formErrors.hourlyJobDescription && (
                    <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.hourlyJobDescription}</p>
                  )}
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginTop: '0.5rem'
                  }}>
                    The more details you provide, the better our professional can prepare for the job.
                  </p>
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
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginBottom: '0.75rem'
                  }}>
                    Photos help our professionals understand the job better. You can upload up to 5 photos.
                  </p>

                  {/* Photo Preview Grid */}
                  {uploadedPhotos.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      {uploadedPhotos.map(photo => (
                        <div
                          key={photo.id}
                          style={{
                            position: 'relative',
                            aspectRatio: '1',
                            borderRadius: '0.5rem',
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

                  {/* Upload Button */}
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
                          borderRadius: '0.5rem',
                          backgroundColor: '#f9fafb',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#2001AF';
                          e.currentTarget.style.backgroundColor = '#f0f4ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                      >
                        {uploading ? (
                          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: '#6b7280' }} />
                        ) : (
                          <Upload size={20} style={{ color: '#6b7280' }} />
                        )}
                        <span style={{ color: '#6b7280', fontWeight: '500' }}>
                          {uploading ? 'Uploading...' : 'Click to upload photos'}
                        </span>
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                          ({5 - uploadedPhotos.length} remaining)
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ color: '#92400e', fontSize: '0.9rem', margin: 0 }}>
                      {selectedHours} {selectedHours === 1 ? 'hour' : 'hours'} × £{service.price}/hour
                    </p>
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#92400e'
                  }}>
                    £{totalPrice.toFixed(2)}
                  </div>
                </div>

                {/* Info Note */}
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#dc2626'
                }}>
                  <strong>Note:</strong> If additional time is needed, you will be informed and charged at the same hourly rate. Our professional will confirm before any extra work.
                </div>
              </div>
            )}

            {/* Customer Details Form */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📋 Your Details
              </h3>

              <div style={{ display: 'grid', gap: '1rem' }}>
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
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                    onBlur={(e) => e.target.style.borderColor = formErrors.fullName ? '#ef4444' : '#e5e7eb'}
                  />
                  {formErrors.fullName && (
                    <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.fullName}</p>
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
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                      onBlur={(e) => e.target.style.borderColor = formErrors.email ? '#ef4444' : '#e5e7eb'}
                    />
                    {formErrors.email && (
                      <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.email}</p>
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
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                      onBlur={(e) => e.target.style.borderColor = formErrors.phone ? '#ef4444' : '#e5e7eb'}
                    />
                    {formErrors.phone && (
                      <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Address Section */}
                <div style={{
                  marginTop: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    📍 Service Address
                  </h4>

                  {/* Address Line 1 */}
                  <div style={{ marginBottom: '1rem' }}>
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
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                      onBlur={(e) => e.target.style.borderColor = formErrors.addressLine1 ? '#ef4444' : '#e5e7eb'}
                    />
                    {formErrors.addressLine1 && (
                      <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.addressLine1}</p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div style={{ marginBottom: '1rem' }}>
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
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  {/* City & Postcode Row */}
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
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          outline: 'none',
                          transition: 'border-color 0.3s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                        onBlur={(e) => e.target.style.borderColor = formErrors.city ? '#ef4444' : '#e5e7eb'}
                      />
                      {formErrors.city && (
                        <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.city}</p>
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
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          outline: 'none',
                          transition: 'border-color 0.3s ease',
                          textTransform: 'uppercase'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                        onBlur={(e) => e.target.style.borderColor = formErrors.postcode ? '#ef4444' : '#e5e7eb'}
                      />
                      {formErrors.postcode && (
                        <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{formErrors.postcode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              {/* Hourly Terms Checkbox */}
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
                      fontSize: '0.9rem',
                      color: '#374151',
                      lineHeight: '1.5'
                    }}>
                      <strong style={{ color: '#d97706' }}>I understand</strong> that I am booking <strong>{selectedHours} {selectedHours === 1 ? 'hour' : 'hours'}</strong> at <strong>£{service.price}/hour</strong> (total: £{totalPrice.toFixed(2)}). 
                      If additional time is needed, I will be informed and charged at the same hourly rate.
                    </span>
                  </label>
                  {formErrors.hourlyTerms && (
                    <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', marginLeft: '28px' }}>{formErrors.hourlyTerms}</p>
                  )}
                </div>
              )}

              {/* General Terms Checkbox */}
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
                    fontSize: '0.9rem',
                    color: '#374151',
                    lineHeight: '1.5'
                  }}>
                    I agree to the <a href="/terms" style={{ color: '#2001AF', textDecoration: 'underline' }}>Terms & Conditions</a> and 
                    <a href="/privacy" style={{ color: '#2001AF', textDecoration: 'underline' }}> Privacy Policy</a>. 
                    I understand that my payment will be processed securely.
                  </span>
                </label>
                {formErrors.terms && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', marginLeft: '28px' }}>{formErrors.terms}</p>
                )}
              </div>
            </div>

            {/* Trust indicators */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1rem'
              }}>
                Why book with Master?
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem'
              }}>
                {[
                  'Instant pricing',
                  'Vetted professionals',
                  'Secure payment',
                  'Satisfaction guaranteed'
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    fontSize: '0.85rem'
                  }}>
                    <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                    <span style={{ color: '#374151' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Summary */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '2rem',
              border: '2px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid #e5e7eb'
              }}>
                Order Summary
              </h2>

              {/* Service Details */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Service</span>
                  <span style={{ fontWeight: '600', color: '#111827', fontSize: '0.9rem', textAlign: 'right', maxWidth: '180px' }}>
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
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Rate</span>
                      <span style={{ fontWeight: '600', color: '#111827', fontSize: '0.9rem' }}>
                        £{parseFloat(service.price).toFixed(2)}/hour
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Hours</span>
                      <span style={{ fontWeight: '600', color: '#d97706', fontSize: '0.9rem' }}>
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
                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Price</span>
                    <span style={{ fontWeight: '600', color: '#111827', fontSize: '0.9rem' }}>
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
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Location</span>
                  <span style={{ color: '#111827', fontSize: '0.9rem' }}>{customerDetails.postcode || postcode}</span>
                </div>
                {isHourlyService && uploadedPhotos.length > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Photos</span>
                    <span style={{ color: '#10b981', fontSize: '0.9rem' }}>
                      {uploadedPhotos.length} attached
                    </span>
                  </div>
                )}
              </div>

              {/* Customer Summary (shows when filled) */}
              {customerDetails.fullName && (
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}>
                  <p style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Contact Details:</p>
                  <p style={{ color: '#6b7280', margin: '0 0 0.25rem 0' }}>{customerDetails.fullName}</p>
                  {customerDetails.email && <p style={{ color: '#6b7280', margin: '0 0 0.25rem 0' }}>{customerDetails.email}</p>}
                  {customerDetails.phone && <p style={{ color: '#6b7280', margin: 0 }}>{customerDetails.phone}</p>}
                </div>
              )}

              {/* Hourly Job Description in Summary */}
              {isHourlyService && hourlyJobDescription && (
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}>
                  <p style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Job Description:</p>
                  <p style={{ color: '#6b7280', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                    {hourlyJobDescription.length > 100 ? hourlyJobDescription.substring(0, 100) + '...' : hourlyJobDescription}
                  </p>
                </div>
              )}

              {/* Hourly Notice in Summary */}
              {isHourlyService && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  color: '#92400e'
                }}>
                  <strong>⏱️ Note:</strong> Additional time may be charged if the job takes longer than {selectedHours} {selectedHours === 1 ? 'hour' : 'hours'}.
                </div>
              )}

              {/* Total */}
              <div style={{
                borderTop: '2px solid #e5e7eb',
                paddingTop: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#020034',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>
                    {isHourlyService ? `Total (${selectedHours}h)` : 'Total'}
                  </span>
                  <span style={{
                    fontSize: '1.75rem',
                    fontWeight: '700'
                  }}>
                    £{totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Form Validation Message */}
              {!isFormValid() && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
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
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#dc2626'
                }}>
                  <AlertCircle size={16} />
                  {paymentError}
                </div>
              )}

              {/* Payment Form */}
              {stripePromise && isFormValid() && clientSecret ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#E94A02',
                      },
                    },
                  }}
                >
                  <PaymentForm
                    onSuccess={handlePaymentSuccess}
                    clientSecret={clientSecret}
                  />
                </Elements>
              ) : stripePromise && isFormValid() && !clientSecret ? (
                <button
                  onClick={createPaymentIntent}
                  disabled={creatingPaymentIntent}
                  style={{
                    width: '100%',
                    backgroundColor: creatingPaymentIntent ? '#9ca3af' : '#E94A02',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: creatingPaymentIntent ? 'not-allowed' : 'pointer',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {creatingPaymentIntent ? (
                    <>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      Preparing payment...
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </button>
              ) : stripePromise && !isFormValid() ? (
                <button
                  onClick={validateForm}
                  style={{
                    width: '100%',
                    backgroundColor: '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                  }}
                >
                  Complete your details to continue
                </button>
              ) : (
                <div style={{
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Loading...</p>
                </div>
              )}

              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                textAlign: 'center',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <Shield size={12} />
                Secure payment • No hidden fees
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 968px) {
          div[style*="grid-template-columns: 1fr 420px"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="position: sticky"] {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default B2CCheckout;
