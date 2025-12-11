import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { 
  Search, 
  Plus, 
  Star,
  ChevronRight,
  Loader2,
  Users,
  X
} from 'lucide-react';

function getInitials(firstName, lastName) {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
}

function ClientRow({ client, isFavorite, onTap, onToggleFavorite }) {
  const initials = getInitials(client.firstName, client.lastName);
  const displayName = [client.firstName, client.lastName].filter(Boolean).join(' ') || 'Unnamed';
  const cityState = [client.city, client.state].filter(Boolean).join(', ');
  
  return (
    <button
      onClick={() => onTap(client)}
      className="flex items-center gap-2.5 p-2 active:bg-gray-50 w-full text-left transition-colors"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(client.id);
        }}
        className="p-0.5 flex-shrink-0"
      >
        <Star 
          className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      </button>

      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-semibold text-gray-600">{initials}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 text-sm truncate">{displayName}</div>
        {cityState && (
          <div className="text-xs text-gray-500 truncate">{cityState}</div>
        )}
      </div>
      
      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </button>
  );
}

function FilterPill({ label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
        active 
          ? 'bg-gray-900 text-white' 
          : 'bg-gray-100 text-gray-600 active:bg-gray-200'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`text-xs ${active ? 'text-gray-300' : 'text-gray-400'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function MobileClients() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const favorites = await base44.entities.FavoriteClient.filter({
        userId: currentUser.id
      });
      setFavoriteIds(favorites.map(f => f.clientId));
      
      const clientList = await base44.entities.Client.filter({});
      setClients(clientList);
      
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    let result = clients;
    
    if (activeFilter === 'favorites') {
      result = result.filter(c => favoriteIds.includes(c.id));
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.firstName?.toLowerCase().includes(query) ||
        c.lastName?.toLowerCase().includes(query) ||
        c.city?.toLowerCase().includes(query)
      );
    }
    
    result.sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    return result;
  }, [clients, activeFilter, searchQuery, favoriteIds]);

  const counts = useMemo(() => ({
    all: clients.length,
    favorites: favoriteIds.length
  }), [clients, favoriteIds]);

  const handleToggleFavorite = async (clientId) => {
    const isFavorite = favoriteIds.includes(clientId);
    
    if (isFavorite) {
      setFavoriteIds(prev => prev.filter(id => id !== clientId));
    } else {
      setFavoriteIds(prev => [...prev, clientId]);
    }
    
    try {
      if (isFavorite) {
        const favorites = await base44.entities.FavoriteClient.filter({
          userId: user.id,
          clientId: clientId
        });
        if (favorites.length > 0) {
          await base44.entities.FavoriteClient.delete(favorites[0].id);
        }
      } else {
        await base44.entities.FavoriteClient.create({
          userId: user.id,
          clientId: clientId
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      if (isFavorite) {
        setFavoriteIds(prev => [...prev, clientId]);
      } else {
        setFavoriteIds(prev => prev.filter(id => id !== clientId));
      }
    }
  };

  const handleClientTap = (client) => {
    navigate(`/MobileClientDetail?id=${client.id}`);
  };

  const handleAddClient = () => {
    navigate('/MobileClientAdd');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#c87533] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 pt-3 pb-2 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533] focus:border-[#c87533]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <FilterPill 
            label="All" 
            active={activeFilter === 'all'} 
            count={counts.all}
            onClick={() => setActiveFilter('all')} 
          />
          <FilterPill 
            label="Favorites" 
            active={activeFilter === 'favorites'} 
            count={counts.favorites}
            onClick={() => setActiveFilter('favorites')} 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">
              {searchQuery ? 'No clients match your search' : activeFilter === 'favorites' ? 'No favorite clients yet' : 'No clients yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 pb-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="bg-white rounded-lg border border-gray-100">
                <ClientRow 
                  client={client}
                  isFavorite={favoriteIds.includes(client.id)}
                  onTap={handleClientTap}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleAddClient}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#c87533] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#b5682e] active:bg-[#a55a28] transition-colors z-20"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}