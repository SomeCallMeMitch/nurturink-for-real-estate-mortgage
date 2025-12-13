import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import CardPreview from '@/components/preview/CardPreview';

// Mobile-specific preview settings - 25% smaller than desktop
const MOBILE_PREVIEW_SETTINGS = {
  fontSize: 16.5,
  lineHeight: 1,
  baseTextWidth: 270,
  baseMarginLeft: 30,
  shortCardMaxLines: 13,
  maxPreviewLines: 19,
  topHalfPaddingTop: 258.75,
  longCardTopPadding: 82.5,
  gapAboveFold: 10.5,
  gapBelowFold: 10.5,
  maxIndent: 12,
  indentAmplitude: 4.5,
  indentNoise: 1.5,
  indentFrequency: 0.35,
  frameWidth: 309,
  frameHeight: 450
};

// Sample client for preview
const SAMPLE_CLIENT = {
  firstName: "John",
  lastName: "Smith",
  fullName: "John Smith",
  company: "ABC Roofing",
  email: "john@abcroofing.com",
  phone: "(555) 123-4567",
  street: "123 Main Street",
  city: "Denver",
  state: "CO",
  zipCode: "80202"
};

/**
 * MobileQuickSendPreviewPanel Component
 * Mobile-optimized preview panel for Quick Send Template
 * 25% smaller than desktop version for better mobile fit
 * 
 * @param {Object} selectedTemplate - Selected Template object (for message content)
 * @param {Object} selectedNoteStyleProfile - Selected NoteStyleProfile object
 * @param {Object} selectedCardDesign - Selected CardDesign object
 * @param {Object} instanceSettings - Instance settings (not used, mobile has fixed settings)
 * @param {boolean} includeGreeting - Whether to show greeting
 * @param {boolean} includeSignature - Whether to show signature
 * @param {Object} user - Current user
 * @param {Object} organization - Current organization
 */
export default function MobileQuickSendPreviewPanel({
  selectedTemplate,
  selectedNoteStyleProfile,
  selectedCardDesign,
  instanceSettings,
  includeGreeting,
  includeSignature,
  user,
  organization
}) {
  const canShowPreview = selectedTemplate && selectedNoteStyleProfile && selectedCardDesign;

  // Use mobile-specific settings (ignore instanceSettings for consistent mobile experience)
  const previewSettings = MOBILE_PREVIEW_SETTINGS;

  return (
    <div>
      <div className="flex justify-center">
        {canShowPreview ? (
          <div className="w-full max-w-[309px]">
            <CardPreview
              message={selectedTemplate.content || ''}
              client={SAMPLE_CLIENT}
              user={user}
              organization={organization}
              noteStyleProfile={selectedNoteStyleProfile}
              selectedDesign={selectedCardDesign}
              previewSettings={previewSettings}
              includeGreeting={includeGreeting}
              includeSignature={includeSignature}
              randomIndentEnabled={true}
              showLineCounter={false}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Zap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">
              {!selectedTemplate 
                ? 'Select a template to see preview'
                : !selectedNoteStyleProfile
                ? 'Select a style to see preview'
                : 'Select a card design to see preview'}
            </p>
          </div>
        )}
      </div>

      {/* Preview Info */}
      {canShowPreview && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Preview uses sample data:</strong>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {SAMPLE_CLIENT.fullName} • {SAMPLE_CLIENT.company}
          </p>
        </div>
      )}
    </div>
  );
}

// Export SAMPLE_CLIENT for potential reuse
export { SAMPLE_CLIENT };