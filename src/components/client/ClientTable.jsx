import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Star,
  Calendar,
  Mail,
  Tag,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

/**
 * ClientTable Component
 * Sortable table display for client list with selection
 * 
 * @param {Array} clients - Filtered/sorted client list
 * @param {Array} selectedClientIds - Currently selected client IDs
 * @param {Set} favoriteClientIds - Set of favorited client IDs
 * @param {Function} onToggleClient - Toggle single client selection
 * @param {Function} onSelectAll - Select/deselect all clients
 * @param {Function} onToggleFavorite - Toggle client favorite status
 * @param {string} sortColumn - Current sort column
 * @param {string} sortDirection - 'asc' or 'desc'
 * @param {Function} onSort - Handle sort column click
 * @param {boolean} hasActiveFilters - Whether filters are active (for empty state)
 * @param {Function} onClearFilters - Clear filters callback
 */
export default function ClientTable({
  clients = [],
  selectedClientIds = [],
  favoriteClientIds = new Set(),
  onToggleClient,
  onSelectAll,
  onToggleFavorite,
  sortColumn,
  sortDirection,
  onSort,
  hasActiveFilters,
  onClearFilters
}) {
  // Check if all clients are selected
  const allSelected = clients.length > 0 &&
    clients.every(client => selectedClientIds.includes(client.id));

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
      ? <ChevronUp className="w-5 h-5 text-amber-700 font-bold" />
      : <ChevronDown className="w-5 h-5 text-amber-700 font-bold" />;
  };

  // Sortable column header component
  const SortableHeader = ({ column, children, icon: Icon }) => (
    <TableHead 
      onClick={() => onSort(column)}
      className="cursor-pointer hover:text-amber-700 transition-colors group"
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
        {getSortIcon(column)}
      </div>
    </TableHead>
  );

  return (
    <Card className="mt-3">
      <CardHeader className="pb-1 pt-2">
        {selectedClientIds.length > 0 && (
          <Badge variant="secondary" className="w-fit">
            {selectedClientIds.length} selected
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">
              {hasActiveFilters ? 'No clients match your filters' : 'No clients found'}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
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
                {/* Select All Checkbox */}
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all clients"
                  />
                </TableHead>
                
                <SortableHeader column="fullName">Full Name</SortableHeader>
                <SortableHeader column="company">Company</SortableHeader>
                <SortableHeader column="city">City</SortableHeader>
                <SortableHeader column="state">State</SortableHeader>
                <SortableHeader column="notes" icon={Mail}>Notes</SortableHeader>
                <SortableHeader column="lastNote" icon={Calendar}>Last Note</SortableHeader>
                <SortableHeader column="tags" icon={Tag}>Tags</SortableHeader>
                
                <TableHead 
                  onClick={() => onSort('favorite')}
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
              {clients.map((client) => {
                const isSelected = selectedClientIds.includes(client.id);
                const isFavorited = favoriteClientIds.has(client.id);
                const totalNotes = client.totalNotesSent || 0;
                const lastNoteDate = formatDate(client.lastNoteSentDate);
                const clientTags = client.tags || [];

                return (
                  <TableRow
                    key={client.id}
                    onClick={() => onToggleClient(client.id)}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Checkbox */}
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleClient(client.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>

                    {/* Full Name */}
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
                      {client.company || '—'}
                    </TableCell>

                    {/* City */}
                    <TableCell className="text-gray-600">
                      {client.city || '—'}
                    </TableCell>

                    {/* State */}
                    <TableCell className="text-gray-600">
                      {client.state || '—'}
                    </TableCell>

                    {/* Notes Count */}
                    <TableCell>
                      <span className={`font-medium ${totalNotes > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {totalNotes}
                      </span>
                    </TableCell>

                    {/* Last Note Date */}
                    <TableCell className="text-sm text-gray-600">
                      {lastNoteDate}
                    </TableCell>

                    {/* Tags */}
                    <TableCell>
                      {clientTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {clientTags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {clientTags.length > 2 && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              +{clientTags.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Favorite Star */}
                    <TableCell>
                      <button
                        onClick={(e) => onToggleFavorite(client.id, e)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            isFavorited 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300 hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}