import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * EditModeSelector Component
 * Dropdown for switching between bulk editing (all recipients) and individual recipient editing
 * 
 * @param {string} mode - Current mode: 'bulk' or 'individual'
 * @param {string} selectedRecipientId - ID of selected recipient (if in individual mode)
 * @param {Array} recipients - Array of recipient objects with {id, name}
 * @param {Function} onModeChange - Callback when mode changes: (mode, recipientId) => void
 */
export default function EditModeSelector({ mode, selectedRecipientId, recipients, onModeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Handle escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Get display text for current selection
  const getDisplayText = () => {
    if (mode === 'bulk') {
      return 'Apply to All Recipients';
    }
    
    const recipient = recipients.find(r => r.id === selectedRecipientId);
    return recipient ? recipient.name : 'Select Recipient';
  };

  // Handle selection
  const handleSelect = (newMode, recipientId = null) => {
    onModeChange(newMode, recipientId);
    setIsOpen(false);
  };

  // Sort recipients alphabetically
  const sortedRecipients = [...recipients].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <div className="flex items-center gap-3" ref={dropdownRef}>
      {/* Label */}
      <span className="text-sm font-medium text-brand-accent">
        Changes Apply To
      </span>

      {/* Dropdown Container */}
      <div className="relative min-w-[200px]">
        {/* Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-[14px] py-[10px] pr-[36px] text-sm font-medium text-foreground bg-card rounded-md border-2 transition-colors ${
            isOpen 
              ? 'border-brand-accent' 
              : 'border-border hover:border-muted-foreground'
          }`}
        >
          <span>{getDisplayText()}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div 
            className="absolute top-[calc(100%+4px)] left-0 right-0 bg-card border-2 border-brand-accent rounded-md shadow-lg overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200"
            style={{ maxHeight: '320px', overflowY: 'auto' }}
          >
            {/* Bulk Option */}
            <button
              onClick={() => handleSelect('bulk')}
              className={`w-full px-4 py-3 text-left text-sm font-semibold text-brand-accent hover:bg-muted transition-colors border-b-2 border-border ${
                mode === 'bulk' ? 'bg-muted' : ''
              }`}
            >
              Apply to All Recipients
            </button>

            {/* Visual Separator */}
            <div className="h-2 bg-muted border-t border-b border-border" />

            {/* Individual Recipients */}
            {sortedRecipients.map((recipient, index) => (
              <button
                key={recipient.id}
                onClick={() => handleSelect('individual', recipient.id)}
                className={`w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted transition-colors ${
                  mode === 'individual' && selectedRecipientId === recipient.id 
                    ? 'bg-muted text-brand-accent font-semibold' 
                    : 'font-normal'
                } ${
                  index < sortedRecipients.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                {recipient.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}