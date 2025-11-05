import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Phone, Mail, LogOut, Bell } from 'lucide-react'
import logo from '../assets/logo.png'
import { supabase } from '../lib/supabase'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar se o usuário está logado
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          // Buscar nome do usuário na tabela users
          const { data: userData } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', user.id)
            .single()
          
          if (userData?.full_name) {
            const nameParts = userData.full_name.trim().split(' ')
            const displayName = nameParts.length >= 2 
              ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
              : userData.full_name
            setUserName(displayName)
          } else {
            setUserName(user.email?.split('@')[0] || 'User')
          }
        }
      } catch (error) {
        console.error('Error checking user:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkUser()
      } else {
        setUserName('')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications) {
        if (!event.target.closest('[data-dropdown]')) {
          setShowNotifications(false)
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showNotifications])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserName('')
    navigate('/')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header style={{
      backgroundColor: '#020135',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      overflowX: 'hidden'
    }}>
      <div className="container" style={{width: '100%', maxWidth: '100%', overflowX: 'hidden'}}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 0',
          gap: '1rem',
          flexWrap: 'wrap',
          width: '100%',
          maxWidth: '100%'
        }}>
          {/* Logo */}
          <Link to="/" style={{display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none'}}>
            <img 
              src={logo} 
              alt="Master" 
              style={{
                height: '40px',
                width: 'auto',
                marginRight: '0.75rem',
                flexShrink: 0
              }}
            />
            <div style={{
              fontSize: '0.875rem',
              color: '#E94A02',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              for Business
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'nowrap'
          }} className="hidden md:flex">
            <a href="#services" style={{
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.875rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              Services
            </a>
            <a href="#features" style={{
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.875rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              Features
            </a>
            <a href="#process" style={{
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.875rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              How it Works
            </a>
            <a href="#faq" style={{
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.875rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              FAQ
            </a>
            <a href="/contact" style={{
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.875rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              Contact
            </a>
          </nav>

          {/* Contact Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.8)',
            flexShrink: 0
          }} className="hidden lg:flex">
            <div style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
              <Phone style={{width: '16px', height: '16px', marginRight: '0.25rem', color: '#E94A02', flexShrink: 0}} />
              <span>020 3337 6168</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
              <Mail style={{width: '16px', height: '16px', marginRight: '0.25rem', color: '#E94A02', flexShrink: 0}} />
              <span>hello@wearemaster.com</span>
            </div>
          </div>

          {/* Notifications & User Name */}
          <div className="hidden md:flex" style={{
            alignItems: 'center',
            gap: '1rem',
            flexShrink: 0
          }}>
            {loading ? (
              <div style={{ color: 'white', fontSize: '0.875rem' }}>Loading...</div>
            ) : user && userName ? (
              <>
                {/* Notifications Icon */}
                <div style={{ position: 'relative' }} data-dropdown>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNotifications(!showNotifications);
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      position: 'relative',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <Bell size={20} />
                    {notifications.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '0.25rem',
                        right: '0.25rem',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%'
                      }}></div>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      width: '320px',
                      backgroundColor: 'white',
                      borderRadius: '0.75rem',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      zIndex: 1000,
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                          Notifications
                        </h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={() => setNotifications([])}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#6b7280',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem'
                            }}
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      {notifications.length > 0 ? (
                        <div style={{ padding: '0.5rem' }}>
                          {notifications.map((notification, index) => (
                            <div
                              key={index}
                              style={{
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                marginBottom: '0.5rem',
                                backgroundColor: '#f9fafb',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#f9fafb'}
                            >
                              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>
                                {notification.title}
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                                {notification.message}
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>
                                {notification.time}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          padding: '3rem 1.5rem',
                          textAlign: 'center'
                        }}>
                          <Bell style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 1rem' }} />
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                            No notifications yet
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Name */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  whiteSpace: 'nowrap'
                }}>
                  <span 
                    onClick={() => navigate('/dashboard')}
                    style={{
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'opacity 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    {userName}
                  </span>
                  <button
                    onClick={handleLogout}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'opacity 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <a href="/login" style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'transparent',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                border: '2px solid white',
                whiteSpace: 'nowrap'
              }}>
                Login
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button md:hidden"
            style={{
              display: 'flex',
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X style={{width: '24px', height: '24px'}} /> : <Menu style={{width: '24px', height: '24px'}} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div style={{
            padding: '1rem 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <a href="#services" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Services
              </a>
              <a href="#features" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Features
              </a>
              <a href="#process" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                How it Works
              </a>
              <a href="#faq" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                FAQ
              </a>
              <a href="/contact" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Contact
              </a>
              <div style={{
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <Phone style={{width: '16px', height: '16px', marginRight: '0.5rem', color: '#E94A02'}} />
                  <span>020 3337 6168</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <Mail style={{width: '16px', height: '16px', marginRight: '0.5rem', color: '#E94A02'}} />
                  <span>hello@wearemaster.com</span>
                </div>
                {user && userName ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    marginBottom: '0.5rem'
                  }}>
                    <span 
                      onClick={() => navigate('/dashboard')}
                      style={{
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'opacity 0.3s ease',
                        flex: 1
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      {userName}
                    </span>
                    <button
                      onClick={handleLogout}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Logout"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <a href="/login" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    border: '2px solid white',
                    width: '100%'
                  }}>
                    Login
                  </a>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
