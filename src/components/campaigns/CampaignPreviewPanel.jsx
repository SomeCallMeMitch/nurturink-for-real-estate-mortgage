// ─────────────────────────────────────────────────────────────────────────────
// CampaignPreviewPanel.jsx  — Column 3
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Info } from 'lucide-react';
import CardPreviewNew from '@/components/preview/CardPreviewNew';
import { SAMPLE_CLIENT } from './campaignWizardConfig';

export default function CampaignPreviewPanel({
  previewMessage,
  defaultNoteStyle,
  selectedDesign,
  user,
  organization,
  previewSettings,
  includeGreeting,
  includeSignature,
  selectedType,
  eligibleCount,
  estMonthly,
  estAnnual,
  steps,
}) {
  return (
    <div
      className="flex-shrink-0 overflow-y-auto"
      style={{ width: '480px', padding: '16px 24px' }}
    >
      <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
        Live preview — sample: {SAMPLE_CLIENT.firstName} {SAMPLE_CLIENT.lastName}
      </p>

      <div className="flex justify-center mb-4">
        {previewMessage && defaultNoteStyle ? (
          <CardPreviewNew
            message={previewMessage}
            client={SAMPLE_CLIENT}
            user={user}
            organization={organization}
            noteStyleProfile={defaultNoteStyle}
            selectedDesign={selectedDesign}
            previewSettings={previewSettings}
            includeGreeting={includeGreeting}
            includeSignature={includeSignature}
            randomIndentEnabled={true}
            showLineCounter={true}
          />
        ) : (
          <div
            className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-gray-50"
            style={{ width: '412px', height: '480px' }}
          >
            <div className="text-center px-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Info className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                {!selectedType
                  ? 'Select a campaign type to get started'
                  : !defaultNoteStyle
                  ? 'No writing styles loaded. Run seedNoteStyleProfiles from the Base44 dashboard.'
                  : previewMessage === ''
                  ? 'Select a message template to see the handwriting preview'
                  : 'Write a message to see the handwriting preview'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Credit estimate ───────────────────────────────────────────────── */}
      {selectedType && eligibleCount !== null && (
        <div className="p-4 rounded-xl border-2 border-border bg-gray-50">
          <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
            Estimated credit usage
          </p>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-2xl font-bold text-brand-accent leading-none">
                ~{estMonthly ?? '—'}
              </p>
              <p className="text-sm text-gray-500 mt-1">credits / month</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-accent leading-none">
                ~{estAnnual ?? '—'}
              </p>
              <p className="text-sm text-gray-500 mt-1">credits / year</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-snug">
            {eligibleCount} client{eligibleCount !== 1 ? 's' : ''} × {steps.length} card
            {steps.length > 1 ? 's' : ''}
            {organization?.creditBalance !== undefined
              ? ` · Balance: ${organization.creditBalance} credits`
              : ''}
          </p>
        </div>
      )}
    </div>
  );
}