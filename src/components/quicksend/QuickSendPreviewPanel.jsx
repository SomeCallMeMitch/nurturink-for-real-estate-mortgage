import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import CardPreview from '@/components/preview/CardPreview';

// Default preview settings fallback
const DEFAULT_PREVIEW_SETTINGS = {
  fontSize: 22,
  lineHeight: 1,
  baseTextWidth: 360,
  baseMarginLeft: 40,
  shortCardMaxLines: 13,
  maxPreviewLines: 19,
  topHalfPaddingTop: 345,
  longCardTopPadding: 110,
  gapAboveFold: 14,
  gapBelowFold: 14,
  maxIndent: 16,
  indentAmplitude: 6,
  indentNoise: 2,
  indentFrequency: 0.35,
  frameWidth: 412,
  frameHeight: 600
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
 * QuickSendPreviewPanel Component
 * Live preview panel for Quick Send Template editing
 * Reuses CardPreview component with robust settings fallback
 * 
 * @param {Object} selectedTemplate - Selected Template object (for message content)
 * @param {Object} selectedNoteStyleProfile - Selected NoteStyleProfile object
 * @param {Object} selectedCardDesign - Selected CardDesign object
 * @param {Object} instanceSettings - Instance settings with cardPreviewSettings
 * @param {boolean} includeGreeting - Whether to show greeting
 * @param {boolean} includeSignature - Whether to show signature
 * @param {Object} user - Current user
 * @param {Object} organization - Current organization
 */
export default function QuickSendPreviewPanel({
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

  // Ensure cardPreviewSettings always has all required properties
  const previewSettings = {
    ...DEFAULT_PREVIEW_SETTINGS,
    ...(instanceSettings?.cardPreviewSettings || {})
  };

  return (
    <Card className="sticky top-6">
      <CardContent className="pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Live Preview</h3>
        
        <div className="flex justify-center">
          {canShowPreview ? (
            <div className="w-full max-w-[400px]">
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
                showLineCounter={true}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm">
                {!selectedTemplate 
                  ? 'Select a message template to see preview'
                  : !selectedNoteStyleProfile
                  ? 'Select a writing style to see preview'
                  : 'Select a card design to see preview'}
              </p>
            </div>
          )}
        </div>

        {/* Preview Info */}
        {canShowPreview && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Preview uses sample data:</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Client: {SAMPLE_CLIENT.fullName} • {SAMPLE_CLIENT.company}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export SAMPLE_CLIENT for potential reuse
export { SAMPLE_CLIENT };