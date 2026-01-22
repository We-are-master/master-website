import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin,
  CheckCircle, 
  AlertCircle, 
  Wrench, 
  Droplets, 
  Zap, 
  Sparkles,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import logo from '../assets/logo.png';
import { supabase } from '../lib/supabase';

const MyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Get service type icon
  const getServiceIcon = (serviceType) => {
    switch (serviceType?.toLowerCase()) {
      case 'plumbing':
        return <Droplets className="w-5 h-5" style={{ color: '#E94A02' }} />;
      case 'electrical':
        return <Zap className="w-5 h-5" style={{ color: '#2001AF' }} />;
      case 'cleaning':
        return <Sparkles className="w-5 h-5" style={{ color: '#E94A02' }} />;
      case 'maintenance':
        return <Wrench className="w-5 h-5" style={{ color: '#020135' }} />;
      default:
        return <Wrench className="w-5 h-5" style={{ color: '#6b7280' }} />;
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'scheduled': 'Scheduled'
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  // Format priority for display
  const formatPriority = (priority) => {
    const priorityMap = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'Urgent'
    };
    return priorityMap[priority?.toLowerCase()] || priority;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'scheduled': return '#3b82f6';
      case 'pending': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      case 'high':
      case 'urgent': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          navigate('/login');
          return;
        }

        // Fetch all requests for the user
        const { data: requestsData, error: requestsError } = await supabase
          .from('requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;

        // Format requests
        const formattedRequests = requestsData.map(request => ({
          id: request.id,
          zohoId: request.zoho_id && request.zoho_id.trim() !== '' ? request.zoho_id : null,
          title: request.title,
          description: request.description,
          status: request.status,
          priority: request.priority,
          serviceType: request.service_type,
          location: request.location,
          assignedTo: request.assigned_to,
          cost: request.cost,
          createdAt: request.created_at || request.requested_date,
          scheduledDate: request.scheduled_date,
          completedDate: request.completed_date
        }));

        setRequests(formattedRequests);
        setFilteredRequests(formattedRequests);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = [...requests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.zohoId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, priorityFilter, requests]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
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
          <p style={{ color: '#6b7280' }}>Loading requests...</p>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <img 
            src={logo} 
            alt="Master Logo" 
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain'
            }}
          />
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#020135',
            margin: 0
          }}>
            My Requests
          </h1>
        </div>
      </header>

      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Filters and Search */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                width: '20px',
                height: '20px'
              }} />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => navigate(`/request/${request.id}`)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{ color: '#E94A02' }}>
                      {getServiceIcon(request.serviceType)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: '0 0 0.5rem 0' }}>
                        {request.title}
                      </h3>
                      {request.description && (
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                          {request.description.length > 100 
                            ? `${request.description.substring(0, 100)}...` 
                            : request.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: getStatusColor(request.status),
                      backgroundColor: `${getStatusColor(request.status)}15`
                    }}>
                      {formatStatus(request.status)}
                    </span>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: getPriorityColor(request.priority),
                      backgroundColor: `${getPriorityColor(request.priority)}15`
                    }}>
                      {formatPriority(request.priority)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <span style={{ fontWeight: '600', color: '#374151' }}>ID:</span>
                    {request.zohoId || request.id.substring(0, 8).toUpperCase()}
                  </div>
                  {request.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      <MapPin size={16} />
                      {request.location.length > 30 
                        ? `${request.location.substring(0, 30)}...` 
                        : request.location}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <Calendar size={16} />
                    Created: {formatDate(request.createdAt)}
                  </div>
                  {request.scheduledDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      <Clock size={16} />
                      Scheduled: {formatDate(request.scheduledDate)}
                    </div>
                  )}
                  {request.cost && (
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Cost:</span> £{parseFloat(request.cost).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <AlertCircle style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              No requests found
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first request to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
              <button
                onClick={() => navigate('/new-request')}
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
                Create New Request
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;



