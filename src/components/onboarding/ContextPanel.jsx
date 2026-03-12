import React from 'react';

/**
 * ContextPanel — Reusable left-column panel for onboarding steps.
 * Displays an icon, heading, bullet points, and an optional note.
 * Uses --onboarding-* CSS variables defined in globals.css.
 *
 * Props:
 *   icon       – Lucide React icon component
 *   heading    – Panel heading text
 *   bullets    – Array of strings or JSX elements for the bullet list
 *   note       – Optional italic note displayed at the bottom
 */
export default function ContextPanel({ icon: Icon, heading, bullets = [], note }) {
  return (
    <aside className="hidden lg:block w-80 flex-shrink-0">
      <div
        className="rounded-2xl p-6 sticky top-20 border-2"
        style={{
          backgroundColor: 'var(--onboarding-bg)',
          borderColor: 'var(--onboarding-border)',
        }}
      >
        {/* Icon */}
        {Icon && (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'rgba(224, 123, 57, 0.1)' }}
          >
            <Icon className="w-5 h-5" style={{ color: 'var(--onboarding-primary)' }} />
          </div>
        )}

        {/* Heading */}
        <h3
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--onboarding-primary)' }}
        >
          {heading}
        </h3>

        {/* Bullet list */}
        {bullets.length > 0 && (
          <ul className="space-y-3">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                <span
                  className="mt-0.5 flex-shrink-0 font-bold"
                  style={{ color: 'var(--onboarding-primary)' }}
                >
                  &#10003;
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Optional note */}
        {note && (
          <p
            className="mt-5 text-xs italic leading-relaxed"
            style={{ color: 'var(--onboarding-primary)', opacity: 0.7 }}
          >
            {note}
          </p>
        )}
      </div>
    </aside>
  );
}