import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Search, CheckCircle, Clock, Shield, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { matchServicesWithAI, normalizeServiceQuery } from '../lib/openai';
import { getServices, searchServices } from '../lib/services';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

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

/**
 * Get category color
 */
const getCategoryColor = (category) => {
  const colors = {
    'Cleaning': { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    'Certificates': { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    'Plumbing/Electrician': { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
    'Multi Trader': { bg: '#fce7f3', text: '#db2777', border: '#fbcfe8' },
    'Carpenter': { bg: '#fed7aa', text: '#c2410c', border: '#fdba74' },
    'Painter': { bg: '#e0e7ff', text: '#4f46e5', border: '#c7d2fe' }
  };
  return colors[category] || { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
};

const B2CBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // If service is provided, start at step 2 (postcode), otherwise start at step 1 (description)
  const [step, setStep] = useState(location.state?.service ? 2 : 1);
  const [jobDescription, setJobDescription] = useState('');
  const [postcode, setPostcode] = useState('');
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const postcodeInputRef = useRef(null);

  // Initialize with service from navigation if available
  useEffect(() => {
    if (location.state?.service) {
      setJobDescription(location.state.service);
      // If service is provided, skip description step and go to postcode
      setStep(2);
    }
  }, [location.state]);

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
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
    
    try {
      // Fetch all services from Supabase
      const allServices = await getServices();
      let servicesFromDB = allServices;
      
      // If we have a job description, use AI to match services
      if (jobDescription.trim()) {
        const normalizedQuery = normalizeServiceQuery(jobDescription);
        const originalQuery = jobDescription.trim().toLowerCase();
        
        // Try AI matching first with original query
        try {
          const aiMatched = await matchServicesWithAI(originalQuery, allServices);
          if (aiMatched && aiMatched.length > 0) {
            servicesFromDB = aiMatched;
          } else {
            // AI returned empty, try database search with both original and normalized
            let dbSearch = await searchServices(originalQuery);
            if ((!dbSearch || dbSearch.length === 0) && normalizedQuery !== originalQuery) {
              dbSearch = await searchServices(normalizedQuery);
            }
            
            if (dbSearch && dbSearch.length > 0) {
              servicesFromDB = dbSearch;
            } else {
              // No matches found - show all services but with a note
              servicesFromDB = allServices;
            }
          }
        } catch (aiError) {
          // Fall back to database search with both queries
          let dbSearch = await searchServices(originalQuery);
          if ((!dbSearch || dbSearch.length === 0) && normalizedQuery !== originalQuery) {
            dbSearch = await searchServices(normalizedQuery);
          }
          servicesFromDB = dbSearch && dbSearch.length > 0 ? dbSearch : allServices;
        }
      }
      
      // Transform Supabase services to match the expected format (V2 schema)
      const transformedServices = servicesFromDB.map(service => {
        // Get price from new schema (price) or fallback to old schema (master_price)
        const price = service.price 
          ? parseFloat(service.price) 
          : (service.master_price ? parseFloat(service.master_price) : 0);
        
        // Get service name from new schema (service) or old schema (service_name)
        const serviceName = service.service || service.service_name || 'Service';
        
        return {
          id: service.id,
          title: serviceName,
          description: service.description || 'Professional service',
          price: price,
          priceType: service.price_type || 'fixed', // 'fixed', 'from', 'hourly', 'per_unit'
          priceUnit: service.price_unit || service.unit || '',
          idealFor: service.ideal_for || '',
          notes: service.notes || '',
          duration: service.duration_estimate || service.duration || '1-2 hours',
          rating: 4.8 + (Math.random() * 0.2), // 4.8 - 5.0
          reviews: Math.floor(Math.random() * 500) + 200,
          image: getServiceImage(service),
          category: service.category,
          keywords: service.keywords || [],
          originalService: service
        };
      });
      
      
      // If no services found, use mock services as fallback
      if (transformedServices.length === 0) {
        setAvailableServices(mockServices);
      } else {
        setAvailableServices(transformedServices);
      }
      
      setLoading(false);
      setStep(3);
    } catch (error) {
      // Fallback to mock services on error
      setAvailableServices(mockServices);
      setLoading(false);
      setStep(3);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    // Check if service is cleaning-related
    const cleaningKeywords = ['cleaning', 'clean', 'deep clean', 'end of tenancy', 'upholstery'];
    const isCleaning = cleaningKeywords.some(keyword => 
      service.title.toLowerCase().includes(keyword) || 
      jobDescription.toLowerCase().includes(keyword)
    );
    
    if (isCleaning) {
      // Navigate to cleaning-specific booking form
      navigate('/cleaning-booking', { state: { service, postcode, jobDescription } });
    } else {
      // Navigate to standard checkout
      navigate('/checkout', { state: { service, postcode, jobDescription } });
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fbfbfd',
      overflowX: 'hidden',
      width: '100%',
      maxWidth: '100vw'
    }}>
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

      <div className="container" style={{ padding: '2rem 0' }}>
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

        {/* Step 3: Available Services */}
        {step === 3 && (
          <div>
            {/* Header with search info */}
            <div style={{ 
              marginBottom: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#2001AF',
                    marginBottom: '0.5rem'
                  }}>
                    {availableServices.length} services found
                  </h1>
                  <p style={{ color: '#6b7280', margin: 0 }}>
                    {jobDescription && (
                      <>Searching for "<strong>{jobDescription}</strong>" in </>
                    )}
                    <strong>{postcode}</strong>
                  </p>
                </div>
                
                {/* Trust badges */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
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
            </div>

            {/* Services Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {availableServices.map((service) => {
                const categoryColors = getCategoryColor(service.category);
                
                return (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '1rem',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid #e5e7eb'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(32, 1, 175, 0.15)';
                      e.currentTarget.style.borderColor = '#2001AF';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    {/* Header with category badge and price - No image */}
                    <div style={{
                      width: '100%',
                      height: '100px',
                      background: 'linear-gradient(135deg, #2001AF 0%, #4F46E5 50%, #7C3AED 100%)',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {/* Decorative pattern */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.1,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                      }} />
                      {/* Category Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        padding: '0.35rem 0.75rem',
                        backgroundColor: categoryColors.bg,
                        color: categoryColors.text,
                        borderRadius: '2rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        border: `1px solid ${categoryColors.border}`
                      }}>
                        {service.category}
                      </div>
                      {/* Price Badge */}
                      <div style={{
                        position: 'absolute',
                        bottom: '0.75rem',
                        right: '0.75rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        color: '#2001AF',
                        borderRadius: '0.5rem',
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}>
                        {service.priceType === 'from' && <span style={{ fontSize: '0.75rem', fontWeight: '400' }}>From </span>}
                        £{typeof service.price === 'number' ? service.price.toFixed(2) : parseFloat(service.price || 0).toFixed(2)}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.25rem' }}>
                      {/* Title */}
                      <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 0.5rem 0',
                        lineHeight: '1.3'
                      }}>
                        {service.title}
                      </h3>

                      {/* Description */}
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        marginBottom: '0.75rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {service.description}
                      </p>

                      {/* Ideal For */}
                      {service.idealFor && (
                        <p style={{
                          color: '#059669',
                          fontSize: '0.8rem',
                          marginBottom: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          ✓ Ideal for: {service.idealFor}
                        </p>
                      )}

                      {/* Notes */}
                      {service.notes && (
                        <p style={{
                          color: '#9ca3af',
                          fontSize: '0.75rem',
                          marginBottom: '0.75rem',
                          padding: '0.5rem',
                          backgroundColor: '#f9fafb',
                          borderRadius: '0.25rem'
                        }}>
                          ℹ️ {service.notes}
                        </p>
                      )}

                      {/* Stats row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #f3f4f6',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Star size={14} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                          <span style={{
                            color: '#111827',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                          }}>
                            {service.rating.toFixed(1)}
                          </span>
                          <span style={{
                            color: '#9ca3af',
                            fontSize: '0.8rem'
                          }}>
                            ({service.reviews} reviews)
                          </span>
                        </div>
                        {service.priceUnit && (
                          <span style={{
                            color: '#6b7280',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {service.priceUnit}
                          </span>
                        )}
                      </div>

                      {/* CTA Button */}
                      <button style={{
                        width: '100%',
                        backgroundColor: '#2001AF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.875rem',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#1a0199';
                        e.target.style.transform = 'scale(1.02)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#2001AF';
                        e.target.style.transform = 'scale(1)';
                      }}
                      >
                        Book Now
                        <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No results message */}
            {availableServices.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}>
                <Search size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
                <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>No services found</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  Try searching with different keywords or browse our categories
                </p>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    backgroundColor: '#2001AF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default B2CBooking;
