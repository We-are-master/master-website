import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const HeaderB2C = () => {
  const navigate = useNavigate();

  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div
          onClick={() => navigate('/')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#E94A02',
            margin: 0
          }}>
            Master
          </h1>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#111827'
          }}>
Master
          </span>
        </div>

        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'transparent',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            color: '#2001AF',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f9fafb';
            e.target.style.borderColor = '#2001AF';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.borderColor = '#e5e7eb';
          }}
        >
          <LogIn size={18} />
          Login
        </button>
      </div>
    </header>
  );
};

export default HeaderB2C;
