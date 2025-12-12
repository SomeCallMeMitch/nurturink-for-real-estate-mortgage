import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { CreditCard, Users, Send, TrendingUp, Zap } from 'lucide-react';

/**
 * MobileHome Component
 * 
 * Dashboard view showing:
 * - RoofScribe logo + welcome message in header
 * - Credits card (burnt orange) with Personal/Organization breakdown
 * - 3-column stats grid: Clients, Notes Sent, Credits Used
 * - Quick Actions: Send a QuickCard, View Clients
 */

export default function MobileHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [whitelabelSettings, setWhitelabelSettings] = useState(null);
  const [stats, setStats] = useState({
    clientCount: 0,
    notesSent: 0,
    creditsUsed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load whitelabel settings
      try {
        const settings = await base44.entities.WhitelabelSettings.filter({});
        if (settings.length > 0) {
          setWhitelabelSettings(settings[0]);
        }
      } catch (wlError) {
        console.error('Failed to load whitelabel settings:', wlError);
      }

      // Load organization if user belongs to one
      if (currentUser.orgId) {
        try {
          const orgs = await base44.entities.Organization.filter({ 
            id: currentUser.orgId 
          });
          if (orgs.length > 0) {
            setOrganization(orgs[0]);
          }
        } catch (orgError) {
          console.error('Failed to load organization:', orgError);
        }
      }

      // Load stats
      try {
        const [clients, notes] = await Promise.all([
          base44.entities.Client.filter({}),
          base44.entities.Note.filter({ userId: currentUser.id })
        ]);
        
        // Sum creditCost from notes (each note has creditCost field, default 1.0)
        const totalCreditsUsed = notes.reduce((sum, note) => sum + (note.creditCost || 1), 0);
        
        setStats({
          clientCount: clients.length,
          notesSent: notes.length,
          creditsUsed: totalCreditsUsed
        });
      } catch (statsError) {
        console.error('Failed to load stats:', statsError);
      }

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate credits - sum of allocated and purchased credits
  const personalCredits = (user?.companyAllocatedCredits || 0) + (user?.personalPurchasedCredits || 0);
  const companyPoolCredits = organization?.creditBalance || 0;
  
  // Extract first name from full_name and capitalize first letter
  const rawFirstName = user?.full_name?.split(' ')[0] || 'User';
  const firstName = rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-[#c87533]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header with Logo and Welcome */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          {whitelabelSettings?.logoUrl ? (
            <img 
              src={whitelabelSettings.logoUrl} 
              alt="RoofScribe"
              className="h-10 w-auto object-contain"
            />
          ) : (
            <div className="w-10 h-10 bg-[#c87533] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">RS</span>
            </div>
          )}
          
          {/* Welcome Message */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              Welcome back, {firstName}!
            </h1>
            <p className="text-xs text-gray-500">Here's your overview</p>
          </div>
        </div>
      </div>

      {/* Credits Card - Burnt Orange */}
      <div className="px-4 pt-4">
        <div className="bg-[#c87533] rounded-xl shadow-md p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Your Credits</h2>
            <CreditCard className="w-5 h-5 opacity-80" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-orange-100 text-sm">Personal Balance:</span>
              <span className="text-2xl font-bold">{personalCredits}</span>
            </div>
            {organization && (
              <div className="flex justify-between items-center pt-2 border-t border-orange-400/50">
                <span className="text-orange-100 text-sm">Company Pool:</span>
                <span className="text-xl font-bold">{companyPoolCredits}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid - 3 Columns */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-3">
          {/* Clients Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
            <Users className="w-5 h-5 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-1">Clients</p>
            <p className="text-2xl font-bold text-gray-900">{stats.clientCount}</p>
          </div>

          {/* Notes Sent Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
            <Send className="w-5 h-5 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-1 leading-tight">Notes Sent</p>
            <p className="text-2xl font-bold text-gray-900">{stats.notesSent}</p>
          </div>

          {/* Credits Used Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
            <TrendingUp className="w-5 h-5 text-[#c87533] mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-1">Credits Used</p>
            <p className="text-2xl font-bold text-gray-900">{stats.creditsUsed}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = createPageUrl('MobileSend')}
            className="w-full bg-[#c87533] text-white rounded-xl py-3.5 font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#b5682e] active:bg-[#a55a28] transition-colors shadow-sm"
          >
            <Zap className="w-5 h-5" />
            Send a QuickCard
          </button>
          
          <button
            onClick={() => window.location.href = createPageUrl('MobileClients')}
            className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl py-3.5 font-semibold text-base hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            View Clients
          </button>
        </div>
      </div>
    </div>
  );
}