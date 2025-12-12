import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MobileLayout from '@/components/mobile/MobileLayout';
import { Search, User } from 'lucide-react';

export default function MobileClients() {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const clientList = await base44.entities.Client.filter({}, '-created_date', 100);
      setClients(clientList);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      client.fullName?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query) ||
      client.city?.toLowerCase().includes(query)
    );
  });

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
      <div className="p-4">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage your client list</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? 'No clients match your search' : 'No clients yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredClients.map((client) => {
              const cityState = [client.city, client.state].filter(Boolean).join(', ');
              return (
                <div key={client.id} className="bg-white rounded-lg shadow p-2.5">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {client.fullName}
                    {cityState && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        {cityState}
                      </span>
                    )}
                  </h3>
                  {client.company && (
                    <p className="text-sm text-gray-500 mt-0.5">{client.company}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}