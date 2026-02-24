import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const MONTHLY_OPTIONS = [
  '', 'Under 100 orders/month', '100-500 orders/month',
  '500-2,000 orders/month', '2,000-10,000 orders/month', '10,000+ orders/month'
];

const INITIAL = {
  firstName: '', lastName: '', email: '',
  address: '', city: '', stateZip: '',
  storeName: '', whatYouSell: '', monthlyOrders: ''
};

export default function EcommerceSampleForm() {
  const [form, setForm] = useState(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.address) return;
    setLoading(true);
    await base44.entities.SampleRequest.create({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      address: form.address,
      city: form.city,
      stateZip: form.stateZip,
      storeName: form.storeName,
      whatYouSell: form.whatYouSell,
      monthlyOrders: form.monthlyOrders,
      source: 'ecommerce_lp'
    });
    setLoading(false);
    setSubmitted(true);
  };

  const inputStyle = {
    width: '100%', padding: '11px 12px',
    border: '1.5px solid #dde1e7', borderRadius: 4,
    fontSize: 17, fontFamily: "'Lato', sans-serif",
    color: '#2d3748', background: '#fff',
    transition: 'border-color 0.15s', outline: 'none',
    WebkitAppearance: 'none', boxSizing: 'border-box'
  };
  const labelStyle = { display: 'block', fontSize: 15, fontWeight: 700, color: '#1a2d4a', marginBottom: 4 };

  return (
    <section id="sample" style={{ background: '#213659', padding: '64px 0 36px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div className="ec-sample-inner">
          <div>
            <span style={{ display: 'inline-block', fontSize: 14, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 8, color: '#f59e0b' }}>Free Sample, No Obligation</span>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 'clamp(1.4rem, 4.8vw, 2.3rem)', lineHeight: 1.12, color: '#fff', marginBottom: 10 }}>
              Get a Real Card Mailed to You. Hold It. Show Your Team.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 17, lineHeight: 1.44, marginBottom: 9 }}>
              Tell us about your store and we will personalize your sample using your actual business, so you see exactly what your customers will experience.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 17, lineHeight: 1.44 }}>
              Processing time is 24-48 hours. Cards are typically in recipients' hands within 6-10 days.
            </p>
          </div>

          <div>
            {!submitted ? (
              <div style={{ background: '#fff', borderRadius: 8, padding: '22px 18px' }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#1a2d4a', marginBottom: 4 }}>Request Your Free Sample Card</h3>
                <p style={{ fontSize: 15, color: '#4a5568', marginBottom: 16, lineHeight: 1.24 }}>We will use your store details to personalize your sample.</p>

                <div className="ec-form-row" style={{ marginBottom: 0 }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>First Name</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jane" style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Last Name</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Smith" style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Email Address</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@yourstore.com" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Mailing Address <span style={{ fontWeight: 400, color: '#4a5568', fontSize: 13 }}>(where to send the sample)</span></label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="Street address" style={inputStyle} />
                </div>

                <div className="ec-form-row" style={{ marginBottom: 0 }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>City</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="City" style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>State and ZIP</label>
                    <input name="stateZip" value={form.stateZip} onChange={handleChange} placeholder="CA 94102" style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Store Name or URL</label>
                  <input name="storeName" value={form.storeName} onChange={handleChange} placeholder="mystore.com or My Store Name" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>What do you sell? <span style={{ fontWeight: 400, color: '#4a5568', fontSize: 13 }}>(helps us personalize your sample)</span></label>
                  <input name="whatYouSell" value={form.whatYouSell} onChange={handleChange} placeholder="e.g. candles, pet supplies, skincare" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Approximate monthly orders <span style={{ fontWeight: 400, color: '#4a5568', fontSize: 13 }}>(optional)</span></label>
                  <select name="monthlyOrders" value={form.monthlyOrders} onChange={handleChange} style={inputStyle}>
                    {MONTHLY_OPTIONS.map((o, i) => <option key={i} value={o}>{o || 'Select a range...'}</option>)}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: '100%', padding: 15,
                    background: loading ? '#ccc' : '#FF7A00',
                    color: '#fff', fontFamily: "'Lato', sans-serif",
                    fontSize: 19, fontWeight: 700, border: 'none',
                    borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    marginTop: 5
                  }}
                >
                  {loading ? 'Sending...' : 'Send My Free Sample Card'}
                </button>
                <p style={{ fontSize: 14, color: '#4a5568', textAlign: 'center', marginTop: 9, lineHeight: 1.24 }}>
                  No credit card. No obligation. No spam. Processed within 24-48 hours.
                </p>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 8, padding: '24px 18px' }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", color: '#1a2d4a', marginBottom: 7, fontWeight: 800 }}>Your sample is being processed.</h3>
                <p style={{ color: '#4a5568', fontSize: 17, lineHeight: 1.44 }}>We will have it written and in the mail within 24-48 hours.</p>
                <div style={{ background: '#1a2d4a', borderRadius: 6, padding: '14px 16px', margin: '14px 0' }}>
                  <p style={{ color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.44 }}>
                    <strong style={{ color: '#f59e0b' }}>Check your email inbox right now.</strong> We are sending you something worth seeing before your card arrives, including a chance to lock in our lowest rate before we speak.<br /><br />
                    <strong style={{ color: '#f59e0b' }}>Add our email to your contacts</strong> so it does not land in spam. Look for a message from NurturInk arriving in the next few minutes.
                  </p>
                </div>
                <p style={{ marginTop: 12, color: '#4a5568', fontSize: 17, lineHeight: 1.44 }}>
                  Once your sample arrives and you want to talk through whether this makes sense for your store, <a href="#book-call" style={{ color: '#FF7A00', fontWeight: 700 }}>book a 30-minute call here</a>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .ec-sample-inner { display: block; }
        .ec-form-row { display: grid; grid-template-columns: 1fr; gap: 0; }
        @media (min-width: 640px) { .ec-form-row { grid-template-columns: 1fr 1fr; gap: 12px; } }
        @media (min-width: 1024px) {
          .ec-sample-inner { display: grid !important; grid-template-columns: 1fr 1fr; gap: 52px; align-items: start; }
        }
      `}</style>
    </section>
  );
}