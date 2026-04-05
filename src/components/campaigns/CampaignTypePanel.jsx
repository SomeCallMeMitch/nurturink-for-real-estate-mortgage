// ─────────────────────────────────────────────────────────────────────────────
// CampaignTypePanel.jsx  — Column 1
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip';
import { getIcon, getTypeColor } from './campaignWizardConfig';

export default function CampaignTypePanel({
  campaignTypes,
  selectedTypeSlug,
  onTypeSelect,
  enrollmentMode,
  setEnrollmentMode,
  returnAddressMode,
  setReturnAddressMode,
  companyTip,
  repTip,
  selectedType,
  needsNewField,
  eligibleCount,
  loadingCount,
  estAnnual,
  organization,
  steps,
}) {
  return (
    <div
      className="border-r border-border overflow-y-auto flex-shrink-0"
      style={{ width: '420px', padding: '16px 20px' }}
    >
      {/* ── Campaign type ─────────────────────────────────────────────────── */}
      <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
        Campaign type
      </p>

      {campaignTypes.length === 0 ? (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800 leading-snug">
            No campaign types found. Run{' '}
            <code className="font-mono text-xs">seedCampaignTypes</code> from the
            Base44 dashboard.
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-5">
          {campaignTypes.map(ct => {
            const Icon = getIcon(ct.icon);
            const isActive = selectedTypeSlug === ct.slug;
            const { hex, bg } = getTypeColor(ct.slug);
            return (
              <button
                key={ct.id}
                onClick={() => onTypeSelect(ct.slug)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all text-left ${
                  isActive
                    ? 'border-brand-accent shadow-sm'
                    : 'border-border hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={isActive ? { background: bg } : {}}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: hex }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground leading-tight">
                    {ct.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-snug truncate">
                    {ct.description ||
                      (ct.triggerMode === 'one_time' ? 'One-time send' : 'Annual recurring')}
                  </div>
                </div>
                {isActive && (
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: hex }} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedType && needsNewField && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800 leading-snug">
            Requires{' '}
            <code className="font-mono text-xs">{selectedType.triggerField}</code> on
            client records
          </p>
        </div>
      )}

      <div className="border-t border-border my-4" />

      {/* ── Enrollment mode ───────────────────────────────────────────────── */}
      <p className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
        Enrollment mode
      </p>
      <div className="flex rounded-xl border-2 border-border overflow-hidden mb-2">
        {[
          { val: 'opt_out', label: 'Auto-enroll' },
          { val: 'opt_in',  label: 'Manual only' },
        ].map(({ val, label }) => (
          <button
            key={val}
            className="flex-1 py-2.5 text-sm text-center font-semibold transition-colors"
            style={enrollmentMode === val
              ? { background: '#E86C2C', color: '#ffffff' }
              : { color: '#6b7280' }}
            onClick={() => setEnrollmentMode(val)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-600 mb-5 leading-snug">
        {enrollmentMode === 'opt_out'
          ? 'Every eligible client is enrolled automatically when this campaign activates. You can exclude individuals at any time.'
          : 'No clients are enrolled until you add them manually from the Clients page.'}
      </p>

      <div className="border-t border-border my-4" />

      {/* ── Return address ────────────────────────────────────────────────── */}
      <p className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
        Return address
      </p>
      <div className="flex gap-2 flex-wrap mb-5">
        {[
          { key: 'company', label: 'Company', tip: companyTip },
          { key: 'rep',     label: 'Rep',     tip: repTip },
          { key: 'none',    label: 'None',    tip: 'No return address\nprinted on envelope' },
        ].map(({ key, label, tip }) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setReturnAddressMode(key)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                  returnAddressMode === key
                    ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                    : 'border-border text-foreground hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="whitespace-pre-line text-sm max-w-[220px] p-3"
            >
              {tip}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* ── Estimated reach ───────────────────────────────────────────────── */}
      {selectedType && (
        <>
          <div className="border-t border-border my-4" />
          <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
            Estimated reach
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: loadingCount ? '…' : (eligibleCount ?? '—'), lbl: 'clients'   },
              { val: estAnnual !== null ? `~${estAnnual}` : '—',   lbl: 'cards/yr' },
              { val: organization?.creditBalance ?? '—',            lbl: 'balance'  },
            ].map(({ val, lbl }) => (
              <div key={lbl} className="rounded-lg bg-gray-100 px-2 py-3 text-center">
                <div className="text-lg font-bold text-brand-accent leading-none">{val}</div>
                <div className="text-xs text-gray-500 mt-1">{lbl}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}