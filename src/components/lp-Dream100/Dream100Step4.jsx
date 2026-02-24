import React from 'react';
import {
  formCardStyle, cardTitleStyle, cardSubStyle,
  formNavStyle, btnBackStyle, btnGenerateStyle,
} from './dream100Styles';

/**
 * Dream100Step4 — Review & Generate
 * Shows a summary confirmation box, then lets the user tap Generate.
 */
export default function Dream100Step4({ formData, onGenerate, onBack }) {
  const rows = [
    { icon: '🏡', label: 'Niche',    value: formData.niche || '—' },
    { icon: '📍', label: 'Market',   value: formData.geo   || '—' },
    { icon: '👤', label: 'Name',     value: formData.name  || '—' },
    { icon: '🤖', label: 'AI Tool',  value: formData.llm   || 'ChatGPT' },
  ];

  return (
    <div style={{ ...formCardStyle, animation: 'd100-fadeUp 0.25s ease both' }}>
      <div style={cardTitleStyle}>Ready to generate</div>
      <div style={cardSubStyle}>
        Here's what's going into your blueprint. Tap Generate to build all 7 prompts.
      </div>

      {/* Confirm summary box */}
      <div style={{
        background: 'var(--d100-cream-dark)', borderRadius: 10,
        padding: 18, marginBottom: 18,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {rows.map(r => (
          <div key={r.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{r.icon}</span>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: 'var(--d100-text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2,
              }}>{r.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--d100-navy)', lineHeight: 1.3 }}>{r.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* What you'll get */}
      <div style={{
        background: 'rgba(201,151,58,0.1)',
        border: '1px solid rgba(201,151,58,0.28)',
        borderRadius: 10, padding: '14px 16px',
        fontSize: 14, color: 'var(--d100-navy)', fontWeight: 500, lineHeight: 1.6,
        marginBottom: 4,
      }}>
        You'll get <strong>7 personalized AI prompts</strong> covering: lifecycle trigger mapping, partner identification, tier ranking, gap analysis, objection prep, outreach scripts including a handwritten note template, and a 90-day follow-up system — all built for{' '}
        <strong>{formData.niche || 'your niche'}</strong> in{' '}
        <strong>{formData.geo || 'your market'}</strong>.
      </div>

      {/* Nav */}
      <div style={formNavStyle}>
        <button onClick={onBack} style={btnBackStyle}>← Back</button>
        <button onClick={() => onGenerate({})} style={btnGenerateStyle}>⚡ Generate My Blueprint</button>
      </div>
    </div>
  );
}