import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

// Monthly order options matching the original HTML spec
const MONTHLY_ORDER_OPTIONS = [
  { value: '', label: 'Select a range...' },
  { value: 'Under 100 orders/month', label: 'Under 100 orders/month' },
  { value: '100-500 orders/month', label: '100-500 orders/month' },
  { value: '500-2,000 orders/month', label: '500-2,000 orders/month' },
  { value: '2,000-10,000 orders/month', label: '2,000-10,000 orders/month' },
  { value: '10,000+ orders/month', label: '10,000+ orders/month' },
];

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  city: '',
  stateZip: '',
  storeNameOrUrl: '',
  productType: '',
  monthlyOrders: '',
};

/**
 * SolarSampleForm — Free sample request form for the Solar landing page.
 * Mirrors the HTML spec provided, using matching design tokens from the Solar LP.
 * On submit: stores record in DB, emails mitch@nurturmail.com, confirms to user.
 */
export default function SolarSampleForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.stateZip.trim()) e.stateZip = 'Required';
    if (!form.storeNameOrUrl.trim()) e.storeNameOrUrl = 'Required';
    return e;
  };

  const handleSubmit = async () => {
    setServerError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const res = await base44.functions.invoke('submitSampleRequest', {
      ...form,
      source: 'solar',
    });

    setLoading(false);

    if (res.data?.success) {
      setSubmitted(true);
    } else {
      setServerError('Something went wrong. Please try again or email us directly.');
    }
  };

  return (
    <section style={{ background: '#213659', padding: '80px 0' }}>
      {/* Scoped styles matching the Solar LP design tokens */}
      <style>{`
        .solar-sample-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: start;
        }
        .solar-sample-eyebrow {
          display: inline-block;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          margin-bottom: 8px;
          color: #f59e0b;
          font-family: 'Lato', sans-serif;
        }
        .solar-sample-heading {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.4rem, 4.8vw, 2.2rem);
          font-weight: 800;
          line-height: 1.12;
          color: #ffffff;
          margin-bottom: 14px;
        }
        .solar-sample-body {
          color: rgba(255,255,255,0.82);
          font-size: 17px;
          line-height: 1.55;
          margin-bottom: 10px;
          font-family: 'Lato', sans-serif;
        }
        .solar-form-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 28px 24px;
        }
        .solar-form-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          color: #1a2d4a;
          margin-bottom: 4px;
        }
        .solar-form-sub {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 20px;
          line-height: 1.36;
          font-family: 'Lato', sans-serif;
        }
        .solar-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .solar-form-field {
          margin-bottom: 14px;
        }
        .solar-form-label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #1a2d4a;
          margin-bottom: 4px;
          font-family: 'Lato', sans-serif;
        }
        .solar-form-label .opt {
          font-weight: 400;
          color: #4a5568;
          font-size: 12px;
        }
        .solar-form-input,
        .solar-form-select {
          width: 100%;
          padding: 11px 12px;
          border: 1.5px solid #dde1e7;
          border-radius: 4px;
          font-size: 15px;
          font-family: 'Lato', sans-serif;
          color: #2d3748;
          background: #ffffff;
          transition: border-color 0.15s;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }
        .solar-form-input:focus,
        .solar-form-select:focus { border-color: #FF7A00; }
        .solar-form-input.error,
        .solar-form-select.error { border-color: #e53e3e; }
        .solar-field-error {
          font-size: 12px;
          color: #e53e3e;
          margin-top: 3px;
          font-family: 'Lato', sans-serif;
        }
        .solar-form-submit {
          width: 100%;
          padding: 15px;
          background: #FF7A00;
          color: #ffffff;
          font-family: 'Lato', sans-serif;
          font-size: 18px;
          font-weight: 700;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s;
          margin-top: 6px;
        }
        .solar-form-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255,122,0,0.4);
        }
        .solar-form-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .solar-form-trust {
          font-size: 13px;
          color: #4a5568;
          text-align: center;
          margin-top: 10px;
          line-height: 1.36;
          font-family: 'Lato', sans-serif;
        }
        .solar-confirmation {
          background: #ffffff;
          border-radius: 8px;
          padding: 28px 24px;
        }
        .solar-confirmation-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          color: #1a2d4a;
          margin-bottom: 10px;
        }
        .solar-confirmation-body {
          color: #4a5568;
          font-size: 15px;
          line-height: 1.55;
          font-family: 'Lato', sans-serif;
          margin-bottom: 16px;
        }
        .solar-conf-highlight {
          background: #1a2d4a;
          border-radius: 6px;
          padding: 16px 18px;
          margin: 14px 0;
        }
        .solar-conf-highlight p {
          color: rgba(255,255,255,0.85);
          margin: 0;
          line-height: 1.55;
          font-family: 'Lato', sans-serif;
          font-size: 15px;
        }
        .solar-conf-highlight strong { color: #f59e0b; }
        .solar-server-error {
          background: #fff5f5;
          border: 1px solid #fed7d7;
          border-radius: 4px;
          padding: 10px 14px;
          color: #c53030;
          font-size: 13px;
          margin-bottom: 12px;
          font-family: 'Lato', sans-serif;
        }
        @media (max-width: 1024px) {
          .solar-sample-inner { padding: 0 32px; gap: 40px; }
        }
        @media (max-width: 768px) {
          .solar-sample-inner { grid-template-columns: 1fr; padding: 0 20px; gap: 28px; }
          .solar-form-row { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>

      <div id="free-sample" className="solar-sample-inner">

        {/* LEFT — intro copy */}
        <div>
          <span className="solar-sample-eyebrow">Free Sample, No Obligation</span>
          <h2 className="solar-sample-heading">
            Get a Real Card Mailed to You. Hold It. Show Your Team.
          </h2>
          <p className="solar-sample-body">
            Tell us about your business and we'll personalize your sample using your actual
            company name — so you see exactly what your customers will experience.
          </p>
          <p className="solar-sample-body">
            Processing time is 24-48 hours. Cards are typically in recipients' hands within 6-10 days.
          </p>
        </div>

        {/* RIGHT — form or confirmation */}
        <div>
          {!submitted ? (
            /* FORM STATE */
            <div className="solar-form-card">
              <h3 className="solar-form-title">Request Your Free Sample Card</h3>
              <p className="solar-form-sub">
                We'll use your details to personalize your sample.
              </p>

              {/* Server error */}
              {serverError && (
                <div className="solar-server-error">{serverError}</div>
              )}

              {/* Name row */}
              <div className="solar-form-row">
                <div className="solar-form-field">
                  <label className="solar-form-label">First Name</label>
                  <input
                    className={`solar-form-input${errors.firstName ? ' error' : ''}`}
                    type="text"
                    name="firstName"
                    placeholder="Jane"
                    value={form.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && <p className="solar-field-error">{errors.firstName}</p>}
                </div>
                <div className="solar-form-field">
                  <label className="solar-form-label">Last Name</label>
                  <input
                    className={`solar-form-input${errors.lastName ? ' error' : ''}`}
                    type="text"
                    name="lastName"
                    placeholder="Smith"
                    value={form.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <p className="solar-field-error">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="solar-form-field">
                <label className="solar-form-label">Email Address</label>
                <input
                  className={`solar-form-input${errors.email ? ' error' : ''}`}
                  type="email"
                  name="email"
                  placeholder="jane@yourcompany.com"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="solar-field-error">{errors.email}</p>}
              </div>

              {/* Mailing address */}
              <div className="solar-form-field">
                <label className="solar-form-label">
                  Mailing Address <span className="opt">(where to send the sample)</span>
                </label>
                <input
                  className={`solar-form-input${errors.address ? ' error' : ''}`}
                  type="text"
                  name="address"
                  placeholder="Street address"
                  value={form.address}
                  onChange={handleChange}
                />
                {errors.address && <p className="solar-field-error">{errors.address}</p>}
              </div>

              {/* City / State ZIP row */}
              <div className="solar-form-row">
                <div className="solar-form-field">
                  <label className="solar-form-label">City</label>
                  <input
                    className={`solar-form-input${errors.city ? ' error' : ''}`}
                    type="text"
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                  />
                  {errors.city && <p className="solar-field-error">{errors.city}</p>}
                </div>
                <div className="solar-form-field">
                  <label className="solar-form-label">State and ZIP</label>
                  <input
                    className={`solar-form-input${errors.stateZip ? ' error' : ''}`}
                    type="text"
                    name="stateZip"
                    placeholder="CA 94102"
                    value={form.stateZip}
                    onChange={handleChange}
                  />
                  {errors.stateZip && <p className="solar-field-error">{errors.stateZip}</p>}
                </div>
              </div>

              {/* Store / Company */}
              <div className="solar-form-field">
                <label className="solar-form-label">Company Name or Website</label>
                <input
                  className={`solar-form-input${errors.storeNameOrUrl ? ' error' : ''}`}
                  type="text"
                  name="storeNameOrUrl"
                  placeholder="mycompany.com or My Company Name"
                  value={form.storeNameOrUrl}
                  onChange={handleChange}
                />
                {errors.storeNameOrUrl && <p className="solar-field-error">{errors.storeNameOrUrl}</p>}
              </div>

              {/* What do you sell */}
              <div className="solar-form-field">
                <label className="solar-form-label">
                  What does your company do? <span className="opt">(helps us personalize your sample)</span>
                </label>
                <input
                  className="solar-form-input"
                  type="text"
                  name="productType"
                  placeholder="e.g. residential solar installations"
                  value={form.productType}
                  onChange={handleChange}
                />
              </div>

              {/* Monthly orders */}
              <div className="solar-form-field">
                <label className="solar-form-label">
                  Approximate monthly jobs <span className="opt">(optional)</span>
                </label>
                <select
                  className="solar-form-select"
                  name="monthlyOrders"
                  value={form.monthlyOrders}
                  onChange={handleChange}
                >
                  {MONTHLY_ORDER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <button
                className="solar-form-submit"
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send My Free Sample Card'}
              </button>
              <p className="solar-form-trust">
                No credit card. No obligation. No spam. Processed within 24-48 hours.
              </p>
            </div>
          ) : (
            /* CONFIRMATION STATE */
            <div className="solar-confirmation">
              <h3 className="solar-confirmation-title">
                Your sample is being processed.
              </h3>
              <p className="solar-confirmation-body">
                We'll have it written and in the mail within 24-48 hours.
              </p>
              <div className="solar-conf-highlight">
                <p>
                  <strong>Check your email inbox right now.</strong> We're sending you something
                  worth seeing before your card arrives, including a chance to lock in our lowest
                  rate before we speak.<br /><br />
                  <strong>Add our email to your contacts</strong> so it doesn't land in spam.
                  Look for a message from NurturInk arriving in the next few minutes.
                </p>
              </div>
              <p style={{ marginTop: 14, fontSize: 14, color: '#4a5568', fontFamily: "'Lato', sans-serif", lineHeight: 1.55 }}>
                Once your sample arrives and you want to talk through whether this makes sense
                for your business,{' '}
                <a
                  href="#book-call"
                  style={{ color: '#FF7A00', fontWeight: 700, textDecoration: 'none' }}
                >
                  book a 30-minute call here
                </a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}