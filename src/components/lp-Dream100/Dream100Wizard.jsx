import React, { useState } from 'react';
import Dream100Step1 from './Dream100Step1';
import Dream100Step2 from './Dream100Step2';
import Dream100Step3 from './Dream100Step3';
import Dream100Step4 from './Dream100Step4';

/**
 * Dream100Wizard — orchestrates the 4-step form wizard.
 * Manages step navigation, data collection, and step-bar progress indicator.
 * On completion, calls onComplete(formData) to hand off to parent.
 */
export default function Dream100Wizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    niche: '', nicheBase: '', customNiche: '',
    geo: '', client: '', challenge: '',
    name: '', years: '', llm: 'ChatGPT',
  });

  // Patch formData then advance step
  const advance = (patch) => {
    const updated = { ...formData, ...patch };
    setFormData(updated);
    if (step < 4) {
      setStep(step + 1);
      scrollToTop();
    }
  };

  const back = () => {
    setStep(s => Math.max(1, s - 1));
    scrollToTop();
  };

  const scrollToTop = () => {
    setTimeout(() => {
      const el = document.getElementById('d100-wizard-top');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleGenerate = (patch) => {
    const final = { ...formData, ...patch };
    setFormData(final);
    onComplete(final);
  };

  const stepLabels = ['', 'Choose Your Niche', 'Your Market', 'Your Info', 'Review & Generate'];

  return (
    <div id="d100-wizard-top" style={{ padding: '0 0 80px' }}>
      {/* Step progress bar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '10px 20px', gap: 0,
        background: 'var(--d100-navy)',
      }}>
        {[1, 2, 3, 4].map((pip, idx) => (
          <React.Fragment key={pip}>
            {/* Pip */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: '50%',
              fontSize: 12, fontWeight: 700,
              background: pip < step ? 'rgba(201,151,58,0.25)'
                        : pip === step ? 'var(--d100-gold)' : 'rgba(255,255,255,0.12)',
              color: pip < step ? 'var(--d100-gold-light)'
                   : pip === step ? 'var(--d100-navy)' : 'rgba(255,255,255,0.45)',
              border: pip < step ? '1.5px solid rgba(201,151,58,0.4)'
                    : pip === step ? '1.5px solid var(--d100-gold)' : '1.5px solid rgba(255,255,255,0.15)',
              transition: 'all 0.3s',
              flexShrink: 0, position: 'relative', zIndex: 1,
            }}>
              {pip < step ? '✓' : pip}
            </div>
            {/* Connector (not after last) */}
            {idx < 3 && (
              <div style={{
                flex: 1, height: 2,
                background: pip < step ? 'rgba(201,151,58,0.4)' : 'rgba(255,255,255,0.12)',
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        ))}
        {/* Step label */}
        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,0.5)',
          marginLeft: 12, whiteSpace: 'nowrap', fontWeight: 500,
        }}>
          <strong style={{ color: 'var(--d100-gold-light)' }}>Step {step} of 4</strong> — {stepLabels[step]}
        </div>
      </div>

      {/* Step content */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '28px 18px 0' }}>
        {step === 1 && <Dream100Step1 formData={formData} onNext={advance} />}
        {step === 2 && <Dream100Step2 formData={formData} onNext={advance} onBack={back} />}
        {step === 3 && <Dream100Step3 formData={formData} onNext={advance} onBack={back} />}
        {step === 4 && <Dream100Step4 formData={formData} onGenerate={handleGenerate} onBack={back} />}
      </div>

      {/* Responsive padding */}
      <style>{`
        @media (min-width: 600px) {
          #d100-wizard-top .d100-wizard-inner { padding: 36px 24px 0 !important; }
        }
      `}</style>
    </div>
  );
}