import React from 'react';
import { Pencil, Mail, Users, Clock, CheckCircle, CreditCard } from 'lucide-react';
import SolarDiffCard from './SolarDiffCard';

/**
 * SolarDifferentiators — SECTION 4: WHY NURTURINK
 * id="why-nurturink", bg #faf9f6, 3-col grid of 6 cards
 */
const cards = [
  { icon: Pencil, title: 'A Real Pen. Every Card.', body: 'A robotic arm holds a real ballpoint pen at a natural hand angle. AI controls pressure variation on every stroke. Ink absorbs into the paper fibers the way a real pen does. Inkjet ink sits on top. The brain registers the difference before the reader can articulate why.' },
  { icon: Mail, title: 'No Postmark at All', body: "Most providers that can send individual cards leave an out-of-town postmark, which signals immediately that it came from a service. NurturInk cards arrive with no postmark. They look like someone dropped it in a local mailbox. No bulk mail indicator. No metered postage. Nothing to break the illusion." },
  { icon: Users, title: 'Built for Reps and Teams', body: 'Most handwritten card services are structured for bulk campaigns of 2,000 to 50,000 pieces sent at one time. NurturInk works for a single card or a full team campaign. Sales organizations can invite their team, oversee cards being sent, and manage shared templates from one account.' },
  { icon: Clock, title: 'Automation That Actually Runs', body: 'Set triggers once. Cards go out on schedule whether you are on a job, traveling, or closing another deal. The manual version of this strategy works until you get busy. Automation is the only version that holds up over time.' },
  { icon: CheckCircle, title: 'The Grandma Test', body: 'Could this card have come from your grandma? Not "would you recognize her handwriting" — just: would you believe a real person wrote this and dropped it in a mailbox? That is the standard. Real pen angle, pressure variation on every stroke, over 20 unique versions of each character so no two letters next to each other are identical. Inkjet fonts fail this test on sight. A real pen does not.' },
  { icon: CreditCard, title: 'One Price, Everything Included', body: "Cardstock, handwritten message, handwritten envelope address, real stamp, mailed. One price covers the full card arriving in your client's mailbox. No separate postage charge. No add-ons." },
];

export default function SolarDifferentiators() {
  return (
    <section id="why-nurturink" style={{ background: '#faf9f6', padding: '80px 40px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF7A00', marginBottom: '14px' }}>
          Why NurturInk
        </div>
        <div style={{ marginBottom: '44px' }}>
          <h2 className="font-sora" style={{ fontSize: 'clamp(1.75rem, 2.6vw, 2.3rem)', fontWeight: 800, lineHeight: 1.15, color: '#1a2d4a', marginBottom: '16px' }}>
            Not All Handwritten Card Services Are the Same
          </h2>
          <p style={{ fontSize: '17px', color: '#4a5568', lineHeight: 1.55, maxWidth: '700px' }}>
            Some services use inkjet printers and call it handwritten. Others are built for marketing departments sending thousands of pieces in a single batch. NurturInk is built differently.
          </p>
        </div>
        <div className="solar-diff-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px' }}>
          {cards.map((c, i) => <SolarDiffCard key={i} icon={c.icon} title={c.title} body={c.body} />)}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .solar-diff-grid { grid-template-columns: 1fr !important; }
          section { padding: 60px 24px !important; }
        }
      `}</style>
    </section>
  );
}