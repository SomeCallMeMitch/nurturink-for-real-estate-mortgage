import React from 'react';

/**
 * RoofingFonts — loads Sora + Lato from Google Fonts
 * and sets base body styles for the Roofing landing page.
 */
export default function RoofingFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=Lato:wght@300;400;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .roofing-page { font-family: 'Lato', sans-serif; font-size: 17px; color: #2d3748; line-height: 1.55; }
        .roofing-page * { box-sizing: border-box; }
        .roofing-page .font-sora { font-family: 'Sora', sans-serif; }
        .roofing-page .font-lato { font-family: 'Lato', sans-serif; }
        .roofing-page input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; outline: none; cursor: pointer; border: none; padding: 0; }
        .roofing-page input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #f59e0b; cursor: pointer; box-shadow: 0 2px 8px rgba(245,158,11,0.45); transition: transform 0.15s; }
        .roofing-page input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .roofing-page input[type=range]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #f59e0b; cursor: pointer; box-shadow: 0 2px 8px rgba(245,158,11,0.45); border: none; }
      `}</style>
    </>
  );
}