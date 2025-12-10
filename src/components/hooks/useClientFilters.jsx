import { useState, useMemo, useCallback } from 'react';

/**
 * useClientFilters Hook
 * Manages filter state and provides filtered/sorted client list
 * 
 * @param {Array} clients - Raw client list
 * @param {Set} favoriteClientIds - Set of favorited client IDs
 * @returns {Object} Filter state, setters, and processed clients
 */
export default function useClientFilters(clients = [], favoriteClientIds = new Set()) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('no_notes_first');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [uploadedFilter, setUploadedFilter] = useState('all');

  // Handle sort column click
  const handleSort = useCallback((column) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  // Toggle tag selection
  const handleToggleTag = useCallback((tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSortColumn('no_notes_first');
    setSortDirection('asc');
    setShowFavoritesOnly(false);
    setSelectedTags([]);
    setUploadedFilter('all');
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() ||
           showFavoritesOnly ||
           selectedTags.length > 0 ||
           sortColumn !== 'no_notes_first' ||
           uploadedFilter !== 'all';
  }, [searchQuery, showFavoritesOnly, selectedTags, sortColumn, uploadedFilter]);

  // Extract unique tags from clients
  const availableTags = useMemo(() => {
    const tagsSet = new Set();
    clients.forEach(client => {
      if (client.tags && Array.isArray(client.tags)) {
        client.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }, [clients]);

  // Filter and sort clients
  const processedClients = useMemo(() => {
    let result = [...clients];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(client => {
        const fullName = (client.fullName || '').toLowerCase();
        const company = (client.company || '').toLowerCase();
        const city = (client.city || '').toLowerCase();
        const state = (client.state || '').toLowerCase();
        return fullName.includes(query) ||
               company.includes(query) ||
               city.includes(query) ||
               state.includes(query);
      });
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      result = result.filter(client => favoriteClientIds.has(client.id));
    }

    // Apply tags filter
    if (selectedTags.length > 0) {
      result = result.filter(client => {
        if (!client.tags || !Array.isArray(client.tags)) return false;
        return selectedTags.some(tag => client.tags.includes(tag));
      });
    }

    // Apply date filter
    if (uploadedFilter !== 'all') {
      const now = new Date();
      result = result.filter(client => {
        if (uploadedFilter === 'manual') {
          return client.source === 'manual' || !client.source;
        }
        
        const addedDate = client.created_date ? new Date(client.created_date) : null;
        if (!addedDate) return false;
        
        const daysDiff = (now - addedDate) / (1000 * 60 * 60 * 24);
        
        switch (uploadedFilter) {
          case 'today': return daysDiff < 1;
          case '7days': return daysDiff <= 7;
          case '30days': return daysDiff <= 30;
          default: return true;
        }
      });
    }

    // Apply sorting
    const direction = sortDirection === 'asc' ? 1 : -1;

    switch (sortColumn) {
      case 'no_notes_first':
        result.sort((a, b) => {
          const aTotalNotes = a.totalNotesSent || 0;
          const bTotalNotes = b.totalNotesSent || 0;

          if (aTotalNotes === 0 && bTotalNotes > 0) return -1;
          if (aTotalNotes > 0 && bTotalNotes === 0) return 1;

          if (aTotalNotes === 0 && bTotalNotes === 0) {
            return (a.firstName || '').localeCompare(b.firstName || '');
          }

          const aDate = a.lastNoteSentDate ? new Date(a.lastNoteSentDate) : new Date(0);
          const bDate = b.lastNoteSentDate ? new Date(b.lastNoteSentDate) : new Date(0);
          return bDate - aDate;
        });
        break;

      case 'fullName':
        result.sort((a, b) => {
          const aLastName = (a.lastName || '').toLowerCase();
          const bLastName = (b.lastName || '').toLowerCase();
          if (aLastName === bLastName) {
            const aFirstName = (a.firstName || '').toLowerCase();
            const bFirstName = (b.firstName || '').toLowerCase();
            return direction * aFirstName.localeCompare(bFirstName);
          }
          return direction * aLastName.localeCompare(bLastName);
        });
        break;

      case 'company':
        result.sort((a, b) => {
          const aCompany = (a.company || '').toLowerCase();
          const bCompany = (b.company || '').toLowerCase();
          return direction * aCompany.localeCompare(bCompany);
        });
        break;

      case 'city':
        result.sort((a, b) => {
          const aCity = (a.city || '').toLowerCase();
          const bCity = (b.city || '').toLowerCase();
          return direction * aCity.localeCompare(bCity);
        });
        break;

      case 'state':
        result.sort((a, b) => {
          const aState = (a.state || '').toLowerCase();
          const bState = (b.state || '').toLowerCase();
          return direction * aState.localeCompare(bState);
        });
        break;

      case 'notes':
        result.sort((a, b) => {
          const aNotes = a.totalNotesSent || 0;
          const bNotes = b.totalNotesSent || 0;
          return direction * (aNotes - bNotes);
        });
        break;

      case 'lastNote':
        result.sort((a, b) => {
          const aDate = a.lastNoteSentDate ? new Date(a.lastNoteSentDate) : new Date(0);
          const bDate = b.lastNoteSentDate ? new Date(b.lastNoteSentDate) : new Date(0);
          return direction * (aDate - bDate);
        });
        break;

      case 'tags':
        result.sort((a, b) => {
          const aTags = a.tags || [];
          const bTags = b.tags || [];
          if (aTags.length !== bTags.length) {
            return direction * (aTags.length - bTags.length);
          }
          const aFirstTag = (aTags[0] || '').toLowerCase();
          const bFirstTag = (bTags[0] || '').toLowerCase();
          return direction * aFirstTag.localeCompare(bFirstTag);
        });
        break;

      case 'favorite':
        result.sort((a, b) => {
          const aFav = favoriteClientIds.has(a.id) ? 1 : 0;
          const bFav = favoriteClientIds.has(b.id) ? 1 : 0;
          return direction * (bFav - aFav);
        });
        break;

      default:
        break;
    }

    return result;
  }, [clients, searchQuery, showFavoritesOnly, selectedTags, uploadedFilter, sortColumn, sortDirection, favoriteClientIds]);

  return {
    searchQuery,
    setSearchQuery,
    sortColumn,
    sortDirection,
    showFavoritesOnly,
    setShowFavoritesOnly,
    selectedTags,
    setSelectedTags,
    uploadedFilter,
    setUploadedFilter,
    handleSort,
    handleToggleTag,
    clearFilters,
    hasActiveFilters,
    availableTags,
    processedClients
  };
}