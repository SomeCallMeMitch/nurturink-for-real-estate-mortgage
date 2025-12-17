import React from 'react';

export default function PillDemo() {
  return (
    <div className="min-h-screen bg-[var(--surface-1)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[var(--text-0)]">Pill Visual Reference</h1>
        
        <div className="flex flex-col gap-6 p-6 bg-[var(--surface-0)] rounded-lg max-w-xl">
          
          {/* Section: Semantic Pills */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-[var(--text-1)]">
              Semantic Pills
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="pill bg-[var(--primary)] text-white">
                Primary
              </span>
              <span className="pill bg-[var(--success)] text-white">
                Success
              </span>
              <span className="pill bg-[var(--warning)] text-black">
                Warning
              </span>
              <span className="pill bg-[var(--danger)] text-white">
                Danger
              </span>
              <span className="pill bg-[var(--surface-muted)] text-[var(--text-0)]">
                Muted
              </span>
            </div>
          </div>

          {/* Section: Utility Pills */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-[var(--text-1)]">
              Utility Pills (Color 1–3)
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="pill bg-[var(--pill-color-1)] text-white">
                Color 1
              </span>
              <span className="pill bg-[var(--pill-color-2)] text-white">
                Color 2
              </span>
              <span className="pill bg-[var(--pill-color-3)] text-white">
                Color 3
              </span>
            </div>
          </div>

          {/* Section: Dense / Table Use */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-[var(--text-1)]">
              Dense / Table Context
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <span className="pill bg-[var(--pill-color-1)] text-white">
                Active
              </span>
              <span className="pill bg-[var(--pill-color-2)] text-white">
                Pending
              </span>
              <span className="pill bg-[var(--pill-color-3)] text-white">
                Archived
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}