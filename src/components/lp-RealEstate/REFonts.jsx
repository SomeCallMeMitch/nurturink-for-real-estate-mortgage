import React from 'react';

/**
 * REFonts — loads Sora + Inter from Google Fonts
 * and sets base body styles for the Real Estate landing page.
 * Phase 2: Changed from Lato to Inter, accent from orange/amber to blue
 */
export default function REFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .real-estate-page { font-family: 'Inter', sans-serif; font-size: 17px; color: #2d3748; line-height: 1.55; }
        .real-estate-page * { box-sizing: border-box; }
        .real-estate-page .font-sora { font-family: 'Sora', sans-serif; }
        .real-estate-page .font-inter { font-family: 'Inter', sans-serif; }
        .real-estate-page input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; outline: none; cursor: pointer; border: none; padding: 0; }
        .real-estate-page input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #007bff; cursor: pointer; box-shadow: 0 2px 8px rgba(0,123,255,0.4); transition: transform 0.15s; }
        .real-estate-page input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .real-estate-page input[type=range]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #007bff; cursor: pointer; box-shadow: 0 2px 8px rgba(0,123,255,0.4); border: none; }
      `}</style>
    </>
  );
}