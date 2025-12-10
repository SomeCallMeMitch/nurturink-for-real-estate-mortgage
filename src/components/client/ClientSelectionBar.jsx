import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';

/**
 * ClientSelectionBar Component
 * Floating action bar that appears when clients are selected
 * Includes both "Continue to Content" (standard workflow) and "Quick Send" options
 * 
 * @param {number} selectedCount - Number of selected clients
 * @param {boolean} initializing - Whether standard workflow is initializing
 * @param {Function} onContinue - Continue to standard workflow (CreateContent)
 * @param {Function} onQuickSend - Open Quick Send template picker
 */
export default function ClientSelectionBar({
  selectedCount,
  initializing = false,
  onContinue,
  onQuickSend
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 text-white rounded-full px-6 py-3 shadow-xl flex items-center gap-6">
        {/* Selected Count */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-sm">
            {selectedCount}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Client{selectedCount !== 1 ? 's' : ''} Selected</span>
            <span className="text-xs text-gray-400">Ready for next step</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-gray-700" />

        {/* Quick Send Button */}
        <Button
          onClick={onQuickSend}
          disabled={initializing}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-5 gap-2"
        >
          <Zap className="w-4 h-4" />
          Quick Send
        </Button>

        {/* Continue to Content Button */}
        <Button
          onClick={onContinue}
          disabled={initializing}
          variant="secondary"
          className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-5"
        >
          {initializing ? 'Initializing...' : 'Custom Message'}
          {!initializing && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}