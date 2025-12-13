import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle2, Home, Send } from 'lucide-react';

export default function MobileSendSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const numClients = urlParams.get('numClients') || '0';
  const templateName = urlParams.get('templateName') || 'your QuickCard';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 pb-24">
      <div className="text-center bg-white rounded-xl shadow-md p-8 max-w-sm w-full">
        {/* Success Icon */}
        <div className="inline-block relative mb-6">
          <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          QuickCards Sent!
        </h1>
        
        {/* Details */}
        <p className="text-base text-gray-700 mb-8">
          You successfully sent <span className="font-semibold">{numClients}</span> QuickCard{numClients !== '1' ? 's' : ''} using the '{templateName}' template.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(createPageUrl('MobileSend'))}
            className="w-full bg-[#c87533] text-white rounded-xl py-3.5 font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#b5682e] active:bg-[#a55a28] transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
            Send Another QuickCard
          </button>
          <button
            onClick={() => navigate(createPageUrl('MobileHome'))}
            className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl py-3.5 font-semibold text-base hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}