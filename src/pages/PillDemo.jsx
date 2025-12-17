import React from 'react';

export default function PillDemo() {
  return (
    <div className="min-h-screen bg-[var(--surface-1)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[var(--text-0)]">Pill Component Demo</h1>
        
        <div className="space-y-8">
          {/* Status Pills */}
          <div className="bg-[var(--surface-0)] p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-0)]">Status Pills</h2>
            <div className="flex flex-wrap gap-3">
              <span className="pill pill-primary">Primary</span>
              <span className="pill pill-muted">Muted</span>
              <span className="pill pill-success">Success</span>
              <span className="pill pill-warning">Warning</span>
              <span className="pill pill-danger">Danger</span>
            </div>
          </div>

          {/* Color Pills */}
          <div className="bg-[var(--surface-0)] p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-0)]">Color Variations</h2>
            <div className="flex flex-wrap gap-3">
              <span className="pill pill-color-1">Color 1</span>
              <span className="pill pill-color-2">Color 2</span>
              <span className="pill pill-color-3">Color 3</span>
            </div>
          </div>

          {/* Usage Example */}
          <div className="bg-[var(--surface-0)] p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text-0)]">Usage Examples</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-1)]">User Status:</span>
                <span className="pill pill-success">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-1)]">Priority:</span>
                <span className="pill pill-danger">High</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-1)]">Category:</span>
                <span className="pill pill-color-2">Design</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline CSS for pills */}
      <style>{`
        .pill {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .pill-primary {
          background-color: var(--brand-primary, #0477d1);
          color: white;
        }

        .pill-muted {
          background-color: var(--surface-1, #eeeeee);
          color: var(--text-1, #787878);
        }

        .pill-success {
          background-color: var(--success-bg, #d1fae5);
          color: var(--success, #10b981);
        }

        .pill-warning {
          background-color: var(--warning-bg, #fef3c7);
          color: var(--warning, #f59e0b);
        }

        .pill-danger {
          background-color: var(--danger-bg, #fee2e2);
          color: var(--danger, #ef4444);
        }

        .pill-color-1 {
          background-color: #e0e7ff;
          color: #4f46e5;
        }

        .pill-color-2 {
          background-color: #fce7f3;
          color: #ec4899;
        }

        .pill-color-3 {
          background-color: #dbeafe;
          color: #3b82f6;
        }
      `}</style>
    </div>
  );
}