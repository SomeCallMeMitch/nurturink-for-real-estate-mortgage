// ─────────────────────────────────────────────────────────────────────────────
// CardEnlargeModal.jsx
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export default function CardEnlargeModal({
  open,
  onOpenChange,
  selectedDesign,
  cardEnlargeFace,
  setCardEnlargeFace,
  enlargeUrl,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{selectedDesign?.name || 'Card Preview'}</DialogTitle>
        </DialogHeader>

        {/* Front / Back segmented control */}
        <div className="flex rounded-xl border-2 border-border overflow-hidden w-36 mb-4">
          {['front', 'back'].map(face => (
            <button
              key={face}
              className="flex-1 py-2 text-sm font-semibold capitalize transition-colors"
              style={cardEnlargeFace === face
                ? { background: '#E86C2C', color: '#ffffff' }
                : { color: '#6b7280' }}
              onClick={() => setCardEnlargeFace(face)}
            >
              {face}
            </button>
          ))}
        </div>

        <div
          className="w-full rounded-xl overflow-hidden border-2 border-border"
          style={{ aspectRatio: '11/8' }}
        >
          {enlargeUrl ? (
            <img
              src={enlargeUrl}
              alt={`${selectedDesign?.name} ${cardEnlargeFace}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <p className="text-sm text-gray-400">
                No {cardEnlargeFace} image available
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          5.5&Prime; × 4&Prime; physical card · Handwritten inside by our robots
        </p>
      </DialogContent>
    </Dialog>
  );
}