import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, Star, User, Users, Grid, ChevronDown, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TemplateFilterControls({ filters, setFilters, categories }) {
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
  const [openSubcategories, setOpenSubcategories] = useState({});
  const panelRef = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setCategoryPanelOpen(false);
      }
    };
    if (categoryPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoryPanelOpen]);

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleViewModeChange = (mode) => {
    setFilters(prev => ({ ...prev, viewMode: mode, categoryId: null }));
  };

  const handleCategorySelect = (categoryId) => {
    setFilters(prev => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? null : categoryId,
      viewMode: 'all'
    }));
    setCategoryPanelOpen(false);
  };

  const handleClearCategory = () => {
    setFilters(prev => ({ ...prev, categoryId: null }));
    setCategoryPanelOpen(false);
  };

  const clearFilters = () => {
    setFilters({ search: '', viewMode: 'all', categoryId: null });
  };

  const toggleSubcategory = (subcat) => {
    setOpenSubcategories(prev => ({
      ...prev,
      [subcat]: prev[subcat] === false ? true : false
    }));
  };

  const hasActiveFilters = filters.search || filters.viewMode !== 'all' || filters.categoryId;
  const isFavoritesActive = filters.viewMode === 'favorites';

  const viewModes = [
    { id: 'my', label: 'My Templates', icon: User },
    { id: 'org', label: 'Organization', icon: Users },
    { id: 'all', label: 'All', icon: Grid }
  ];

  // Group categories by subcategory, sorted by sortOrder within each group
  const groupedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return {};
    const groups = {};
    const sorted = [...categories].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
    for (const cat of sorted) {
      const subcat = cat.subcategory || 'General';
      if (!groups[subcat]) groups[subcat] = [];
      groups[subcat].push(cat);
    }
    return groups;
  }, [categories]);

  const subcategoryNames = Object.keys(groupedCategories);
  const selectedCategory = categories?.find(c => c.id === filters.categoryId);

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      {/* Search Bar and Category Button - Side by Side */}
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

        {/* Category Filter Button + Dropdown */}
        {categories && categories.length > 0 && (
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setCategoryPanelOpen(prev => !prev)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all h-10",
                filters.categoryId
                  ? "bg-brand-accent text-brand-accent-foreground border-brand-accent shadow-md"
                  : "bg-card text-muted-foreground border-border hover:bg-accent"
              )}
            >
              <Tag className="w-4 h-4 flex-shrink-0" />
              <span className="max-w-[140px] truncate">
                {selectedCategory ? selectedCategory.name : "Category"}
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 flex-shrink-0 transition-transform duration-200",
                categoryPanelOpen && "rotate-180"
              )} />
            </button>

            {/* Grouped Dropdown Panel */}
            {categoryPanelOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                {/* All Categories option */}
                <button
                  onClick={handleClearCategory}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-border",
                    !filters.categoryId
                      ? "bg-brand-accent/10 text-brand-accent"
                      : "hover:bg-accent text-foreground"
                  )}
                >
                  All Categories
                </button>

                {/* Accordion grouped by subcategory */}
                <div className="max-h-80 overflow-y-auto">
                  {subcategoryNames.map(subcat => {
                    // Default open unless user has explicitly closed it
                    // Subcategories start collapsed; user must click to expand
                    const isOpen = openSubcategories[subcat] === true;
                    return (
                      <div key={subcat} className="border-b border-border last:border-0">
                        {/* Subcategory header */}
                        <button
                          onClick={() => toggleSubcategory(subcat)}
                          className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-accent transition-colors"
                        >
                          {subcat}
                          <ChevronDown className={cn(
                            "w-3.5 h-3.5 transition-transform duration-200",
                            isOpen && "rotate-180"
                          )} />
                        </button>

                        {/* Category items */}
                        {isOpen && (
                          <div className="pb-1">
                            {groupedCategories[subcat].map(cat => (
                              <button
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat.id)}
                                className={cn(
                                  "w-full text-left px-6 py-1.5 text-sm transition-colors",
                                  filters.categoryId === cat.id
                                    ? "bg-brand-accent/10 text-brand-accent font-medium"
                                    : "text-foreground hover:bg-accent"
                                )}
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

        {/* Favorites Toggle Button */}
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

      {/* Active Filter Summary Pills */}
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