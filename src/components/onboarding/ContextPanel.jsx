import React from 'react';

/**
 * ContextPanel — Reusable left-column panel for onboarding steps.
 * Displays an icon, heading, bullet points, and an optional note.
 * Props:
 *   icon       – Lucide React icon component
 *   heading    – Panel heading text
 *   bullets    – Array of strings or JSX elements for the bullet list
 *   note       – Optional italic note displayed at the bottom
 */
export default function ContextPanel({ icon: Icon, heading, bullets = [], note }) {
  return (
    <aside className="hidden lg:block w-80 flex-shrink-0">
      <div className="bg-onboarding-bg border-2 border-onboarding-border rounded-2xl p-6 sticky top-20">
        {/* Icon */}
        {Icon && (
          <div className="w-10 h-10 rounded-full bg-onboarding-primary/10 flex items-center justify-center mb-4">
            <Icon className="w-5 h-5 text-onboarding-primary" />
          </div>
        )}

        {/* Heading */}
        <h3 className="text-base font-semibold text-onboarding-primary mb-4">
          {heading}
        </h3>

        {/* Bullet list */}
        {bullets.length > 0 && (
          <ul className="space-y-3">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                <span className="text-onboarding-primary mt-0.5 flex-shrink-0">&#10003;</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Optional note */}
        {note && (
          <p className="mt-5 text-xs text-onboarding-primary/70 italic leading-relaxed">
            {note}
          </p>
        )}
      </div>
    </aside>
  );
}