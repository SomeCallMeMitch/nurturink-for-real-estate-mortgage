import React from 'react';
import InsuranceWayCard from './InsuranceWayCard';
import InsurancePreJobCard from './InsurancePreJobCard';

/**
 * InsuranceThreeWays — SECTION 5: THREE WAYS (Give. Give. Get.)
 * Insurance-specific: 3 cards (not 4), retention-focused content
 */
const ways = [
  { num: '01', title: 'New Client Welcome Card', body: 'Sent within days of signing. No ask. Just gratitude. "Thank you for trusting me with your coverage." Most agents disappear after the sale. This card signals you are different before the relationship is even established. ClientCircle data shows new clients who receive two handwritten cards in the first 60 days are twice as likely to refer friends and family.' },
  { num: '02', title: 'Birthday Card', body: 'Sent 7 to 14 days before their birthday so it arrives on time. Still no ask. You are acknowledging them as a person, not a policy number. Nothing about insurance. Nothing about renewals. Just "Happy Birthday." That is it. ClientCircle data shows birthday card recipients are 7.5x more likely to leave a Google review than clients who don\'t receive one.' },
  { num: '03', title: 'Pre-Renewal Card', body: 'Sent 30 to 90 days before their renewal date. Now you have earned the ask. You have already given twice. The relationship exists. Your renewal email is competing against 121 others in their inbox. Your pre-renewal card arrives on the kitchen counter. Because you sent the welcome and the birthday, you are not a stranger selling something. You are their agent, checking in.' },
];

export default function InsuranceThreeWays() {
  return (
    <section style={{ background: '#ffffff', padding: '80px 0' }}>
      {/* Widened inner container to 1200px */}
      <div className="insurance-ways-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF7A00', marginBottom: '14px' }}>
          The System That Works
        </div>
        <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#1a2d4a', marginBottom: '16px' }}>
          Give. Give. Get.
        </h2>
        <p style={{ fontSize: '17px', color: '#4a5568', lineHeight: 1.55, maxWidth: '700px' }}>
          Most agents only reach out when they want something — a renewal, a referral, a cross-sell. Clients feel that. The give-give-get sequence builds the relationship first, so when the time comes, you are not a stranger asking for a favor. You are their agent, checking in.
        </p>
        <div className="insurance-ways-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px', marginTop: '40px' }}>
          {ways.map((w, i) => <InsuranceWayCard key={i} num={w.num} title={w.title} body={w.body} />)}
        </div>
        <InsurancePreJobCard />
      </div>
      <style>{`
        @media (max-width: 768px) {
          .insurance-ways-grid { grid-template-columns: 1fr !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}