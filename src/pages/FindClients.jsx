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
  ChevronDown,
  Check
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
      
      setUser(currentUser);
      if (currentUser.organization) {
        setOrganization(currentUser.organization);
      }

      const [clientList, favoritesList] = await Promise.all([
        base44.entities.Client.filter({ orgId: currentUser.orgId }),
        base44.entities.FavoriteClient.filter({ userId: currentUser.id })
      ]);

      console.log('🔍 FindClients: Clients loaded:', clientList.length);

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

      case "fullName":
        // Sort by last name (lastName field from Client entity)
        result.sort((a, b) => {
          const aLastName = (a.lastName || '').toLowerCase();
          const bLastName = (b.lastName || '').toLowerCase();
          // If last names are equal, sort by first name
          if (aLastName === bLastName) {
            const aFirstName = (a.firstName || '').toLowerCase();
            const bFirstName = (b.firstName || '').toLowerCase();
            return direction * aFirstName.localeCompare(bFirstName);
          }
          return direction * aLastName.localeCompare(bLastName);
        });
        break;

      case "company":
        result.sort((a, b) => {
          const aCompany = (a.company || '').toLowerCase();
          const bCompany = (b.company || '').toLowerCase();
          return direction * aCompany.localeCompare(bCompany);
        });
        break;

      case "city":
        result.sort((a, b) => {
          const aCity = (a.city || '').toLowerCase();
          const bCity = (b.city || '').toLowerCase();
          return direction * aCity.localeCompare(bCity);
        });
        break;

      case "state":
        result.sort((a, b) => {
          const aState = (a.state || '').toLowerCase();
          const bState = (b.state || '').toLowerCase();
          return direction * aState.localeCompare(bState);
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

      case "tags":
        // Sort by number of tags, then alphabetically by first tag
        result.sort((a, b) => {
          const aTags = a.tags || [];
          const bTags = b.tags || [];
          // First compare by tag count
          if (aTags.length !== bTags.length) {
            return direction * (aTags.length - bTags.length);
          }
          // If same count, compare by first tag alphabetically
          const aFirstTag = (aTags[0] || '').toLowerCase();
          const bFirstTag = (bTags[0] || '').toLowerCase();
          return direction * aFirstTag.localeCompare(bFirstTag);
        });
        break;

      case "favorite":
        // Sort favorites first (or last depending on direction)
        result.sort((a, b) => {
          const aFav = favoriteClientIds.has(a.id) ? 1 : 0;
          const bFav = favoriteClientIds.has(b.id) ? 1 : 0;
          return direction * (bFav - aFav); // Favorites first when ascending
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
      ? <ChevronUp className="w-5 h-5 text-amber-700 font-bold" />
      : <ChevronDown className="w-5 h-5 text-amber-700 font-bold" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Users className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-pulse" />
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
            {/* Row 1: Search, Tags Dropdown, Favorites, Refresh */}
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

              {/* Tags Dropdown - moved next to search bar */}
              {availableTags.length > 0 && (
                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className={`gap-2 ${selectedTags.length > 0 ? 'border-amber-500 bg-amber-50 text-amber-700' : ''}`}
                          >
                            <Tag className="w-4 h-4" />
                            Tags
                            {selectedTags.length > 0 && (
                              <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-700">
                                {selectedTags.length}
                              </Badge>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Filter by tags</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent align="end" className="w-48">
                    {availableTags.map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <DropdownMenuItem
                          key={tag}
                          onClick={() => handleToggleTag(tag)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{tag}</span>
                            {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                    {selectedTags.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setSelectedTags([])}
                          className="text-gray-500 cursor-pointer"
                        >
                          Clear tag filters
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

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

                {/* Continue Button with Tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={selectedClientIds.length === 0 ? 0 : -1}>
                        <Button
                          onClick={handleContinue}
                          disabled={selectedClientIds.length === 0 || initializing}
                          className="bg-amber-600 hover:bg-amber-700 gap-2"
                        >
                          {initializing ? 'Initializing...' : 'Continue to Content'}
                          {!initializing && <ArrowRight className="w-4 h-4" />}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {selectedClientIds.length === 0 && (
                      <TooltipContent>
                        <p>You must select at least one recipient before continuing.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* Checkbox column */}
                    <TableHead className="w-10"></TableHead>
                    
                    {/* Full Name column - sortable */}
                    <TableHead 
                      onClick={() => handleSort('fullName')}
                      className="cursor-pointer hover:text-amber-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>Full Name</span>
                        {getSortIcon('fullName')}
                      </div>
                    </TableHead>
                    
                    {/* Company column - sortable */}
                    <TableHead 
                      onClick={() => handleSort('company')}
                      className="cursor-pointer hover:text-amber-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>Company</span>
                        {getSortIcon('company')}
                      </div>
                    </TableHead>
                    
                    {/* City column - sortable */}
                    <TableHead 
                      onClick={() => handleSort('city')}
                      className="cursor-pointer hover:text-amber-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>City</span>
                        {getSortIcon('city')}
                      </div>
                    </TableHead>
                    
                    {/* State column - sortable */}
                    <TableHead 
                      onClick={() => handleSort('state')}
                      className="cursor-pointer hover:text-amber-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>State</span>
                        {getSortIcon('state')}
                      </div>
                    </TableHead>
                    
                    {/* Notes column - sortable */}
                    <TableHead 
                      onClick={() => handleSort('notes')}
                      className="cursor-pointer hover:text-amber-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>Notes</span>
                        {getSortIcon('notes')}
                      </div>
                    </TableHead>
                    
                    {/* Last Note column - sortable */}
                    <TableHead 
                      onClick={() => handleSort('lastNote')}
                      className="cursor-pointer hover:text-amber-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Last Note</span>
                        {getSortIcon('lastNote')}
                      </div>
                    </TableHead>
                    
                    {/* Tags column - sortable */}
                    <TableHead 
                      onClick={() => handleSort('tags')}
                      className="cursor-pointer hover:text-amber-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span>Tags</span>
                        {getSortIcon('tags')}
                      </div>
                    </TableHead>
                    
                    {/* Favorite column - sortable */}
                    <TableHead 
                      onClick={() => handleSort('favorite')}
                      className="w-10 cursor-pointer hover:text-amber-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        {getSortIcon('favorite')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedClients.map((client) => {
                    const isSelected = selectedClientIds.includes(client.id);
                    const isFavorited = favoriteClientIds.has(client.id);
                    const totalNotes = client.totalNotesSent || 0;
                    const lastNoteDate = formatDate(client.lastNoteSentDate);
                    const clientTags = client.tags || [];

                    return (
                      <TableRow
                        key={client.id}
                        onClick={() => handleToggleClient(client.id)}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Checkbox */}
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleClient(client.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>

                        {/* Full Name - BOLD */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              {client.fullName || 'Unnamed Client'}
                            </span>
                            {totalNotes === 0 && (
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                No notes sent
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Company */}
                        <TableCell className="text-gray-600">
                          {client.company || <span className="text-gray-400">—</span>}
                        </TableCell>

                        {/* City */}
                        <TableCell className="text-gray-600">
                          {client.city || <span className="text-gray-400">—</span>}
                        </TableCell>

                        {/* State */}
                        <TableCell className="text-gray-600">
                          {client.state || <span className="text-gray-400">—</span>}
                        </TableCell>

                        {/* Notes Count */}
                        <TableCell className="text-gray-600">
                          <span className="font-medium">{totalNotes}</span>
                          <span className="text-gray-400 ml-1">note{totalNotes !== 1 ? 's' : ''}</span>
                        </TableCell>

                        {/* Last Note Date */}
                        <TableCell className="text-gray-600">
                          <span className="font-medium">{lastNoteDate}</span>
                        </TableCell>

                        {/* Tags */}
                        <TableCell>
                          {clientTags.length > 0 ? (
                            <div className="flex items-center gap-1 flex-wrap">
                              {clientTags.slice(0, 2).map(tag => (
                                <Badge 
                                  key={tag} 
                                  variant="outline" 
                                  className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {clientTags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{clientTags.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>

                        {/* Favorite Button */}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleToggleFavorite(client.id, e)}
                            className={`w-10 ${isFavorited ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
                          >
                            <Star className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}