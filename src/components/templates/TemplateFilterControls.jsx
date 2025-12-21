import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Star, User, Users, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TemplateFilterControls({ filters, setFilters, categories }) {
  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleViewModeChange = (mode) => {
    setFilters(prev => ({ ...prev, viewMode: mode, categoryId: null }));
  };

  const handleCategoryChange = (categoryId) => {
    setFilters(prev => ({ 
      ...prev, 
      categoryId: categoryId === 'all' ? null : categoryId,
      viewMode: 'all'
    }));
  };

  const clearFilters = () => {
    setFilters({ search: '', viewMode: 'all', categoryId: null });
  };

  const hasActiveFilters = filters.search || filters.viewMode !== 'all' || filters.categoryId;

  // Favorites is now a separate toggle button, not part of view modes
  const viewModes = [
    { id: 'my', label: 'My Templates', icon: User },
    { id: 'org', label: 'Organization', icon: Users },
    { id: 'all', label: 'All', icon: Grid }
  ];

  const isFavoritesActive = filters.viewMode === 'favorites';

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      {/* Search Bar and Category Dropdown - Side by Side */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="w-64">
            <Select
              value={filters.categoryId || 'all'}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="gap-2 flex-shrink-0"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* View Mode Tabs + Favorites Toggle */}
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        {viewModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = filters.viewMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => handleViewModeChange(mode.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-accent text-brand-accent-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {mode.label}
            </button>
          );
        })}

        {/* Favorites Toggle Button - Separate from view modes */}
        <button
          onClick={() => handleViewModeChange(isFavoritesActive ? 'all' : 'favorites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isFavoritesActive
              ? 'bg-warning text-warning-foreground shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavoritesActive ? 'fill-current' : ''}`} />
          Favorites
        </button>
      </div>

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {filters.viewMode !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pill-warning-bg text-pill-warning-fg rounded-full text-sm">
              {filters.viewMode === 'favorites' ? 'Favorites' : viewModes.find(m => m.id === filters.viewMode)?.label}
            </span>
          )}
          {filters.categoryId && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pill-color2-bg text-pill-color2-fg rounded-full text-sm">
              {categories.find(c => c.id === filters.categoryId)?.name}
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pill-color1-bg text-pill-color1-fg rounded-full text-sm">
              Search: "{filters.search}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}