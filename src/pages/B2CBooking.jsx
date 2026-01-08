import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Search, CheckCircle, Clock, Shield, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

const B2CBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: description, 2: postcode, 3: services list
  const [jobDescription, setJobDescription] = useState('');
  const [postcode, setPostcode] = useState('');
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Initialize with service from navigation if available
  useEffect(() => {
    if (location.state?.service) {
      setJobDescription(location.state.service);
    }
  }, [location.state]);

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

  const handlePostcodeSubmit = (e) => {
    e.preventDefault();
    if (postcode.trim()) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        // Filter services based on description or show all
        const filtered = jobDescription.trim()
          ? mockServices.filter(s => 
              s.title.toLowerCase().includes(jobDescription.toLowerCase()) ||
              s.description.toLowerCase().includes(jobDescription.toLowerCase())
            )
          : mockServices;
        
        setAvailableServices(filtered.length > 0 ? filtered : mockServices);
        setLoading(false);
        setStep(3);
      }, 1000);
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
            <p style={{
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              We need your location to show available services
            </p>

            <form onSubmit={handlePostcodeSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#2001AF'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <MapPin size={20} style={{ color: '#6b7280', margin: '0 0.75rem' }} />
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                    placeholder="Enter your postcode..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '1.125rem',
                      fontFamily: 'inherit'
                    }}
                    required
                    pattern="[A-Za-z]{1,2}[0-9]{1,2}[A-Za-z]? [0-9][A-Za-z]{2}"
                  />
                </div>
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
                        £{service.price}
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
