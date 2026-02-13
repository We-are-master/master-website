import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Home } from 'lucide-react';
import logo from '../assets/logo.png';
import { submitPartnerApplication } from '../lib/partnerApply';
import './PartnerApply.css';

const WORK_TYPES = [
  { id: 'handyman', label: 'Handyman' },
  { id: 'plumber', label: 'Plumber' },
  { id: 'carpenter', label: 'Carpenter' },
  { id: 'painter', label: 'Painter' },
  { id: 'builder', label: 'Builder' },
  { id: 'roofer', label: 'Roofer' },
  { id: 'electrician', label: 'Electrician' },
  { id: 'gas_technician', label: 'Gas Technician' },
  { id: 'end_of_tenancy_cleaning', label: 'End of Tenancy Cleaning' },
  { id: 'deep_cleaning', label: 'Deep Cleaning' },
  { id: 'after_builders_cleaning', label: 'After Builders Cleaning' },
];

const AREAS = [
  'London | Central',
  'London | South West',
  'London | North West',
  'London | East',
  'London | West',
];

const VEHICLES = [
  { id: 'car', label: 'Yes, I have a car' },
  { id: 'van', label: 'Yes, I have a van' },
  { id: 'motorbike', label: 'Yes, I have a motorbike' },
  { id: 'fleet', label: 'Yes, I have a fleet' },
  { id: 'none', label: "No, I don't drive" },
];

const BUSINESS_STRUCTURE = [
  { id: 'sole_trader', label: 'Sole Trader (Self-Employed)' },
  { id: 'limited_company', label: 'Limited Company' },
];

export default function PartnerApply() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United Kingdom',
    businessStructure: '',
    workTypes: [],
    areaCoverage: [],
    vehicle: '',
    teamSize: '',
    toolsPhoto: null,
    idDocument: null,
    proofOfAddress: null,
    rightToWork: null,
    publicLiability: null,
    dbs: null,
    profilePhoto: null,
    declaration: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const toggleWorkType = (id) => {
    setForm((prev) => ({
      ...prev,
      workTypes: prev.workTypes.includes(id)
        ? prev.workTypes.filter((x) => x !== id)
        : [...prev.workTypes, id],
    }));
  };

  const toggleArea = (area) => {
    setForm((prev) => ({
      ...prev,
      areaCoverage: prev.areaCoverage.includes(area)
        ? prev.areaCoverage.filter((x) => x !== area)
        : [...prev.areaCoverage, area],
    }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.fullName?.trim()) e.fullName = 'Required';
    if (!form.email?.trim()) e.email = 'Required';
    if (!form.phone?.trim()) e.phone = 'Required';
    if (!form.businessStructure) e.businessStructure = 'Required';
    if (form.workTypes.length === 0) e.workTypes = 'Select at least one';
    if (form.areaCoverage.length === 0) e.areaCoverage = 'Required';
    if (!form.vehicle) e.vehicle = 'Required';
    if (!form.toolsPhoto) e.toolsPhoto = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.idDocument) e.idDocument = 'Required';
    if (!form.proofOfAddress) e.proofOfAddress = 'Required';
    if (!form.rightToWork) e.rightToWork = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep4 = () => {
    const e = {};
    if (!form.declaration) e.declaration = 'You must confirm the declaration';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 4 && !validateStep4()) return;
    if (step < 4) setStep((s) => s + 1);
    else handleSubmit();
  };

  const resetForm = () => {
    setStep(1);
    setForm({
      fullName: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United Kingdom',
      businessStructure: '',
      workTypes: [],
      areaCoverage: [],
      vehicle: '',
      teamSize: '',
      toolsPhoto: null,
      idDocument: null,
      proofOfAddress: null,
      rightToWork: null,
      publicLiability: null,
      dbs: null,
      profilePhoto: null,
      declaration: false,
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await submitPartnerApplication(form);
      if (result.success) {
        navigate('/partner-apply/success');
      } else {
        toast.error(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pa-root">
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <header className="pa-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        background: 'rgba(2, 0, 52, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Master" style={{ height: 32, width: 'auto' }} />
        </Link>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <Home size={18} />
          Home
        </Link>
      </header>

      <div className="pa-container">
        <div className="pa-hero">
          <div className="pa-hero-badge">Become a Master Partner</div>
          <h1>More jobs. Less hassle. A real way to grow your revenue.</h1>
          <p>
            You are about to join the fastest-growing team of cleaners and tradespeople in the UK.
            Master connects you with jobs, manages the admin, and makes sure you get paid on time so you can focus on what you do best: delivering quality work.
          </p>
        </div>

        <div className="pa-steps">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`pa-step-dot ${step === s ? 'active' : step > s ? 'done' : ''}`}
            >
              {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="pa-card">
              <h2>Tell us a bit about yourself</h2>
              <div className="pa-field">
                <label>Full Name *Required</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  placeholder="Your full name"
                />
                {errors.fullName && <div className="pa-error">{errors.fullName}</div>}
              </div>
              <div className="pa-field">
                <label>Email *Required</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="you@example.com"
                />
                {errors.email && <div className="pa-error">{errors.email}</div>}
              </div>
              <div className="pa-field">
                <label>Phone *Required</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="07508123456"
                />
                {errors.phone && <div className="pa-error">{errors.phone}</div>}
              </div>
              <div className="pa-field">
                <label>Address</label>
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => update('street', e.target.value)}
                  placeholder="Street Address"
                />
              </div>
              <div className="pa-field-row">
                <div className="pa-field">
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="pa-field">
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    placeholder="State / Region / Province"
                  />
                </div>
              </div>
              <div className="pa-field-row">
                <div className="pa-field">
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => update('postalCode', e.target.value)}
                    placeholder="Postal / Zip Code"
                  />
                </div>
                <div className="pa-field">
                  <select
                    value={form.country}
                    onChange={(e) => update('country', e.target.value)}
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="pa-field">
                <label>What is your business structure? *Required</label>
                <div className="pa-options">
                  {BUSINESS_STRUCTURE.map(({ id, label }) => (
                    <label key={id} className={`pa-option ${form.businessStructure === id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="businessStructure"
                        checked={form.businessStructure === id}
                        onChange={() => update('businessStructure', id)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {errors.businessStructure && <div className="pa-error">{errors.businessStructure}</div>}
              </div>
              <div className="pa-field">
                <label>Which type of work do you provide? *Required</label>
                <div className="pa-work-types">
                  {WORK_TYPES.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      className={`pa-work-type ${form.workTypes.includes(id) ? 'selected' : ''}`}
                      onClick={() => toggleWorkType(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {errors.workTypes && <div className="pa-error">{errors.workTypes}</div>}
              </div>
              <div className="pa-field">
                <label>Area Coverage *Required</label>
                <div className="pa-work-types">
                  {AREAS.map((area) => (
                    <button
                      key={area}
                      type="button"
                      className={`pa-work-type ${form.areaCoverage.includes(area) ? 'selected' : ''}`}
                      onClick={() => toggleArea(area)}
                    >
                      {area}
                    </button>
                  ))}
                </div>
                {errors.areaCoverage && <div className="pa-error">{errors.areaCoverage}</div>}
              </div>
              <div className="pa-field">
                <label>Do you have a vehicle? *Required</label>
                <div className="pa-options">
                  {VEHICLES.map(({ id, label }) => (
                    <label key={id} className={`pa-option ${form.vehicle === id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="vehicle"
                        checked={form.vehicle === id}
                        onChange={() => update('vehicle', id)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {errors.vehicle && <div className="pa-error">{errors.vehicle}</div>}
              </div>
              <div className="pa-field">
                <label>How big is your team right now?</label>
                <input
                  type="text"
                  value={form.teamSize}
                  onChange={(e) => update('teamSize', e.target.value)}
                  placeholder="e.g. 1 or number of people"
                />
              </div>
              <div className="pa-field">
                <label>Please upload a photo of the tools and equipment you currently use *Required</label>
                <div className="pa-file-wrap">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => update('toolsPhoto', e.target.files?.[0] || null)}
                  />
                  {form.toolsPhoto && <div className="pa-file-name">Selected: {form.toolsPhoto.name}</div>}
                </div>
                {errors.toolsPhoto && <div className="pa-error">{errors.toolsPhoto}</div>}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="pa-card">
            <h2>Documents</h2>
            <div className="pa-field">
              <label>ID Document *Required</label>
              <div className="pa-file-wrap">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => update('idDocument', e.target.files?.[0] || null)}
                />
                {form.idDocument && <div className="pa-file-name">Selected: {form.idDocument.name}</div>}
              </div>
              {errors.idDocument && <div className="pa-error">{errors.idDocument}</div>}
            </div>
            <div className="pa-field">
              <label>Proof of Address *Required</label>
              <div className="pa-file-wrap">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => update('proofOfAddress', e.target.files?.[0] || null)}
                />
                {form.proofOfAddress && <div className="pa-file-name">Selected: {form.proofOfAddress.name}</div>}
              </div>
              {errors.proofOfAddress && <div className="pa-error">{errors.proofOfAddress}</div>}
            </div>
            <div className="pa-field">
              <label>Right to Work *Required</label>
              <div className="pa-file-wrap">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => update('rightToWork', e.target.files?.[0] || null)}
                />
                {form.rightToWork && <div className="pa-file-name">Selected: {form.rightToWork.name}</div>}
              </div>
              {errors.rightToWork && <div className="pa-error">{errors.rightToWork}</div>}
            </div>
            <div className="pa-field">
              <label>Public Liability Insurance <span className="pa-optional">(If Applicable)</span></label>
              <div className="pa-file-wrap">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => update('publicLiability', e.target.files?.[0] || null)}
                />
                {form.publicLiability && <div className="pa-file-name">Selected: {form.publicLiability.name}</div>}
              </div>
            </div>
            <div className="pa-field">
              <label>DBS <span className="pa-optional">(If Applicable)</span></label>
              <div className="pa-file-wrap">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => update('dbs', e.target.files?.[0] || null)}
                />
                {form.dbs && <div className="pa-file-name">Selected: {form.dbs.name}</div>}
              </div>
            </div>
            <div className="pa-field">
              <label>Profile photo or Company Logo</label>
              <div className="pa-file-wrap">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => update('profilePhoto', e.target.files?.[0] || null)}
                />
                {form.profilePhoto && <div className="pa-file-name">Selected: {form.profilePhoto.name}</div>}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="pa-card">
            <h2>Almost there</h2>
            <p className="pa-review-intro">
              Review your details and proceed to the final step to confirm and submit your application.
            </p>
            <div className="pa-review">
              <section className="pa-review-section">
                <h3>Contact</h3>
                <dl className="pa-review-dl">
                  <dt>Name</dt><dd>{form.fullName || '—'}</dd>
                  <dt>Email</dt><dd>{form.email || '—'}</dd>
                  <dt>Phone</dt><dd>{form.phone || '—'}</dd>
                </dl>
              </section>
              <section className="pa-review-section">
                <h3>Address</h3>
                <dl className="pa-review-dl">
                  <dt>Street</dt><dd>{form.street || '—'}</dd>
                  <dt>City</dt><dd>{form.city || '—'}</dd>
                  <dt>State / Region</dt><dd>{form.state || '—'}</dd>
                  <dt>Postal code</dt><dd>{form.postalCode || '—'}</dd>
                  <dt>Country</dt><dd>{form.country || '—'}</dd>
                </dl>
              </section>
              <section className="pa-review-section">
                <h3>Business</h3>
                <dl className="pa-review-dl">
                  <dt>Structure</dt>
                  <dd>{BUSINESS_STRUCTURE.find((x) => x.id === form.businessStructure)?.label || form.businessStructure || '—'}</dd>
                  <dt>Work types</dt>
                  <dd>{form.workTypes?.length ? form.workTypes.map((id) => WORK_TYPES.find((x) => x.id === id)?.label || id).join(', ') : '—'}</dd>
                  <dt>Area coverage</dt>
                  <dd>{form.areaCoverage?.length ? form.areaCoverage.join(', ') : '—'}</dd>
                  <dt>Vehicle</dt>
                  <dd>{VEHICLES.find((x) => x.id === form.vehicle)?.label || form.vehicle || '—'}</dd>
                  <dt>Team size</dt><dd>{form.teamSize || '—'}</dd>
                </dl>
              </section>
              <section className="pa-review-section">
                <h3>Documents</h3>
                <dl className="pa-review-dl">
                  <dt>Tools photo</dt><dd>{form.toolsPhoto?.name || '—'}</dd>
                  <dt>ID document</dt><dd>{form.idDocument?.name || '—'}</dd>
                  <dt>Proof of address</dt><dd>{form.proofOfAddress?.name || '—'}</dd>
                  <dt>Right to work</dt><dd>{form.rightToWork?.name || '—'}</dd>
                  <dt>Public liability</dt><dd>{form.publicLiability?.name || '—'}</dd>
                  <dt>DBS</dt><dd>{form.dbs?.name || '—'}</dd>
                  <dt>Profile photo</dt><dd>{form.profilePhoto?.name || '—'}</dd>
                </dl>
              </section>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="pa-card">
            <h2>Final Step</h2>
            <div className="pa-checkbox-wrap">
              <input
                type="checkbox"
                id="declaration"
                checked={form.declaration}
                onChange={(e) => update('declaration', e.target.checked)}
              />
              <label htmlFor="declaration">
                I hereby confirm that all the information I have provided is accurate and truthful to the best of my knowledge. *
              </label>
            </div>
            {errors.declaration && <div className="pa-error">{errors.declaration}</div>}
          </div>
        )}

        <div className="pa-actions">
          <button
            type="button"
            className="pa-btn pa-btn-back"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
          >
            Back
          </button>
          <button
            type="button"
            className="pa-btn pa-btn-next"
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : step < 4 ? 'Next' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
