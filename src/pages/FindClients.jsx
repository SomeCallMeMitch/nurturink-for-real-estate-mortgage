import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Check,
  Upload,
  Plus
} from "lucide-react";
import ClientImportModal from "@/components/client/ClientImportModal";
import ClientCreateModal from "@/components/client/ClientCreateModal";
import QuickSendPickerModal from "@/components/quicksend/QuickSendPickerModal";
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
  const [uploadedFilter, setUploadedFilter] = useState("all"); // 'all', 'today', '7days', '30days', 'manual'
  
  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Add client modal state
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  // Quick Send modal state
  const [showQuickSendModal, setShowQuickSendModal] = useState(false);

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
      
      // Explicitly fetch Organization entity to get accurate creditBalance
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (orgList && orgList.length > 0) {
          setOrganization(orgList[0]);
          console.log('🔍 FindClients: Organization loaded:', orgList[0].name, 'creditBalance:', orgList[0].creditBalance);
        }
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

    // Apply added date filter - uses created_date for all clients (manual and imported)
    if (uploadedFilter !== 'all') {
      const now = new Date();
      result = result.filter(client => {
        if (uploadedFilter === 'manual') {
          return client.source === 'manual' || !client.source;
        }
        
        // Use created_date (built-in field) for date filtering - works for all clients
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
  }, [clients, searchQuery, sortColumn, sortDirection, showFavoritesOnly, selectedTags, favoriteClientIds, uploadedFilter]);

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

  // Handle continue button (Custom Message flow)
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

  // Handle Quick Send template selection
  const handleQuickSendSelect = async (template) => {
    try {
      setInitializing(true);
      setError(null);

      const response = await base44.functions.invoke('initializeMailingBatch', {
        clientIds: selectedClientIds,
        quickSendTemplateId: template.id
      });

      const { mailingBatchId } = response.data;

      // Navigate to CreateContent with mailingBatchId (Quick Send flow)
      navigate(createPageUrl(`CreateContent?mailingBatchId=${mailingBatchId}&quickSend=true`));

    } catch (err) {
      console.error('Failed to initialize Quick Send batch:', err);
      setError(err.response?.data?.error || 'Failed to start Quick Send. Please try again.');
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
    setUploadedFilter("all");
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() ||
                          showFavoritesOnly ||
                          selectedTags.length > 0 ||
                          sortColumn !== "no_notes_first" ||
                          uploadedFilter !== "all";

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
          <CardContent className="pt-3 space-y-2">
            {/* Row 1: Search, Client Count, Tags Dropdown, Favorites, Refresh */}
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

              {/* Client Count - MOVED HERE from CardHeader */}
              <div className="flex items-center px-3 bg-gray-100 rounded-lg">
                <span className="font-semibold text-gray-900">{processedClients.length}</span>
                <span className="text-gray-500 ml-1">{processedClients.length === 1 ? 'Client' : 'Clients'}</span>
              </div>

              {/* Tags Dropdown - moved next to search bar */}
              {availableTags.length > 0 && (
                <DropdownMenu>
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
                      <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
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

                    {/* Spacer for tags when no tags available */}

              {/* Added Today Toggle */}
              <Button
                variant={uploadedFilter === "today" ? "default" : "outline"}
                onClick={() => setUploadedFilter(uploadedFilter === "today" ? "all" : "today")}
                className={`gap-2 ${uploadedFilter === "today" ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
              >
                <Calendar className="w-4 h-4" />
                Added Today
              </Button>

              {/* Favorites Toggle */}
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`gap-2 ${showFavoritesOnly ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
              >
                <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites
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

              {/* Add Client Dropdown */}
              <div className="border-l pl-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2 bg-gray-900 hover:bg-gray-800 text-white">
                      <Plus className="w-4 h-4" />
                      Add Client
                      <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowAddClientModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Client
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowImportModal(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Import CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                  {uploadedFilter !== "all" && <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                    {uploadedFilter === 'today' ? 'Added Today' : 
                     uploadedFilter === '7days' ? 'Added Last 7 Days' : 
                     uploadedFilter === '30days' ? 'Added Last 30 Days' : 'Manual Only'}
                  </Badge>}
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
        <Card className="mt-3">
          <CardHeader className="pb-1 pt-2">
            {/* Selected count badge - only shown when clients are selected */}
            {selectedClientIds.length > 0 && (
              <Badge variant="secondary" className="w-fit">
                {selectedClientIds.length} selected
              </Badge>
            )}
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
                    {/* Select All Checkbox column - ADDED: Standard practice placement */}
                    <TableHead className="w-10">
                      {processedClients.length > 0 && (
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all clients"
                        />
                      )}
                    </TableHead>
                    
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

      {/* Client Import Modal */}
      <ClientImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImportComplete={(results) => {
          loadData();
          toast({
            title: 'Import Complete',
            description: `Successfully imported ${results.summary.imported} clients`,
            className: 'bg-green-50 border-green-200 text-green-900'
          });
        }}
      />

      {/* Add Client Modal */}
      <ClientCreateModal
        open={showAddClientModal}
        onOpenChange={setShowAddClientModal}
        onClientCreated={() => {
          loadData();
        }}
        availableTagsFromParent={availableTags}
      />

      {/* Floating Action Bar - appears when clients are selected */}
      {selectedClientIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white rounded-full px-6 py-3 shadow-xl flex items-center gap-6">
            {/* Selected Count */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-sm">
                {selectedClientIds.length}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{selectedClientIds.length} Client{selectedClientIds.length > 1 ? 's' : ''} Selected</span>
                <span className="text-xs text-gray-400">Choose your sending method</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-gray-700 pl-6">
              {/* Quick Send Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setShowQuickSendModal(true)}
                      disabled={initializing}
                      className="bg-amber-500 text-white hover:bg-amber-600 rounded-full px-5 gap-2"
                    >
                      <Star className="w-4 h-4 fill-current" />
                      Quick Send
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Use a pre-configured template</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Custom Message Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleContinue}
                      disabled={initializing}
                      className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-5 gap-2"
                    >
                      {initializing ? 'Initializing...' : (
                        <>
                          <Mail className="w-4 h-4" />
                          Custom Message
                        </>
                      )}
                      {!initializing && <ArrowRight className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create a custom message from scratch</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}

      {/* Quick Send Picker Modal */}
      <QuickSendPickerModal
        open={showQuickSendModal}
        onOpenChange={setShowQuickSendModal}
        onSelectTemplate={handleQuickSendSelect}
        user={user}
      />
      </div>
      );
      }