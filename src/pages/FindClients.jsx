import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  ArrowRight, 
  Users, 
  Star, 
  Calendar,
  Mail,
  Tag,
  RefreshCw,
  X
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
  
  // Selection state
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [initializing, setInitializing] = useState(false);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("no_notes_first"); // Default: clients with no notes first
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await base44.auth.me();
      
      // Load clients and favorites in parallel
      const [clientList, favoritesList] = await Promise.all([
        base44.entities.Client.filter({ orgId: user.orgId }),
        base44.entities.FavoriteClient.filter({ userId: user.id })
      ]);
      
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

  // Toggle favorite status
  const handleToggleFavorite = async (clientId, e) => {
    e.stopPropagation(); // Prevent client selection
    
    try {
      const response = await base44.functions.invoke('toggleFavoriteClient', {
        clientId: clientId
      });
      
      if (response.data.success) {
        // Update local state
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
    switch (sortBy) {
      case "no_notes_first":
        // Default: Clients with no notes first, then by last note date (most recent first)
        result.sort((a, b) => {
          const aTotalNotes = a.totalNotesSent || 0;
          const bTotalNotes = b.totalNotesSent || 0;
          
          // If one has notes and other doesn't, no notes comes first
          if (aTotalNotes === 0 && bTotalNotes > 0) return -1;
          if (aTotalNotes > 0 && bTotalNotes === 0) return 1;
          
          // If both have no notes or both have notes, sort by last note date (most recent first)
          if (aTotalNotes === 0 && bTotalNotes === 0) {
            // Both have no notes - sort by firstName
            return (a.firstName || '').localeCompare(b.firstName || '');
          }
          
          // Both have notes - sort by lastNoteSentDate (most recent first)
          const aDate = a.lastNoteSentDate ? new Date(a.lastNoteSentDate) : new Date(0);
          const bDate = b.lastNoteSentDate ? new Date(b.lastNoteSentDate) : new Date(0);
          return bDate - aDate;
        });
        break;
        
      case "firstName_asc":
        result.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
        break;
        
      case "firstName_desc":
        result.sort((a, b) => (b.firstName || '').localeCompare(a.firstName || ''));
        break;
        
      case "lastName_asc":
        result.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
        break;
        
      case "lastName_desc":
        result.sort((a, b) => (b.lastName || '').localeCompare(a.lastName || ''));
        break;
        
      case "city_asc":
        result.sort((a, b) => (a.city || '').localeCompare(b.city || ''));
        break;
        
      case "city_desc":
        result.sort((a, b) => (b.city || '').localeCompare(a.city || ''));
        break;
        
      case "state_asc":
        result.sort((a, b) => (a.state || '').localeCompare(b.state || ''));
        break;
        
      case "state_desc":
        result.sort((a, b) => (b.state || '').localeCompare(a.state || ''));
        break;
        
      case "last_note_recent":
        result.sort((a, b) => {
          const aDate = a.lastNoteSentDate ? new Date(a.lastNoteSentDate) : new Date(0);
          const bDate = b.lastNoteSentDate ? new Date(b.lastNoteSentDate) : new Date(0);
          return bDate - aDate;
        });
        break;
        
      case "last_note_oldest":
        result.sort((a, b) => {
          const aDate = a.lastNoteSentDate ? new Date(a.lastNoteSentDate) : new Date(0);
          const bDate = b.lastNoteSentDate ? new Date(b.lastNoteSentDate) : new Date(0);
          return aDate - bDate;
        });
        break;
        
      case "most_notes":
        result.sort((a, b) => (b.totalNotesSent || 0) - (a.totalNotesSent || 0));
        break;
        
      case "least_notes":
        result.sort((a, b) => (a.totalNotesSent || 0) - (b.totalNotesSent || 0));
        break;
        
      default:
        break;
    }
    
    return result;
  }, [clients, searchQuery, sortBy, showFavoritesOnly, selectedTags, favoriteClientIds]);

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
    setSortBy("no_notes_first");
    setShowFavoritesOnly(false);
    setSelectedTags([]);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || 
                          showFavoritesOnly || 
                          selectedTags.length > 0 || 
                          sortBy !== "no_notes_first";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Workflow Steps Header */}
      <WorkflowSteps currentStep={1} creditsLeft={0} />
      
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
            {/* Row 1: Search, Sort, Favorites, Refresh */}
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
              
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_notes_first">No Notes First (Default)</SelectItem>
                  <SelectItem value="firstName_asc">First Name (A-Z)</SelectItem>
                  <SelectItem value="firstName_desc">First Name (Z-A)</SelectItem>
                  <SelectItem value="lastName_asc">Last Name (A-Z)</SelectItem>
                  <SelectItem value="lastName_desc">Last Name (Z-A)</SelectItem>
                  <SelectItem value="city_asc">City (A-Z)</SelectItem>
                  <SelectItem value="city_desc">City (Z-A)</SelectItem>
                  <SelectItem value="state_asc">State (A-Z)</SelectItem>
                  <SelectItem value="state_desc">State (Z-A)</SelectItem>
                  <SelectItem value="last_note_recent">Last Note (Recent First)</SelectItem>
                  <SelectItem value="last_note_oldest">Last Note (Oldest First)</SelectItem>
                  <SelectItem value="most_notes">Most Notes Sent</SelectItem>
                  <SelectItem value="least_notes">Least Notes Sent</SelectItem>
                </SelectContent>
              </Select>
              
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
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
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
                  {sortBy !== "no_notes_first" && <Badge variant="secondary">Custom Sort</Badge>}
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
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
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
                {processedClients.map((client) => {
                  const isSelected = selectedClientIds.includes(client.id);
                  const isFavorited = favoriteClientIds.has(client.id);
                  const totalNotes = client.totalNotesSent || 0;
                  const lastNoteDate = formatDate(client.lastNoteSentDate);
                  
                  return (
                    <div
                      key={client.id}
                      onClick={() => handleToggleClient(client.id)}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {/* Checkbox */}
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleClient(client.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      {/* Client Info */}
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
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {client.company && (
                            <span className="truncate">{client.company}</span>
                          )}
                          {client.city && client.state && (
                            <span className="flex items-center gap-1">
                              {client.city}, {client.state}
                            </span>
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
                      
                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm">
                        {/* Notes Count */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="font-medium">{totalNotes}</span>
                          <span className="text-gray-400">note{totalNotes !== 1 ? 's' : ''}</span>
                        </div>
                        
                        {/* Last Note Date */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{lastNoteDate}</span>
                        </div>
                      </div>
                      
                      {/* Favorite Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleToggleFavorite(client.id, e)}
                        className={`${isFavorited ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
                      >
                        <Star className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
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