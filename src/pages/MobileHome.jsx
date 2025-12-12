import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MobileLayout from '@/components/mobile/MobileLayout';
import { CreditCard, Users, Send, TrendingUp } from 'lucide-react';

export default function MobileHome() {
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

      if (currentUser.orgId) {
        const orgs = await base44.entities.Organization.filter({ 
          id: currentUser.orgId 
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

  const personalCredits = user?.personalPurchasedCredits || 0;
  const allocatedCredits = user?.companyAllocatedCredits || 0;
  const totalPersonalCredits = personalCredits + allocatedCredits;
  const companyPoolCredits = organization?.creditBalance || 0;

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow p-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || user?.full_name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">Here's your overview</p>
        </div>

        {/* Credits Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Your Credits</h2>
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-blue-100">Personal Balance:</span>
              <span className="text-2xl font-bold">{totalPersonalCredits}</span>
            </div>
            {organization && companyPoolCredits > 0 && (
              <div className="flex justify-between items-baseline pt-2 border-t border-blue-400">
                <span className="text-blue-100">Company Pool:</span>
                <span className="text-xl font-semibold">{companyPoolCredits}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Clients</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.clientCount}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Notes Sent</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.notesSent}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Credits Used</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.creditsUsed}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium">
              Send a Note
            </button>
            <button className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 font-medium">
              View Clients
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}