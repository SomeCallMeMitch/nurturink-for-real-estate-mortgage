import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

// ─── Shared layout pieces ────────────────────────────────────────────────────

function PageShell({ children }) {
  return (
    <div className="flex gap-7 items-start max-w-6xl mx-auto px-8 py-8">
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

function FormNav({ onBack, stepLabel, onContinue }) {
  return (
    <div className="flex items-center justify-between mt-7 pt-5 border-t border-gray-200">
      <button
        onClick={onBack}
        className="px-5 py-2.5 rounded-lg bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1"
        style={{ border: '1.5px solid #d1d5db' }}
      >
        ← Back
      </button>
      <span className="text-xs text-gray-500">{stepLabel}</span>
      <button
        onClick={onContinue}
        className="px-8 py-2.5 bg-[#e07b39] text-white rounded-lg text-sm font-bold hover:bg-[#c96a2a] transition-colors shadow-sm"
      >
        Continue →
      </button>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

// ─── Address fields ───────────────────────────────────────────────────────────

function AddressFields({ streetId, cityId, stateId, zipId, data, onUpdate, streetPlaceholder }) {
  const handleChange = (e) => {
    onUpdate({ [e.target.id]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Street Address</FieldLabel>
        <Input
          id={streetId}
          value={data[streetId] || ''}
          onChange={handleChange}
          placeholder={streetPlaceholder || '123 Main St (add Suite or Apt number at the end if needed)'}
        />
      </div>
      <div className="grid grid-cols-[1fr_100px_100px] gap-3">
        <div>
          <FieldLabel>City</FieldLabel>
          <Input id={cityId} value={data[cityId] || ''} onChange={handleChange} placeholder="City" />
        </div>
        <div>
          <FieldLabel>State</FieldLabel>
          <Select
            value={data[stateId] || ''}
            onValueChange={(val) => onUpdate({ [stateId]: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FieldLabel>ZIP</FieldLabel>
          <Input
            id={zipId}
            value={data[zipId] || ''}
            onChange={handleChange}
            placeholder="94590"
            maxLength={5}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step component ───────────────────────────────────────────────────────────

export default function AddressStep({ data, onUpdate, onComplete, onBack }) {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <PageShell>
      <ContextPanel
        icon="✉️"
        heading="How return addresses work"
        bullets={[
          'Before each card is sent, you choose which return address to print on the envelope, <strong>or none at all.</strong>',
          'Many users keep both: a personal one for warm outreach and a company one for branded business cards.',
          'You can pick a different return address for every single card. There is no permanent choice here.',
          'If your address has a suite or apartment number, add it to the end of the street address line (e.g. <em>123 Main St Suite 4B</em>).',
        ]}
        note="Both addresses are optional, but entering both now gives you the most flexibility when sending cards."
      />

      <FormCard>
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Set your return addresses</h1>
          <p className="mt-1.5 text-sm text-gray-700 leading-snug">
            When a card is ready to send, you choose which return address appears on the envelope, or none at all. Enter both for maximum flexibility.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2.5 text-sm font-semibold transition-all rounded-t-md -mb-0.5 ${
              activeTab === 'personal'
                ? 'text-[#e07b39] border-b-2 border-[#e07b39]'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Personal Address
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`px-4 py-2.5 text-sm font-semibold transition-all rounded-t-md -mb-0.5 ${
              activeTab === 'company'
                ? 'text-[#e07b39] border-b-2 border-[#e07b39]'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Company Address
          </button>
        </div>

        {/* Personal tab */}
        {activeTab === 'personal' && (
          <AddressFields
            streetId="personalStreet"
            cityId="personalCity"
            stateId="personalState"
            zipId="personalZipCode"
            data={data}
            onUpdate={onUpdate}
            streetPlaceholder="123 Main St (add Suite or Apt number at the end if needed)"
          />
        )}

        {/* Company tab */}
        {activeTab === 'company' && (
          <AddressFields
            streetId="companyStreet"
            cityId="companyCity"
            stateId="companyState"
            zipId="companyZipCode"
            data={data}
            onUpdate={onUpdate}
            streetPlaceholder="456 Business Blvd (add Suite or Apt number at the end if needed)"
          />
        )}

        <FormNav
          onBack={onBack}
          stepLabel="Step 3 of 5"
          onContinue={onComplete}
        />
      </FormCard>
    </PageShell>
  );
}