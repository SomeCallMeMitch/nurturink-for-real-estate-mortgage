import React from 'react';
import REWayCard from './REWayCard';
import REOpenHouseCard from './REOpenHouseCard';

/**
 * REThreeWays — SECTION 5: FOUR WAYS + OPEN HOUSE WIDE CARD
 * Real Estate: 4 cards in grid (delta change 1), Open House card below grid (delta change 2)
 * Blue accent, RE-specific copy
 */
const ways = [
  { num: '01', title: 'New Client Closing Card', body: 'Sent within days of closing. No ask. Just gratitude. "Thank you for trusting me with one of the biggest decisions of your life." Most agents disappear after the sale. This card signals you are different before the relationship is even established. Industry data shows clients who receive a handwritten card within 30 days of closing are twice as likely to refer friends and family.' },
  { num: '02', title: 'Move-In Anniversary Card', body: "Sent 7 to 14 days before their move-in anniversary so it arrives on time. Still no ask. You are acknowledging them as a person, not a transaction. Nothing about real estate. Nothing about referrals. Just \"Happy Anniversary in your home!\" That is it. Clients who receive anniversary cards are 7.5x more likely to leave a Google review than those who don't." },
  { num: '03', title: 'Neighborhood Market Update Card', body: "Sent to past clients in a specific neighborhood when there's a relevant market update. \"Homes in your area have appreciated 12% this year — your investment is doing well!\" This positions you as the local expert, keeps you top of mind, and gives clients a reason to share your name when neighbors ask about real estate." },
  { num: '04', title: 'Referral Thank-You Card', body: "When a past client sends you a referral, a handwritten thank-you does two things. It expresses genuine appreciation for something genuinely valuable. And it makes them want to do it again. Research shows clients who feel a personal connection are 5x more likely to refer. Thanking them in writing reinforces exactly that connection." },
];

export default function REThreeWays() {
  return (
    <section style={{ background: '#ffffff', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#007bff', marginBottom: '14px' }}>
          The System That Works
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#1a2d4a', marginBottom: '16px' }}>
          Give. Give. Give. Get.
        </h2>
        <p style={{ fontSize: '17px', color: '#4a5568', lineHeight: 1.55, maxWidth: '700px' }}>
          Most agents only reach out when they want something — a referral, a listing, a review. Clients feel that. The give-give-give-get sequence builds the relationship first, so when the time comes, you are not a stranger asking for a favor. You are their agent, checking in.
        </p>
        {/* Delta change 1: 4-column grid, 22px gap */}
        <div className="re-ways-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '22px', marginTop: '40px' }}>
          {ways.map((w, i) => <REWayCard key={i} num={w.num} title={w.title} body={w.body} />)}
        </div>
        {/* Delta change 2: Open House card sits BELOW the grid, not inside it */}
        <REOpenHouseCard />
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .re-ways-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 768px) {
          .re-ways-grid { grid-template-columns: 1fr !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}