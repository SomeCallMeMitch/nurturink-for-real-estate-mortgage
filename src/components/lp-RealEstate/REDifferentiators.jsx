import React from 'react';
import { Pencil, Mail, Users, Clock, CheckCircle, CreditCard } from 'lucide-react';
import REDiffCard from './REDiffCard';

/**
 * REDifferentiators — SECTION 4: WHY NURTURINK
 * Real Estate: blue accent, RE-specific copy for cards 3 & 4
 */
const cards = [
  { icon: Pencil, title: 'A Real Pen. Every Card.', body: 'A robotic arm holds a real ballpoint pen at a natural hand angle. AI controls pressure variation on every stroke. Ink absorbs into the paper fibers the way a real pen does. Inkjet ink sits on top. The brain registers the difference before the reader can articulate why — and that difference is exactly what drives the open rate, recall, and reciprocity that make this work.' },
  { icon: Mail, title: 'No Postmark at All', body: "Most providers that can send individual cards leave an out-of-town postmark, which signals immediately that it came from a service. NurturInk cards arrive with no postmark. They look like someone dropped it in a local mailbox. No bulk mail indicator. No metered postage. Nothing to break the impression that the card came from a person who thought of them." },
  { icon: Users, title: 'Built for Agents & Teams', body: "Most handwritten card platforms are structured for bulk campaigns of thousands of pieces. NurturInk works for a solo agent with 150 past clients or a team with 10 agents and 2,000. Team leaders can manage shared templates, oversee the cards going out across their team, and ensure every past client and new lead gets touched — regardless of which agent manages them." },
  { icon: Clock, title: 'Runs on Autopilot', body: "Everyone intends to send closing cards and past-client anniversary touches. Almost nobody does it consistently because life gets in the way. NurturInk connects to your client data and triggers cards automatically — closing day thank-you, move-in anniversary, open house follow-up. Set it once. It runs." },
  { icon: CheckCircle, title: 'The Grandma Test', body: 'Could this card have come from your grandma? Not "would you recognize her handwriting" — just: would you believe a real person wrote this and dropped it in a mailbox? That is the standard. Real pen angle, pressure variation on every stroke, over 20 unique versions of each character so no two letters next to each other are identical. Inkjet fonts fail this test on sight. A real pen does not.' },
  { icon: CreditCard, title: 'One Price, Everything Included', body: "Cardstock, handwritten message, handwritten envelope address, real stamp, mailed. One price covers the full card arriving in your client's mailbox. No separate postage charge. No add-ons. For an agent running a 200-client sphere with three touchpoints per year, the total annual investment is under $4 per client." },
];

export default function REDifferentiators() {
  return (
    <section id="why-nurturink" style={{ background: '#faf9f6', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#007bff', marginBottom: '14px' }}>
          Why NurturInk
        </div>
        <div style={{ marginBottom: '44px' }}>
          <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#1a2d4a', marginBottom: '16px' }}>
            Not All Handwritten Card Services Are the Same
          </h2>
          <p style={{ fontSize: '17px', color: '#4a5568', lineHeight: 1.55, maxWidth: '700px' }}>
            Some services use inkjet printers and call it handwritten. Others require bulk minimums built for marketing departments. NurturInk is built for individual real estate agents and teams who need a reliable, automated system that runs on their sphere of influence — not a campaign calendar.
          </p>
        </div>
        <div className="re-diff-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px' }}>
          {cards.map((c, i) => <REDiffCard key={i} icon={c.icon} title={c.title} body={c.body} />)}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .re-diff-grid { grid-template-columns: 1fr !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}