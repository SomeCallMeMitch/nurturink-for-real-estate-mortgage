import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CreditCard, Users, Send, TrendingUp, Zap } from 'lucide-react';

export default function MobileHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
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

      if (currentUser.organizationId) {
        const orgs = await base44.entities.Organization.filter({ 
          id: currentUser.organizationId 
        });
        if (orgs.length > 0) {
          setOrganization(orgs[0]);
        }
      }

      const clients = await base44.entities.Client.filter({});
      const notes = await base44.entities.Note.filter({ userId: currentUser.id });
      
      setStats({
        clientCount: clients.length,
        notesSent: notes.length,
        creditsUsed: notes.length
      });

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const personalCredits = user?.personalCredits || 0;
  const orgCredits = organization?.creditBalance || 0;
  const totalCredits = personalCredits + orgCredits;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c87533]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header with Logo and Welcome */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-sm font-bold text-[#c87533]">RoofScribe</h1>
        </div>
        <div className="flex-1 text-right">
          <p className="text-xs text-gray-500">Welcome back, {user?.firstName || 'User'}!</p>
          <p className="text-xs text-gray-400">Here's your overview</p>
        </div>
      </div>

      {/* Credits Card */}
      <div className="px-4 pt-4">
        <div className="bg-[#c87533] rounded-lg shadow-md p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Your Credits</h2>
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-orange-100">Personal:</span>
              <span className="font-bold">{personalCredits}</span>
            </div>
            {organization && orgCredits > 0 && (
              <div className="flex justify-between">
                <span className="text-orange-100">Organization:</span>
                <span className="font-bold">{orgCredits}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid - 3 Columns */}
      <div className="px-4 pt-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {/* Clients Card */}
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <Users className="w-4 h-4 text-gray-400 mx-auto mb-1.5" />
            <p className="text-xs text-gray-500 mb-1">Clients</p>
            <p className="text-xl font-bold text-gray-900">{stats.clientCount}</p>
          </div>

          {/* Notes Sent Card */}
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <Send className="w-4 h-4 text-gray-400 mx-auto mb-1.5" />
            <div className="text-xs text-gray-500 mb-1 leading-tight">
              <div>Notes</div>
              <div>Sent</div>
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.notesSent}</p>
          </div>

          {/* Credits Used Card */}
          <div className="bg-white rounded-lg shadow p-3 text-center">
            <TrendingUp className="w-4 h-4 text-gray-400 mx-auto mb-1.5" />
            <p className="text-xs text-gray-500 mb-1">Credits</p>
            <p className="text-xl font-bold text-gray-900">{stats.creditsUsed}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => navigate('/MobileSend')}
            className="w-full bg-[#c87533] text-white rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#b5682e] active:bg-[#a55a28] transition-colors"
          >
            <Zap className="w-4 h-4" />
            Send a QuickCard
          </button>
          
          <button
            onClick={() => navigate('/MobileClients')}
            className="w-full bg-white text-gray-900 border border-gray-200 rounded-lg py-3 font-semibold text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            View Clients
          </button>
        </div>
      </div>
    </div>
  );
}