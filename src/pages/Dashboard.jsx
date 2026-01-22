import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Wrench, 
  Droplets, 
  Zap, 
  Sparkles,
  TrendingUp,
  Users,
  Star,
  Settings,
  LogOut,
  MapPin,
  User,
  Lock,
  Shield,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userName, setUserName] = useState('User');
  const [userInitials, setUserInitials] = useState('U');
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState([
    {
      title: 'Active Requests',
      value: '0',
      change: '0 this week',
      icon: <Wrench className="w-6 h-6" />,
      color: '#E94A02'
    },
    {
      title: 'Completed Requests',
      value: '0',
      change: '0 this month',
      icon: <CheckCircle className="w-6 h-6" />,
      color: '#10b981'
    },
    {
      title: 'Total Spent',
      value: '£0',
      change: '0% vs last month',
      icon: <TrendingUp className="w-6 h-6" />,
      color: '#2001AF'
    },
    {
      title: 'Rating',
      value: '0',
      change: 'No reviews yet',
      icon: <Star className="w-6 h-6" />,
      color: '#f59e0b'
    }
  ]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // My Requests state
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Settings state
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsUserData, setSettingsUserData] = useState({
    email: '',
    fullName: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Schedule state
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleView, setScheduleView] = useState('month'); // 'month' or 'week'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get service type icon
  const getServiceIcon = (serviceType) => {
    switch (serviceType?.toLowerCase()) {
      case 'plumbing':
        return <Droplets className="w-5 h-5" />;
      case 'electrical':
        return <Zap className="w-5 h-5" />;
      case 'cleaning':
        return <Sparkles className="w-5 h-5" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'scheduled': 'Scheduled',
      'confirmed': 'Confirmed'
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user from Supabase auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch user data from users table
        const { data: userDataFromDB, error: userError } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', user.id)
          .single();
        
        if (userDataFromDB && userDataFromDB.full_name) {
          // Extract first and last name
          const nameParts = userDataFromDB.full_name.trim().split(' ');
          let displayName = userDataFromDB.full_name;
          let initials = 'U';
          
          if (nameParts.length >= 2) {
            displayName = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
            initials = `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
          } else if (nameParts.length === 1) {
            initials = nameParts[0][0].toUpperCase();
          }
          
          setUserName(displayName);
          setUserInitials(initials);
        }
        
        // Store user data
        setUserData({
          email: user.email || userDataFromDB?.email || '',
          fullName: userDataFromDB?.full_name || ''
        });

        // Fetch all requests for the user
        const { data: requests, error: requestsError } = await supabase
          .from('requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;

        // Calculate statistics
        const activeRequests = requests.filter(r => r.status === 'in_progress' || r.status === 'pending' || r.status === 'scheduled');
        const completedRequests = requests.filter(r => r.status === 'completed');
        
        // Calculate this week's active requests
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeekActive = activeRequests.filter(r => {
          const requestDate = new Date(r.created_at);
          return requestDate >= oneWeekAgo;
        }).length;

        // Calculate this month's completed requests
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const thisMonthCompleted = completedRequests.filter(r => {
          const completedDate = new Date(r.completed_date || r.created_at);
          return completedDate >= oneMonthAgo;
        }).length;

        // Calculate total spent
        const totalSpent = requests.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0);
        
        // Calculate last month's spent for comparison
        const now = new Date();
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const lastMonthRequests = requests.filter(r => {
          const requestDate = new Date(r.created_at);
          return requestDate >= lastMonthStart && requestDate <= lastMonthEnd;
        });
        
        const thisMonthRequests = requests.filter(r => {
          const requestDate = new Date(r.created_at);
          return requestDate >= thisMonthStart;
        });
        
        const lastMonthSpent = lastMonthRequests.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0);
        const thisMonthSpent = thisMonthRequests.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0);
        
        const spentChange = lastMonthSpent > 0 
          ? `${thisMonthSpent >= lastMonthSpent ? '+' : ''}${((thisMonthSpent - lastMonthSpent) / lastMonthSpent * 100).toFixed(0)}% vs last month`
          : thisMonthSpent > 0 ? '+100% vs last month' : '0% vs last month';

        // Calculate average rating
        const ratedRequests = requests.filter(r => r.rating !== null && r.rating > 0);
        const averageRating = ratedRequests.length > 0
          ? (ratedRequests.reduce((sum, r) => sum + r.rating, 0) / ratedRequests.length).toFixed(1)
          : '0';

        // Update stats
        setStats([
          {
            title: 'Active Requests',
            value: activeRequests.length.toString(),
            change: `+${thisWeekActive} this week`,
            icon: <Wrench className="w-6 h-6" />,
            color: '#E94A02'
          },
          {
            title: 'Completed Requests',
            value: completedRequests.length.toString(),
            change: `+${thisMonthCompleted} this month`,
            icon: <CheckCircle className="w-6 h-6" />,
            color: '#10b981'
          },
          {
            title: 'Total Spent',
            value: `£${totalSpent.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            change: spentChange,
            icon: <TrendingUp className="w-6 h-6" />,
            color: '#2001AF'
          },
          {
            title: 'Rating',
            value: averageRating,
            change: `Based on ${ratedRequests.length} reviews`,
            icon: <Star className="w-6 h-6" />,
            color: '#f59e0b'
    }
        ]);

        // Get recent requests (last 5)
        const recent = requests.slice(0, 5).map(request => ({
          id: request.id,
          zohoId: request.zoho_id,
          title: request.title,
          status: request.status,
          priority: request.priority,
          assignedTo: request.assigned_to || 'Unassigned',
          date: new Date(request.requested_date || request.created_at).toLocaleDateString('en-GB'),
          type: request.service_type,
          icon: getServiceIcon(request.service_type)
        }));

        setRecentRequests(recent);
      } catch (error) {
('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);


  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'scheduled':
      case 'confirmed': return '#3b82f6';
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

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getWeekDates = (date) => {
    const week = [];
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    const monday = new Date(current);
    monday.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(monday);
      weekDate.setDate(monday.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const getJobsForDate = (date) => {
    if (!scheduledJobs || scheduledJobs.length === 0) return [];
    const dateStr = date.toDateString();
    return scheduledJobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      return jobDate.toDateString() === dateStr;
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Fetch My Requests data
  useEffect(() => {
    if (activeTab === 'requests') {
      const fetchRequests = async () => {
        try {
          setRequestsLoading(true);
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) return;

          const { data: requestsData, error: requestsError } = await supabase
            .from('requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (requestsError) throw requestsError;

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

          setAllRequests(formattedRequests);
          setFilteredRequests(formattedRequests);
        } catch (error) {
('Error fetching requests:', error);
        } finally {
          setRequestsLoading(false);
        }
      };

      fetchRequests();
    }
  }, [activeTab]);

  // Filter requests
  useEffect(() => {
    if (activeTab === 'requests') {
      let filtered = [...allRequests];
      if (searchTerm) {
        filtered = filtered.filter(request => 
          request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.zohoId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (statusFilter !== 'all') {
        filtered = filtered.filter(request => request.status === statusFilter);
      }
      if (priorityFilter !== 'all') {
        filtered = filtered.filter(request => request.priority === priorityFilter);
      }
      setFilteredRequests(filtered);
    }
  }, [searchTerm, statusFilter, priorityFilter, allRequests, activeTab]);

  // Fetch Settings data
  useEffect(() => {
    if (activeTab === 'settings') {
      const fetchSettingsData = async () => {
        try {
          setSettingsLoading(true);
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) return;

          const { data: userDataFromDB, error: dataError } = await supabase
            .from('users')
            .select('full_name, phone')
            .eq('id', user.id)
            .single();

          setSettingsUserData({
            email: user.email || '',
            fullName: userDataFromDB?.full_name || '',
            phone: userDataFromDB?.phone || ''
          });
        } catch (error) {
('Error fetching settings data:', error);
          setSettingsError('Failed to load user data');
        } finally {
          setSettingsLoading(false);
        }
      };

      fetchSettingsData();
    }
  }, [activeTab]);

  // Fetch Scheduled Jobs
  useEffect(() => {
    if (activeTab === 'schedule') {
      const fetchScheduledJobs = async () => {
        try {
          setScheduleLoading(true);
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) return;

          // Fetch only confirmed jobs with a scheduled_date
          const { data: jobsData, error: jobsError } = await supabase
            .from('requests')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'confirmed')
            .not('scheduled_date', 'is', null)
            .order('scheduled_date', { ascending: true });

          if (jobsError) throw jobsError;

          // Format scheduled jobs
          const formattedJobs = jobsData.map(job => ({
            id: job.id,
            zohoId: job.zoho_id && job.zoho_id.trim() !== '' ? job.zoho_id : null,
            title: job.title,
            description: job.description,
            serviceType: job.service_type,
            location: job.location,
            assignedTo: job.assigned_to,
            scheduledDate: job.scheduled_date,
            priority: job.priority,
            cost: job.cost
          }));

          setScheduledJobs(formattedJobs);
        } catch (error) {
('Error fetching scheduled jobs:', error);
        } finally {
          setScheduleLoading(false);
        }
      };

      fetchScheduledJobs();
    }
  }, [activeTab]);

  // Settings handlers
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsError('');
    setSettingsSuccess('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: settingsUserData.fullName,
          phone: settingsUserData.phone
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSettingsSuccess('Profile updated successfully');
      setTimeout(() => setSettingsSuccess(''), 3000);
    } catch (error) {
      setSettingsError(error.message || 'Failed to update profile');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsError('');
    setSettingsSuccess('');

    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setSettingsError('New passwords do not match');
        setSettingsSaving(false);
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setSettingsError('Password must be at least 6 characters');
        setSettingsSaving(false);
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) throw updateError;

      setSettingsSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSettingsSuccess(''), 3000);
    } catch (error) {
      setSettingsError(error.message || 'Failed to update password');
    } finally {
      setSettingsSaving(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications || showUserMenu) {
        if (!event.target.closest('[data-dropdown]')) {
          setShowNotifications(false);
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications, showUserMenu]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{
          width: '250px',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          padding: '2rem 0',
          minHeight: 'calc(100vh - 80px)'
        }}>
          <nav>
            {[
              { id: 'overview', label: 'Overview', icon: <TrendingUp size={20} />, action: () => setActiveTab('overview') },
              { id: 'requests', label: 'My Requests', icon: <Wrench size={20} />, action: () => setActiveTab('requests') },
              { id: 'new-request', label: 'New Request', icon: <Plus size={20} />, action: () => navigate('/new-request'), isExternal: true },
              { id: 'schedule', label: 'Schedule', icon: <Calendar size={20} />, action: () => setActiveTab('schedule') },
              { id: 'team', label: 'Team', icon: <Users size={20} />, action: () => setActiveTab('team') },
              { id: 'settings', label: 'Settings', icon: <Settings size={20} />, action: () => setActiveTab('settings') }
            ].map(item => (
              <button
                key={item.id}
                onClick={item.action}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  backgroundColor: !item.isExternal && activeTab === item.id ? '#f0f9ff' : 'transparent',
                  color: !item.isExternal && activeTab === item.id ? '#2001AF' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: !item.isExternal && activeTab === item.id ? '600' : '500',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!(!item.isExternal && activeTab === item.id)) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!item.isExternal && activeTab === item.id)) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem' }}>
          {activeTab === 'overview' && (
            <>
              {/* Welcome Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  Welcome back, {userName.split(' ')[0]}! 👋
                </h2>
                <p style={{
                  color: '#6b7280',
                  fontSize: '1rem'
                }}>
                  Here's what's happening with your property maintenance today.
                </p>
              </div>

              {/* Stats Grid */}
              {loading ? (
                <div style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#6b7280',
                  marginBottom: '2rem'
                }}>
                  Loading statistics...
                </div>
              ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {stats.map((stat, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: `${stat.color}15`,
                        borderRadius: '0.75rem',
                        color: stat.color
                      }}>
                        {stat.icon}
                      </div>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#10b981',
                        fontWeight: '500'
                      }}>
                        {stat.change}
                      </span>
                    </div>
                    <h3 style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: '0.25rem'
                    }}>
                      {stat.value}
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      {stat.title}
                    </p>
                  </div>
                ))}
              </div>
              )}

              {/* Recent Jobs */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0
                  }}>
                    Recent Requests
                  </h3>
                  <a href="/new-request" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#E94A02',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}>
                    <Plus size={16} />
                    New Request
                  </a>
                </div>

                <div style={{ padding: '0' }}>
                  {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      Loading requests...
                    </div>
                  ) : recentRequests.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      No requests yet. Create your first request!
                    </div>
                  ) : (
                    recentRequests.map((request, index) => (
                    <div key={request.id} style={{
                      padding: '1.5rem',
                      borderBottom: index < recentRequests.length - 1 ? '1px solid #f3f4f6' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '0.75rem',
                        color: '#6b7280'
                      }}>
                        {request.icon}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          marginBottom: '0.5rem'
                        }}>
                          <h4 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: 0
                          }}>
                            {request.title}
                          </h4>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: getStatusColor(request.status),
                            backgroundColor: `${getStatusColor(request.status)}15`,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.375rem'
                          }}>
                            {formatStatus(request.status)}
                          </span>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: getPriorityColor(request.priority),
                            backgroundColor: `${getPriorityColor(request.priority)}15`,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.375rem'
                          }}>
                            {formatPriority(request.priority)}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          fontSize: '0.875rem',
                          color: '#6b7280'
                        }}>
                          <span>ID: {request.zohoId || request.id.substring(0, 8)}</span>
                          <span>•</span>
                          <span>Assigned to: {request.assignedTo}</span>
                          <span>•</span>
                          <span>{request.date}</span>
                        </div>
                      </div>

                      <a href={`/request/${request.id}`} style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #e5e7eb',
                        color: '#6b7280',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                        display: 'inline-block'
                      }}>
                        View Details
                      </a>
                    </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'requests' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                My Requests
              </h2>
              
              {requestsLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E94A02', margin: '0 auto 1rem' }} />
                  <p style={{ color: '#6b7280' }}>Loading requests...</p>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}

          {activeTab === 'new-request' && (
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <Plus size={48} style={{ color: '#E94A02', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                New Request
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Create a new maintenance request for your business.
              </p>
              <a href="/new-request" style={{
                backgroundColor: '#E94A02',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                Start New Request
              </a>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              {/* Header with View Toggle and Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                  Schedule
                </h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* View Toggle */}
                  <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', padding: '0.25rem', gap: '0.25rem' }}>
                    <button
                      onClick={() => setScheduleView('month')}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        backgroundColor: scheduleView === 'month' ? 'white' : 'transparent',
                        color: scheduleView === 'month' ? '#111827' : '#6b7280',
                        boxShadow: scheduleView === 'month' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setScheduleView('week')}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        backgroundColor: scheduleView === 'week' ? 'white' : 'transparent',
                        color: scheduleView === 'week' ? '#111827' : '#6b7280',
                        boxShadow: scheduleView === 'week' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Week
                    </button>
                  </div>
                </div>
              </div>

              {scheduleLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E94A02', margin: '0 auto 1rem' }} />
                  <p style={{ color: '#6b7280' }}>Loading schedule...</p>
                </div>
              ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  {/* Calendar Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button
                        onClick={() => scheduleView === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #e5e7eb',
              backgroundColor: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#2001AF';
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <ChevronLeft size={20} style={{ color: '#374151' }} />
                      </button>
                      
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0, minWidth: '200px', textAlign: 'center' }}>
                        {scheduleView === 'month' 
                          ? currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
                          : (() => {
                              const weekDates = getWeekDates(currentDate);
                              const start = weekDates[0];
                              const end = weekDates[6];
                              if (start.getMonth() === end.getMonth()) {
                                return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
                              } else {
                                return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
                              }
                            })()}
                      </h3>
                      
                      <button
                        onClick={() => scheduleView === 'month' ? navigateMonth(1) : navigateWeek(1)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#2001AF';
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <ChevronRight size={20} style={{ color: '#374151' }} />
                      </button>
                    </div>
                    
                    <button
                      onClick={goToToday}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2001AF';
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      Today
                    </button>
                  </div>

                  {/* Calendar View */}
                  {scheduleView === 'month' ? (
                    (() => {
                      const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
                      const today = new Date();
                      const days = [];
                      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      
                      // Add empty cells for days before the first day of the month
                      for (let i = 0; i < startingDayOfWeek; i++) {
                        days.push(null);
                      }
                      
                      // Add all days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        days.push(new Date(year, month, day));
                      }
                      
                      return (
                        <div>
                          {/* Week day headers */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {weekDays.map(day => (
                              <div key={day} style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                                {day}
                              </div>
                            ))}
                          </div>
                          
                          {/* Calendar grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                            {days.map((date, index) => {
                              if (!date) {
                                return <div key={index} style={{ minHeight: '100px', border: '1px solid #f3f4f6', borderRadius: '0.5rem' }} />;
                              }
                              
                              const isToday = date.toDateString() === today.toDateString();
                              const isCurrentMonth = date.getMonth() === month;
                              const jobsForDate = getJobsForDate(date);
                              
                              return (
                                <div
                                  key={index}
                                  style={{
                                    minHeight: '100px',
                                    border: isToday ? '2px solid #2001AF' : '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem',
                                    backgroundColor: isToday ? '#f0f4ff' : 'white',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isToday) {
                                      e.currentTarget.style.borderColor = '#2001AF';
                                      e.currentTarget.style.backgroundColor = '#f9fafb';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isToday) {
                                      e.currentTarget.style.borderColor = '#e5e7eb';
                                      e.currentTarget.style.backgroundColor = 'white';
                                    }
                                  }}
                                >
                                  <div style={{ 
                                    fontSize: '0.875rem', 
                                    fontWeight: isToday ? '700' : '600', 
                                    color: isCurrentMonth ? (isToday ? '#2001AF' : '#111827') : '#9ca3af',
                                    marginBottom: '0.5rem'
                                  }}>
                                    {date.getDate()}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {jobsForDate.slice(0, 3).map((job, jobIndex) => (
                                      <div
                                        key={job.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/request/${job.id}`);
                                        }}
                                        style={{
                                          backgroundColor: getStatusColor(job.status),
                                          color: 'white',
                                          padding: '0.25rem 0.5rem',
                                          borderRadius: '0.25rem',
                                          fontSize: '0.75rem',
                                          cursor: 'pointer',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.opacity = '0.9';
                                          e.currentTarget.style.transform = 'scale(1.02)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.opacity = '1';
                                          e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                        title={job.title}
                                      >
                                        {job.title.length > 20 ? `${job.title.substring(0, 20)}...` : job.title}
                                      </div>
                                    ))}
                                    {jobsForDate.length > 3 && (
                                      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', padding: '0.25rem 0.5rem' }}>
                                        +{jobsForDate.length - 3} more
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    (() => {
                      const weekDates = getWeekDates(currentDate);
                      const today = new Date();
                      const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      
                      return (
                        <div>
                          {/* Week day headers */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {weekDays.map((day, index) => {
                              const date = weekDates[index];
                              const isToday = date.toDateString() === today.toDateString();
                              
                              return (
                                <div key={day} style={{ 
                                  textAlign: 'center', 
                                  padding: '0.75rem', 
                                  fontSize: '0.875rem', 
                                  fontWeight: '600',
                                  color: isToday ? '#2001AF' : '#6b7280',
                                  borderBottom: isToday ? '2px solid #2001AF' : '1px solid #e5e7eb'
                                }}>
                                  <div>{day.substring(0, 3)}</div>
                                  <div style={{ fontSize: '0.75rem', color: isToday ? '#2001AF' : '#9ca3af', marginTop: '0.25rem' }}>
                                    {date.getDate()}/{date.getMonth() + 1}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Week grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', minHeight: '400px' }}>
                            {weekDates.map((date, index) => {
                              const isToday = date.toDateString() === today.toDateString();
                              const jobsForDate = getJobsForDate(date);
                              
                              return (
                                <div
                                  key={index}
                                  style={{
                                    border: isToday ? '2px solid #2001AF' : '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    padding: '0.75rem',
                                    backgroundColor: isToday ? '#f0f4ff' : 'white',
                                    minHeight: '400px',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isToday) {
                                      e.currentTarget.style.borderColor = '#2001AF';
                                      e.currentTarget.style.backgroundColor = '#f9fafb';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isToday) {
                                      e.currentTarget.style.borderColor = '#e5e7eb';
                                      e.currentTarget.style.backgroundColor = 'white';
                                    }
                                  }}
                                >
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {jobsForDate.length > 0 ? (
                                      jobsForDate.map((job) => {
                                        const scheduledDate = new Date(job.scheduledDate);
                                        
                                        return (
                                          <div
                                            key={job.id}
                                            onClick={() => navigate(`/request/${job.id}`)}
                                            style={{
                                              backgroundColor: getStatusColor(job.status),
                                              color: 'white',
                                              padding: '0.75rem',
                                              borderRadius: '0.5rem',
                                              cursor: 'pointer',
                                              transition: 'all 0.2s ease',
                                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.opacity = '0.9';
                                              e.currentTarget.style.transform = 'translateY(-2px)';
                                              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.opacity = '1';
                                              e.currentTarget.style.transform = 'translateY(0)';
                                              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                                            }}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                              {getServiceIcon(job.serviceType)}
                                              <div style={{ fontSize: '0.875rem', fontWeight: '600', flex: 1 }}>
                                                {job.title.length > 30 ? `${job.title.substring(0, 30)}...` : job.title}
                                              </div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                              <Clock size={12} />
                                              {scheduledDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {job.location && (
                                              <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <MapPin size={12} />
                                                {job.location.length > 25 ? `${job.location.substring(0, 25)}...` : job.location}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <div style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>
                                        No jobs scheduled
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <Users size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                Team
              </h3>
              <p style={{ color: '#6b7280' }}>
                Manage your team members and their access to the portal.
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                Settings
              </h2>

              {settingsLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E94A02', margin: '0 auto 1rem' }} />
                  <p style={{ color: '#6b7280' }}>Loading settings...</p>
                </div>
              ) : (
                <>
                  {/* Success/Error Messages */}
                  {settingsError && (
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
                      <span>{settingsError}</span>
                    </div>
                  )}

                  {settingsSuccess && (
                    <div style={{
                      padding: '1rem',
                      backgroundColor: '#d1fae5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '0.75rem',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#059669'
                    }}>
                      <CheckCircle size={20} />
                      <span>{settingsSuccess}</span>
                    </div>
                  )}

                  {/* Profile Settings */}
            <div style={{
              backgroundColor: 'white',
                    borderRadius: '1rem',
              padding: '2rem',
                    marginBottom: '2rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <User style={{ color: '#E94A02', width: '24px', height: '24px' }} />
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                        Profile Information
                      </h3>
                    </div>

                    <form onSubmit={handleProfileUpdate}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={settingsUserData.fullName}
                            onChange={(e) => setSettingsUserData(prev => ({ ...prev, fullName: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              fontSize: '1rem',
                              outline: 'none',
                              transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                            Email
                          </label>
                          <input
                            type="email"
                            value={settingsUserData.email}
                            disabled
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              fontSize: '1rem',
                              backgroundColor: '#f3f4f6',
                              color: '#6b7280',
                              cursor: 'not-allowed'
                            }}
                          />
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            Email cannot be changed
                          </p>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={settingsUserData.phone}
                            onChange={(e) => setSettingsUserData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+44 20 7123 4567"
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              fontSize: '1rem',
                              outline: 'none',
                              transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={settingsSaving}
                          style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '0.5rem',
                            backgroundColor: settingsSaving ? '#9ca3af' : '#E94A02',
                            color: 'white',
                            cursor: settingsSaving ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            justifyContent: 'center',
                            opacity: settingsSaving ? 0.7 : 1
                          }}
                        >
                          {settingsSaving ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Password Settings */}
                  <div style={{
                    backgroundColor: 'white',
              borderRadius: '1rem',
                    padding: '2rem',
                    marginBottom: '2rem',
              border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <Lock style={{ color: '#E94A02', width: '24px', height: '24px' }} />
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                        Change Password
              </h3>
                    </div>

                    <form onSubmit={handlePasswordChange}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              fontSize: '1rem',
                              outline: 'none',
                              transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              fontSize: '1rem',
                              outline: 'none',
                              transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            Must be at least 6 characters
                          </p>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              fontSize: '1rem',
                              outline: 'none',
                              transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#2001AF'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={settingsSaving}
                          style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '0.5rem',
                            backgroundColor: settingsSaving ? '#9ca3af' : '#E94A02',
                            color: 'white',
                            cursor: settingsSaving ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            justifyContent: 'center',
                            opacity: settingsSaving ? 0.7 : 1
                          }}
                        >
                          {settingsSaving ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Lock size={16} />
                              Update Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
