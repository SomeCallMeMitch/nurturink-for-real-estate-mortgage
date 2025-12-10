import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, X, Star, User, Users, Grid } from 'lucide-react';
import { PURPOSE_OPTIONS } from '@/components/utils/quickSendConstants';

/**
 * QuickSendFilterControls Component
 * Filter controls for Quick Send Templates list page
 * Reuses patterns from TemplateFilterControls
 * 
 * @param {Object} filters - Current filter state { search, viewMode, purpose }
 * @param {Function} setFilters - Callback to update filters
 */
export default function QuickSendFilterControls({ filters, setFilters }) {
  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleViewModeChange = (mode) => {
    setFilters(prev => ({ ...prev, viewMode: mode }));
  };

  const handlePurposeChange = (purpose) => {
    setFilters(prev => ({ ...prev, purpose: purpose }));
  };

  const clearFilters = () => {
    setFilters({ search: '', viewMode: 'all', purpose: 'all' });
  };

  const hasActiveFilters = filters.search || filters.viewMode !== 'all' || filters.purpose !== 'all';

  const viewModes = [
    { id: 'all', label: 'All', icon: Grid },
    { id: 'my', label: 'My Templates', icon: User },
    { id: 'org', label: 'Organization', icon: Users },
    { id: 'platform', label: 'Platform', icon: Star }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Search Bar and Purpose Dropdown - Side by Side */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search Quick Send Templates..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* Purpose Filter */}
        <div className="w-48">
          <Select value={filters.purpose} onValueChange={handlePurposeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Purposes</SelectItem>
              {PURPOSE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2 flex-shrink-0">
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
        {viewModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = filters.viewMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => handleViewModeChange(mode.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {filters.viewMode !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
              {viewModes.find(m => m.id === filters.viewMode)?.label}
            </span>
          )}
          {filters.purpose !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {PURPOSE_OPTIONS.find(p => p.value === filters.purpose)?.label}
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Search: "{filters.search}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}