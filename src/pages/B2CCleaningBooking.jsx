import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './B2CCleaningBooking.css';

// This is a simplified React version of the cleaning booking form
// The full implementation would require Stripe integration and Google Places API
const B2CCleaningBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [state, setState] = useState({
    postcode: '',
    cleanType: '',
    propertyType: '',
    addressPicked: '',
    bedrooms: 1,
    bathrooms: 1,
    extras: new Set(),
    steam: new Set(),
    products: '',
    parking: '',
    contact: {
      firstName: '',
      phone: '',
      email: '',
      address: '',
      date: '',
      slot: ''
    },
    coupon: {
      code: '',
      discount: 0,
      applied: false
    }
  });

  // Initialize from location state
  useEffect(() => {
    if (location.state?.postcode) {
      setState(prev => ({ ...prev, postcode: location.state.postcode }));
    }
    if (location.state?.jobDescription) {
      // Check if description mentions cleaning
      const desc = location.state.jobDescription.toLowerCase();
      if (desc.includes('cleaning') || desc.includes('clean')) {
        // Auto-detect cleaning type if possible
      }
    }
  }, [location.state]);

  const updateState = (updates) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      // Handle nested updates
      if (updates.contact) {
        newState.contact = { ...prev.contact, ...updates.contact };
      }
      if (updates.coupon) {
        newState.coupon = { ...prev.coupon, ...updates.coupon };
      }
      return newState;
    });
  };

  const handleStep1Continue = () => {
    if (!state.addressPicked.trim()) {
      alert('Please enter/select your address.');
      return;
    }
    setStep(2);
  };

  const handleStep2Continue = () => {
    if (!state.cleanType) {
      alert('Select a cleaning type.');
      return;
    }
    setStep(3);
  };

  const handleStep3Continue = () => {
    const { firstName, phone, email, address, date, slot } = state.contact;
    if (!firstName || !phone || !email || !address || !date || !slot) {
      alert('Please complete your details and choose date & time.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    setStep(4);
  };

  const toggleExtra = (task) => {
    setState(prev => {
      const newExtras = new Set(prev.extras);
      if (newExtras.has(task)) {
        newExtras.delete(task);
      } else {
        newExtras.add(task);
      }
      return { ...prev, extras: newExtras };
    });
  };

  const toggleSteam = (service) => {
    setState(prev => {
      const newSteam = new Set(prev.steam);
      if (newSteam.has(service)) {
        newSteam.delete(service);
      } else {
        newSteam.add(service);
      }
      return { ...prev, steam: newSteam };
    });
  };

  const calculatePrice = () => {
    // Simplified pricing calculation
    // In production, use the full PRICING object from the original code
    let base = 0;
    
    if (state.cleanType === 'deep') {
      base = state.propertyType === 'house' ? 229.17 : 166.67;
    } else if (state.cleanType === 'eot') {
      base = state.propertyType === 'house' ? 254.17 : 191.67;
    } else if (state.cleanType === 'after_builders') {
      base = state.propertyType === 'house' ? 257.50 : 195.00;
    } else if (state.cleanType === 'upholstery') {
      base = 75.00; // Minimum
    }

    // Add extras
    const extrasTotal = Array.from(state.extras).reduce((sum, task) => {
      const prices = {
        inside_windows: 25,
        inside_fridge: 20.83,
        inside_oven: 91.67,
        balcony: 50.00,
        bathroom: 29.17,
        kitchen: 29.17,
        living_room: 29.17,
        extra_room: 29.17
      };
      return sum + (prices[task] || 0);
    }, 0);

    const parkingFee = state.parking === 'no' ? 15 : 0;
    const materialsFee = state.products === 'bring' ? 6 : 0;

    let total = base + extrasTotal + parkingFee + materialsFee;
    
    // Apply coupon
    if (state.coupon.applied && state.coupon.discount > 0) {
      total = Math.max(0, total - state.coupon.discount);
    }

    return Math.round(total * 100) / 100;
  };

  return (
    <div className="mcx">
      <div className="wrap">
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 0',
          marginBottom: '1rem'
        }}>
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

        <div className="hero-banner" role="img" aria-label="You're almost there — book now and let us handle the rest."></div>

        <h2>Your Home, Your Way</h2>
        <p className="lead">Flexible services tailored to your schedule</p>

        {/* Progress Stepper */}
        <div className="stepper" aria-label="Progress">
          <div className="step">
            <span style={{ width: step >= 1 ? '100%' : '25%' }}></span>
          </div>
          <div className="step">
            <span style={{ width: step >= 2 ? '100%' : '0%' }}></span>
          </div>
          <div className="step">
            <span style={{ width: step >= 3 ? '100%' : '0%' }}></span>
          </div>
          <div className="step">
            <span style={{ width: step >= 4 ? '100%' : '0%' }}></span>
          </div>
        </div>

        <div className="grid two">
          {/* LEFT COLUMN */}
          <div id="leftCol">
            {/* STEP 1: Address */}
            {step === 1 && (
              <div id="step1" className="card stepcard" style={{ border: '2px solid #020034', boxShadow: '0 0 0 4px rgba(2,0,52,.10)' }}>
                <label id="postcodeLabel" style={{ position: 'relative', paddingRight: '88px' }}>
                  What's the service address?
                  <span style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'linear-gradient(90deg, #020034, #ED4A00)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '900',
                    letterSpacing: '0.03em',
                    padding: '5px 9px',
                    borderRadius: '999px',
                    boxShadow: '0 4px 10px rgba(0,0,0,.08)'
                  }}>
                    Start here
                  </span>
                </label>
                <input
                  id="addressStep1"
                  type="text"
                  placeholder="Start typing your address…"
                  autoComplete="postal-code"
                  value={state.addressPicked}
                  onChange={(e) => updateState({ addressPicked: e.target.value })}
                  style={{
                    width: '100%',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <small className="note">Start typing your address (like 123 City Road) and we'll find you</small>
                <div className="btns" style={{ marginTop: '12px' }}>
                  <button
                    className="btn primary"
                    onClick={handleStep1Continue}
                    disabled={!state.addressPicked.trim()}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Cleaning Details */}
            {step === 2 && (
              <div id="step2" className="card stepcard">
                <label>What type of clean do you need?</label>
                <div className="clean-cards" id="cleanTypeCards">
                  {[
                    { type: 'deep', icon: '🫧', title: 'Deep Clean', desc: 'More thorough than a regular clean. Remove dirt and limescale' },
                    { type: 'eot', icon: '🛋️', title: 'End of Tenancy Clean', desc: 'Our most thorough clean. When you\'re moving out or in' },
                    { type: 'after_builders', icon: '🏠', title: 'After Builders Clean', desc: 'Remove dirt and dust after building work or renovation' },
                    { type: 'upholstery', icon: '🛏️', title: 'Upholstery Cleaning', desc: 'Professional cleaning for sofas, carpets, and upholstered furniture' }
                  ].map(card => (
                    <div
                      key={card.type}
                      className={`clean-card ${state.cleanType === card.type ? 'is-active' : ''}`}
                      onClick={() => updateState({ cleanType: card.type })}
                    >
                      <div className="icon">{card.icon}</div>
                      <h4>{card.title}</h4>
                      <p>{card.desc}</p>
                    </div>
                  ))}
                </div>

                {state.cleanType !== 'upholstery' && (
                  <>
                    <div style={{ height: '10px' }}></div>
                    <label id="propertyTypeLabel">Property type</label>
                    <div className="choice-set" id="propertyChoices">
                      <div
                        className={`choice ${state.propertyType === 'house' ? 'is-active' : ''}`}
                        onClick={() => updateState({ propertyType: 'house' })}
                      >
                        House
                      </div>
                      <div
                        className={`choice ${state.propertyType === 'flat' ? 'is-active' : ''}`}
                        onClick={() => updateState({ propertyType: 'flat' })}
                      >
                        Flat
                      </div>
                    </div>

                    <div style={{ height: '10px' }}></div>
                    <label id="bedroomsLabel">How many bedrooms?</label>
                    <div className="counter" data-key="bedrooms">
                      <button
                        type="button"
                        onClick={() => updateState({ bedrooms: Math.max(1, state.bedrooms - 1) })}
                      >
                        −
                      </button>
                      <div className="value">
                        <span>{state.bedrooms}</span>&nbsp;bedroom{state.bedrooms !== 1 ? 's' : ''}
                      </div>
                      <button
                        type="button"
                        onClick={() => updateState({ bedrooms: Math.min(10, state.bedrooms + 1) })}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ height: '10px' }}></div>
                    <label id="bathroomsLabel">How many bathrooms?</label>
                    <div className="counter" data-key="bathrooms">
                      <button
                        type="button"
                        onClick={() => updateState({ bathrooms: Math.max(1, state.bathrooms - 1) })}
                      >
                        −
                      </button>
                      <div className="value">
                        <span>{state.bathrooms}</span>&nbsp;bathroom{state.bathrooms !== 1 ? 's' : ''}
                      </div>
                      <button
                        type="button"
                        onClick={() => updateState({ bathrooms: Math.min(10, state.bathrooms + 1) })}
                      >
                        +
                      </button>
                    </div>
                  </>
                )}

                <div style={{ height: '12px' }}></div>
                <label>Extra tasks (optional)</label>
                <div className="tasks" id="tasks">
                  {[
                    { key: 'inside_windows', label: 'Inside windows' },
                    { key: 'inside_fridge', label: 'Inside fridge' },
                    { key: 'inside_oven', label: 'Inside oven' },
                    { key: 'balcony', label: 'Balcony' },
                    { key: 'bathroom', label: 'Bathroom' },
                    { key: 'kitchen', label: 'Kitchen' },
                    { key: 'living_room', label: 'Living room' },
                    { key: 'extra_room', label: 'Extra room' }
                  ].map(task => (
                    <div
                      key={task.key}
                      className={`task ${state.extras.has(task.key) ? 'is-active' : ''}`}
                      onClick={() => toggleExtra(task.key)}
                    >
                      {task.label}
                    </div>
                  ))}
                </div>

                <div style={{ height: '12px' }}></div>
                <label>Cleaning products</label>
                <div className="pillset" id="productsPills">
                  <div
                    className={`pill ${state.products === 'bring' ? 'is-active' : ''}`}
                    onClick={() => updateState({ products: 'bring' })}
                  >
                    Bring cleaning products
                  </div>
                  <div
                    className={`pill ${state.products === 'client' ? 'is-active' : ''}`}
                    onClick={() => updateState({ products: 'client' })}
                  >
                    I will provide
                  </div>
                </div>

                <div className="btns" style={{ marginTop: '20px' }}>
                  <button className="btn secondary" onClick={() => setStep(1)}>Back</button>
                  <button className="btn primary" onClick={handleStep2Continue}>Continue</button>
                </div>
              </div>
            )}

            {/* STEP 3: Date, Time, Contact */}
            {step === 3 && (
              <div id="step3" className="card stepcard">
                <div className="oneCol">
                  <div>
                    <label>Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={state.contact.date}
                      onChange={(e) => updateState({ contact: { ...state.contact, date: e.target.value } })}
                      style={{
                        width: '100%',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label>What time would you like the cleaning team to arrive?</label>
                    <div className="slot-list" id="slotList">
                      {[
                        { key: 'daytime', title: 'Daytime', time: '09:00 - 15:00' },
                        { key: 'early_morning', title: 'Early morning', time: '08:00 - 09:00' },
                        { key: 'morning', title: 'Morning', time: '09:00 - 12:00' },
                        { key: 'afternoon', title: 'Afternoon', time: '12:00 - 15:00' },
                        { key: 'late_afternoon', title: 'Late afternoon', time: '15:00 - 18:00' },
                        { key: 'evening', title: 'Evening', time: '18:00 - 19:00' }
                      ].map(slot => (
                        <div
                          key={slot.key}
                          className={`slot-row ${state.contact.slot === `${slot.title} (${slot.time})` ? 'is-active' : ''}`}
                          onClick={() => updateState({ contact: { ...state.contact, slot: `${slot.title} (${slot.time})` } })}
                        >
                          <strong>{slot.title}</strong>
                          <span>{slot.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ height: '10px' }}></div>
                <label>Can you provide free parking?</label>
                <div className="choice-set" id="parkingChoices">
                  <div
                    className={`choice ${state.parking === 'yes' ? 'is-active' : ''}`}
                    onClick={() => updateState({ parking: 'yes' })}
                  >
                    Yes
                  </div>
                  <div
                    className={`choice ${state.parking === 'no' ? 'is-active' : ''}`}
                    onClick={() => updateState({ parking: 'no' })}
                  >
                    No
                  </div>
                </div>
                <small className="note">If no, a £15 parking fee applies.</small>

                <div style={{ height: '12px' }}></div>
                <div className="twoCol">
                  <div>
                    <label>First name</label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Your name"
                      value={state.contact.firstName}
                      onChange={(e) => updateState({ contact: { ...state.contact, firstName: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label>Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="e.g. 07123 456789"
                      value={state.contact.phone}
                      onChange={(e) => updateState({ contact: { ...state.contact, phone: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label>Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={state.contact.email}
                      onChange={(e) => updateState({ contact: { ...state.contact, email: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label>Postcode</label>
                    <input
                      id="postcodeEcho"
                      type="text"
                      value={state.postcode}
                      disabled
                    />
                  </div>
                </div>

                <div style={{ height: '8px' }}></div>
                <label>Address</label>
                <input
                  id="address"
                  type="text"
                  placeholder="Your address"
                  value={state.contact.address || state.addressPicked}
                  onChange={(e) => updateState({ contact: { ...state.contact, address: e.target.value } })}
                />

                <div className="btns" style={{ marginTop: 'auto' }}>
                  <button className="btn secondary" onClick={() => setStep(2)}>Back</button>
                  <button className="btn orange" onClick={handleStep3Continue}>
                    Proceed to payment
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Payment */}
            {step === 4 && (
              <div id="step4" className="card stepcard">
                <h3 className="payhead">Secure payment</h3>
                <p className="paynote">Complete your booking on this page.</p>

                <div className="paygrid">
                  <div>
                    <div className="twoCol" style={{ marginBottom: '8px' }}>
                      <input
                        id="couponCode"
                        type="text"
                        placeholder="Coupon code (optional)"
                      />
                      <button className="btn secondary" id="applyCoupon" type="button">
                        Apply
                      </button>
                    </div>

                    <div className="btns">
                      <button type="button" className="btn secondary" onClick={() => setStep(3)}>
                        Back
                      </button>
                      <button
                        id="submitPayment"
                        className="btn orange"
                        onClick={() => {
                          const total = calculatePrice();
                          alert(`Booking confirmed! Total: £${total.toFixed(2)}\n\n(In production, this would integrate with Stripe payment processing)`);
                          navigate('/');
                        }}
                      >
                        Pay now £{calculatePrice().toFixed(2)}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="paybox" id="payBox">
                      <div className="label">You'll pay now</div>
                      <div className="amount">£{calculatePrice().toFixed(2)}</div>
                      <div className="sub">Secure payment • Stripe</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside>
            <div className="sticky">
              <div className="card faq">
                <details open>
                  <summary>How does pricing work?</summary>
                  <p className="note">Base hourly rate by type + extras + products (if we bring them).</p>
                </details>
                <details>
                  <summary>Will I always have the same cleaner?</summary>
                  <p className="note">We try to keep the same professional for recurring cleans.</p>
                </details>
                <details>
                  <summary>Minimum contract?</summary>
                  <p className="note">No. Change or cancel anytime.</p>
                </details>
              </div>

              <div className="card summary">
                <div className="head">Booking summary</div>
                <div className="list">
                  <div className="row">
                    <span className="key">Type</span>
                    <span className="val">
                      {state.cleanType === 'deep' ? 'Deep clean' :
                       state.cleanType === 'eot' ? 'End of tenancy' :
                       state.cleanType === 'after_builders' ? 'After builders' :
                       state.cleanType === 'upholstery' ? 'Upholstery cleaning' : '—'}
                    </span>
                  </div>
                  <div className="row">
                    <span className="key">Parking</span>
                    <span className="val">
                      {state.parking === 'yes' ? 'Yes (free)' :
                       state.parking === 'no' ? 'No (+£15)' : '—'}
                    </span>
                  </div>
                  <div className="row">
                    <span className="key">Postcode</span>
                    <span className="val">{state.postcode || '—'}</span>
                  </div>
                  <div className="row">
                    <span className="key">Bedrooms</span>
                    <span className="val">{state.bedrooms || '—'}</span>
                  </div>
                  <div className="row">
                    <span className="key">Bathrooms</span>
                    <span className="val">{state.bathrooms || '—'}</span>
                  </div>
                  <div className="row">
                    <span className="key">Extra tasks</span>
                    <span className="val">{state.extras.size} selected</span>
                  </div>
                  <div className="row">
                    <span className="key">Products</span>
                    <span className="val">
                      {state.products === 'client' ? 'I will provide' :
                       state.products === 'bring' ? 'We bring' : '—'}
                    </span>
                  </div>
                  <div className="row">
                    <span className="key">Date</span>
                    <span className="val">{state.contact.date || '—'}</span>
                  </div>
                  <div className="row">
                    <span className="key">Time</span>
                    <span className="val">{state.contact.slot || '—'}</span>
                  </div>
                </div>

                <div className="totals">
                  <div className="row">
                    <span className="key">Subtotal</span>
                    <span className="val">£{calculatePrice().toFixed(2)}</span>
                  </div>
                </div>

                <div className="note">Estimates may vary based on final instructions and property condition.</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default B2CCleaningBooking;
