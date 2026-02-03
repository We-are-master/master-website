import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Search, CheckCircle, Clock, Shield, Trash2, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { matchServicesWithAI, normalizeServiceQuery } from '../lib/openai';
import { getServices, searchServices } from '../lib/services';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { SEO } from '../components/SEO';

/**
 * Custom Service Request Banner Component
 * Shows at the end of services list, allowing users to submit a custom request
 */
const CustomServiceRequestBanner = ({ searchQuery, onBack, compact = false }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceDescription: searchQuery || '',
    location: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('custom-service-request', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          serviceDescription: formData.serviceDescription,
          location: formData.location,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          searchQuery: searchQuery
        }
      });

      if (error) {
        throw error;
      }

      setSubmitted(true);
      toast.success(data?.message || 'Your custom service request has been submitted successfully!');
    } catch (error) {
      console.error('Error submitting custom request:', error);
      toast.error('Failed to submit request. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb'
      }}>
        <CheckCircle size={48} style={{ color: '#E94A02', marginBottom: '1rem' }} />
        <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Request Submitted!</h3>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          We've received your custom service request. Our team will contact you soon to discuss your needs.
        </p>
        <button
          onClick={onBack}
          style={{
            backgroundColor: '#E94A02',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#d13d00';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#E94A02';
            e.target.style.transform = 'scale(1)';
          }}
        >
          Search Again
        </button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div style={{
        textAlign: 'center',
        padding: compact ? '2rem 1.5rem' : '3rem 2rem',
        background: 'linear-gradient(135deg, #E94A02 0%, #d13d00 100%)',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb',
        color: 'white'
      }}>
        <Search size={compact ? 36 : 48} style={{ color: 'white', marginBottom: compact ? '0.75rem' : '1rem', opacity: 0.9 }} />
        <h3 style={{ 
          color: 'white', 
          marginBottom: compact ? '0.5rem' : '0.5rem', 
          fontSize: compact ? '1.25rem' : '1.5rem', 
          fontWeight: '600' 
        }}>
          {compact ? "Need something else?" : "Didn't find what you're looking for?"}
        </h3>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          marginBottom: compact ? '1rem' : '1.5rem', 
          fontSize: compact ? '0.9375rem' : '1rem' 
        }}>
          {compact 
            ? "Create a custom service request and we'll get back to you with a personalized quote."
            : "No problem! Create a custom service request and we'll get back to you with a personalized quote."
          }
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: 'white',
              color: '#E94A02',
              border: 'none',
              borderRadius: '0.5rem',
              padding: compact ? '0.625rem 1.25rem' : '0.75rem 1.5rem',
              fontSize: compact ? '0.9375rem' : '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 12px rgba(233, 74, 2, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Create Custom Request
          </button>
          {!compact && (
            <button
              onClick={onBack}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#374151', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
          Create Custom Service Request
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Tell us about your service needs and we'll get back to you with a personalized quote.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
            Your Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
            Email <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
            Service Description <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            name="serviceDescription"
            value={formData.serviceDescription}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="Describe the service you need..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., London, SW1A 1AA"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
              Preferred Date
            </label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500', fontSize: '0.875rem' }}>
              Preferred Time
            </label>
            <select
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            >
              <option value="">Select time</option>
              <option value="morning">Morning (8am - 12pm)</option>
              <option value="afternoon">Afternoon (12pm - 5pm)</option>
              <option value="evening">Evening (5pm - 8pm)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              flex: 1,
              backgroundColor: submitting ? '#9ca3af' : '#E94A02',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.target.style.backgroundColor = '#d13d00';
                e.target.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.target.style.backgroundColor = '#E94A02';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            style={{
              backgroundColor: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Get service-specific image based on category and service name
 * @param {Object} service - Service object with category and service
 * @returns {string} Image URL
 */
const getServiceImage = (service) => {
  const category = (service.category || '').toLowerCase();
  const serviceName = (service.service || service.service_name || '').toLowerCase();
  
  // If service has image_url, use it
  if (service.image_url) {
    return service.image_url;
  }
  
  // Cleaning services
  if (category.includes('cleaning')) {
    if (serviceName.includes('oven')) {
      return 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=300&fit=crop';
    }
    if (serviceName.includes('carpet') || serviceName.includes('rug')) {
      return 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=300&fit=crop';
    }
    if (serviceName.includes('sofa') || serviceName.includes('upholstery')) {
      return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop';
    }
    if (serviceName.includes('end of tenancy') || serviceName.includes('move out')) {
      return 'https://images.unsplash.com/photo-1527515545081-5db817172677?w=400&h=300&fit=crop';
    }
    if (serviceName.includes('deep clean')) {
      return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop';
    }
    if (serviceName.includes('after builder')) {
      return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop';
  }
  
  // Certificates
  if (category.includes('certificate')) {
    if (serviceName.includes('eicr') || serviceName.includes('electrical')) {
      return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop';
    }
    if (serviceName.includes('gas')) {
      return 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop';
    }
    if (serviceName.includes('fire')) {
      return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
    }
    if (serviceName.includes('pat')) {
      return 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop';
  }
  
  // Plumbing/Electrician services
  if (category.includes('plumbing') || category.includes('electrician')) {
    return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop';
  }
  
  // Multi Trader / Handyman services
  if (category.includes('multi trader') || category.includes('handyman')) {
    return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop';
  }
  
  // Carpenter services
  if (category.includes('carpenter')) {
    if (serviceName.includes('door')) {
      return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
    }
    if (serviceName.includes('flooring') || serviceName.includes('floor')) {
      return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop';
  }
  
  // Painter services
  if (category.includes('painter')) {
    return 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop';
  }
  
  // Default fallback
  const imageOptions = [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop'
  ];
  
  if (service.id) {
    const hash = service.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return imageOptions[hash % imageOptions.length];
  }
  
  return imageOptions[0];
};

/** Brand font used across the site */
const BRAND_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';

/**
 * Get category color – brand orange tint
 */
const getCategoryColor = (category) => {
  return {
    bg: 'rgba(233, 74, 2, 0.12)',
    text: '#E94A02',
    border: 'rgba(233, 74, 2, 0.3)'
  };
};

/** Timeout for loading services (AI/DB can hang); after this we show fallback. */
const SERVICES_LOAD_TIMEOUT_MS = 15000;

const B2CBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // If service is provided, start at step 2 (postcode), otherwise start at step 1 (description)
  // When both service and postcode come from home, go straight to step 3 (services list)
  const hasServiceAndPostcodeFromState = !!(location.state?.service && location.state?.postcode);
  const [step, setStep] = useState(hasServiceAndPostcodeFromState ? 3 : (location.state?.service ? 2 : 1));
  const [jobDescription, setJobDescription] = useState(location.state?.service || '');
  const [postcode, setPostcode] = useState(location.state?.postcode || '');
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(hasServiceAndPostcodeFromState);
  const [selectedService, setSelectedService] = useState(null);
  const [cart, setCart] = useState([]); // { service, quantity }[]
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const postcodeInputRef = useRef(null);

  const BOOKING_FEE = 5;

  const addToCart = (service) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.service.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.service.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
  };

  const removeFromCart = (serviceId) => {
    setCart((prev) => prev.filter((item) => item.service.id !== serviceId));
  };

  const isInCart = (serviceId) => cart.some((item) => item.service.id === serviceId);

  const cartSubtotal = cart.reduce((sum, item) => sum + (parseFloat(item.service.price) || 0) * item.quantity, 0);
  const cartTotal = cartSubtotal + BOOKING_FEE;

  // When arriving from home with both service + postcode: load services and show step 3 (no postcode step)
  useEffect(() => {
    const serviceFromState = location.state?.service;
    const postcodeFromState = location.state?.postcode;
    if (!serviceFromState || !postcodeFromState) return;

    setJobDescription(serviceFromState);
    setPostcode(postcodeFromState);
    setLoading(true);

    let cancelled = false;
    const loadPromise = (async () => {
      try {
        const jobDesc = String(serviceFromState).trim();
        let servicesFromDB;

        if (jobDesc) {
          const normalizedQuery = normalizeServiceQuery(jobDesc);
          const originalQuery = jobDesc.toLowerCase();
          let dbSearch = await searchServices(normalizedQuery);
          if (!dbSearch?.length && normalizedQuery !== originalQuery) {
            dbSearch = await searchServices(originalQuery);
          }
          if (dbSearch?.length > 0) {
            servicesFromDB = dbSearch;
          } else {
            const allServices = await getServices();
            try {
              const aiMatched = await matchServicesWithAI(originalQuery, allServices);
              servicesFromDB = (aiMatched?.length > 0) ? aiMatched : allServices;
            } catch {
              servicesFromDB = allServices;
            }
          }
        } else {
          servicesFromDB = await getServices();
        }

        const transformedServices = servicesFromDB.map(service => {
          const price = service.price
            ? parseFloat(service.price)
            : (service.master_price ? parseFloat(service.master_price) : 0);
          const serviceName = service.service || service.service_name || 'Service';
          return {
            id: service.id,
            title: serviceName,
            description: service.description || 'Professional service',
            price,
            priceType: service.price_type || 'fixed',
            priceUnit: service.price_unit || service.unit || '',
            idealFor: service.ideal_for || '',
            notes: service.notes || '',
            duration: service.duration_estimate || service.duration || '1-2 hours',
            rating: 4.8 + (Math.random() * 0.2),
            reviews: Math.floor(Math.random() * 500) + 200,
            image: getServiceImage(service),
            category: service.category,
            keywords: service.keywords || [],
            originalService: service
          };
        });

        if (!cancelled) {
          setAvailableServices(transformedServices.length === 0 ? mockServices : transformedServices);
        }
      } catch {
        if (!cancelled) setAvailableServices(mockServices);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setStep(3);
        }
      }
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), SERVICES_LOAD_TIMEOUT_MS)
    );

    Promise.race([loadPromise, timeoutPromise]).catch(() => {
      if (!cancelled) {
        setAvailableServices(mockServices);
        setLoading(false);
        setStep(3);
        toast.info('Taking longer than usual – showing available services.');
      }
    });

    return () => { cancelled = true; };
  }, [location.state?.service, location.state?.postcode]);

  // Load Google Maps script dynamically
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      return;
    }

    // Check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsGoogleLoaded(true);
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const checkGoogle = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsGoogleLoaded(true);
        }
      };
      existingScript.addEventListener('load', checkGoogle);
      checkGoogle(); // Check immediately
      return () => {
        existingScript.removeEventListener('load', checkGoogle);
      };
    }

    // Load script if not already loaded
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleLoaded(true);
    };
    script.onerror = () => {
      setIsGoogleLoaded(false);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize Google Places Autocomplete
  const placesAutocomplete = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'gb' }, // Restrict to UK
      types: ['postal_code'], // Focus on postcodes
    },
    debounce: 300,
    initOnMount: false,
  });

  const {
    ready,
    value: autocompleteValue,
    setValue: setAutocompleteValue,
    suggestions: { status, data },
    clearSuggestions,
    init,
  } = placesAutocomplete;

  // Initialize the hook when Google Maps is loaded
  useEffect(() => {
    if (isGoogleLoaded && window.google && window.google.maps && window.google.maps.places && !ready) {
      init();
    }
  }, [isGoogleLoaded, ready, init]);

  // When step 3 has cart: add body class so App gets padding-bottom and footer isn't cut off by fixed summary
  useEffect(() => {
    if (step === 3 && cart.length > 0) {
      document.body.classList.add('booking-step3-has-summary');
    }
    return () => {
      document.body.classList.remove('booking-step3-has-summary');
    };
  }, [step, cart.length]);

  const handleSelectSuggestion = async (suggestion) => {
    const address = suggestion.description;
    setAutocompleteValue(address, false);
    clearSuggestions();
    setShowSuggestions(false);
    
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      // Extract postcode from the address
      const postcodeMatch = address.match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i);
      if (postcodeMatch) {
        setPostcode(postcodeMatch[0].toUpperCase());
      } else {
        setPostcode(address.toUpperCase().replace(/[^A-Z0-9\s]/g, ''));
      }
    } catch (error) {
      const postcodeMatch = address.match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i);
      if (postcodeMatch) {
        setPostcode(postcodeMatch[0].toUpperCase());
      }
    }
  };

  // Mock available services - in production, this would come from your database
  const mockServices = [
    {
      id: 1,
      title: 'TV Mounting',
      description: 'Professional TV mounting service. Our expert will securely mount your TV to the wall exactly where you want it.',
      price: 69,
      duration: '1-2 hours',
      rating: 4.9,
      reviews: 1247,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Handyman Services',
      description: 'General handyman services for odd jobs around your home. From furniture assembly to minor repairs.',
      price: 45,
      duration: '1-3 hours',
      rating: 4.8,
      reviews: 892,
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Flatpack Assembly',
      description: 'Professional furniture assembly service. We\'ll put together your flatpack furniture quickly and correctly.',
      price: 55,
      duration: '1-2 hours',
      rating: 4.9,
      reviews: 634,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      title: 'Light Fitting Replacement',
      description: 'Safe and professional light fitting installation and replacement service.',
      price: 65,
      duration: '1 hour',
      rating: 4.7,
      reviews: 456,
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      title: 'Picture Hanging',
      description: 'Professional picture and artwork hanging service. We\'ll hang your pictures perfectly level.',
      price: 35,
      duration: '30 mins - 1 hour',
      rating: 4.8,
      reviews: 321,
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop'
    },
    {
      id: 6,
      title: 'Minor Repairs',
      description: 'Quick fixes and small repairs around your home. From door handles to leaky taps.',
      price: 50,
      duration: '1-2 hours',
      rating: 4.6,
      reviews: 789,
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop'
    },
    {
      id: 7,
      title: 'Cleaning Services',
      description: 'Professional cleaning services including deep clean, end of tenancy, after builders, and upholstery cleaning.',
      price: 0, // Price calculated dynamically
      duration: 'Varies',
      rating: 4.9,
      reviews: 2156,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'
    }
  ];

  const handleDescriptionSubmit = (e) => {
    e.preventDefault();
    if (jobDescription.trim()) {
      setStep(2);
    }
  };

  const handlePostcodeSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use autocomplete value if available, otherwise use postcode state
    const valueToValidate = ready && autocompleteValue ? autocompleteValue : postcode;
    const trimmedPostcode = valueToValidate.trim();
    
    if (!trimmedPostcode) {
      toast.error('Please enter a postcode');
      return;
    }

    // Extract postcode from the value (might be full address)
    const postcodeMatch = trimmedPostcode.match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i);
    const finalPostcode = postcodeMatch ? postcodeMatch[0].toUpperCase() : trimmedPostcode.toUpperCase().replace(/[^A-Z0-9\s]/g, '');

    // Basic UK postcode validation (more lenient)
    const postcodePattern = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;
    if (!postcodePattern.test(finalPostcode)) {
      toast.error('Please enter a valid UK postcode (e.g., SW1A 1AA, M1 1AA)');
      return;
    }

    // Update postcode state with the extracted value
    setPostcode(finalPostcode);

    setLoading(true);

    const loadPromise = (async () => {
      try {
        let servicesFromDB;

        // Fast path: try DB search first (no OpenAI, no full getServices when we have a query)
        if (jobDescription.trim()) {
          const normalizedQuery = normalizeServiceQuery(jobDescription);
          const originalQuery = jobDescription.trim().toLowerCase();

          let dbSearch = await searchServices(normalizedQuery);
          if (!dbSearch?.length && normalizedQuery !== originalQuery) {
            dbSearch = await searchServices(originalQuery);
          }

          if (dbSearch?.length > 0) {
            servicesFromDB = dbSearch;
          } else {
            // DB search returned nothing: fetch all and use AI as fallback
            const allServices = await getServices();
            try {
              const aiMatched = await matchServicesWithAI(originalQuery, allServices);
              servicesFromDB = (aiMatched?.length > 0) ? aiMatched : allServices;
            } catch {
              servicesFromDB = allServices;
            }
          }
        } else {
          servicesFromDB = await getServices();
        }

        // Transform Supabase services to match the expected format (V2 schema)
        const transformedServices = servicesFromDB.map(service => {
          const price = service.price
            ? parseFloat(service.price)
            : (service.master_price ? parseFloat(service.master_price) : 0);
          const serviceName = service.service || service.service_name || 'Service';
          return {
            id: service.id,
            title: serviceName,
            description: service.description || 'Professional service',
            price,
            priceType: service.price_type || 'fixed',
            priceUnit: service.price_unit || service.unit || '',
            idealFor: service.ideal_for || '',
            notes: service.notes || '',
            duration: service.duration_estimate || service.duration || '1-2 hours',
            rating: 4.8 + (Math.random() * 0.2),
            reviews: Math.floor(Math.random() * 500) + 200,
            image: getServiceImage(service),
            category: service.category,
            keywords: service.keywords || [],
            originalService: service
          };
        });

        if (transformedServices.length === 0) {
          setAvailableServices(mockServices);
        } else {
          setAvailableServices(transformedServices);
        }
        setLoading(false);
        setStep(3);
      } catch {
        setAvailableServices(mockServices);
        setLoading(false);
        setStep(3);
      }
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), SERVICES_LOAD_TIMEOUT_MS)
    );

    Promise.race([loadPromise, timeoutPromise]).catch(() => {
      setAvailableServices(mockServices);
      setLoading(false);
      setStep(3);
      toast.info('Taking longer than usual – showing available services.');
    });
  };

  const handleContinueToCheckout = () => {
    if (cart.length === 0) return;
    const service = cart[0].service;
    const cleaningKeywords = ['cleaning', 'clean', 'deep clean', 'end of tenancy', 'upholstery'];
    const isCleaning = cleaningKeywords.some(keyword =>
      service.title.toLowerCase().includes(keyword) ||
      jobDescription.toLowerCase().includes(keyword)
    );
    if (isCleaning) {
      navigate('/cleaning-booking', { state: { service, postcode, jobDescription, services: cart } });
    } else {
      navigate('/checkout', { state: { service, postcode, jobDescription, services: cart } });
    }
  };

  return (
    <>
      <SEO 
        title="Book a Service - Master Services"
        description="Book your property maintenance or cleaning service with Master Services. Easy online booking, same-day service available, vetted professionals."
        keywords="book property maintenance, book cleaning service, online booking, same-day service booking"
      />
      <div
        className="booking-page-root"
        style={{
          minHeight: '100vh',
          backgroundColor: '#fbfbfd',
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100%'
        }}
      >
      {/* Header */}
      <div style={{
        backgroundColor: '#fbfbfd',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '1.25rem 0'
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
              color: '#1d1d1f',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: '400',
              transition: 'color 0.2s ease',
              letterSpacing: '-0.01em'
            }}
            onMouseEnter={(e) => e.target.style.color = '#E94A02'}
            onMouseLeave={(e) => e.target.style.color = '#1d1d1f'}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </div>

      <div className={`container${step === 3 ? ' booking-step3-container' : ''}`} style={{ padding: '2rem 0' }}>
        {/* Step 1: Job Description */}
        {step === 1 && (
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#2001AF',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              Describe your job
            </h1>
            <p style={{
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              Tell us what you need help with
            </p>

            <form onSubmit={handleDescriptionSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  What do you need done?
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="e.g., Mount my TV on the wall, Assemble flatpack furniture, Fix a leaky tap..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#2001AF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '1rem 2rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1a0199'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2001AF'}
              >
                Continue
                <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Postcode */}
        {step === 2 && (
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '3rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '600',
              color: '#1d1d1f',
              marginBottom: '0.75rem',
              textAlign: 'center',
              letterSpacing: '-0.03em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              Enter your postcode
            </h1>
            {jobDescription && (
              <p style={{
                color: '#86868b',
                textAlign: 'center',
                marginBottom: '0.5rem',
                fontSize: '0.9375rem',
                fontWeight: '400'
              }}>
                Service: <strong style={{ color: '#E94A02', fontWeight: '600' }}>{jobDescription}</strong>
              </p>
            )}
            <p style={{
              color: '#86868b',
              textAlign: 'center',
              marginBottom: '2.5rem',
              fontSize: '1rem',
              lineHeight: '1.5',
              fontWeight: '400'
            }}>
              We need your location to show available services
            </p>

            <form onSubmit={handlePostcodeSubmit}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#1d1d1f',
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.01em'
                }}>
                  Postcode
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <div 
                    id="postcode-container"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid rgba(0,0,0,0.2)',
                      borderRadius: '8px',
                      padding: '0.875rem 1rem',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      width: '100%',
                      backgroundColor: 'white'
                    }}
                  >
                    <MapPin size={20} style={{ color: '#86868b', marginRight: '0.75rem', flexShrink: 0 }} />
                    <input
                      ref={postcodeInputRef}
                      type="text"
                      id="postcode-input"
                      value={ready ? autocompleteValue : postcode}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (ready) {
                          setAutocompleteValue(value, true);
                          setShowSuggestions(true);
                          // Extract postcode from value as user types
                          const postcodeMatch = value.match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i);
                          if (postcodeMatch) {
                            setPostcode(postcodeMatch[0].toUpperCase());
                          } else {
                            const upperValue = value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
                            setPostcode(upperValue);
                          }
                        } else {
                          const upperValue = value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
                          setPostcode(upperValue);
                        }
                      }}
                      onBlur={(e) => {
                        const container = document.getElementById('postcode-container');
                        if (container) {
                          container.style.borderColor = 'rgba(0,0,0,0.2)'
                          container.style.boxShadow = 'none'
                        }
                        // Extract postcode from final value if user typed manually
                        if (ready && autocompleteValue) {
                          const postcodeMatch = autocompleteValue.match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i);
                          if (postcodeMatch) {
                            setPostcode(postcodeMatch[0].toUpperCase());
                          }
                        }
                        // Delay to allow click on suggestions
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      placeholder="e.g., SW1A 1AA"
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        background: 'transparent',
                        minWidth: 0,
                        color: '#1d1d1f'
                      }}
                      onFocus={(e) => {
                        const container = document.getElementById('postcode-container');
                        if (container) {
                          container.style.borderColor = '#E94A02'
                          container.style.boxShadow = '0 0 0 3px rgba(233, 74, 2, 0.1)'
                        }
                        if (ready) {
                          setShowSuggestions(true);
                        }
                      }}
                      disabled={!ready && isGoogleLoaded === false}
                      autoFocus
                      required
                    />
                  </div>
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && ready && status === 'OK' && data && data.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.5rem)',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
                      zIndex: 1000,
                      maxHeight: '300px',
                      overflowY: 'auto',
                      marginTop: '0.5rem'
                    }}>
                      {data.map((suggestion) => (
                        <div
                          key={suggestion.place_id}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          style={{
                            padding: '0.875rem 1rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f7'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                          <div style={{
                            fontSize: '0.9375rem',
                            fontWeight: '500',
                            color: '#1d1d1f',
                            marginBottom: '0.25rem',
                            letterSpacing: '-0.01em'
                          }}>
                            {suggestion.structured_formatting.main_text}
                          </div>
                          <div style={{
                            fontSize: '0.8125rem',
                            color: '#86868b',
                            fontWeight: '400'
                          }}>
                            {suggestion.structured_formatting.secondary_text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p style={{
                  fontSize: '0.8125rem',
                  color: '#86868b',
                  marginTop: '0.75rem',
                  fontWeight: '400'
                }}>
                  Enter a UK postcode (e.g., SW1A 1AA, M1 1AA, B33 8TH)
                </p>
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
                {loading ? 'Loading...' : "Let's go!"}
                {!loading && <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Available Services - Cart + Summary layout */}
        {step === 3 && (
          <div className="booking-step3-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: BRAND_FONT, width: '100%', minWidth: 0 }}>
            {/* Header with search info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ecfdf5',
                  borderRadius: '2rem',
                  fontSize: '0.875rem',
                  color: '#059669',
                  fontWeight: '500'
                }}>
                  <Shield size={16} />
                  Fully Insured
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '2rem',
                  fontSize: '0.875rem',
                  color: '#d97706',
                  fontWeight: '500'
                }}>
                  <CheckCircle size={16} />
                  Vetted Pros
                </div>
              </div>
            </div>

            <div
              className="booking-step3-layout"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2rem',
                alignItems: 'start'
              }}
            >
              {/* Left: Your services (cart) + Other services grid */}
              <div className={`booking-step3-content${cart.length > 0 ? ' booking-step3-content-has-summary' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '1' }}>
                {/* Your services - selected items */}
                {cart.length > 0 && (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    border: '1px solid #f3f4f6',
                    fontFamily: BRAND_FONT
                  }}>
                    <h2 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: '1rem',
                      fontFamily: BRAND_FONT
                    }}>
                      Your services
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {cart.map(({ service, quantity }) => (
                        <div
                          key={service.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.75rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '0.5rem'
                          }}
                        >
                          <img
                            src={service.image}
                            alt=""
                            style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', color: '#111827' }}>{service.title}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {quantity} × £{(parseFloat(service.price) || 0).toFixed(2)} = £{((parseFloat(service.price) || 0) * quantity).toFixed(2)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(service.id)}
                            style={{
                              padding: '0.5rem',
                              border: 'none',
                              background: 'transparent',
                              color: '#6b7280',
                              cursor: 'pointer',
                              borderRadius: 8
                            }}
                            aria-label="Remove"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

            {loading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                gap: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e5e7eb',
                  borderTopColor: '#E94A02',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
            <div className="booking-step3-services-grid">
              {availableServices.map((service) => {
                const categoryColors = getCategoryColor(service.category);
                const added = isInCart(service.id);
                return (
                  <div
                    key={service.id}
                    className="booking-step3-service-card"
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      transition: 'box-shadow 0.2s ease',
                      border: '1px solid #f3f4f6',
                      fontFamily: BRAND_FONT
                    }}
                  >
                    {/* Minimal header: category + price on one line */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '1rem 1.25rem 0',
                      flexWrap: 'wrap',
                      flexShrink: 0
                    }}>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        backgroundColor: categoryColors.bg,
                        color: categoryColors.text,
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        border: `1px solid ${categoryColors.border}`,
                        fontFamily: BRAND_FONT
                      }}>
                        {service.category}
                      </span>
                      <span style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: '#2001AF',
                        fontFamily: BRAND_FONT
                      }}>
                        {service.priceType === 'from' && <span style={{ fontSize: '0.75rem', fontWeight: '400' }}>From </span>}
                        £{typeof service.price === 'number' ? service.price.toFixed(2) : parseFloat(service.price || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Content: área flex para botão ficar sempre no fim e tamanho igual entre cards */}
                    <div className="booking-step3-card-content" style={{ padding: '1rem 1.25rem 1.25rem' }}>
                      <h3 style={{
                        fontSize: '1.0625rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 0.5rem 0',
                        lineHeight: '1.35',
                        fontFamily: BRAND_FONT,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {service.title}
                      </h3>

                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.8125rem',
                        lineHeight: '1.45',
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontFamily: BRAND_FONT
                      }}>
                        {service.description}
                      </p>

                      {/* Add to booking / Task added */}
                      <button
                        className="booking-step3-card-cta"
                        type="button"
                        onClick={(e) => { e.stopPropagation(); addToCart(service); }}
                        style={{
                          width: '100%',
                          backgroundColor: isInCart(service.id) ? '#E94A02' : '#2001AF',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          padding: '0.875rem',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: isInCart(service.id) ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          fontFamily: BRAND_FONT
                        }}
                        onMouseOver={(e) => {
                          if (!isInCart(service.id)) {
                            e.target.style.backgroundColor = '#1a0199';
                            e.target.style.transform = 'scale(1.02)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isInCart(service.id)) {
                            e.target.style.backgroundColor = '#2001AF';
                            e.target.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        {isInCart(service.id) ? (
                          <>
                            <Check size={18} />
                            Task added
                          </>
                        ) : (
                          <>
                            Add to booking
                            <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}

                {/* Custom Request Banner - Always shown at the end */}
                {!loading && (
                  <div style={{ 
                    gridColumn: '1 / -1', 
                    marginTop: availableServices.length > 0 ? '2rem' : '0' 
                  }}>
                    <CustomServiceRequestBanner 
                      searchQuery={jobDescription}
                      onBack={() => setStep(1)}
                      compact={availableServices.length > 0}
                    />
                  </div>
                )}
              </div>

              {/* Right: Your summary (sticky; fixed at bottom on mobile) – only when cart has items */}
              {cart.length > 0 && (
              <div
                className="booking-summary-box"
                style={{
                  position: 'sticky',
                  top: '1.5rem',
                  width: '100%',
                  maxWidth: '380px',
                  minWidth: 0,
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  padding: '1rem 1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #f3f4f6',
                  alignSelf: 'start',
                  fontFamily: BRAND_FONT
                }}
              >
                <h2 style={{
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '0.5rem',
                  fontFamily: BRAND_FONT
                }}>
                  Your summary
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.5rem' }}>
                  {cart.map(({ service, quantity }) => {
                    const lineTotal = (parseFloat(service.price) || 0) * quantity;
                    return (
                      <div
                        key={service.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.375rem',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ color: '#111827' }}>{quantity}× {service.title}</span>
                          <span style={{ color: '#6b7280', fontWeight: '600', marginLeft: '0.25rem' }}>£{lineTotal.toFixed(2)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(service.id)}
                          style={{
                            padding: '0.2rem',
                            border: 'none',
                            background: 'transparent',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                          aria-label="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#6b7280' }}>
                    <span>Subtotal</span>
                    <span>£{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#6b7280' }}>
                    <span>Booking fee</span>
                    <span>£{BOOKING_FEE.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', fontWeight: '700', color: '#2001AF', marginTop: '0.25rem', fontFamily: BRAND_FONT }}>
                    <span>Total</span>
                    <span>£{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleContinueToCheckout}
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    backgroundColor: '#E94A02',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    fontFamily: BRAND_FONT
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#d13d00';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#E94A02';
                  }}
                >
                  Continue to Checkout
                  <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                </button>
              </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default B2CBooking;
