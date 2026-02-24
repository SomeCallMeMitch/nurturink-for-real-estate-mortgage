import React from 'react';

const quotes = [
  { text: 'It makes it memorable and differentiates it from the average Amazon order. It feels less like an \'order\' and more like a \'gift.\'', source: 'r/Shopify seller, 1,000+ orders sent with notes' },
  { text: 'My customers love it and mention it in reviews. Just keep it short and sweet.', source: 'r/Entrepreneur, gift food seller, 6,000+ orders/year' },
  { text: 'I\'ve had people share the notes on social media when they tag me in their purchases.', source: 'Flora and Fauna (Australia), via r/Shopify' },
  { text: 'Something as simple as a handwritten Thank You card makes a huge impact when businesses rely almost exclusively on email.', source: 'r/Entrepreneur' },
  { text: 'Seeing the handwriting of a real human being helps customers connect with your brand on a personal level.', source: 'Shopify Official Blog, August 2024' },
  { text: 'They complete that intimate feeling by including handwritten notes with each order. It\'s very tactile and that is the key theme across all our customer experiences.', source: 'Joel, Desmond and Dempsey (luxury DTC), Shopify Enterprise Blog, December 2025' },
];

export default function EcommerceQuotes() {
  return (
    <section style={{ background: '#fff', padding: '64px 0 36px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <span style={{
          display: 'block', textAlign: 'center',
          fontSize: 14, fontWeight: 700, letterSpacing: '0.13em',
          textTransform: 'uppercase', marginBottom: 8, color: '#FF7A00'
        }}>Real Sellers. Real Experiences.</span>
        <h2 style={{
          fontFamily: "'Sora', sans-serif", fontWeight: 800,
          fontSize: 'clamp(1.4rem, 4.8vw, 2.3rem)', lineHeight: 1.12,
          color: '#1a2d4a', textAlign: 'center', marginBottom: 7
        }}>
          What Happens When Your Customers Hold Something Real
        </h2>
        <p style={{ textAlign: 'center', color: '#4a5568', fontSize: 17, marginBottom: 5 }}>
          From r/Shopify, r/Entrepreneur, and Shopify's own published research.
        </p>
        <p style={{ textAlign: 'center', color: '#4a5568', fontSize: 14, fontStyle: 'italic', marginBottom: 22, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.24 }}>
          These are independent ecommerce operators sharing their experiences publicly, and content from Shopify's own research.
        </p>

        <div className="ec-quotes-grid">
          {quotes.map((q, i) => (
            <div key={i} style={{
              background: '#f2f1ee', border: '1px solid #dde1e7',
              borderRadius: 6, padding: '17px 15px'
            }}>
              <blockquote style={{
                fontSize: 17, color: '#2d3748', lineHeight: 1.44,
                fontStyle: 'italic', marginBottom: 10
              }}>
                <span style={{
                  fontSize: '2.4rem', color: '#FF7A00',
                  fontFamily: "'Sora', sans-serif", lineHeight: 0,
                  verticalAlign: '-0.36em', marginRight: 2
                }}>"</span>
                {q.text}
              </blockquote>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {q.source}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ec-quotes-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        @media (min-width: 640px) { .ec-quotes-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .ec-quotes-grid { grid-template-columns: repeat(3,1fr); } }
      `}</style>
    </section>
  );
}