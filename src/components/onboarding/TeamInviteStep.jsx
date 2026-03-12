import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

// ─── Step component ───────────────────────────────────────────────────────────

let nextId = 2;

export default function TeamInviteStep({ onComplete, onSkip, onBack }) {
  const [inviteRows, setInviteRows] = useState([
    { id: 1, firstName: '', email: '', role: 'sales_rep' },
  ]);

  const updateRow = (id, field, value) => {
    setInviteRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const addRow = () => {
    setInviteRows((rows) => [
      ...rows,
      { id: nextId++, firstName: '', email: '', role: 'sales_rep' },
    ]);
  };

  const removeRow = (id) => {
    setInviteRows((rows) => rows.filter((r) => r.id !== id));
  };

  const handleComplete = () => {
    const validInvites = inviteRows
      .filter((r) => r.firstName.trim() && r.email.trim())
      .map(({ firstName, email, role }) => ({ firstName, email, role }));
    onComplete(validInvites);
  };

  const showRemove = inviteRows.length > 1;

  return (
    <PageShell>
      <ContextPanel
        icon="👥"
        heading="How team accounts work"
        bullets={[
          'Each person you invite gets their own login and sends cards from their own account.',
          '<strong>Admins</strong> can assign credits to team members and see how many cards each person has sent, great for tracking team performance.',
          '<strong>Team Members</strong> can send cards up to their assigned credit balance.',
          'Invited teammates receive an email with a link to set up their account.',
          'You can add or remove team members at any time from your Settings.',
        ]}
        note="This step is optional. Skip it now and invite your team any time from Settings."
      />

      <FormCard>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Invite your team</h1>
          <p className="mt-1.5 text-sm text-gray-700 leading-snug">
            Add team members and they will receive an email invite. As the account owner, you assign credits and track sends from your dashboard. You can add or remove team members any time.
          </p>
        </div>

        {/* Invite rows */}
        <div className="space-y-3 mb-4">
          {inviteRows.map((row) => (
            <div
              key={row.id}
              className="relative bg-gray-50 border border-gray-200 rounded-xl px-4 pt-4 pb-4"
            >
              {/* Remove button */}
              {showRemove && (
                <button
                  onClick={() => removeRow(row.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none p-0.5 transition-colors"
                  title="Remove"
                >
                  ✕
                </button>
              )}

              <div className="grid grid-cols-[1fr_1fr_160px] gap-3">
                <div>
                  <FieldLabel>First Name</FieldLabel>
                  <Input
                    value={row.firstName}
                    onChange={(e) => updateRow(row.id, 'firstName', e.target.value)}
                    placeholder="Alex"
                  />
                </div>
                <div>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    value={row.email}
                    onChange={(e) => updateRow(row.id, 'email', e.target.value)}
                    placeholder="alex@company.com"
                  />
                </div>
                <div>
                  <FieldLabel>Role</FieldLabel>
                  <Select
                    value={row.role}
                    onValueChange={(val) => updateRow(row.id, 'role', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales_rep">Team Member</SelectItem>
                      <SelectItem value="organization_owner">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add another row */}
        <button
          onClick={addRow}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-sm font-semibold text-gray-700 rounded-lg transition-colors hover:text-[#e07b39] hover:border-[#e07b39] mb-2"
          style={{ border: '1.5px dashed #d1d5db' }}
        >
          + Add another team member
        </button>

        {/* Nav */}
        <div className="flex items-center justify-between mt-7 pt-5 border-t border-gray-200">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-lg bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1"
            style={{ border: '1.5px solid #d1d5db' }}
          >
            ← Back
          </button>
          <span className="text-xs text-gray-500">Step 5 of 5</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onSkip}
              className="px-5 py-2.5 rounded-lg bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              style={{ border: '1.5px solid #d1d5db' }}
            >
              Skip for Now
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-2.5 bg-[#e07b39] text-white rounded-lg text-sm font-bold hover:bg-[#c96a2a] transition-colors shadow-sm"
            >
              Complete Setup &amp; Send Invites
            </button>
          </div>
        </div>
      </FormCard>
    </PageShell>
  );
}