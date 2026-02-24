import React, { useEffect } from 'react';

export default function EcommerceBookCall() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      const existing = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existing) existing.remove();
    };
  }, []);

  return (
    <section id="book-call" style={{ background: '#faf9f6', padding: '64px 0 36px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div className="ec-book-inner">
          <div>
            <span style={{
              display: 'inline-block', fontSize: 14, fontWeight: 700,
              letterSpacing: '0.13em', textTransform: 'uppercase',
              marginBottom: 8, color: '#FF7A00'
            }}>Talk to a Human</span>
            <h2 style={{
              fontFamily: "'Sora', sans-serif", fontWeight: 800,
              fontSize: 'clamp(1.4rem, 4.8vw, 2.3rem)', lineHeight: 1.12,
              color: '#1a2d4a', marginBottom: 10
            }}>
              Let's Figure Out Together If the Math Works for Your Store.
            </h2>
            <p style={{ fontSize: 19, lineHeight: 1.44, maxWidth: 700, marginBottom: 22, color: '#4a5568' }}>
              30 minutes. We will look at your store type, your customer lifecycle, and work out whether the numbers make sense. If they do not, I will tell you that too.
            </p>

            <div style={{ background: '#1a2d4a', borderRadius: 8, padding: 18 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f59e0b', display: 'block', marginBottom: 7 }}>Limited Availability</span>
              <h3 style={{ fontFamily: "'Sora', sans-serif", color: '#fff', marginBottom: 7, fontSize: '1rem', fontWeight: 800 }}>Lock In $2.00/Card. Grandfathered for Life.</h3>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', lineHeight: 1.44, margin: 0 }}>
                Book a call and I will lock your account at <strong style={{ color: '#FF7A00' }}>$2.00 per card</strong>, all-in, for as long as you are a customer. The only exception is future USPS postage increases, which we pass through at actual cost, nothing more. You do not have to buy anything on the call. Just show up.
              </p>
            </div>
          </div>

          <div>
            <div style={{
              background: '#fff', border: '1px solid #dde1e7',
              borderRadius: 8, overflow: 'hidden',
              minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {/* Calendly embed placeholder — replace with actual embed */}
              <div style={{ textAlign: 'center', padding: '38px 22px' }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", color: '#1a2d4a', marginBottom: 7, fontWeight: 800 }}>Schedule a 30-Minute Call</h3>
                <p style={{ color: '#4a5568', fontSize: 17 }}>Add your Calendly embed here.</p>
                <a
                  href="mailto:hello@nurturink.com?subject=Call Request"
                  style={{
                    display: 'inline-block', marginTop: 16,
                    padding: '14px 26px', background: '#FF7A00', color: '#fff',
                    fontFamily: "'Lato', sans-serif", fontSize: 17, fontWeight: 700,
                    borderRadius: 4, textDecoration: 'none',
                    boxShadow: '0 3px 14px rgba(255,122,0,0.35)'
                  }}
                >
                  Email to Schedule
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ec-book-inner { display: block; }
        @media (min-width: 1024px) {
          .ec-book-inner { display: grid !important; grid-template-columns: 1fr 1fr; gap: 52px; align-items: start; }
        }
      `}</style>
    </section>
  );
}