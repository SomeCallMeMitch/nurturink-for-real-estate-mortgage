import React from 'react';
import { Loader2 } from 'lucide-react';

export default function OnboardingLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 bg-opacity-75">
      <Loader2 className="w-12 h-12 animate-spin text-white" />
      <p className="mt-4 text-lg font-semibold text-white">Setting up your account...</p>
      <p className="text-sm text-gray-300">This may take a moment.</p>
    </div>
  );
}