import React from 'react';

/**
 * REFurmanSection — Change 9: Furman Social Proof Section
 * Inserted AFTER REPSL and BEFORE REScience.
 * Source: BizBox Outside the Box Podcast, June 2025
 */
export default function REFurmanSection() {
  return (
    <section style={{ background: '#1a2d4a', padding: '80px 40px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Label */}
        <div style={{
          fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#f59e0b', marginBottom: '14px',
        }}>
          Real Agent. Real System. Real Results.
        </div>

        {/* Headline */}
        <h2 className="font-sora" style={{
          fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 900,
          lineHeight: 1.15, color: '#ffffff', marginBottom: '24px',
        }}>
          She Built a 98% Referral Business on Five Cards a Week.
        </h2>

        {/* Stat badge */}
        <div style={{
          display: 'inline-block', background: '#f59e0b',
          color: '#ffffff', fontFamily: "'Sora', sans-serif",
          fontWeight: 900, fontSize: '1.1rem',
          padding: '10px 22px', borderRadius: '4px', marginBottom: '28px',
        }}>
          98% Referral-Based Business
        </div>

        {/* Body paragraphs */}
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.6, marginBottom: '16px' }}>
          Amanda Furman runs the Amanda Furman Real Estate Collective in Appleton, Wisconsin. Her team has one requirement beyond showing up to meetings: write five handwritten note cards every week. Not about listings. Not about the market. About life.
        </p>
        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.6 }}>
          When she struggles to find who to write, she opens social media and looks for pain, pleasure, and celebration. Someone lost a pet. Someone got promoted. Someone had a baby. She sends a card. No logo. No pitch. Just acknowledgment that she noticed — and that she cared enough to say something with a pen.
        </p>

        {/* Quote 1 */}
        <div style={{
          borderLeft: '5px solid #f59e0b', padding: '24px 32px',
          margin: '36px 0', background: 'rgba(255,255,255,0.04)',
          borderRadius: '0 5px 5px 0',
        }}>
          <p style={{ fontSize: '1.2rem', fontStyle: 'italic', color: '#ffffff', lineHeight: 1.6, margin: '0 0 12px' }}>
            "The only requirement to be on my team is to come to our team meetings and to write five handwritten note cards every week — and they can't be anything business related."
          </p>
          <cite style={{ fontSize: '0.85rem', color: '#f59e0b', fontStyle: 'normal', fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>
            — Amanda Furman, Amanda Furman Real Estate Collective | Source: BizBox Outside the Box Podcast, June 2025
          </cite>
        </div>

        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.6 }}>
          The result: no cold calling, no door knocking, no ad spend. Nine point nine out of ten times, the person who receives a card reaches back out to say how much it meant to them. And when a neighbor asks "do you know a good agent?" — Amanda's name is the one that comes up.
        </p>

        {/* Quote 2 */}
        <div style={{
          borderLeft: '5px solid #f59e0b', padding: '24px 32px',
          margin: '36px 0', background: 'rgba(255,255,255,0.04)',
          borderRadius: '0 5px 5px 0',
        }}>
          <p style={{ fontSize: '1.2rem', fontStyle: 'italic', color: '#ffffff', lineHeight: 1.6, margin: '0 0 12px' }}>
            "I would say 9.9 out of 10 times, whoever I send a card to reaches back out to me and lets me know how much that meant to them."
          </p>
          <cite style={{ fontSize: '0.85rem', color: '#f59e0b', fontStyle: 'normal', fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>
            — Amanda Furman | Source: BizBox Outside the Box Podcast, June 2025
          </cite>
        </div>

        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.6 }}>
          NurturInk automates the mechanical part. You provide the intention. We handle the pen, the stamp, and the mailbox.
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}