// ─────────────────────────────────────────────────────────────────────────────
// CustomMessageModal.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import PlaceholderSelector from '@/components/mailing/PlaceholderSelector';
import { sanitizeMessage } from './campaignWizardConfig';

export default function CustomMessageModal({
  open,
  onOpenChange,
  customMsgDraft,
  setCustomMsgDraft,
  includeGreeting,
  setIncludeGreeting,
  includeSignature,
  setIncludeSignature,
  onSave,
  textareaRef,
  onPlaceholderInsert,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Write a Custom Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            ref={textareaRef}
            value={customMsgDraft}
            onChange={e => setCustomMsgDraft(sanitizeMessage(e.target.value))}
            onPaste={e => {
              e.preventDefault();
              const pasted = e.clipboardData.getData('text');
              const sanitized = sanitizeMessage(pasted);
              const el = e.target;
              const start = el.selectionStart;
              const end = el.selectionEnd;
              const next =
                customMsgDraft.substring(0, start) +
                sanitized +
                customMsgDraft.substring(end);
              setCustomMsgDraft(next);
            }}
            placeholder={'Write your message here…\n\nUse placeholders like {{client.firstName}} for personalization.'}
            className="min-h-[200px] text-sm resize-none"
            rows={8}
          />

          {/* Placeholder selector */}
          <div className="flex items-center gap-4">
            <PlaceholderSelector onPlaceholderSelect={onPlaceholderInsert} />
            <span className="text-xs text-gray-400">
              Placeholders are replaced with real data when each card is sent
            </span>
          </div>

          {/* Include greeting / signature */}
          <div className="flex items-center gap-6 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Checkbox
                id="inc-greeting"
                checked={includeGreeting}
                onCheckedChange={setIncludeGreeting}
              />
              <Label htmlFor="inc-greeting" className="text-sm cursor-pointer font-normal">
                Include greeting
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="inc-signature"
                checked={includeSignature}
                onCheckedChange={setIncludeSignature}
              />
              <Label htmlFor="inc-signature" className="text-sm cursor-pointer font-normal">
                Include signature
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={!customMsgDraft.trim()}
            className="bg-brand-accent hover:bg-brand-accent/90 text-brand-accent-foreground"
          >
            Save Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}