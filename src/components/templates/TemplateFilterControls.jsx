import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TemplateFilterControls({ filters, setFilters, categories }) {
  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFilters(prev => {
      const currentCategories = prev.categoryIds || [];
      const newCategories = currentCategories.includes(categoryId)
        ? currentCategories.filter(id => id !== categoryId)
        : [...currentCategories, categoryId];
      
      return { ...prev, categoryIds: newCategories };
    });
  };

  const clearFilters = () => {
    setFilters({ search: '', categoryIds: [] });
  };

  const hasActiveFilters = filters.search || (filters.categoryIds && filters.categoryIds.length > 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <Select
            value={filters.categoryIds?.[0] || ''}
            onValueChange={(value) => {
              if (value) {
                handleCategoryToggle(value);
              }
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Category Pills */}
      {filters.categoryIds && filters.categoryIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.categoryIds.map(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            if (!category) return null;
            
            return (
              <button
                key={categoryId}
                onClick={() => handleCategoryToggle(categoryId)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
              >
                {category.name}
                <X className="w-3 h-3" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}