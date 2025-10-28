import React from 'react'
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Apple, Play } from 'lucide-react'
import logo from '../assets/logo.png'

const Footer = () => {
  return (
    <footer style={{backgroundColor: '#020135', color: 'white'}}>
      <div className="container">
        {/* Main footer content */}
        <div style={{padding: '4rem 0'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem'}}>
            {/* Company Info */}
            <div>
              <div style={{marginBottom: '1.5rem'}}>
                <div style={{marginBottom: '1rem'}}>
                  <img 
                    src={logo} 
                    alt="Master" 
                    style={{
                      height: '50px',
                      width: 'auto',
                      filter: 'brightness(0) invert(1)'
                    }}
                  />
                </div>
                <div style={{fontSize: '0.875rem', color: '#E94A02', marginBottom: '1rem', fontWeight: '500'}}>
                  for Business
                </div>
                <p style={{color: '#e5e7eb', lineHeight: '1.625', marginBottom: '1.5rem'}}>
                  Master is an all-in-one platform connecting customers and businesses 
                  with trusted, vetted professionals for cleaning, repairs and property 
                  maintenance across London.
                </p>
              </div>
              
              {/* App Store Links */}
              <div style={{marginBottom: '1.5rem'}}>
                <p style={{color: 'white', fontWeight: '600', marginBottom: '0.75rem'}}>Download Our App</p>
                <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                  <a href="#" style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: '#2001AF', 
                    color: 'white', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '0.5rem', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}>
                    <Apple className="w-4 h-4" style={{marginRight: '0.5rem'}} />
                    App Store
                  </a>
                  <a href="#" style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    backgroundColor: '#E94A02', 
                    color: 'white', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '0.5rem', 
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}>
                    <Play className="w-4 h-4" style={{marginRight: '0.5rem'}} />
                    Play Store
                  </a>
                </div>
              </div>
              
              {/* Social Media */}
              <div style={{display: 'flex', gap: '1rem'}}>
                <a href="#" style={{color: '#9ca3af', transition: 'color 0.3s ease'}}>
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" style={{color: '#9ca3af', transition: 'color 0.3s ease'}}>
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" style={{color: '#9ca3af', transition: 'color 0.3s ease'}}>
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" style={{color: '#9ca3af', transition: 'color 0.3s ease'}}>
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: 'white'}}>Services</h3>
              <ul style={{listStyle: 'none', padding: 0}}>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>Trades Services</a></li>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>End of Tenancy Cleaning</a></li>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>Deep Cleaning</a></li>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>Plumbing</a></li>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>Electrical</a></li>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>Handyman</a></li>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>Carpentry</a></li>
              </ul>
            </div>

            {/* Business */}
            <div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: 'white'}}>For Business</h3>
              <ul style={{listStyle: 'none', padding: 0}}>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>Master for Business</a></li>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>Join as a Handyman</a></li>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>Join as a Cleaner</a></li>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>API Integration</a></li>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>Partner Portal</a></li>
                <li style={{marginBottom: '0.75rem'}}><a href="#" style={{color: 'white', textDecoration: 'none', transition: 'color 0.3s ease'}}>Become a Partner</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: 'white'}}>Contact</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div style={{display: 'flex', alignItems: 'flex-start'}}>
                  <MapPin className="w-5 h-5" style={{color: '#E94A02', marginRight: '0.75rem', marginTop: '0.25rem', flexShrink: 0}} />
                  <div>
                    <p style={{color: '#e5e7eb', margin: 0}}>
                      124 City Rd, London<br />
                      EC1V 2NX<br />
                      United Kingdom
                    </p>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'flex-start'}}>
                  <Phone className="w-5 h-5" style={{color: '#E94A02', marginRight: '0.75rem', marginTop: '0.25rem', flexShrink: 0}} />
                  <div>
                    <p style={{color: '#e5e7eb', margin: 0}}>020 3337 6168</p>
                    <p style={{color: '#e5e7eb', margin: 0}}>079 8318 2332</p>
                    <p style={{color: '#e5e7eb', margin: 0}}>075 0880 1803</p>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Mail className="w-5 h-5" style={{color: '#E94A02', marginRight: '0.75rem', flexShrink: 0}} />
                  <p style={{color: '#e5e7eb', margin: 0}}>hello@wearemaster.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div style={{padding: '2rem 0', borderTop: '1px solid #374151'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <div style={{display: 'flex', color: '#E94A02', marginRight: '0.75rem'}}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{fontSize: '1.125rem'}}>★</span>
                ))}
              </div>
              <div style={{fontSize: '0.875rem', color: '#e5e7eb'}}>
                <span style={{fontWeight: '600'}}>5.0</span> Top Rated Service
              </div>
              <div style={{marginLeft: '0.5rem', fontSize: '0.75rem', color: '#9ca3af'}}>
                verified by Trustindex
              </div>
            </div>
            
            <div style={{fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center'}}>
              MASTER SERVICES TRADES LTD Company number <strong style={{color: 'white'}}>15406523</strong>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div style={{padding: '1.5rem 0', borderTop: '1px solid #374151'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'}}>
            <div style={{color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center'}}>
              © Copyright by Master Services – All right reserved.
            </div>
            <div style={{display: 'flex', gap: '1.5rem', fontSize: '0.875rem'}}>
              <a href="#" style={{color: '#2001AF', textDecoration: 'none', transition: 'color 0.3s ease'}}>
                Terms and conditions
              </a>
              <a href="#" style={{color: '#2001AF', textDecoration: 'none', transition: 'color 0.3s ease'}}>
                Privacy policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
