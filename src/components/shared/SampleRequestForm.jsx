import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Linkedin } from 'lucide-react';

/**
 * SampleRequestForm — Shared, reusable free-sample form used across ALL landing pages.
 * Props:
 *   source          {string}  — 'solar' | 'roofing' | 'insurance' | 'real_estate' | 'ecommerce'
 *   accentColor     {string}  — hex color for focus rings, button, links (default #FF7A00)
 *   bgColor         {string}  — section background (default #213659)
 *   businessLabel   {string}  — label text for the store/company field
 *   businessPlaceholder {string}
 *   productLabel    {string}  — label for what-they-sell field
 *   productPlaceholder  {string}
 *   volumeLabel     {string}  — label for the monthly volume dropdown
 *   volumeOptions   {Array}   — array of { value, label } for the dropdown
 *   bookCallAnchor  {string}  — anchor id for "book a call" link (default 'book-call')
 */

const DEFAULT_VOLUME_OPTIONS = [
  { value: '', label: 'Select a range...' },
  { value: 'Under 100/month', label: 'Under 100/month' },
  { value: '100-500/month', label: '100-500/month' },
  { value: '500-2,000/month', label: '500-2,000/month' },
  { value: '2,000-10,000/month', label: '2,000-10,000/month' },
  { value: '10,000+/month', label: '10,000+/month' },
];

// US states list for the state dropdown
const US_STATES = [
  { value: '', label: 'State' },
  { value: 'AL', label: 'AL' }, { value: 'AK', label: 'AK' }, { value: 'AZ', label: 'AZ' },
  { value: 'AR', label: 'AR' }, { value: 'CA', label: 'CA' }, { value: 'CO', label: 'CO' },
  { value: 'CT', label: 'CT' }, { value: 'DE', label: 'DE' }, { value: 'FL', label: 'FL' },
  { value: 'GA', label: 'GA' }, { value: 'HI', label: 'HI' }, { value: 'ID', label: 'ID' },
  { value: 'IL', label: 'IL' }, { value: 'IN', label: 'IN' }, { value: 'IA', label: 'IA' },
  { value: 'KS', label: 'KS' }, { value: 'KY', label: 'KY' }, { value: 'LA', label: 'LA' },
  { value: 'ME', label: 'ME' }, { value: 'MD', label: 'MD' }, { value: 'MA', label: 'MA' },
  { value: 'MI', label: 'MI' }, { value: 'MN', label: 'MN' }, { value: 'MS', label: 'MS' },
  { value: 'MO', label: 'MO' }, { value: 'MT', label: 'MT' }, { value: 'NE', label: 'NE' },
  { value: 'NV', label: 'NV' }, { value: 'NH', label: 'NH' }, { value: 'NJ', label: 'NJ' },
  { value: 'NM', label: 'NM' }, { value: 'NY', label: 'NY' }, { value: 'NC', label: 'NC' },
  { value: 'ND', label: 'ND' }, { value: 'OH', label: 'OH' }, { value: 'OK', label: 'OK' },
  { value: 'OR', label: 'OR' }, { value: 'PA', label: 'PA' }, { value: 'RI', label: 'RI' },
  { value: 'SC', label: 'SC' }, { value: 'SD', label: 'SD' }, { value: 'TN', label: 'TN' },
  { value: 'TX', label: 'TX' }, { value: 'UT', label: 'UT' }, { value: 'VT', label: 'VT' },
  { value: 'VA', label: 'VA' }, { value: 'WA', label: 'WA' }, { value: 'WV', label: 'WV' },
  { value: 'WI', label: 'WI' }, { value: 'WY', label: 'WY' },
  { value: 'DC', label: 'DC' },
];

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  city: '',
  state: '',   // split from stateZip — state dropdown
  zip: '',     // split from stateZip — zip code input
  storeNameOrUrl: '',
  productType: '',
  monthlyOrders: '',
};

export default function SampleRequestForm({
  source = 'solar',
  accentColor = '#FF7A00',
  bgColor = '#213659',
  businessLabel = 'Company Name or Website',
  businessPlaceholder = 'mycompany.com or My Company Name',
  productLabel = 'What does your company do?',
  productPlaceholder = 'e.g. residential solar installations',
  volumeLabel = 'Approximate monthly volume',
  volumeOptions = DEFAULT_VOLUME_OPTIONS,
  bookCallAnchor = 'book-call',
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  // Client-side validation (Phase 1 Option C)
  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Valid email required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state) e.state = 'Required';
    if (!form.zip.trim()) e.zip = 'Required';
    else if (!/^\d{5}(-\d{4})?$/.test(form.zip.trim())) e.zip = 'Enter a valid ZIP code';
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
    try {
      // Combine state + zip back into stateZip for the backend schema
      const res = await base44.functions.invoke('submitSampleRequest', {
        ...form,
        stateZip: `${form.state} ${form.zip}`.trim(),
        source,
      });
      if (res.data?.success) {
        setShowConfirmation(true);
        setForm(INITIAL_FORM);
      } else {
        setServerError('Something went wrong. Please try again or email us directly.');
      }
    } catch {
      // Always reset loading on error so button never stays stuck
      setServerError('Something went wrong. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  // Scoped CSS — prefix `srf-` to avoid collisions across landing pages
  const css = `
    .srf-section { background: ${bgColor}; padding: 80px 0; }
    .srf-inner {
      max-width: 1200px; margin: 0 auto; padding: 0 48px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start;
    }
    .srf-eyebrow {
      display: inline-block; font-size: 13px; font-weight: 700;
      letter-spacing: 0.13em; text-transform: uppercase;
      margin-bottom: 8px; color: ${accentColor}; font-family: 'Lato', sans-serif;
    }
    .srf-heading {
      font-family: 'Sora', sans-serif; font-size: clamp(1.4rem, 4.8vw, 2.2rem);
      font-weight: 800; line-height: 1.12; color: #ffffff; margin-bottom: 14px;
    }
    .srf-body {
      color: rgba(255,255,255,0.82); font-size: 17px;
      line-height: 1.55; margin-bottom: 10px; font-family: 'Lato', sans-serif;
    }
    .srf-card { background: #ffffff; border-radius: 8px; padding: 28px 24px; }
    .srf-card-title {
      font-family: 'Sora', sans-serif; font-size: 1.1rem;
      font-weight: 800; color: #1a2d4a; margin-bottom: 4px;
    }
    .srf-card-sub {
      font-size: 14px; color: #4a5568; margin-bottom: 20px;
      line-height: 1.36; font-family: 'Lato', sans-serif;
    }
    .srf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .srf-field { margin-bottom: 14px; }
    .srf-label {
      display: block; font-size: 14px; font-weight: 700;
      color: #1a2d4a; margin-bottom: 4px; font-family: 'Lato', sans-serif;
    }
    .srf-label .opt { font-weight: 400; color: #4a5568; font-size: 12px; }
    .srf-input, .srf-select {
      width: 100%; padding: 11px 12px; border: 1.5px solid #dde1e7;
      border-radius: 4px; font-size: 15px; font-family: 'Lato', sans-serif;
      color: #2d3748; background: #ffffff; transition: border-color 0.15s;
      outline: none; -webkit-appearance: none; appearance: none; box-sizing: border-box;
    }
    .srf-input:focus, .srf-select:focus { border-color: ${accentColor}; }
    .srf-input.err, .srf-select.err { border-color: #e53e3e; }
    .srf-field-error { font-size: 12px; color: #e53e3e; margin-top: 3px; font-family: 'Lato', sans-serif; }
    .srf-server-error {
      background: #fff5f5; border: 1px solid #fed7d7; border-radius: 4px;
      padding: 10px 14px; color: #c53030; font-size: 13px;
      margin-bottom: 12px; font-family: 'Lato', sans-serif;
    }
    .srf-btn {
      width: 100%; padding: 15px; background: ${accentColor}; color: #ffffff;
      font-family: 'Lato', sans-serif; font-size: 18px; font-weight: 700;
      border: none; border-radius: 4px; cursor: pointer;
      transition: transform 0.18s, box-shadow 0.18s; margin-top: 6px;
    }
    .srf-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px ${accentColor}66;
    }
    .srf-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .srf-trust {
      font-size: 13px; color: #4a5568; text-align: center;
      margin-top: 10px; line-height: 1.36; font-family: 'Lato', sans-serif;
    }
    .srf-confirm { background: #ffffff; border-radius: 8px; padding: 28px 24px; }
    .srf-confirm-title {
      font-family: 'Sora', sans-serif; font-size: 1.1rem;
      font-weight: 800; color: #1a2d4a; margin-bottom: 10px;
    }
    .srf-confirm-body {
      color: #4a5568; font-size: 15px; line-height: 1.55;
      font-family: 'Lato', sans-serif; margin-bottom: 16px;
    }
    .srf-highlight {
      background: #1a2d4a; border-radius: 6px; padding: 16px 18px; margin: 14px 0;
    }
    .srf-highlight p {
      color: rgba(255,255,255,0.85); margin: 0;
      line-height: 1.55; font-family: 'Lato', sans-serif; font-size: 15px;
    }
    .srf-highlight strong { color: #f59e0b; }
    @media (max-width: 1024px) { .srf-inner { padding: 0 32px; gap: 40px; } }
    @media (max-width: 768px) {
      .srf-inner { grid-template-columns: 1fr; padding: 0 20px; gap: 28px; }
      .srf-row { grid-template-columns: 1fr; gap: 0; }
      .srf-section { padding: 60px 0; }
    }
  `;

  return (
    <section id="get-sample" className="srf-section">
      <style>{css}</style>

      <div id="free-sample" className="srf-inner">

        {/* LEFT — intro copy */}
        <div>
          <span className="srf-eyebrow">Free Sample, No Obligation</span>
          <h2 className="srf-heading">
            Get a Real Card Mailed to You. Hold It. Show Your Team.
          </h2>
          <p className="srf-body">
            Tell us about your business and we'll personalize your sample using your actual
            company name — so you see exactly what your customers will experience.
          </p>
          <p className="srf-body">
            Processing time is 24-48 hours. Cards are typically in recipients' hands within 6-10 days.
          </p>
        </div>

        {/* RIGHT — form (always shown) + confirmation dialog */}
        <div>
          {/* Confirmation modal — shown after successful submission */}
          <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
            <DialogContent style={{ fontFamily: "'Lato', sans-serif", maxWidth: 480 }}>
              <DialogHeader>
                <DialogTitle style={{ fontFamily: "'Sora', sans-serif", color: '#1a2d4a', fontSize: '1.2rem' }}>
                  Your sample is being processed!
                </DialogTitle>
                <DialogDescription asChild>
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 15, color: '#4a5568', lineHeight: 1.6, marginBottom: 12 }}>
                      We'll have it written and in the mail within <strong>24–48 hours</strong>. Cards typically arrive within <strong>6–10 days</strong>.
                    </p>
                    <div style={{ background: '#1a2d4a', borderRadius: 6, padding: '14px 16px', marginBottom: 12 }}>
                      <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                        <strong style={{ color: '#f59e0b' }}>Check your inbox right now.</strong> We're sending you something worth reading before your card arrives — including a chance to lock in our lowest rate before we speak.<br /><br />
                        <strong style={{ color: '#f59e0b' }}>Add us to your contacts</strong> so our email doesn't land in spam. Look for a message from <strong style={{ color: '#fff' }}>noreply@nurturink.com</strong>.
                      </p>
                    </div>
                    {/* CTA: Book a call + LinkedIn — added per user request */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                      {/* Book a call button */}
                      <a
                        href={`#${bookCallAnchor}`}
                        onClick={() => setShowConfirmation(false)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          background: accentColor, color: '#fff', fontFamily: "'Lato', sans-serif",
                          fontWeight: 700, fontSize: 15, padding: '12px 18px', borderRadius: 4,
                          textDecoration: 'none', transition: 'opacity 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}
                      >
                        <Calendar size={16} />
                        Book a 30-Minute Call
                      </a>
                      {/* LinkedIn profile link */}
                      <a
                        href="https://www.linkedin.com/in/mitchfields/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          background: '#0a66c2', color: '#fff', fontFamily: "'Lato', sans-serif",
                          fontWeight: 700, fontSize: 15, padding: '12px 18px', borderRadius: 4,
                          textDecoration: 'none', transition: 'opacity 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}
                      >
                        <Linkedin size={16} />
                        Connect with Mitch on LinkedIn
                      </a>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setShowConfirmation(false)} style={{ background: accentColor, color: '#fff', fontFamily: "'Lato', sans-serif", fontWeight: 700 }}>
                  Got it, thanks!
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="srf-card">
              <h3 className="srf-card-title">Request Your Free Sample Card</h3>
              <p className="srf-card-sub">We'll use your details to personalize your sample.</p>

              {/* Server error banner */}
              {serverError && <div className="srf-server-error">{serverError}</div>}

              {/* Name row */}
              <div className="srf-row">
                <div className="srf-field">
                  <label className="srf-label">First Name</label>
                  <input
                    className={`srf-input${errors.firstName ? ' err' : ''}`}
                    type="text" name="firstName" placeholder="Jane"
                    value={form.firstName} onChange={handleChange}
                  />
                  {errors.firstName && <p className="srf-field-error">{errors.firstName}</p>}
                </div>
                <div className="srf-field">
                  <label className="srf-label">Last Name</label>
                  <input
                    className={`srf-input${errors.lastName ? ' err' : ''}`}
                    type="text" name="lastName" placeholder="Smith"
                    value={form.lastName} onChange={handleChange}
                  />
                  {errors.lastName && <p className="srf-field-error">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="srf-field">
                <label className="srf-label">Email Address</label>
                <input
                  className={`srf-input${errors.email ? ' err' : ''}`}
                  type="email" name="email" placeholder="jane@yourcompany.com"
                  value={form.email} onChange={handleChange}
                />
                {errors.email && <p className="srf-field-error">{errors.email}</p>}
              </div>

              {/* Mailing address */}
              <div className="srf-field">
                <label className="srf-label">
                  Mailing Address <span className="opt">(where to send the sample)</span>
                </label>
                <input
                  className={`srf-input${errors.address ? ' err' : ''}`}
                  type="text" name="address" placeholder="Street address"
                  value={form.address} onChange={handleChange}
                />
                {errors.address && <p className="srf-field-error">{errors.address}</p>}
              </div>

              {/* City / State ZIP */}
              <div className="srf-row">
                <div className="srf-field">
                  <label className="srf-label">City</label>
                  <input
                    className={`srf-input${errors.city ? ' err' : ''}`}
                    type="text" name="city" placeholder="City"
                    value={form.city} onChange={handleChange}
                  />
                  {errors.city && <p className="srf-field-error">{errors.city}</p>}
                </div>
                <div className="srf-field">
                  <label className="srf-label">State and ZIP</label>
                  <input
                    className={`srf-input${errors.stateZip ? ' err' : ''}`}
                    type="text" name="stateZip" placeholder="CA 94102"
                    value={form.stateZip} onChange={handleChange}
                  />
                  {errors.stateZip && <p className="srf-field-error">{errors.stateZip}</p>}
                </div>
              </div>

              {/* Business name / URL */}
              <div className="srf-field">
                <label className="srf-label">{businessLabel}</label>
                <input
                  className={`srf-input${errors.storeNameOrUrl ? ' err' : ''}`}
                  type="text" name="storeNameOrUrl" placeholder={businessPlaceholder}
                  value={form.storeNameOrUrl} onChange={handleChange}
                />
                {errors.storeNameOrUrl && <p className="srf-field-error">{errors.storeNameOrUrl}</p>}
              </div>

              {/* What they sell / do */}
              <div className="srf-field">
                <label className="srf-label">
                  {productLabel} <span className="opt">(helps us personalize your sample)</span>
                </label>
                <input
                  className="srf-input"
                  type="text" name="productType" placeholder={productPlaceholder}
                  value={form.productType} onChange={handleChange}
                />
              </div>

              {/* Monthly volume */}
              <div className="srf-field">
                <label className="srf-label">
                  {volumeLabel} <span className="opt">(optional)</span>
                </label>
                <select className="srf-select" name="monthlyOrders"
                  value={form.monthlyOrders} onChange={handleChange}>
                  {volumeOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <button
                className="srf-btn" type="button"
                onClick={handleSubmit} disabled={loading}
              >
                {loading ? 'Sending...' : 'Send My Free Sample Card'}
              </button>
              <p className="srf-trust">
                No credit card. No obligation. No spam. Processed within 24-48 hours.
              </p>
            </div>
        </div>
      </div>
    </section>
  );
}