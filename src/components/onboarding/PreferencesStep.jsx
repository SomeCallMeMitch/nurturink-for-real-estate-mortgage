import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, PenLine } from 'lucide-react';
import ContextPanel from './ContextPanel';

const styles = [
  { key: 'Friendly', name: 'Friendly', description: 'Warm and approachable.' },
  { key: 'Casual', name: 'Casual', description: 'Relaxed and informal.' },
  { key: 'Professional', name: 'Professional', description: 'Formal and business-like.' },
  { key: 'Grateful', name: 'Grateful', description: 'Expresses thanks and appreciation.' },
  { key: 'Direct', name: 'Direct', description: 'Clear and to the point.' },
];

const stylePreviews = {
  Friendly: { greeting: 'Hi [Client Name],', signature: 'Best,\n[Your Name]' },
  Casual: { greeting: 'Hey [Client Name],', signature: 'Cheers,\n[Your Name]' },
  Professional: { greeting: 'Dear [Client Name],', signature: 'Sincerely,\n[Your Full Name]\n[Your Title]' },
  Grateful: { greeting: 'Hi [Client Name],', signature: 'With gratitude,\n[Your Name]' },
  Direct: { greeting: '[Client Name],', signature: 'Regards,\n[Your Name]' },
};

/**
 * Phase 3: Added animated style preview transition on switch,
 * orange accent CTA, and visual polish.
 */
export default function PreferencesStep({ onSelect, onSkip, onBack }) {
  const [selectedStyle, setSelectedStyle] = useState('Friendly');

  return (
    <div className="flex gap-8 items-start">
      <ContextPanel
        icon={PenLine}
        heading="Writing style tips"
        bullets={[
          'Sets the default greeting & signature tone',
          'Applied automatically to new notes',
          'Create unlimited custom styles later',
        ]}
        note="Most users start with Friendly and adjust over time."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-1 max-w-lg mx-auto"
      >
        <Card className="shadow-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl">Set Your Writing Style</CardTitle>
            <CardDescription>Choose a default style for your notes. You can change this and create your own later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="writing-style">Default Style</Label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger id="writing-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map(style => (
                    <SelectItem key={style.key} value={style.key}>
                      <div className="flex flex-col">
                        <span className="font-semibold">{style.name}</span>
                        <span className="text-xs text-gray-500">{style.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phase 3: Animated style preview with cross-fade on switch */}
            <div className="space-y-2">
              <Label>Style Preview</Label>
              <div
                className="p-4 border rounded-lg text-sm text-gray-700 whitespace-pre-wrap font-serif min-h-[140px] relative overflow-hidden"
                style={{ backgroundColor: 'var(--onboarding-bg)', borderColor: 'var(--onboarding-border)' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedStyle}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span style={{ color: 'var(--onboarding-primary)' }}>
                      {stylePreviews[selectedStyle].greeting}
                    </span>
                    <br /><br />
                    <span className="text-gray-400 italic">...your message will go here...</span>
                    <br /><br />
                    <span style={{ color: 'var(--onboarding-primary)' }}>
                      {stylePreviews[selectedStyle].signature}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Phase 3: Orange accent footer */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              {onBack && (
                <Button variant="outline" onClick={onBack} className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              )}
              <Button variant="outline" className="flex-1" onClick={onSkip}>Skip for Now</Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => onSelect(selectedStyle)}
                style={{ backgroundColor: 'var(--onboarding-primary)', color: '#fff' }}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}