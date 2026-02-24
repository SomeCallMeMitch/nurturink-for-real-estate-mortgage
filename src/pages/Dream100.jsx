import React, { useState } from 'react';
import Dream100Fonts from '../components/lp-Dream100/Dream100Fonts';
import Dream100Nav from '../components/lp-Dream100/Dream100Nav';
import Dream100Hero from '../components/lp-Dream100/Dream100Hero';
import Dream100Wizard from '../components/lp-Dream100/Dream100Wizard';
import Dream100Generating from '../components/lp-Dream100/Dream100Generating';
import Dream100Output from '../components/lp-Dream100/Dream100Output';
import Dream100Footer from '../components/lp-Dream100/Dream100Footer';

/**
 * Dream 100 Blueprint — Real Estate Referral Partner System
 * Mobile-first landing page.
 *
 * States:
 *  'hero'       — initial landing view
 *  'wizard'     — 4-step form
 *  'generating' — spinner (2s artificial delay)
 *  'output'     — 7 prompt cards + CTA
 */
export default function Dream100() {
  const [stage, setStage] = useState('hero');
  const [formData, setFormData] = useState({});

  const handleStart = () => setStage('wizard');

  const handleWizardComplete = (data) => {
    setFormData(data);
    setStage('generating');
    // Match original 2-second "generating" experience
    setTimeout(() => setStage('output'), 2000);
  };

  const handleRestart = () => {
    setFormData({});
    setStage('hero');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="d100-page" style={{ scrollBehavior: 'smooth' }}>
      <Dream100Fonts />
      <Dream100Nav />

      {/* Hero — only shown before wizard starts */}
      {stage === 'hero' && (
        <Dream100Hero onStart={handleStart} />
      )}

      {/* Wizard — 4-step form */}
      {stage === 'wizard' && (
        <Dream100Wizard onComplete={handleWizardComplete} />
      )}

      {/* Generating spinner */}
      {stage === 'generating' && (
        <Dream100Generating />
      )}

      {/* Output — 7 prompt cards */}
      {stage === 'output' && (
        <Dream100Output formData={formData} onRestart={handleRestart} />
      )}

      <Dream100Footer />
    </div>
  );
}