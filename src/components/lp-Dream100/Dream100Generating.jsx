import React from 'react';

/**
 * Dream100Generating — spinner card shown while prompts are "building"
 * Matches HTML #generating-card: white card, gold spinner, centered text
 */
export default function Dream100Generating() {
  return (
    <div style={{
      maxWidth: 600, margin: '28px auto 80px', padding: '0 18px',
    }}>
      <div style={{
        background: 'var(--d100-white)',
        borderRadius: 'var(--d100-radius)',
        border: '1px solid var(--d100-border)',
        padding: '48px 20px',
        textAlign: 'center',
        boxShadow: 'var(--d100-shadow)',
        animation: 'd100-fadeUp 0.25s ease both',
      }}>
        {/* Spinner */}
        <div style={{
          width: 44, height: 44,
          border: '3px solid var(--d100-cream-dark)',
          borderTopColor: 'var(--d100-gold)',
          borderRadius: '50%',
          animation: 'd100-spin 0.8s linear infinite',
          margin: '0 auto 20px',
        }} />
        <h3 style={{
          fontSize: 19, fontWeight: 700,
          color: 'var(--d100-navy)', marginBottom: 8,
        }}>Building Your Blueprint...</h3>
        <p style={{
          fontSize: 15, color: 'var(--d100-text-muted)', lineHeight: 1.5,
        }}>
          Assembling 7 personalized prompts<br />for your market. Just a moment.
        </p>
      </div>
    </div>
  );
}