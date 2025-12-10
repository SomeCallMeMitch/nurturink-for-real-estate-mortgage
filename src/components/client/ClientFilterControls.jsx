import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Star,
  Calendar,
  Tag,
  RefreshCw,
  X,
  ChevronDown,
  Check,
  Upload,
  Plus
} from 'lucide-react';

/**
 * ClientFilterControls Component
 * Search, filter, and action controls for client list
 * 
 * @param {string} searchQuery - Current search query
 * @param {Function} setSearchQuery - Update search query
 * @param {number} clientCount - Number of filtered clients
 * @param {Array} availableTags - Available tag options
 * @param {Array} selectedTags - Currently selected tags
 * @param {Function} onToggleTag - Toggle tag selection
 * @param {Function} onClearTags - Clear all tag filters
 * @param {string} uploadedFilter - Date filter value ('all', 'today', '7days', '30days')
 * @param {Function} setUploadedFilter - Update date filter
 * @param {boolean} showFavoritesOnly - Favorites filter state
 * @param {Function} setShowFavoritesOnly - Toggle favorites filter
 * @param {boolean} loading - Loading state
 * @param {Function} onRefresh - Refresh data callback
 * @param {Function} onAddClient - Open add client modal
 * @param {Function} onImportCSV - Open import CSV modal
 * @param {boolean} hasActiveFilters - Whether any filters are active
 * @param {Function} onClearFilters - Clear all filters
 * @param {string} sortColumn - Current sort column (for display)
 */
export default function ClientFilterControls({
  searchQuery,
  setSearchQuery,
  clientCount,
  availableTags = [],
  selectedTags = [],
  onToggleTag,
  onClearTags,
  uploadedFilter,
  setUploadedFilter,
  showFavoritesOnly,
  setShowFavoritesOnly,
  loading,
  onRefresh,
  onAddClient,
  onImportCSV,
  hasActiveFilters,
  onClearFilters,
  sortColumn
}) {
  return (
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

          {/* Client Count */}
          <div className="flex items-center px-3 bg-gray-100 rounded-lg">
            <span className="font-semibold text-gray-900">{clientCount}</span>
            <span className="text-gray-500 ml-1">{clientCount === 1 ? 'Client' : 'Clients'}</span>
          </div>

          {/* Tags Dropdown */}
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
                      onClick={() => onToggleTag(tag)}
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
                      onClick={onClearTags}
                      className="text-gray-500 cursor-pointer"
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
            onClick={onRefresh}
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
                <DropdownMenuItem onClick={onAddClient}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onImportCSV}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 2: Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            
            {searchQuery && (
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                Search: {searchQuery}
              </Badge>
            )}
            
            {showFavoritesOnly && (
              <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                Favorites only
              </Badge>
            )}
            
            {selectedTags.map(tag => (
              <Badge key={tag} variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                Tag: {tag}
              </Badge>
            ))}
            
            {uploadedFilter !== 'all' && (
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                {uploadedFilter === 'today' ? 'Added Today' :
                 uploadedFilter === '7days' ? 'Last 7 Days' :
                 uploadedFilter === '30days' ? 'Last 30 Days' :
                 'Manual Entries'}
              </Badge>
            )}
            
            {sortColumn !== 'no_notes_first' && (
              <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700">
                Sorted by: {sortColumn}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="ml-auto gap-1"
            >
              <X className="w-3 h-3" />
              Clear All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}