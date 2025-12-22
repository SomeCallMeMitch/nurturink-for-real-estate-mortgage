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
import { Pill } from "@/components/ui/Pill";
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

// PHASE 2: Import CreditContext hook for global credit state
import { useCredits } from "../components/context/CreditContext";

export default function FindClients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // PHASE 2: Use global credit context for user, organization, and credits
  const { user, organization, totalCredits, refreshCredits } = useCredits();

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
  const [sortColumn, setSortColumn] = useState("no_notes_first");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [uploadedFilter, setUploadedFilter] = useState("all");
  
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

      // PHASE 2: Refresh credit context to get latest user/org data
      await refreshCredits();

      const currentUser = await base44.auth.me();
      console.log('🔍 FindClients: Current user:', currentUser);
      console.log('🔍 FindClients: User orgId:', currentUser.orgId);

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

  // PHASE 2: Use totalCredits from CreditContext (centralized calculation)
  const totalAvailableCredits = totalCredits;

  // Handle back to home
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
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
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

    // Apply added date filter
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
      case "no_notes_first":
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

      case "favorite":
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

  // Get sort icon for column header
  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="w-5 h-5 opacity-30 group-hover:opacity-60 transition-opacity" />;
    }
    return sortDirection === 'asc'
      ? <ChevronUp className="w-5 h-5 text-primary font-bold" />
      : <ChevronDown className="w-5 h-5 text-primary font-bold" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Users className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header: Workflow Steps + Search/Filter Controls */}
      <div className="sticky top-0 z-20 bg-background">
        {/* Workflow Steps Header with Back Button and Title */}
        <WorkflowSteps 
          currentStep={1} 
          creditsLeft={totalAvailableCredits}
          pageTitle="Find Clients"
          onBackClick={handleBack}
        />

        {/* Search, Filter, and Sort Controls */}
        <div className="max-w-7xl mx-auto px-6 pb-3">
          {/* Error Message */}
          {error && (
            <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <Card className="shadow-sm">
            <CardContent className="py-2 space-y-2">
            <div className="flex gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, company, city, or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Client Count */}
              <div className="flex items-center px-3 bg-muted rounded-lg">
                <span className="font-semibold text-foreground">{processedClients.length}</span>
                <span className="text-muted-foreground ml-1">{processedClients.length === 1 ? 'Client' : 'Clients'}</span>
              </div>

              {/* Tags Dropdown */}
              {availableTags.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`gap-2 ${selectedTags.length > 0 ? 'border-primary bg-primary/10 text-primary' : ''}`}
                    >
                      <Tag className="w-4 h-4" />
                      Tags
                      {selectedTags.length > 0 && (
                        <Pill variant="tag" size="sm">
                          {selectedTags.length}
                        </Pill>
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
                            {isSelected && <Check className="w-4 h-4 text-primary" />}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                    {selectedTags.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setSelectedTags([])}
                          className="text-muted-foreground cursor-pointer"
                        >
                          Clear tag filters
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Added Today Toggle */}
              <Button
                variant={uploadedFilter === "today" ? "default" : "outline"}
                onClick={() => setUploadedFilter(uploadedFilter === "today" ? "all" : "today")}
                className={`gap-2 ${uploadedFilter === "today" ? 'bg-primary hover:bg-primary/90' : ''}`}
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
                    <Button className="gap-2 bg-foreground hover:bg-foreground/90 text-background">
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
          </CardContent>
        </Card>
        </div>
      </div>
      {/* END Sticky Header */}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        {/* Client Table */}
        <Card>
          <CardContent className="p-0">
            {/* Selection summary */}
            {selectedClientIds.length > 0 && (
              <div className="px-4 py-2 bg-muted/50 border-b flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{selectedClientIds.length}</span> selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClientIds([])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear selection
                </Button>
              </div>
            )}

            {processedClients.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
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
                    <TableHead className="w-10">
                      {processedClients.length > 0 && (
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all clients"
                        />
                      )}
                    </TableHead>
                    
                    <TableHead 
                      onClick={() => handleSort('fullName')}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>Full Name</span>
                        {getSortIcon('fullName')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      onClick={() => handleSort('company')}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>Company</span>
                        {getSortIcon('company')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      onClick={() => handleSort('city')}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>City</span>
                        {getSortIcon('city')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      onClick={() => handleSort('state')}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>State</span>
                        {getSortIcon('state')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      onClick={() => handleSort('notes')}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>Notes</span>
                        {getSortIcon('notes')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      onClick={() => handleSort('lastNote')}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Last Note</span>
                        {getSortIcon('lastNote')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      onClick={() => handleSort('tags')}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span>Tags</span>
                        {getSortIcon('tags')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      onClick={() => handleSort('favorite')}
                      className="w-10 cursor-pointer hover:text-primary transition-colors"
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
                    const isImported = client.source === 'csv_import';

                    return (
                      <TableRow
                        key={client.id}
                        onClick={() => handleToggleClient(client.id)}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleClient(client.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {client.fullName || 'Unnamed Client'}
                            </span>
                            {totalNotes === 0 && (
                              <Pill variant="warning" size="sm">
                                No notes sent
                              </Pill>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {client.company || <span className="text-muted-foreground/50">—</span>}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {client.city || <span className="text-muted-foreground/50">—</span>}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {client.state || <span className="text-muted-foreground/50">—</span>}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          <span className="font-medium">{totalNotes}</span>
                          <span className="text-muted-foreground/70 ml-1">note{totalNotes !== 1 ? 's' : ''}</span>
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          <span className="font-medium">{lastNoteDate}</span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            {isImported && (
                              <Pill variant="color1" size="sm">
                                imported
                              </Pill>
                            )}
                            {clientTags.length > 0 ? (
                              <>
                                {clientTags.slice(0, 2).map(tag => (
                                  <Pill 
                                    key={tag} 
                                    variant="tag"
                                    size="sm"
                                  >
                                    {tag}
                                  </Pill>
                                ))}
                                {clientTags.length > 2 && (
                                  <Pill variant="muted" size="sm">
                                    +{clientTags.length - 2}
                                  </Pill>
                                )}
                              </>
                            ) : (
                              !isImported && <span className="text-muted-foreground/50">—</span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleToggleFavorite(client.id, e)}
                            className={`w-10 ${isFavorited ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-yellow-500'}`}
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

      {/* Floating Action Bar */}
      {selectedClientIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-foreground text-background rounded-full px-6 py-3 shadow-xl flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm text-primary-foreground">
                {selectedClientIds.length}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{selectedClientIds.length} Client{selectedClientIds.length > 1 ? 's' : ''} Selected</span>
                <span className="text-xs text-muted-foreground">Choose your sending method</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-muted-foreground/30 pl-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setShowQuickSendModal(true)}
                      disabled={initializing}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 gap-2"
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

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleContinue}
                      disabled={initializing}
                      className="bg-background text-foreground hover:bg-muted rounded-full px-5 gap-2"
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