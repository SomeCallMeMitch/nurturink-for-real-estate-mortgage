import React, { useState } from 'react';
import { formCardStyle, cardTitleStyle, cardSubStyle } from './dream100Styles';

/**
 * Dream100Step1 — Niche selector
 * 2-col grid (4-col at ≥600px), niche helper chips, optional custom niche textarea.
 */

const NICHES = [
  { value: 'Luxury & High-End Residential', icon: '🏛️', title: 'Luxury & High-End', desc: '$1M+ properties' },
  { value: 'First-Time Homebuyers',           icon: '🔑', title: 'First-Time Buyers',  desc: 'FHA, down payment programs' },
  { value: 'Empty Nesters & Downsizing',      icon: '🌿', title: 'Empty Nesters',      desc: 'Downsizing, 55+ lifestyle' },
  { value: 'Investor & Fix-and-Flip',         icon: '📈', title: 'Investors',          desc: 'BRRRR, fix-and-flip' },
  { value: 'Military Relocation (PCS)',        icon: '🎖️', title: 'Military PCS',       desc: 'VA loans, relocation' },
  { value: 'Divorce & Estate Sales',          icon: '⚖️', title: 'Divorce & Estate',   desc: 'Probate, court-ordered' },
  { value: 'New Construction & Builder Representation', icon: '🏗️', title: 'New Construction', desc: 'Builder rep, new dev' },
  { value: 'General Residential',            icon: '🏡', title: 'General Residential', desc: 'Mix of buyers & sellers' },
];

const NICHE_CHIPS = {
  'Luxury & High-End Residential':   ['Waterfront estates $2M+', 'Gated communities with private amenities', 'Luxury condos for empty nesters', 'Primary residence to vacation home buyers', 'International/out-of-state luxury buyers'],
  'First-Time Homebuyers':           ['Young professionals age 25–35', 'FHA and down payment assistance buyers', 'Renters moving to suburbs', 'Dual-income couples buying their first home', 'Single buyers in urban markets'],
  'Empty Nesters & Downsizing':      ['Couples 55–70 selling a 4BR family home', 'Moving to a 55+ active adult community', 'Seeking lock-and-leave condos', 'Downsizing to be near grandchildren', 'Trading a large home for a smaller home + cash'],
  'Investor & Fix-and-Flip':         ['Out-of-state investors buying remotely', 'BRRRR strategy buyers', 'Local flippers doing 5–10 deals a year', 'Multifamily 2–4 unit investors', 'Short-term rental (Airbnb) buyers'],
  'Military Relocation (PCS)':       ['Active duty families on PCS orders', 'VA loan buyers near a base', 'Retiring military buying their forever home', 'Dual military couples', 'Military families relocating to/from overseas'],
  'Divorce & Estate Sales':          ['Divorce attorneys who refer clients needing to sell', 'Probate and estate attorneys', 'Inherited property owners', 'Court-ordered sales needing quick close', 'Executors managing estate real estate'],
  'New Construction & Builder Representation': ['Representing buyers in new subdivisions', 'Exclusive builder sales rep partnerships', 'Custom home lot buyers', 'Buyers torn between resale and new build', '55+ new construction communities'],
  'General Residential':             ['Mix of move-up buyers and sellers', 'Suburban families in a specific price range', 'Buyers and sellers in a specific neighborhood', 'Referral-based business, all price points'],
};

export default function Dream100Step1({ formData, onNext }) {
  const [selected, setSelected] = useState(formData.nicheBase || '');
  const [custom, setCustom] = useState(formData.customNiche || '');
  const [error, setError] = useState(false);

  const handleSelect = (value) => {
    setSelected(value);
    setError(false);
  };

  const handleChip = (chip) => {
    setCustom(prev => prev ? prev + ', ' + chip : chip);
  };

  const handleNext = () => {
    if (!selected) { setError(true); return; }
    onNext({
      nicheBase: selected,
      customNiche: custom,
      niche: custom ? `${selected} — ${custom}` : selected,
    });
  };

  const chips = selected ? NICHE_CHIPS[selected] || [] : [];

  return (
    <div style={{ ...formCardStyle, animation: 'd100-fadeUp 0.25s ease both' }}>
      <div style={cardTitleStyle}>What's your real estate niche?</div>
      <div style={cardSubStyle}>
        Pick the market you focus on most.{' '}
        <strong style={{ color: 'var(--d100-text)', fontWeight: 600 }}>
          You can come back and build a separate blueprint for each niche
        </strong>{' '}
        — start with the one that drives most of your business right now.
      </div>

      {/* Niche grid */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--d100-navy)', marginBottom: 6, letterSpacing: '0.01em' }}>
          Select your primary niche
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}>
          {NICHES.map(n => (
            <NicheCard
              key={n.value}
              niche={n}
              selected={selected === n.value}
              onSelect={() => handleSelect(n.value)}
            />
          ))}
        </div>
        {error && (
          <div style={{ fontSize: 13, color: '#DC2626', marginTop: 6, fontWeight: 500 }}>
            Please select a niche to continue.
          </div>
        )}
      </div>

      {/* Niche helper chips */}
      {selected && (
        <div style={{
          background: 'rgba(201,151,58,0.08)',
          border: '1px solid rgba(201,151,58,0.25)',
          borderRadius: 10, padding: '14px 16px', marginBottom: 14,
        }}>
          <p style={{ fontSize: 14, color: 'var(--d100-navy)', fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>
            Add more detail to get sharper results:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
            {chips.map(chip => (
              <span
                key={chip}
                onClick={() => handleChip(chip)}
                style={{
                  fontSize: 12, fontWeight: 600,
                  background: 'var(--d100-white)',
                  border: '1px solid var(--d100-border)',
                  color: 'var(--d100-navy)',
                  padding: '5px 11px', borderRadius: 20,
                  cursor: 'pointer', transition: 'all 0.15s',
                  userSelect: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--d100-navy)'; e.currentTarget.style.color = 'var(--d100-white)'; e.currentTarget.style.borderColor = 'var(--d100-navy)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--d100-white)'; e.currentTarget.style.color = 'var(--d100-navy)'; e.currentTarget.style.borderColor = 'var(--d100-border)'; }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Optional custom niche textarea */}
      {selected && (
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--d100-navy)', marginBottom: 6, letterSpacing: '0.01em' }}>
            Describe your niche in more detail{' '}
            <span style={{ fontWeight: 400, color: 'var(--d100-text-muted)', fontSize: 13 }}>(optional but makes your prompts much sharper)</span>
          </label>
          <textarea
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder={chips[0] ? `e.g., ${chips[0].toLowerCase()}...` : 'Describe your ideal client, price range, specific situation...'}
            style={textareaStyle}
          />
          <p style={{ fontSize: 13, color: 'var(--d100-text-muted)', marginTop: 7, lineHeight: 1.5, fontStyle: 'italic' }}>
            The more specific you are here, the more targeted your AI prompts will be. Generic inputs = generic results.
          </p>
        </div>
      )}

      {/* Nav */}
      <div style={formNavStyle}>
        <button onClick={handleNext} style={btnNextStyle}>Continue →</button>
      </div>

      <style>{`
        @media (min-width: 600px) { .d100-niche-grid { grid-template-columns: repeat(4,1fr) !important; } }
      `}</style>
    </div>
  );
}

function NicheCard({ niche, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: selected ? '2px solid var(--d100-navy)' : '2px solid var(--d100-border)',
        borderRadius: 10, padding: '13px 14px',
        cursor: 'pointer', transition: 'all 0.18s',
        background: selected ? 'var(--d100-white)' : 'var(--d100-cream)',
        boxShadow: selected ? '0 0 0 2px rgba(27,42,74,0.1)' : 'none',
        position: 'relative',
        transform: hovered && !selected ? 'scale(0.98)' : 'scale(1)',
        userSelect: 'none',
      }}
    >
      {/* Checkmark for selected */}
      {selected && (
        <div style={{
          position: 'absolute', top: 8, right: 10,
          width: 18, height: 18,
          background: 'var(--d100-navy)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: 'white', fontWeight: 800,
        }}>✓</div>
      )}
      <div style={{ fontSize: 20, marginBottom: 5 }}>{niche.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--d100-navy)', lineHeight: 1.2, marginBottom: 3 }}>{niche.title}</div>
      <div style={{ fontSize: 11, color: 'var(--d100-text-muted)', lineHeight: 1.3, fontWeight: 400 }}>{niche.desc}</div>
    </div>
  );
}

// ─── Shared input styles ────────────────────────────────
export const inputStyle = {
  width: '100%', padding: '14px 16px',
  border: '1.5px solid var(--d100-border)', borderRadius: 10,
  fontFamily: "'Sora', sans-serif", fontSize: 16,
  color: 'var(--d100-text)', background: 'var(--d100-cream)',
  outline: 'none', appearance: 'none', WebkitAppearance: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  lineHeight: 1.4,
};

export const textareaStyle = {
  ...inputStyle, minHeight: 88, resize: 'none',
};

export const formNavStyle = {
  display: 'flex', gap: 10, justifyContent: 'flex-end',
  marginTop: 24, paddingTop: 20,
  borderTop: '1px solid var(--d100-border)',
};

export const btnNextStyle = {
  flex: 1, padding: '14px 20px', border: 'none',
  borderRadius: 10, background: 'var(--d100-navy)',
  color: 'var(--d100-white)', fontFamily: "'Sora', sans-serif",
  fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
};

export const btnBackStyle = {
  padding: '13px 20px',
  border: '1.5px solid var(--d100-border)', borderRadius: 10,
  background: 'transparent', color: 'var(--d100-text-muted)',
  fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.2s',
};