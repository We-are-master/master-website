import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  AlertCircle,
  CheckCircle,
  Wrench,
  Droplets,
  Zap,
  Sparkles,
  MessageCircle,
  Camera,
  Download,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import logo from '../assets/logo.png';
import { supabase } from '../lib/supabase';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error('User not authenticated');
        }

        // Fetch request from database
        const { data: request, error: requestError } = await supabase
          .from('requests')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (requestError) throw requestError;
        if (!request) throw new Error('Request not found');

        // Parse image URLs from notes if available
        let images = [];
        if (request.notes) {
('Request notes:', request.notes);
          // Try to match "Images: ..." pattern (handles newlines and multiple spaces)
          const imageMatch = request.notes.match(/Images:\s*([^\n]+)/);
          if (imageMatch) {
            const imageString = imageMatch[1].trim();
            images = imageString.split(',').map(url => url.trim()).filter(url => url.length > 0);
('Parsed images:', images);
          } else {
            // Try to find URLs in notes (fallback)
            const urlPattern = /(https?:\/\/[^\s,]+)/g;
            const foundUrls = request.notes.match(urlPattern);
            if (foundUrls) {
              images = foundUrls;
('Found URLs in notes:', images);
            }
          }
        }

        // Format request data
        const formattedData = {
          id: request.zoho_id && request.zoho_id.trim() !== '' ? request.zoho_id : request.id.substring(0, 8).toUpperCase(),
          title: request.title,
          status: request.status.charAt(0).toUpperCase() + request.status.slice(1),
          priority: request.priority.charAt(0).toUpperCase() + request.priority.slice(1),
          type: request.service_type.charAt(0).toUpperCase() + request.service_type.slice(1),
          description: request.description || 'No description provided',
          location: request.location || 'Location not specified',
          assignedTo: request.assigned_to ? {
            name: request.assigned_to,
      phone: '+44 20 7123 4567',
            email: 'technician@master.com',
      rating: 4.8,
      completedJobs: 156
          } : null,
          createdAt: request.created_at || request.requested_date,
          scheduledDate: request.scheduled_date,
          estimatedDuration: '2-3 hours', // Default, can be added to database
          estimatedCost: request.cost ? `£${parseFloat(request.cost).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null,
          images: images,
          updates: [] // Can be fetched from a separate table if needed
        };

        setRequestData(formattedData);
      } catch (error) {
('Error fetching request:', error);
        setError(error.message || 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequest();
    }
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#f59e0b';
      case 'Scheduled': return '#3b82f6';
      case 'Pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case 'Plumbing': return <Droplets className="w-6 h-6" style={{ color: '#E94A02' }} />;
      case 'Electrical': return <Zap className="w-6 h-6" style={{ color: '#2001AF' }} />;
      case 'Maintenance': return <Wrench className="w-6 h-6" style={{ color: '#020135' }} />;
      case 'Cleaning': return <Sparkles className="w-6 h-6" style={{ color: '#E94A02' }} />;
      default: return <Wrench className="w-6 h-6" style={{ color: '#6b7280' }} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
('Error uploading image:', error);
        // Continue with other images even if one fails
      }
    }
    
    return uploadedUrls;
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0 || !requestData || !id) return;

    try {
      setUploading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Fetch current request to get existing notes
      const { data: currentRequest, error: fetchError } = await supabase
        .from('requests')
        .select('notes')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      // Upload new images
      const imageUrls = await uploadImages(files, id);
      
      if (imageUrls.length > 0) {
        // Parse existing images from notes
        let existingImages = [];
        if (currentRequest.notes) {
          const imageMatch = currentRequest.notes.match(/Images:\s*([^\n]+)/);
          if (imageMatch) {
            existingImages = imageMatch[1].split(',').map(url => url.trim()).filter(url => url.length > 0);
          }
        }

        // Combine existing and new images
        const allImages = [...existingImages, ...imageUrls];
        const imageUrlsString = allImages.join(', ');
        
        // Update request with all image URLs
        const existingNotes = currentRequest.notes || '';
        const updatedNotes = existingNotes.includes('Images:')
          ? existingNotes.replace(/Images:\s*[^\n]+/, `Images: ${imageUrlsString}`)
          : existingNotes 
            ? `${existingNotes}\n\nImages: ${imageUrlsString}`
            : `Images: ${imageUrlsString}`;

        const { error: updateError } = await supabase
          .from('requests')
          .update({ notes: updatedNotes })
          .eq('id', id);

        if (updateError) throw updateError;

        // Refresh request data
        const { data: { user: user2 } } = await supabase.auth.getUser();
        const { data: request, error: requestError } = await supabase
          .from('requests')
          .select('*')
          .eq('id', id)
          .eq('user_id', user2.id)
          .single();

        if (requestError) throw requestError;

        // Parse image URLs from updated notes
        let images = [];
        if (request.notes) {
          const imageMatch = request.notes.match(/Images:\s*([^\n]+)/);
          if (imageMatch) {
            const imageString = imageMatch[1].trim();
            images = imageString.split(',').map(url => url.trim()).filter(url => url.length > 0);
          }
        }

        // Update requestData with new images
        setRequestData(prev => ({
          ...prev,
          images: images
        }));

        // Switch to photos tab
        setActiveTab('photos');
      }
    } catch (error) {
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E94A02', margin: '0 auto 1rem' }} />
          <p style={{ color: '#6b7280' }}>Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !requestData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <AlertCircle style={{ width: '48px', height: '48px', color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            Error Loading Request
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            {error || 'Request not found'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: '#E94A02',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#020135',
              margin: 0
            }}>
              Request Details
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0
            }}>
              {requestData.id}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'transparent',
            border: '2px solid #e5e7eb',
            color: '#6b7280',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            <Edit size={16} />
            Edit
          </button>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#E94A02',
            border: 'none',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            <MessageCircle size={16} />
            Message
          </button>
        </div>
      </header>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          {/* Main Content */}
          <div>
            {/* Request Header */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '1.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    {getServiceIcon(requestData.type)}
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                      {requestData.title}
                    </h2>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                    {requestData.description}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: getStatusColor(requestData.status),
                    backgroundColor: `${getStatusColor(requestData.status)}15`
                  }}>
                    {requestData.status}
                  </span>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: getPriorityColor(requestData.priority),
                    backgroundColor: `${getPriorityColor(requestData.priority)}15`
                  }}>
                    {requestData.priority}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin style={{ color: '#6b7280', width: '20px', height: '20px' }} />
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Location</p>
                    <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: 0 }}>
                      {requestData.location}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar style={{ color: '#6b7280', width: '20px', height: '20px' }} />
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Scheduled</p>
                    <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: 0 }}>
                      {formatDate(requestData.scheduledDate)} at {formatTime(requestData.scheduledDate)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Clock style={{ color: '#6b7280', width: '20px', height: '20px' }} />
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Duration</p>
                    <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', margin: 0 }}>
                      {requestData.estimatedDuration}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                borderBottom: '1px solid #e5e7eb'
              }}>
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'updates', label: 'Updates' },
                  { id: 'photos', label: 'Photos' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: '1rem 1.5rem',
                      border: 'none',
                      backgroundColor: activeTab === tab.id ? '#f0f9ff' : 'transparent',
                      color: activeTab === tab.id ? '#2001AF' : '#6b7280',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textAlign: 'left'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: '2rem' }}>
                {activeTab === 'overview' && (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
                      Request Information
                    </h3>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                          Service Type
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {getServiceIcon(requestData.type)}
                          <span style={{ fontSize: '1rem', color: '#111827' }}>{requestData.type}</span>
                        </div>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                          Estimated Cost
                        </h4>
                        {requestData.estimatedCost ? (
                        <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                          {requestData.estimatedCost}
                        </p>
                        ) : (
                          <p style={{ fontSize: '1rem', fontStyle: 'italic', color: '#6b7280', margin: 0 }}>
                            Awaiting quote
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                          Created
                        </h4>
                        <p style={{ fontSize: '1rem', color: '#111827', margin: 0 }}>
                          {formatDate(requestData.createdAt)} at {formatTime(requestData.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'updates' && (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
                      Request Updates
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {requestData.updates.map((update, index) => (
                        <div key={update.id} style={{
                          display: 'flex',
                          gap: '1rem',
                          padding: '1rem',
                          backgroundColor: '#f9fafb',
                          borderRadius: '0.75rem'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: update.type === 'status' ? '#3b82f6' : '#E94A02',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0
                          }}>
                            {update.type === 'status' ? <CheckCircle size={20} /> : <MessageCircle size={20} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                                {update.author}
                              </span>
                              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                {formatTime(update.timestamp)}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                              {update.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'photos' && (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
                      Photos ({requestData.images.length})
                    </h3>
                    {requestData.images.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '1rem'
                    }}>
                      {requestData.images.map((image, index) => (
                        <div key={index} style={{
                          position: 'relative',
                          borderRadius: '0.75rem',
                          overflow: 'hidden',
                          border: '1px solid #e5e7eb'
                        }}>
                          <img
                            src={image}
                            alt={`Request photo ${index + 1}`}
                              onError={(e) => {
('Error loading image:', image);
                                e.target.style.display = 'none';
                              }}
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            display: 'flex',
                            gap: '0.25rem'
                          }}>
                            <button 
                              onClick={async () => {
                                try {
                                  // Download da imagem
                                  const response = await fetch(image);
                                  const blob = await response.blob();
                                  
                                  // Extrair nome do arquivo da URL ou usar nome padrão
                                  const urlParts = image.split('/');
                                  const fileName = urlParts[urlParts.length - 1] || `request-photo-${index + 1}`;
                                  
                                  // Criar link para download
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = fileName;
                                  document.body.appendChild(link);
                                  link.click();
                                  
                                  // Limpar
                                  document.body.removeChild(link);
                                  window.URL.revokeObjectURL(url);
                                } catch (error) {
('Error downloading image:', error);
                                  // Fallback: abrir em nova aba se download falhar
                                  window.open(image, '_blank');
                                }
                              }}
                              style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              border: 'none',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(0,0,0,0.7)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgba(0,0,0,0.5)';
                              }}
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    ) : (
                      <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.75rem',
                        border: '1px dashed #d1d5db'
                      }}>
                        <Camera style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          No photos uploaded yet
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Assigned Technician */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Assigned Technician
              </h3>
                {requestData.assignedTo ? (
                  <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#2001AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  {requestData.assignedTo.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>
                    {requestData.assignedTo.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', color: '#f59e0b' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ fontSize: '0.75rem' }}>★</span>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {requestData.assignedTo.rating} ({requestData.assignedTo.completedJobs} jobs)
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href={`tel:${requestData.assignedTo.phone}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#6b7280',
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}>
                  <Phone size={16} />
                  {requestData.assignedTo.phone}
                </a>
                <a href={`mailto:${requestData.assignedTo.email}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#6b7280',
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}>
                  <Mail size={16} />
                  {requestData.assignedTo.email}
                </a>
              </div>
                  </>
                ) : (
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    No technician assigned yet
                  </p>
                )}
            </div>

            {/* Quick Actions */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textAlign: 'left'
                }}>
                  <MessageCircle size={16} />
                  Send Message
                </button>
                <button 
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                  disabled={uploading}
                  style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                    backgroundColor: uploading ? '#f3f4f6' : 'white',
                    color: uploading ? '#9ca3af' : '#6b7280',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                    textAlign: 'left',
                    opacity: uploading ? 0.7 : 1
                  }}
                >
                  <Camera size={16} />
                  {uploading ? 'Uploading...' : 'Add Photo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  border: '2px solid #ef4444',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textAlign: 'left'
                }}>
                  <Trash2 size={16} />
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;

