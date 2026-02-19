import React from 'react';
import SolarWayCard from './SolarWayCard';
import SolarPreJobCard from './SolarPreJobCard';

/**
 * SolarThreeWays — SECTION 5: THREE WAYS + PRE-JOB CARD
 * bg #ffffff, 3-col grid + full-width pre-job card below
 */
const ways = [
  { num: '01', title: 'Follow Up on Open Proposals', body: 'A solar proposal is a significant decision. Most prospects go quiet while they consider it. A handwritten note received five to seven days after the proposal does what a fourth follow-up email cannot. It signals you are the company that operates differently, which matters when someone is trusting you with their home and their energy costs for the next 25 years.' },
  { num: '02', title: 'Generate Reviews and Referrals Post-Install', body: "The installation is complete. The homeowner is excited. A handwritten thank-you note arrives a few days later while they are still talking about it. No other contractor does this. Cialdini's research on reciprocity is clear: unexpected, effortful gestures create genuine inclination to respond in kind. Reviews and referrals follow." },
  { num: '03', title: 'Prospect the Neighborhood', body: 'After every installation, nearby homes can see your panels on the roof. A handwritten note using the PSL formula turns your installed system into your best lead source. When door knocking, your opener writes itself: "Did you get the note from our owner?" That is not a cold knock anymore. It is a follow-up.' },
];

export default function SolarThreeWays() {
  return (
    <section style={{ background: '#ffffff', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF7A00', marginBottom: '14px' }}>
          Three Ways It Works
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#1a2d4a', marginBottom: '16px' }}>
          Close More Proposals. Generate More Referrals. Own the Neighborhood.
        </h2>
        <p style={{ fontSize: '17px', color: '#4a5568', lineHeight: 1.55, maxWidth: '700px' }}>
          Solar is a high-ticket, relationship-driven business. These are the three moments where a handwritten card changes the outcome.
        </p>
        <div className="solar-ways-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px', marginTop: '40px' }}>
          {ways.map((w, i) => <SolarWayCard key={i} num={w.num} title={w.title} body={w.body} />)}
        </div>
        <SolarPreJobCard />
      </div>
      <style>{`
        @media (max-width: 768px) {
          .solar-ways-grid { grid-template-columns: 1fr !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}