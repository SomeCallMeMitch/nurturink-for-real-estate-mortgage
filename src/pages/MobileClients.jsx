import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import MobileLayout from '@/components/mobile/MobileLayout';
import { Search, User, Star, Plus, X, Filter } from 'lucide-react';

export default function MobileClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [whitelabelSettings, setWhitelabelSettings] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteClientIds, setFavoriteClientIds] = useState([]);
  const [user, setUser] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      
      // Load current user
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load whitelabel settings for logo
      try {
        const settings = await base44.entities.WhitelabelSettings.filter({});
        if (settings.length > 0) {
          setWhitelabelSettings(settings[0]);
        }
      } catch (wlError) {
        console.error('Failed to load whitelabel settings:', wlError);
      }
      
      // Load favorite clients
      try {
        const favorites = await base44.entities.FavoriteClient.filter({ userId: currentUser.id });
        setFavoriteClientIds(favorites.map(f => f.clientId));
      } catch (favError) {
        console.error('Failed to load favorites:', favError);
      }
      
      // Load clients and extract tags
      const clientList = await base44.entities.Client.filter({}, '-created_date', 100);
      setClients(clientList);
      
      // Extract unique tags from all clients
      const tagsSet = new Set();
      clientList.forEach(client => {
        if (client.tagIds && Array.isArray(client.tagIds)) {
          client.tagIds.forEach(tagId => tagsSet.add(tagId));
        }
      });
      
      // Load tag details
      if (tagsSet.size > 0) {
        const tagsList = await base44.entities.Tag.filter({});
        const relevantTags = tagsList.filter(tag => tagsSet.has(tag.id));
        setAvailableTags(relevantTags);
      }
      
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    // Filter by favorites
    if (showFavorites && !favoriteClientIds.includes(client.id)) {
      return false;
    }
    
    // Filter by selected tags
    if (selectedTagIds.length > 0) {
      const hasSelectedTag = selectedTagIds.some(tagId => 
        client.tagIds && client.tagIds.includes(tagId)
      );
      if (!hasSelectedTag) return false;
    }
    
    // Filter by search query
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      client.fullName?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query) ||
      client.city?.toLowerCase().includes(query)
    );
  });

  const toggleTag = (tagId) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleClientClick = (clientId) => {
    navigate(createPageUrl('MobileClientEdit') + `?clientId=${clientId}`);
  };

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
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Fixed Header with Logo */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-1.5">
          <div className="flex items-center gap-3">
            {whitelabelSettings?.logoUrl ? (
              <img 
                src={whitelabelSettings.logoUrl} 
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-[#c87533] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">RS</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">Clients</h1>
              <p className="text-sm text-gray-500">Manage your client list</p>
            </div>
          </div>
        </div>

        {/* Content - Padding for fixed header */}
        <div className="pt-[60px] p-4">
          {/* Search Bar with Favorite Toggle */}
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-3 py-3 rounded-lg border transition-colors ${
                showFavorites 
                  ? 'bg-[#c87533] border-[#c87533] text-white' 
                  : 'bg-white border-gray-300 text-gray-600'
              }`}
            >
              <Star className={`w-5 h-5 ${showFavorites ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by Tag:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? 'bg-[#c87533] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clients List */}
          {filteredClients.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchQuery || selectedTagIds.length > 0 ? 'No clients match your filters' : 'No clients yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 mb-20">
              {filteredClients.map((client) => {
                const cityState = [client.city, client.state].filter(Boolean).join(', ');
                const isFavorite = favoriteClientIds.includes(client.id);
                
                return (
                  <div 
                    key={client.id} 
                    onClick={() => handleClientClick(client.id)}
                    className="bg-white rounded-lg shadow p-2.5 cursor-pointer active:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
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
                      {isFavorite && (
                        <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        <button
          onClick={() => navigate(createPageUrl('MobileClientAdd'))}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-[#c87533] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#b5682e] active:bg-[#a55a28] transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </MobileLayout>
  );
}