import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Search, CheckCircle, Clock, Shield, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { matchServicesWithAI, normalizeServiceQuery } from '../lib/openai';
import { getServices, searchServices } from '../lib/services';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

/**
 * Get service-specific image based on category, type, and service name
 * @param {Object} service - Service object with category, type, and service_name
 * @returns {string} Image URL
 */
const getServiceImage = (service) => {
  const category = (service.category || '').toLowerCase();
  const type = (service.type || '').toLowerCase();
  const serviceName = (service.service_name || '').toLowerCase();
  
  // If service has image_url, use it
  if (service.image_url) {
    return service.image_url;
  }
  
  // Map images based on service category and type
  // Carpenter services
  if (category.includes('carpenter')) {
    // Bolt services - hardware/security focused
    if (serviceName.includes('bolt')) {
      // Use a hardware/security related image for bolts
      return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
    }
    // Door installation services
    if (serviceName.includes('door')) {
      // Use a door/carpentry focused image
      return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop';
    }
    // Flooring services
    if (serviceName.includes('flooring') || serviceName.includes('skirting') || serviceName.includes('carpet')) {
      return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop';
    }
    // Frame and hinge services
    if (serviceName.includes('frame') || serviceName.includes('hinge')) {
      return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop';
    }
    // General carpenter work
    return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop';
  }
  
  // Electrician services
  if (category.includes('electrician')) {
    if (serviceName.includes('light') || serviceName.includes('fitting')) {
      return 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop';
    }
    if (serviceName.includes('eicr') || serviceName.includes('pat')) {
      return 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop';
    }
    // General electrician work
    return 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop';
  }
  
  // Plumbing/Electrician services
  if (category.includes('plumbing')) {
    return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop';
  }
  
  // Painter services
  if (category.includes('painter')) {
    return 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop';
  }
  
  // Handyman services
  if (category.includes('handyman')) {
    return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop';
  }
  
  // Materials category
  if (type.includes('materials')) {
    if (serviceName.includes('door')) {
      return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop';
    }
    if (serviceName.includes('bolt')) {
      // Hardware/security image for bolt materials
      return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop';
    }
    if (serviceName.includes('hinge') || serviceName.includes('handle')) {
      return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop';
  }
  
  // Default fallback - use a unique image based on service ID hash
  const imageOptions = [
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop'
  ];
  
  // Use service ID to consistently select an image
  if (service.id) {
    const hash = service.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return imageOptions[hash % imageOptions.length];
  }
  
  return imageOptions[0];
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
      console.warn('VITE_GOOGLE_API_KEY not found in environment variables');
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
      console.error('Failed to load Google Maps API');
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
      console.error('Error getting location:', error);
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
      alert('Please enter a postcode');
      return;
    }

    // Extract postcode from the value (might be full address)
    const postcodeMatch = trimmedPostcode.match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i);
    const finalPostcode = postcodeMatch ? postcodeMatch[0].toUpperCase() : trimmedPostcode.toUpperCase().replace(/[^A-Z0-9\s]/g, '');

    // Basic UK postcode validation (more lenient)
    const postcodePattern = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;
    if (!postcodePattern.test(finalPostcode)) {
      alert('Please enter a valid UK postcode (e.g., SW1A 1AA, M1 1AA)');
      return;
    }

    // Update postcode state with the extracted value
    setPostcode(finalPostcode);

    setLoading(true);
    
    try {
      // Fetch services from Supabase
      let servicesFromDB = await getServices();
      
      // If we have a job description, use AI to match services
      if (jobDescription.trim()) {
        const normalizedQuery = normalizeServiceQuery(jobDescription);
        
        // Try AI matching first
        try {
          const aiMatched = await matchServicesWithAI(normalizedQuery, servicesFromDB);
          if (aiMatched && aiMatched.length > 0) {
            servicesFromDB = aiMatched;
          }
        } catch (aiError) {
          console.warn('AI matching failed, using basic search:', aiError);
          // Fall back to basic search
          servicesFromDB = await searchServices(normalizedQuery);
        }
      }
      
      // Transform Supabase services to match the expected format
      const transformedServices = servicesFromDB.map(service => {
        // Get price from master_price field (primary) or fallback to other fields
        const price = service.master_price 
          ? parseFloat(service.master_price) 
          : (service.price ? parseFloat(service.price) : (service.hourly_rate ? parseFloat(service.hourly_rate) : 0));
        
        return {
          id: service.id,
          title: service.service_name || service.title || 'Service',
          description: service.description || 'Professional service',
          price: price,
          duration: service.duration || service.estimated_duration || '1-2 hours',
          unit: service.unit || '',
          rating: 4.8,
          reviews: Math.floor(Math.random() * 1000) + 100,
          image: getServiceImage(service),
          category: service.category,
          type: service.type,
          originalService: service // Keep original for reference
        };
      });
      
      console.log('Transformed services:', transformedServices);
      
      // If no services found, use mock services as fallback
      if (transformedServices.length === 0) {
        console.warn('No services found, using mock services');
        setAvailableServices(mockServices);
      } else {
        setAvailableServices(transformedServices);
      }
      
      setLoading(false);
      setStep(3);
    } catch (error) {
      console.error('Error fetching services:', error);
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0'
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
              color: '#2001AF',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            <ArrowLeft size={20} />
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
            maxWidth: '500px',
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
              Enter your postcode
            </h1>
            {jobDescription && (
              <p style={{
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: '0.5rem',
                fontSize: '0.95rem',
                fontStyle: 'italic'
              }}>
                Service: <strong>{jobDescription}</strong>
              </p>
            )}
            <p style={{
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              We need your location to show available services
            </p>

            <form onSubmit={handlePostcodeSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Postcode
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <div 
                    id="postcode-container"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      transition: 'border-color 0.3s ease',
                      width: '100%'
                    }}
                  >
                    <MapPin size={20} style={{ color: '#6b7280', margin: '0 0.75rem', flexShrink: 0 }} />
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
                        if (container) container.style.borderColor = '#e5e7eb';
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
                        fontSize: '1.125rem',
                        fontFamily: 'inherit',
                        background: 'transparent',
                        minWidth: 0
                      }}
                      onFocus={(e) => {
                        const container = document.getElementById('postcode-container');
                        if (container) container.style.borderColor = '#2001AF';
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
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f3f4f6',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                          <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#111827',
                            marginBottom: '0.25rem'
                          }}>
                            {suggestion.structured_formatting.main_text}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#6b7280'
                          }}>
                            {suggestion.structured_formatting.secondary_text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  marginTop: '0.5rem'
                }}>
                  Enter a UK postcode (e.g., SW1A 1AA, M1 1AA, B33 8TH)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#9ca3af' : '#2001AF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '1rem 2rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#1a0199';
                }}
                onMouseOut={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#2001AF';
                }}
              >
                {loading ? 'Loading...' : "Let's go!"}
                {!loading && <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Available Services */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#2001AF',
                marginBottom: '0.5rem'
              }}>
                Available services
              </h1>
              <p style={{ color: '#6b7280' }}>
                Based on your location: <strong>{postcode}</strong>
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {availableServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#f3f4f6',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={service.image}
                      alt={service.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '0.5rem'
                    }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: 0
                      }}>
                        {service.title}
                      </h3>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#2001AF'
                      }}>
                        £{typeof service.price === 'number' ? service.price.toFixed(2) : parseFloat(service.price || 0).toFixed(2)}
                        {service.unit && (
                          <span style={{
                            fontSize: '0.875rem',
                            fontWeight: '400',
                            color: '#6b7280',
                            marginLeft: '0.25rem'
                          }}>
                            / {service.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      marginBottom: '1rem'
                    }}>
                      {service.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: '#fbbf24'
                      }}>
                        <Star size={16} style={{ fill: 'currentColor' }} />
                        <span style={{
                          color: '#111827',
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}>
                          {service.rating}
                        </span>
                        <span style={{
                          color: '#6b7280',
                          fontSize: '0.875rem'
                        }}>
                          ({service.reviews})
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#6b7280',
                        fontSize: '0.875rem'
                      }}>
                        <Clock size={16} />
                        {service.duration}
                      </div>
                    </div>

                    <button style={{
                      width: '100%',
                      backgroundColor: '#2001AF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#1a0199'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#2001AF'}
                    >
                      Select this service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default B2CBooking;
