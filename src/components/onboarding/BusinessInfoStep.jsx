import React from 'react';
import { Input } from '@/components/ui/input';

// ─── Shared layout pieces ────────────────────────────────────────────────────

function PageShell({ children }) {
  return (
    <div className="flex gap-7 items-start max-w-5xl mx-auto px-8 py-8">
      {children}
    </div>
  );
}

function ContextPanel({ icon, heading, bullets, note }) {
  return (
    <div className="w-72 flex-shrink-0 bg-[#fff8f3] border-2 border-[#f5c9a0] rounded-2xl p-7 sticky top-16 self-start">
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

function FormNav({ onBack, stepLabel, onContinue, continueDisabled, continueLabel = 'Continue →' }) {
  return (
    <div className="flex items-center justify-between mt-7 pt-5 border-t border-gray-200">
      <button
        onClick={onBack}
        className="px-5 py-2.5 border-1.5 border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1"
        style={{ border: '1.5px solid #d1d5db' }}
      >
        ← Back
      </button>
      <span className="text-xs text-gray-500">{stepLabel}</span>
      <button
        onClick={onContinue}
        disabled={continueDisabled}
        className="px-8 py-2.5 bg-[#e07b39] text-white rounded-lg text-sm font-bold hover:bg-[#c96a2a] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {continueLabel}
      </button>
    </div>
  );
}

function FieldLabel({ children, optional }) {
  return (
    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
      {children}
      {optional && <span className="ml-1.5 text-xs font-normal normal-case tracking-normal text-gray-500 italic">optional</span>}
    </label>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-gray-700 pt-3 border-t border-gray-200 mt-1">
      {label}
    </div>
  );
}

// ─── Step component ───────────────────────────────────────────────────────────

export default function BusinessInfoStep({ data, onUpdate, onComplete, onBack }) {
  const handleChange = (e) => {
    onUpdate({ [e.target.id]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    onUpdate({ phone: e.target.value });
  };

  const isFormValid = () => {
    if (!data.fullName || !data.firstName || !data.lastName || !data.jobTitle || !data.phone) return false;
    return true;
  };

  return (
    <PageShell>
      <ContextPanel
        icon="✍️"
        heading="Write it like you'd say it"
        bullets={[
          '<strong>Website:</strong> Write <em>YourSite.com</em>, not https://www.yoursite.com',
          '<strong>Phone:</strong> Write it how you\'d jot it on a card: <em>555.867.5309</em> or <em>555-867-5309</em>. Skip the parentheses.',
          '<strong>Name and Title:</strong> This appears as your card sign-off, so write it exactly as you\'d sign your name.',
          '<strong>Full Name</strong> lets you control how your complete name looks when written out. It may differ from First plus Last combined.',
        ]}
        note="These fields will be written by an actual ink pen on your note cards. Think notecard, not web form."
      />

      <FormCard>
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Tell us about your business</h1>
          <p className="mt-1.5 text-sm text-gray-700 leading-snug">
            This information will appear as placeholders in your note card signatures, written exactly as you enter it here.
          </p>
        </div>

        {/* Form grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">

          {/* Row 1: First / Last */}
          <div>
            <FieldLabel>First Name</FieldLabel>
            <Input id="firstName" value={data.firstName || ''} onChange={handleChange} placeholder="Robin" />
          </div>
          <div>
            <FieldLabel>Last Name</FieldLabel>
            <Input id="lastName" value={data.lastName || ''} onChange={handleChange} placeholder="Mock" />
          </div>

          {/* Row 2: Full Name with side hint */}
          <div>
            <FieldLabel>Full Name</FieldLabel>
            <Input
              id="fullName"
              value={data.fullName || ''}
              onChange={handleChange}
              placeholder="Robin Mock  /  R. Mock  /  Robin A. Mock"
            />
          </div>
          <div className="flex items-center">
            <p className="text-xs text-gray-600 leading-relaxed">
              This may differ from First + Last combined.<br />
              Customize it exactly as you'd sign off.
            </p>
          </div>

          {/* Row 3: Job Title / Phone */}
          <div>
            <FieldLabel optional>Job Title</FieldLabel>
            <Input id="jobTitle" value={data.jobTitle || ''} onChange={handleChange} placeholder="Sales Director" />
          </div>
          <div>
            <FieldLabel optional>Phone <span className="text-xs font-normal normal-case tracking-normal italic">— dots or dashes, skip parentheses</span></FieldLabel>
            <Input id="phone" value={data.phone || ''} onChange={handlePhoneChange} placeholder="555.867.5309" />
          </div>

          {/* Section divider */}
          <SectionDivider label="Your Organization" />

          {/* Row 4: Company Name / Org Email */}
          <div>
            <FieldLabel optional>Name</FieldLabel>
            <Input id="companyName" value={data.companyName || ''} onChange={handleChange} placeholder="Acme Sales Co." />
          </div>
          <div>
            <FieldLabel optional>Email</FieldLabel>
            <Input id="organizationEmail" type="email" value={data.organizationEmail || ''} onChange={handleChange} placeholder="hello@company.com" />
          </div>

          {/* Row 5: Website with side hint */}
          <div>
            <FieldLabel optional>Website</FieldLabel>
            <Input id="website" value={data.website || ''} onChange={handleChange} placeholder="YourSite.com" />
          </div>
          <div className="flex items-center">
            <p className="text-xs text-gray-600">Just the domain — no https:// needed</p>
          </div>

        </div>

        <FormNav
          onBack={onBack}
          stepLabel="Step 2 of 5"
          onContinue={onComplete}
          continueDisabled={!isFormValid()}
        />
      </FormCard>
    </PageShell>
  );
}