import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowRight,
  Users,
  Star,
  Calendar,
  Mail,
  Tag,
  RefreshCw,
  X,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import WorkflowSteps from "@/components/mailing/WorkflowSteps";
import { useToast } from "@/components/ui/use-toast";

export default function FindClients() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data state
  const [clients, setClients] = useState([]);
  const [favoriteClientIds, setFavoriteClientIds] = useState(new Set());
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // NEW: State for user and organization
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);

  // Selection state
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [initializing, setInitializing] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("no_notes_first"); // Column to sort by
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc' or 'desc'
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = await base44.auth.me();
      console.log('🔍 FindClients: Current user:', currentUser);
      console.log('🔍 FindClients: User orgId:', currentUser.orgId);
      console.log('🔍 FindClients: User appRole:', currentUser.appRole);
      
      setUser(currentUser);
      if (currentUser.organization) {
        setOrganization(currentUser.organization);
      }

      // Load clients - for super_admin, load ALL clients, otherwise filter by orgId
      const clientQuery = currentUser.appRole === 'super_admin' 
        ? {} 
        : { orgId: currentUser.orgId };
      
      console.log('🔍 FindClients: Client query:', clientQuery);

      const [clientList, favoritesList] = await Promise.all([
        base44.entities.Client.filter(clientQuery),
        base44.entities.FavoriteClient.filter({ userId: currentUser.id })
      ]);

      console.log('🔍 FindClients: Clients loaded:', clientList.length);
      console.log('🔍 FindClients: First 3 clients:', clientList.slice(0, 3));

      setClients(clientList);

      // Create a Set of favorited client IDs for fast lookup
      const favIds = new Set(favoritesList.map(f => f.clientId));
      setFavoriteClientIds(favIds);

      // Extract unique tags from all clients
      const tagsSet = new Set();
      clientList.forEach(client => {
        if (client.tags && Array.isArray(client.tags)) {
          client.tags.forEach(tag => tagsSet.add(tag));
        }
      });
      setAvailableTags(Array.from(tagsSet).sort());

    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total available credits with CORRECTED hierarchy
  const totalAvailableCredits = useMemo(() => {
    if (!user) return 0;
    
    const companyAllocated = user.companyAllocatedCredits || 0;
    const personalPurchased = user.personalPurchasedCredits || 0;
    
    // Only include company pool if user has access
    const canAccessPool = user.canAccessCompanyPool !== false;
    const companyCredits = canAccessPool ? (organization?.creditBalance || 0) : 0;
    
    return companyAllocated + companyCredits + personalPurchased;
  }, [user, organization]);

  // NEW: Handle back to home
  const handleBack = () => {
    navigate(createPageUrl('Home'));
  };

  // Toggle favorite status
  const handleToggleFavorite = async (clientId, e) => {
    e.stopPropagation();

    try {
      const response = await base44.functions.invoke('toggleFavoriteClient', {
        clientId: clientId
      });

      if (response.data.success) {
        setFavoriteClientIds(prev => {
          const newSet = new Set(prev);
          if (response.data.isFavorited) {
            newSet.add(clientId);
          } else {
            newSet.delete(clientId);
          }
          return newSet;
        });
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      toast({
        title: 'Failed to Update Favorite',
        description: err.response?.data?.error || 'Please try again',
        variant: 'destructive'
      });
    }
  };

  // Handle column header click for sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter, sort, and process clients
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

    // Apply sorting
    const direction = sortDirection === 'asc' ? 1 : -1;

    switch (sortColumn) {
      case "no_notes_first":
        // Default: Clients with no notes first, then by last note date (most recent first)
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

      case "name":
        result.sort((a, b) => {
          const aName = (a.fullName || '').toLowerCase();
          const bName = (b.fullName || '').toLowerCase();
          return direction * aName.localeCompare(bName);
        });
        break;

      case "company":
        result.sort((a, b) => {
          const aCompany = (a.company || '').toLowerCase();
          const bCompany = (b.company || '').toLowerCase();
          return direction * aCompany.localeCompare(bCompany);
        });
        break;

      case "location":
        result.sort((a, b) => {
          const aLoc = `${a.city || ''}, ${a.state || ''}`.toLowerCase();
          const bLoc = `${b.city || ''}, ${b.state || ''}`.toLowerCase();
          return direction * aLoc.localeCompare(bLoc);
        });
        break;

      case "notes":
        result.sort((a, b) => {
          const aNotes = a.totalNotesSent || 0;
          const bNotes = b.totalNotesSent || 0;
          return direction * (aNotes - bNotes);
        });
        break;

      case "lastNote":
        result.sort((a, b) => {
          const aDate = a.lastNoteSentDate ? new Date(a.lastNoteSentDate) : new Date(0);
          const bDate = b.lastNoteSentDate ? new Date(b.lastNoteSentDate) : new Date(0);
          return direction * (aDate - bDate);
        });
        break;

      default:
        break;
    }

    return result;
  }, [clients, searchQuery, sortColumn, sortDirection, showFavoritesOnly, selectedTags, favoriteClientIds]);

  // Handle individual checkbox toggle
  const handleToggleClient = (clientId) => {
    setSelectedClientIds(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedClientIds(processedClients.map(c => c.id));
    } else {
      setSelectedClientIds([]);
    }
  };

  // Check if all filtered clients are selected
  const allSelected = processedClients.length > 0 &&
    processedClients.every(client => selectedClientIds.includes(client.id));

  // Handle continue button
  const handleContinue = async () => {
    try {
      setInitializing(true);
      setError(null);

      const response = await base44.functions.invoke('initializeMailingBatch', {
        clientIds: selectedClientIds
      });

      const { mailingBatchId } = response.data;

      navigate(createPageUrl(`CreateContent?mailingBatchId=${mailingBatchId}`));

    } catch (err) {
      console.error('Failed to initialize mailing batch:', err);
      setError(err.response?.data?.error || 'Failed to start workflow. Please try again.');
      setInitializing(false);
    }
  };

  // Handle tag filter toggle
  const handleToggleTag = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSortColumn("no_notes_first");
    setSortDirection("asc");
    setShowFavoritesOnly(false);
    setSelectedTags([]);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() ||
                          showFavoritesOnly ||
                          selectedTags.length > 0 ||
                          sortColumn !== "no_notes_first";

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  // Get sort icon for column header - IMPROVED VERSION
  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="w-5 h-5 opacity-30 group-hover:opacity-60 transition-opacity" />;
    }
    return sortDirection === 'asc'
      ? <ChevronUp className="w-5 h-5 text-blue-600 font-bold" />
      : <ChevronDown className="w-5 h-5 text-blue-600 font-bold" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Workflow Steps Header with Back Button and Title */}
      <WorkflowSteps 
        currentStep={1} 
        creditsLeft={totalAvailableCredits}
        pageTitle="Find Clients"
        onBackClick={handleBack}
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Search, Filter, and Sort Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            {/* Row 1: Search, Favorites, Refresh */}
            <div className="flex gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name, company, city, or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Favorites Toggle */}
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`gap-2 ${showFavoritesOnly ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
              >
                <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites Only
              </Button>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Row 2: Tags Filter */}
            {availableTags.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">Tags:</span>
                </div>
                {availableTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <Badge
                      key={tag}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleToggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Active Filters Summary & Clear Button */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Active filters:</span>
                  {searchQuery && <Badge variant="secondary">Search: "{searchQuery}"</Badge>}
                  {showFavoritesOnly && <Badge variant="secondary">Favorites Only</Badge>}
                  {selectedTags.length > 0 && <Badge variant="secondary">{selectedTags.length} Tag{selectedTags.length > 1 ? 's' : ''}</Badge>}
                  {sortColumn !== "no_notes_first" && <Badge variant="secondary">Sorted by {sortColumn}</Badge>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>{processedClients.length} {processedClients.length === 1 ? 'Client' : 'Clients'}</span>
                {selectedClientIds.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedClientIds.length} selected
                  </Badge>
                )}
              </CardTitle>

              {/* Continue Button and Select All Checkbox */}
              <div className="flex items-center gap-4">
                {/* Select All Checkbox */}
                {processedClients.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Select All
                    </label>
                  </div>
                )}

                {/* Continue Button */}
                <Button
                  onClick={handleContinue}
                  disabled={selectedClientIds.length === 0 || initializing}
                  className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  {initializing ? 'Initializing...' : 'Continue to Content'}
                  {!initializing && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {processedClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">
                  {clients.length === 0
                    ? 'No clients found'
                    : 'No clients match your filters'}
                </p>
                {hasActiveFilters && clients.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {/* Sortable Column Headers */}
                <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-t-lg border-b-2 border-gray-200">
                  {/* Checkbox column - no sort */}
                  <div className="w-6"></div>

                  {/* Name column - sortable */}
                  <button
                    onClick={() => handleSort('name')}
                    className="flex-1 flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors group"
                  >
                    <span>Name / Company</span>
                    {getSortIcon('name')}
                  </button>

                  {/* Location column - sortable */}
                  <button
                    onClick={() => handleSort('location')}
                    className="w-40 flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors group"
                  >
                    <span>Location</span>
                    {getSortIcon('location')}
                  </button>

                  {/* Notes column - sortable */}
                  <button
                    onClick={() => handleSort('notes')}
                    className="w-32 flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors group"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Notes</span>
                    {getSortIcon('notes')}
                  </button>

                  {/* Last Note column - sortable */}
                  <button
                    onClick={() => handleSort('lastNote')}
                    className="w-40 flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors group"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Last Note</span>
                    {getSortIcon('lastNote')}
                  </button>

                  {/* Favorite column - no sort */}
                  <div className="w-10"></div>
                </div>

                {/* Client Rows */}
                {processedClients.map((client, index) => {
                  const isSelected = selectedClientIds.includes(client.id);
                  const isFavorited = favoriteClientIds.has(client.id);
                  const totalNotes = client.totalNotesSent || 0;
                  const lastNoteDate = formatDate(client.lastNoteSentDate);

                  return (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleToggleClient(client.id)}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-sm'
                      }`}
                    >
                      {/* Checkbox */}
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleClient(client.id)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Name / Company Column */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {client.fullName || 'Unnamed Client'}
                          </h3>
                          {totalNotes === 0 && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              No notes sent
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {client.company && (
                            <span className="truncate">{client.company}</span>
                          )}
                        </div>
                        {client.tags && client.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {client.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Location Column */}
                      <div className="w-40 text-sm text-gray-600">
                        {client.city && client.state ? (
                          <span>{client.city}, {client.state}</span>
                        ) : (
                          <span className="text-gray-400">No location</span>
                        )}
                      </div>

                      {/* Notes Count Column */}
                      <div className="w-32 flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">{totalNotes}</span>
                        <span className="text-gray-400">note{totalNotes !== 1 ? 's' : ''}</span>
                      </div>

                      {/* Last Note Date Column */}
                      <div className="w-40 text-sm text-gray-600">
                        <span className="font-medium">{lastNoteDate}</span>
                      </div>

                      {/* Favorite Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleToggleFavorite(client.id, e)}
                        className={`w-10 ${isFavorited ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
                      >
                        <Star className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}