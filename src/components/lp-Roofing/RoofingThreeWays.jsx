import React from 'react';
import RoofingWayCard from './RoofingWayCard';
import RoofingPreJobCard from './RoofingPreJobCard';

/**
 * RoofingThreeWays — SECTION 5: THREE WAYS + PRE-JOB CARD
 * Cloned from SolarThreeWays
 */
const ways = [
  { num: '01', title: 'Follow Up on Open Estimates', body: 'Most homeowners get multiple estimates and go quiet while they decide. A handwritten note received five to seven days after your estimate does what a fourth follow-up call cannot. It signals you are the company that operates differently. That is the one that stays on the counter while they are thinking it over.' },
  { num: '02', title: 'Post-Job Thank You and Referral', body: "The job is done. The roof looks great. The homeowner is happy but already moving on. A handwritten thank-you note arrives while they are still talking about it. No other roofer does this. When their neighbor asks who did the roof, they do not have to think. They have your card right there." },
  { num: '03', title: 'Storm Response Outreach', body: 'After a hail event or high winds, every roofer in the market floods the same neighborhood with door hangers and mailers. A handwritten note stands apart from all of it. It reads as personal. It reads as someone who noticed and took the time. That is a meaningful difference when every other company looks identical.' },
  { num: '04', title: 'Neighborhood Prospecting', body: 'Every completed job is visible from the street. A handwritten note to surrounding homes using the PSL formula turns each install into a lead source. When door knocking the same area, your opener is already written: "Did you get the note from our owner?" That is not a cold knock. That is a follow-up.' },
];

export default function RoofingThreeWays() {
  return (
    <section style={{ background: '#ffffff', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF7A00', marginBottom: '14px' }}>
          Three Ways It Works
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#1a2d4a', marginBottom: '16px' }}>
          Close More Estimates. Generate More Referrals. Own the Neighborhood.
        </h2>
        <p style={{ fontSize: '17px', color: '#4a5568', lineHeight: 1.55, maxWidth: '700px' }}>
          Roofing is a high-ticket, relationship-driven business where the homeowner is choosing who they trust with their home. These are the four moments where a handwritten card changes the outcome.
        </p>
        <div className="roofing-ways-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '22px', marginTop: '40px' }}>
          {ways.map((w, i) => <RoofingWayCard key={i} num={w.num} title={w.title} body={w.body} />)}
        </div>
        <RoofingPreJobCard />
      </div>
      <style>{`
        @media (max-width: 768px) {
          .roofing-ways-grid { grid-template-columns: 1fr !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}