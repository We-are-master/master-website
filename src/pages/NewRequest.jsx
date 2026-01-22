import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Upload, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Wrench,
  Droplets,
  Zap,
  Sparkles,
  Building
} from 'lucide-react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.png';

// Location Input Component with Google Places Autocomplete
const LocationInput = ({ formData, setFormData, onGoogleLoaded }) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const hasCalledCallback = useRef(false);

  // Load Google Maps script dynamically
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      return;
    }

    // Check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsGoogleLoaded(true);
      if (onGoogleLoaded && !hasCalledCallback.current) {
        hasCalledCallback.current = true;
        onGoogleLoaded();
      }
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const checkGoogle = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsGoogleLoaded(true);
          if (onGoogleLoaded && !hasCalledCallback.current) {
            hasCalledCallback.current = true;
            onGoogleLoaded();
          }
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
      if (onGoogleLoaded && !hasCalledCallback.current) {
        hasCalledCallback.current = true;
        onGoogleLoaded();
      }
    };
    script.onerror = () => {
      setIsGoogleLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []); // Empty dependency array - only run once

  // Only initialize the hook when Google Maps is loaded
  // Use a key to force re-initialization when Google Maps loads
  const placesAutocomplete = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'gb' }, // Restrict to UK
    },
    debounce: 300,
    initOnMount: false, // We'll initialize manually when Google Maps is ready
  });

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
    init,
  } = placesAutocomplete;

  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Initialize the hook when Google Maps is loaded
  useEffect(() => {
    if (isGoogleLoaded && window.google && window.google.maps && window.google.maps.places && !ready) {
      init();
    }
  }, [isGoogleLoaded, ready, init]);
  
  // Debug: Log suggestions status
  useEffect(() => {
    if (showSuggestions && value && ready) {
    }
  }, [showSuggestions, status, data, value, ready]);

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();
    setShowSuggestions(false);
    
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      setFormData(prev => ({
        ...prev,
        location: address,
        locationLat: lat,
        locationLng: lng
      }));
    } catch (error) {
      setFormData(prev => ({
        ...prev,
        location: address
      }));
    }
  };

  // Remove the sync effect - let the input handle its own state
  // The formData.location will be updated when user selects from suggestions

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
        Location
      </label>
      <div style={{ position: 'relative' }}>
        <MapPin style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9ca3af',
          width: '20px',
          height: '20px',
          zIndex: 1
        }} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            setValue(newValue, true); // Trigger search for suggestions
            setShowSuggestions(true);
            // Only update formData when user selects from suggestions or finishes typing
          }}
          onBlur={(e) => {
            // Update formData when user leaves the field
            if (e.target.value) {
              setFormData(prev => ({ ...prev, location: e.target.value }));
            }
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.backgroundColor = 'white';
            // Delay to allow click on suggestions
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          disabled={!ready}
          placeholder="Enter your business address"
          style={{
            width: '100%',
            padding: '0.875rem 1rem 0.875rem 3rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: ready ? 'white' : '#f3f4f6'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2001AF';
            e.target.style.backgroundColor = 'white';
            setShowSuggestions(true);
          }}
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && ready && status === 'OK' && data && data.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.25rem',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {data.map(({ place_id, description }) => (
              <div
                key={place_id}
                onClick={() => handleSelect(description)}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'background-color 0.2s',
                  fontSize: '0.875rem',
                  color: '#374151'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                {description}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const NewRequest = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleMapsKey, setGoogleMapsKey] = useState(0);
  const googleMapsLoadedRef = useRef(false);
  const submitButtonClickedRef = useRef(false);
  
  const handleGoogleLoaded = useCallback(() => {
    // Only update key once to force re-initialization
    if (!googleMapsLoadedRef.current) {
      googleMapsLoadedRef.current = true;
      setGoogleMapsKey(1);
    }
  }, []);
  
  const [formData, setFormData] = useState({
    serviceType: '',
    priority: 'Medium',
    location: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
    contactPhone: '',
    images: [],
    locationLat: null,
    locationLng: null
  });

  const serviceTypes = [
    { id: 'plumbing', name: 'Plumbing', icon: <Droplets className="w-6 h-6" />, color: '#E94A02' },
    { id: 'electrical', name: 'Electrical', icon: <Zap className="w-6 h-6" />, color: '#2001AF' },
    { id: 'maintenance', name: 'Maintenance', icon: <Wrench className="w-6 h-6" />, color: '#020135' },
    { id: 'cleaning', name: 'Cleaning', icon: <Sparkles className="w-6 h-6" />, color: '#E94A02' }
  ];

  const priorities = [
    { value: 'Low', label: 'Low Priority', color: '#10b981', description: 'Can be scheduled within a week' },
    { value: 'Medium', label: 'Medium Priority', color: '#f59e0b', description: 'Should be addressed within 2-3 days' },
    { value: 'High', label: 'High Priority', color: '#ef4444', description: 'Urgent - needs immediate attention' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && !formData.serviceType) {
      setError('Please select a service type');
      return;
    }
    if (currentStep === 2 && !formData.priority) {
      setError('Please select a priority level');
      return;
    }
    if (currentStep === 3) {
      if (!formData.location) {
        setError('Please enter a location');
        return;
      }
      if (!formData.description) {
        setError('Please provide a description');
        return;
      }
    }
    
    setError(''); // Clear any previous errors
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Upload images to Supabase Storage
  const uploadImages = async (images, requestId) => {
    const uploadedUrls = [];
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${requestId}/${Date.now()}_${i}.${fileExt}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('request-images')
          .upload(fileName, file);
        
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('request-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(urlData.publicUrl);
      } catch (error) {
        // Continue with other images even if one fails
      }
    }
    
    return uploadedUrls;
  };

  // Generate Zoho ID (you can replace this with actual Zoho integration)
  const generateZohoId = () => {
    return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) {
      e.stopImmediatePropagation();
    }
    
    // CRITICAL: Only submit if the submit button was explicitly clicked
    if (!submitButtonClickedRef.current) {
      return;
    }
    
    // Reset the flag
    submitButtonClickedRef.current = false;
    
    // Only submit if we're on the last step
    if (currentStep !== 4) {
      return;
    }
    
    // Validate required fields
    if (!formData.serviceType) {
      setError('Please select a service type');
      return;
    }
    if (!formData.location || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated. Please login.');
      }

      // First, create the request record
      // zoho_id will be updated later via external process
      const requestData = {
        zoho_id: '', // Empty string, will be updated later
        user_id: user.id,
        title: `${formData.serviceType} - ${formData.location || 'Location not specified'}`,
        description: formData.description,
        service_type: formData.serviceType,
        priority: formData.priority.toLowerCase(),
        location: formData.location,
        status: 'pending',
        requested_date: new Date().toISOString(),
        scheduled_date: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : null,
        notes: formData.contactPhone ? `Contact: ${formData.contactPhone}\nPreferred Time: ${formData.preferredTime}` : null
      };

      const { data: request, error: requestError } = await supabase
        .from('requests')
        .insert([requestData])
        .select()
        .single();

      if (requestError) throw requestError;

      // Upload images if any
      let imageUrls = [];
      if (formData.images.length > 0 && request) {
        imageUrls = await uploadImages(formData.images, request.id);
        
        // Update request with image URLs
        if (imageUrls.length > 0) {
          const existingNotes = requestData.notes || '';
          const imageUrlsString = imageUrls.join(', ');
          const updatedNotes = existingNotes 
            ? `${existingNotes}\n\nImages: ${imageUrlsString}`
            : `Images: ${imageUrlsString}`;
          
          const { error: updateError } = await supabase
            .from('requests')
            .update({ notes: updatedNotes })
            .eq('id', request.id);
          
          if (updateError) {
          } else {
          }
        }
      }

      // Fetch user data for webhook
      const { data: userData } = await supabase
        .from('users')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .single();

      // Prepare webhook payload with all request information
      const webhookPayload = {
        request_id: request.id,
        zoho_id: request.zoho_id || '',
        user_id: user.id,
        user_name: userData?.full_name || user.email || 'Unknown',
        user_email: user.email || userData?.email || '',
        user_phone: userData?.phone || formData.contactPhone || '',
        title: request.title,
        description: request.description,
        service_type: request.service_type,
        priority: request.priority,
        status: request.status,
        location: request.location,
        location_lat: formData.locationLat,
        location_lng: formData.locationLng,
        contact_phone: formData.contactPhone || '',
        preferred_date: formData.preferredDate || null,
        preferred_time: formData.preferredTime || '',
        scheduled_date: request.scheduled_date,
        requested_date: request.requested_date,
        created_at: request.created_at,
        notes: request.notes,
        image_urls: imageUrls,
        image_count: imageUrls.length
      };

      // Send to webhook (non-blocking - don't fail if webhook fails)
      try {
        const webhookResponse = await fetch('https://n8n.wearemaster.com/webhook/9c4a40a5-6e6a-444a-91be-0cb5fdbe1a80', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        });

        if (!webhookResponse.ok) {
        } else {
        }
      } catch (webhookError) {
        // Log error but don't block the flow
      }

      // Redirect to dashboard or request details
      navigate(`/request/${request.id}`);
    } catch (error) {
      setError(error.message || 'Failed to submit request. Please try again.');
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              What service do you need?
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Select the type of maintenance service you require
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {serviceTypes.map(service => (
                <button
                  key={service.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFormData(prev => ({ ...prev, serviceType: service.id }));
                  }}
                  style={{
                    padding: '1.5rem',
                    border: formData.serviceType === service.id ? `2px solid ${service.color}` : '2px solid #e5e7eb',
                    borderRadius: '1rem',
                    backgroundColor: formData.serviceType === service.id ? `${service.color}15` : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <div style={{ color: service.color, marginBottom: '0.75rem' }}>
                    {service.icon}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {service.name}
                  </h4>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              Priority Level
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              How urgent is this request?
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {priorities.map(priority => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFormData(prev => ({ ...prev, priority: priority.value }));
                  }}
                  style={{
                    padding: '1.5rem',
                    border: formData.priority === priority.value ? `2px solid ${priority.color}` : '2px solid #e5e7eb',
                    borderRadius: '1rem',
                    backgroundColor: formData.priority === priority.value ? `${priority.color}15` : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    width: '100%'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: priority.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem'
                  }}>
                    {formData.priority === priority.value ? '✓' : ''}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>
                      {priority.label}
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                      {priority.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              Request Details
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Provide more information about your request
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <LocationInput 
                key={googleMapsKey}
                formData={formData} 
                setFormData={setFormData}
                onGoogleLoaded={handleGoogleLoaded}
                  />

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the issue or service needed..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    Preferred Date
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Calendar style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af',
                      width: '20px',
                      height: '20px'
                    }} />
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem 0.875rem 3rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    Preferred Time
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Clock style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9ca3af',
                      width: '20px',
                      height: '20px'
                    }} />
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem 0.875rem 3rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Select time</option>
                      <option value="morning">Morning (8AM - 12PM)</option>
                      <option value="afternoon">Afternoon (12PM - 5PM)</option>
                      <option value="evening">Evening (5PM - 8PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder="Your contact number"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div
            onClick={(e) => {
              // Prevent any form submission from this entire section
              e.stopPropagation();
              if (e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
              }
            }}
            onKeyDown={(e) => {
              // Prevent Enter key from submitting form
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                if (e.stopImmediatePropagation) {
                  e.stopImmediatePropagation();
                }
              }
            }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              Upload Photos (Optional)
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Add photos to help us understand the issue better
            </p>
            
            <div 
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
                if (files.length > 0) {
                  setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...files]
                  }));
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
              }}
              onClick={(e) => {
                // Prevent form submission when clicking on the drop zone
                e.stopPropagation();
                e.stopImmediatePropagation();
              }}
              style={{
              border: '2px dashed #d1d5db',
              borderRadius: '1rem',
              padding: '3rem',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
              }}
            >
              <Upload style={{ width: '48px', height: '48px', color: '#9ca3af', marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Upload Images
              </h4>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Drag and drop images here, or click to select
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  // Prevent form submission when selecting files
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.stopImmediatePropagation) {
                    e.stopImmediatePropagation();
                  }
                  handleImageUpload(e);
                }}
                onClick={(e) => {
                  // Prevent form submission when clicking file input
                  e.stopPropagation();
                  if (e.stopImmediatePropagation) {
                    e.stopImmediatePropagation();
                  }
                }}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <button
                type="button"
                onClick={(e) => {
                  // Prevent form submission
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.stopImmediatePropagation) {
                    e.stopImmediatePropagation();
                  }
                  const fileInput = document.getElementById('image-upload');
                  if (fileInput) {
                    fileInput.click();
                  }
                }}
                style={{
                  backgroundColor: '#E94A02',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Choose Files
              </button>
            </div>

            {formData.images.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                  Selected Images ({formData.images.length})
                </h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {formData.images.map((image, index) => (
                    <div key={index} style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      border: '2px solid #e5e7eb'
                    }}>
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '0.5rem',
              marginRight: '1rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <img 
            src={logo} 
            alt="Master Logo" 
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain',
              marginRight: '1rem'
            }}
          />
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#020135',
            margin: 0
          }}>
            New Request
          </h1>
        </div>
      </header>

      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        {/* Progress Steps */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: '0',
            position: 'relative'
          }}>
            {[1, 2, 3, 4].map((step, index) => {
              const stepLabels = ['Service Type', 'Priority', 'Details', 'Photos'];
              const isActive = currentStep === step;
              
              return (
                <React.Fragment key={step}>
                  <div style={{
                display: 'flex',
                    flexDirection: 'column',
                alignItems: 'center',
                    position: 'relative',
                    zIndex: 2
              }}>
                    {/* Step Circle */}
                <div style={{
                      width: '48px',
                      height: '48px',
                  borderRadius: '50%',
                      backgroundColor: isActive ? '#E94A02' : '#e5e7eb',
                      color: isActive ? 'white' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                      fontSize: '1rem',
                      marginBottom: '0.75rem',
                      transition: 'all 0.3s ease'
                }}>
                      {step}
                </div>
                    
                    {/* Step Label */}
                    <span style={{
                      fontSize: '0.875rem',
                      color: isActive ? '#111827' : '#9ca3af',
                      fontWeight: isActive ? '600' : '500',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap'
                    }}>
                      {stepLabels[index]}
                    </span>
                  </div>
                  
                  {/* Connecting Line */}
                  {index < 3 && (
                  <div style={{
                      width: '100px',
                    height: '2px',
                      backgroundColor: '#e5e7eb',
                      marginTop: '24px',
                      marginLeft: '0.5rem',
                      marginRight: '0.5rem',
                      transition: 'all 0.3s ease'
                  }} />
                )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#dc2626'
            }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          <form 
            onSubmit={(e) => {
              // COMPLETELY BLOCK form submission from onSubmit handler
              // We only submit via the button's onClick handler
              e.preventDefault();
              e.stopPropagation();
              if (e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
              }
              
              
              // Reset the flag
              submitButtonClickedRef.current = false;
              
              return false;
            }}
            onClick={(e) => {
              // Prevent form submission on clicks within the form
              // Only allow clicks on actual submit button
              if (e.target.type !== 'submit' && e.target.tagName !== 'BUTTON' && e.target.type !== 'file') {
                e.stopPropagation();
              }
            }}
            onKeyDown={(e) => {
              // Prevent form submission on Enter key unless it's the submit button
              if (e.key === 'Enter') {
                const target = e.target;
                // Only allow Enter on submit button
                if (target.type !== 'submit' && target.tagName !== 'BUTTON') {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.stopImmediatePropagation) {
                    e.stopImmediatePropagation();
                  }
                }
              }
            }}
          >
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  opacity: currentStep === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.75rem',
                    backgroundColor: '#E94A02',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  id="submit-request-button"
                  onClick={(e) => {
                    // Explicitly allow submit only when this button is clicked
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.stopImmediatePropagation) {
                      e.stopImmediatePropagation();
                    }
                    submitButtonClickedRef.current = true;
                    // Manually trigger handleSubmit
                    handleSubmit(e);
                  }}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.75rem',
                    backgroundColor: loading ? '#9ca3af' : '#E94A02',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewRequest;

