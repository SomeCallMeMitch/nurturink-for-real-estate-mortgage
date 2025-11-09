import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  Star, 
  Tag, 
  RefreshCw, 
  X,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Calendar,
  Mail
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminClients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [clients, setClients] = useState([]);
  const [favoriteClientIds, setFavoriteClientIds] = useState(new Set());
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, client: null });
  const [deleting, setDeleting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
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
      
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
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

  // Get sort icon for column header
  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="w-5 h-5 opacity-30 group-hover:opacity-60 transition-opacity" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-5 h-5 text-indigo-600 font-bold" />
      : <ChevronDown className="w-5 h-5 text-indigo-600 font-bold" />;
  };

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let result = [...clients];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(client =>
        (client.fullName || '').toLowerCase().includes(query) ||
        (client.company || '').toLowerCase().includes(query) ||
        (client.email || '').toLowerCase().includes(query) ||
        (client.phone || '').toLowerCase().includes(query) ||
        (client.city || '').toLowerCase().includes(query) ||
        (client.state || '').toLowerCase().includes(query)
      );
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
    
    result.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortColumn) {
        case 'fullName':
        case 'company':
        case 'email':
        case 'phone':
        case 'city':
        case 'state':
          aVal = (a[sortColumn] || '').toLowerCase();
          bVal = (b[sortColumn] || '').toLowerCase();
          return direction * aVal.localeCompare(bVal);
          
        case 'notes':
          aVal = a.totalNotesSent || 0;
          bVal = b.totalNotesSent || 0;
          return direction * (aVal - bVal);
          
        case 'lastNote':
          aVal = a.lastNoteSentDate ? new Date(a.lastNoteSentDate) : new Date(0);
          bVal = b.lastNoteSentDate ? new Date(b.lastNoteSentDate) : new Date(0);
          return direction * (aVal - bVal);
          
        default:
          return 0;
      }
    });
    
    return result;
  }, [clients, searchQuery, sortColumn, sortDirection, showFavoritesOnly, selectedTags, favoriteClientIds]);

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
    setSortColumn('fullName');
    setSortDirection('asc');
    setShowFavoritesOnly(false);
    setSelectedTags([]);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || 
                          showFavoritesOnly || 
                          selectedTags.length > 0 || 
                          sortColumn !== 'fullName';

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

  const handleDelete = async () => {
    if (!deleteDialog.client) return;
    
    try {
      setDeleting(true);
      await base44.entities.Client.delete(deleteDialog.client.id);
      setClients(prev => prev.filter(c => c.id !== deleteDialog.client.id));
      setDeleteDialog({ open: false, client: null });
      
      toast({
        title: 'Client Deleted',
        description: 'Client has been removed successfully',
        className: 'bg-green-50 border-green-200 text-green-900'
      });
    } catch (error) {
      console.error('Failed to delete client:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete client. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showFavoritesOnly, selectedTags, sortColumn, sortDirection]);

  const SortableHeader = ({ label, sortKey, icon }) => (
    <TableHead
      className="cursor-pointer hover:bg-gray-100 select-none transition-colors"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2 group">
        {icon && icon}
        <span>{label}</span>
        {getSortIcon(sortKey)}
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-600 mt-1">
                Manage your client database
              </p>
            </div>
            <Button
              onClick={() => navigate(createPageUrl('AdminClientEdit?id=new'))}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
          </div>

          {/* Search, Filter, and Sort Controls */}
          <Card className="mb-6">
            <CardContent className="pt-6 space-y-4">
              {/* Row 1: Search, Favorites, Refresh */}
              <div className="flex gap-3">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, company, email, phone, city, or state..."
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
                  onClick={loadClients}
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
                    {sortColumn !== 'fullName' && <Badge variant="secondary">Sorted by {sortColumn}</Badge>}
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
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredClients.length} {filteredClients.length === 1 ? 'Client' : 'Clients'}
              {hasActiveFilters && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (filtered from {clients.length} total)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentClients.length === 0 ? (
              <div className="text-center py-12">
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
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader label="Full Name" sortKey="fullName" />
                        <SortableHeader label="Company" sortKey="company" />
                        <SortableHeader label="City" sortKey="city" />
                        <SortableHeader label="State" sortKey="state" />
                        <SortableHeader label="Notes" sortKey="notes" icon={<Mail className="w-4 h-4" />} />
                        <SortableHeader label="Last Note" sortKey="lastNote" icon={<Calendar className="w-4 h-4" />} />
                        <TableHead>Tags</TableHead>
                        <TableHead>Favorite</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentClients.map((client) => {
                        const isFavorited = favoriteClientIds.has(client.id);
                        const totalNotes = client.totalNotesSent || 0;
                        const lastNoteDate = formatDate(client.lastNoteSentDate);
                        
                        return (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {client.fullName || 'Unnamed Client'}
                                {totalNotes === 0 && (
                                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                    No notes
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{client.company || '-'}</TableCell>
                            <TableCell>{client.city || '-'}</TableCell>
                            <TableCell>{client.state || '-'}</TableCell>
                            <TableCell>
                              <span className="font-medium">{totalNotes}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{lastNoteDate}</span>
                            </TableCell>
                            <TableCell>
                              {client.tags && client.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {client.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {client.tags.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{client.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleToggleFavorite(client.id, e)}
                                className={`${isFavorited ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
                              >
                                <Star className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(createPageUrl(`AdminClientEdit?id=${client.id}`))}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteDialog({ open: true, client })}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredClients.length)} of {filteredClients.length} clients
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, client: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.client?.fullName}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}