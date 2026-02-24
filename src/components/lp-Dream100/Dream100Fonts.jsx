import React from 'react';

/**
 * Dream100Fonts — loads Sora from Google Fonts and sets
 * base body/page styles for the Dream 100 landing page.
 * Matches HTML spec: font-family Sora, base 16px, color #1A1A2E,
 * line-height 1.6, background #FAF8F4 (--cream)
 */
export default function Dream100Fonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        /* ─── CSS CUSTOM PROPERTIES ─────────────────────── */
        .d100-page {
          --d100-navy:        #1B2A4A;
          --d100-navy-light:  #243659;
          --d100-gold:        #C9973A;
          --d100-gold-light:  #E8B55A;
          --d100-cream:       #FAF8F4;
          --d100-cream-dark:  #F0EBE1;
          --d100-text:        #1A1A2E;
          --d100-text-muted:  #5A6278;
          --d100-white:       #FFFFFF;
          --d100-border:      #DDD5C5;
          --d100-success:     #2D6A4F;
          --d100-radius:      14px;
          --d100-shadow:      0 2px 16px rgba(27,42,74,0.09);
          --d100-shadow-lg:   0 8px 40px rgba(27,42,74,0.16);

          font-family: 'Sora', -apple-system, sans-serif;
          background: var(--d100-cream);
          color: var(--d100-text);
          line-height: 1.6;
          font-size: 16px;
          min-height: 100vh;
        }

        .d100-page * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

        /* ─── ANIMATIONS ──────────────────────────────── */
        @keyframes d100-fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes d100-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes d100-slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }

        /* ─── SCROLLBAR ───────────────────────────────── */
        .d100-prompt-text::-webkit-scrollbar { width: 4px; }
        .d100-prompt-text::-webkit-scrollbar-track { background: transparent; }
        .d100-prompt-text::-webkit-scrollbar-thumb {
          background: var(--d100-border);
          border-radius: 2px;
        }
      `}</style>
    </>
  );
}