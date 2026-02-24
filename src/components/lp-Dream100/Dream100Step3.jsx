import React, { useState } from 'react';
import {
  formCardStyle, cardTitleStyle, cardSubStyle,
  fieldLabelStyle, fieldHintStyle,
  inputStyle, selectStyle,
  formNavStyle, btnNextStyle, btnBackStyle,
} from './dream100Styles';

/**
 * Dream100Step3 — Agent info
 * Collects: first name (required), years experience (optional), AI tool preference (optional)
 */

const YEARS_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: "I'm in my first 2 years and building my referral base from scratch", label: 'Under 2 years' },
  { value: 'I have 3–5 years of experience and am building more consistent systems', label: '3–5 years' },
  { value: 'I have 6–10 years of experience and am refining my referral approach', label: '6–10 years' },
  { value: "I have over 10 years of experience and want to systematize what I've been doing informally", label: '10+ years' },
];

const LLM_OPTIONS = ['ChatGPT', 'Claude (Anthropic)', 'Perplexity', 'Gemini', 'Grok (xAI)', "I'm not sure yet"];

export default function Dream100Step3({ formData, onNext, onBack }) {
  const [name, setName] = useState(formData.name || '');
  const [years, setYears] = useState(formData.years || '');
  const [llm, setLlm] = useState(formData.llm || 'ChatGPT');
  const [nameError, setNameError] = useState(false);

  const focusStyle = {
    borderColor: 'var(--d100-navy)',
    background: 'var(--d100-white)',
    boxShadow: '0 0 0 3px rgba(27,42,74,0.09)',
  };

  const handleNext = () => {
    if (!name.trim()) { setNameError(true); return; }
    onNext({ name: name.trim(), years, llm });
  };

  return (
    <div style={{ ...formCardStyle, animation: 'd100-fadeUp 0.25s ease both' }}>
      <div style={cardTitleStyle}>Almost there</div>
      <div style={cardSubStyle}>
        Your name personalizes the outreach scripts so they sound like you, not a template.
      </div>

      {/* First name */}
      <div style={{ marginBottom: 22 }}>
        <label style={fieldLabelStyle}>Your first name</label>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); if (nameError) setNameError(false); }}
          placeholder="e.g., Sarah"
          style={{ ...inputStyle, borderColor: nameError ? '#DC2626' : 'var(--d100-border)' }}
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => { e.target.style.borderColor = nameError ? '#DC2626' : 'var(--d100-border)'; e.target.style.background = 'var(--d100-cream)'; e.target.style.boxShadow = 'none'; }}
        />
        {nameError && <div style={{ fontSize: 13, color: '#DC2626', marginTop: 6, fontWeight: 500 }}>Please enter your first name.</div>}
      </div>

      {/* Years experience */}
      <div style={{ marginBottom: 22 }}>
        <label style={fieldLabelStyle}>
          Years in real estate{' '}
          <span style={{ fontWeight: 400, color: 'var(--d100-text-muted)', fontSize: 13 }}>(optional)</span>
        </label>
        <select
          value={years}
          onChange={e => setYears(e.target.value)}
          style={selectStyle}
          onFocus={e => Object.assign(e.target.style, { borderColor: 'var(--d100-navy)', background: 'var(--d100-white)', boxShadow: '0 0 0 3px rgba(27,42,74,0.09)' })}
          onBlur={e => { e.target.style.borderColor = 'var(--d100-border)'; e.target.style.background = 'var(--d100-cream)'; e.target.style.boxShadow = 'none'; }}
        >
          {YEARS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <p style={fieldHintStyle}>Used to calibrate the tone and positioning of your outreach scripts — a newer agent sounds different than a 15-year veteran.</p>
      </div>

      {/* AI tool */}
      <div style={{ marginBottom: 22 }}>
        <label style={fieldLabelStyle}>Which AI tool will you paste these prompts into?</label>
        <select
          value={llm}
          onChange={e => setLlm(e.target.value)}
          style={selectStyle}
          onFocus={e => Object.assign(e.target.style, { borderColor: 'var(--d100-navy)', background: 'var(--d100-white)', boxShadow: '0 0 0 3px rgba(27,42,74,0.09)' })}
          onBlur={e => { e.target.style.borderColor = 'var(--d100-border)'; e.target.style.background = 'var(--d100-cream)'; e.target.style.boxShadow = 'none'; }}
        >
          {LLM_OPTIONS.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <p style={fieldHintStyle}>Choose the one you use most — each prompt will be formatted to get the best results from that tool.</p>
      </div>

      {/* Nav */}
      <div style={formNavStyle}>
        <button onClick={onBack} style={btnBackStyle}>← Back</button>
        <button onClick={handleNext} style={btnNextStyle}>Continue →</button>
      </div>
    </div>
  );
}