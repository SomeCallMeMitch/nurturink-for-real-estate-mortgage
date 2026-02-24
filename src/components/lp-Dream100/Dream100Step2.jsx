import React, { useState } from 'react';
import {
  formCardStyle, cardTitleStyle, cardSubStyle,
  fieldLabelStyle, fieldHintStyle,
  inputStyle, textareaStyle, selectStyle,
  formNavStyle, btnNextStyle, btnBackStyle,
} from './dream100Styles';

/**
 * Dream100Step2 — Market & Challenge
 * Collects: geo (required), client description (optional), challenge (required)
 */
const CHALLENGES = [
  { value: "I don't have a systematic approach to finding referral partners", label: "No systematic approach yet" },
  { value: "I rely on one or two relationships that aren't consistent enough", label: "Too dependent on a few people" },
  { value: "I know who the right partners are but don't know how to approach them without it feeling like a cold call", label: "I know who — just can't break in" },
  { value: "I've tried reaching out to partners but haven't gotten traction or real responses", label: "Reached out but can't get traction" },
  { value: "I don't know which partner types are most valuable for my specific niche", label: "Don't know which partners to prioritize" },
];

export default function Dream100Step2({ formData, onNext, onBack }) {
  const [geo, setGeo] = useState(formData.geo || '');
  const [client, setClient] = useState(formData.client || '');
  const [challenge, setChallenge] = useState(formData.challenge || '');
  const [errors, setErrors] = useState({ geo: false, challenge: false });

  const handleNext = () => {
    const errs = { geo: !geo.trim(), challenge: !challenge };
    setErrors(errs);
    if (errs.geo || errs.challenge) return;
    onNext({ geo: geo.trim(), client: client.trim(), challenge });
  };

  const focusStyle = {
    borderColor: 'var(--d100-navy)',
    background: 'var(--d100-white)',
    boxShadow: '0 0 0 3px rgba(27,42,74,0.09)',
  };

  return (
    <div style={{ ...formCardStyle, animation: 'd100-fadeUp 0.25s ease both' }}>
      <div style={cardTitleStyle}>Your market &amp; challenge</div>
      <div style={cardSubStyle}>
        The more specific your market, the more targeted your partner list.{' '}
        <strong style={{ color: 'var(--d100-text)', fontWeight: 600 }}>
          You can also come back and redo this for different cities or neighborhoods.
        </strong>
      </div>

      {/* Market area */}
      <div style={{ marginBottom: 22 }}>
        <label style={fieldLabelStyle}>Your primary market area</label>
        <input
          type="text"
          value={geo}
          onChange={e => { setGeo(e.target.value); if (errors.geo) setErrors(p => ({ ...p, geo: false })); }}
          placeholder="e.g., Scottsdale, AZ · Buckhead, Atlanta · The Hamptons, NY"
          style={{ ...inputStyle, borderColor: errors.geo ? '#DC2626' : 'var(--d100-border)' }}
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => { e.target.style.borderColor = errors.geo ? '#DC2626' : 'var(--d100-border)'; e.target.style.background = 'var(--d100-cream)'; e.target.style.boxShadow = 'none'; }}
        />
        <p style={fieldHintStyle}>City, metro, neighborhood, or county. Be as specific as possible — "North Scottsdale" beats "Arizona."</p>
        {errors.geo && <div style={{ fontSize: 13, color: '#DC2626', marginTop: 6, fontWeight: 500 }}>Please enter your market area.</div>}
      </div>

      {/* Ideal client */}
      <div style={{ marginBottom: 22 }}>
        <label style={fieldLabelStyle}>
          Describe your ideal client{' '}
          <span style={{ fontWeight: 400, color: 'var(--d100-text-muted)', fontSize: 13 }}>(optional — adds a lot of value)</span>
        </label>
        <textarea
          value={client}
          onChange={e => setClient(e.target.value)}
          placeholder="e.g., Couples 45–65 with $1M+ in equity looking to downsize to a maintenance-free condo or 55+ community near good healthcare..."
          style={textareaStyle}
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => { e.target.style.borderColor = 'var(--d100-border)'; e.target.style.background = 'var(--d100-cream)'; e.target.style.boxShadow = 'none'; }}
        />
        <p style={fieldHintStyle}>Demographics, lifestyle, financial situation, motivations — anything that makes them distinct from the average buyer or seller.</p>
      </div>

      {/* Challenge */}
      <div style={{ marginBottom: 22 }}>
        <label style={fieldLabelStyle}>Your biggest referral challenge right now</label>
        <select
          value={challenge}
          onChange={e => { setChallenge(e.target.value); if (errors.challenge) setErrors(p => ({ ...p, challenge: false })); }}
          style={{ ...selectStyle, borderColor: errors.challenge ? '#DC2626' : 'var(--d100-border)' }}
          onFocus={e => Object.assign(e.target.style, { borderColor: 'var(--d100-navy)', background: 'var(--d100-white)', boxShadow: '0 0 0 3px rgba(27,42,74,0.09)' })}
          onBlur={e => { e.target.style.borderColor = errors.challenge ? '#DC2626' : 'var(--d100-border)'; e.target.style.background = 'var(--d100-cream)'; e.target.style.boxShadow = 'none'; }}
        >
          <option value="" disabled>Select your challenge...</option>
          {CHALLENGES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <p style={fieldHintStyle}>This shapes your objection handling and outreach scripts — your prompts will directly address your specific situation.</p>
        {errors.challenge && <div style={{ fontSize: 13, color: '#DC2626', marginTop: 6, fontWeight: 500 }}>Please select your biggest challenge.</div>}
      </div>

      {/* Nav */}
      <div style={formNavStyle}>
        <button onClick={onBack} style={btnBackStyle}>← Back</button>
        <button onClick={handleNext} style={btnNextStyle}>Continue →</button>
      </div>
    </div>
  );
}