import React from 'react';

export default function EcommerceFonts() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800;900&family=Lato:wght@300;400;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .ec-page {
          font-family: 'Lato', sans-serif;
          font-size: 17px;
          line-height: 1.36;
          color: #2d3748;
          background: #ffffff;
        }
        .ec-page *, .ec-page *::before, .ec-page *::after {
          box-sizing: border-box;
        }
        .ec-page h1, .ec-page h2, .ec-page h3, .ec-page h4 {
          font-family: 'Sora', sans-serif;
          color: inherit;
          margin: 0;
          padding: 0;
        }
        .ec-page p { line-height: 1.36; margin: 0; }
        .ec-page p + p { margin-top: 9px; }
        /* Override globals that conflict */
        .ec-page input, .ec-page textarea, .ec-page select {
          background: #ffffff;
          border: 1.5px solid #dde1e7;
          border-radius: 4px;
          font-size: 17px;
          font-family: 'Lato', sans-serif;
          color: #2d3748;
          padding: 11px 12px;
          width: 100%;
          outline: none;
          -webkit-appearance: none;
          transition: border-color 0.15s;
        }
        .ec-page input:focus, .ec-page textarea:focus, .ec-page select:focus {
          border-color: #FF7A00;
          outline: none;
          box-shadow: none;
        }
        .ec-page input[type=range] {
          width: 100%;
          height: 5px;
          background: rgba(255,255,255,0.2);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
          cursor: pointer;
          padding: 0;
          border: none;
        }
        .ec-page input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(245,158,11,0.5);
        }
        .ec-page input[type=range]:focus {
          outline: none;
          box-shadow: none;
        }
      `}</style>
    </>
  );
}