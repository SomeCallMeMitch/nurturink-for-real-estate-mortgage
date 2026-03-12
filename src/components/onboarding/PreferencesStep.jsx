import React, { useState } from 'react';

const STYLES = [
  {
    key: 'Friendly',
    name: 'Friendly',
    desc: 'Warm and approachable',
    greeting: 'Hi [Name],',
    signoff: 'Thanks,\n[Your Name]',
  },
  {
    key: 'Professional',
    name: 'Professional',
    desc: 'Polished and business-ready',
    greeting: 'Hello [Name],',
    signoff: 'Best,\n[Your Name]',
  },
  {
    key: 'Casual',
    name: 'Casual',
    desc: 'Relaxed and personal',
    greeting: 'Hey [Name],',
    signoff: 'Talk soon,\n[Your Name]',
  },
  {
    key: 'Grateful',
    name: 'Grateful',
    desc: 'Appreciative and heartfelt',
    greeting: 'Hi [Name],',
    signoff: 'Thank you,\n[Your Name]',
  },
  {
    key: 'Direct',
    name: 'Direct',
    desc: 'Clean and to the point',
    greeting: '[Name],',
    signoff: '[Your Name]',
  },
  {
    key: 'Warm',
    name: 'Warm',
    desc: 'Sincere and relationship-focused',
    greeting: 'Dear [Name],',
    signoff: 'Sincerely,\n[Your Name]',
  },
];

// ─── Shared layout pieces ────────────────────────────────────────────────────

function PageShell({ children }) {
  return (
    <div className="flex gap-7 items-start max-w-7xl mx-auto px-8 py-8">
      {children}
    </div>
  );
}

function ContextPanel({ icon, heading, bullets, note }) {
  return (
    <div className="w-[400px] flex-shrink-0 bg-[#fff8f3] border-2 border-[#f5c9a0] rounded-2xl p-7 sticky top-16 self-start">
      <div className="w-11 h-11 bg-[#e07b39] rounded-full flex items-center justify-center text-xl mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[#92400e] mb-4">{heading}</h3>
      <ul className="space-y-3">
        {bullets.map((b, i) => (
          <li key={i} className="text-sm text-[#78350f] leading-relaxed pl-6 relative">
            <span className="absolute left-0 top-0.5 text-xs">✍️</span>
            <span dangerouslySetInnerHTML={{ __html: b }} />
          </li>
        ))}
      </ul>
      <hr className="border-t border-[#f5c9a0] my-4" />
      <p className="text-sm text-[#92400e] italic leading-relaxed">💡 {note}</p>
    </div>
  );
}

function FormCard({ children }) {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-10 py-8">
      {children}
    </div>
  );
}

// ─── Style card ───────────────────────────────────────────────────────────────

function StyleCard({ style, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(style.key)}
      className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
        selected
          ? 'border-[#e07b39] bg-[#fff8f3]'
          : 'border-gray-200 bg-white hover:border-[#f5c9a0] hover:bg-[#fffaf7]'
      }`}
    >
      {/* Checkmark badge */}
      {selected && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-[#e07b39] text-white rounded-full flex items-center justify-center text-xs font-bold">
          ✓
        </div>
      )}
      <div className="text-sm font-bold text-gray-900 mb-0.5">{style.name}</div>
      <div className="text-xs text-gray-500 mb-2">{style.desc}</div>
      <div
        className={`rounded-lg px-3 py-2 text-xs text-gray-700 font-serif leading-relaxed border-l-[3px] bg-gray-50 whitespace-pre-line ${
          selected ? 'border-[#e07b39]' : 'border-gray-200'
        }`}
      >
        {style.greeting}
        {'\n\n'}...your message...{'\n\n'}
        {style.signoff}
      </div>
    </div>
  );
}

// ─── Step component ───────────────────────────────────────────────────────────

export default function PreferencesStep({ onSelect, onSkip, onBack }) {
  const [selectedStyle, setSelectedStyle] = useState('Friendly');

  return (
    <PageShell>
      <ContextPanel
        icon="🖊️"
        heading="What is a Writing Style?"
        bullets={[
          'Each style sets two things: how you <strong>open</strong> the note (greeting) and how you <strong>close</strong> it (sign-off).',
          '<strong>Greeting examples:</strong> Hi, Hello, Hey, Dear',
          '<strong>Sign-off examples:</strong> Best, Sincerely, Thanks, Cheers, Warmly',
          'Each card shows you a live preview so you always know exactly what it will look like.',
          'You can create unlimited custom styles in Settings any time.',
        ]}
        note="This is your default. You can change the style for any individual card before it is sent."
      />

      <FormCard>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Choose your default writing style</h1>
          <p className="mt-1.5 text-sm text-gray-700 leading-snug">
            Your writing style sets how notes open and close. Pick the one that feels most natural. You can swap it any time, even per card.
          </p>
        </div>

        {/* 3-column style card grid */}
        <div className="grid grid-cols-3 gap-3">
          {STYLES.map((style) => (
            <StyleCard
              key={style.key}
              style={style}
              selected={selectedStyle === style.key}
              onSelect={setSelectedStyle}
            />
          ))}
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between mt-7 pt-5 border-t border-gray-200">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-lg bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1"
            style={{ border: '1.5px solid #d1d5db' }}
          >
            ← Back
          </button>
          <span className="text-xs text-gray-500">Step 4 of 5</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onSkip}
              className="px-5 py-2.5 rounded-lg bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              style={{ border: '1.5px solid #d1d5db' }}
            >
              Skip for Now
            </button>
            <button
              onClick={() => onSelect(selectedStyle)}
              className="px-8 py-2.5 bg-[#e07b39] text-white rounded-lg text-sm font-bold hover:bg-[#c96a2a] transition-colors shadow-sm"
            >
              Continue →
            </button>
          </div>
        </div>
      </FormCard>
    </PageShell>
  );
}