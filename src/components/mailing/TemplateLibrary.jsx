import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TemplateFilterControls from '@/components/templates/TemplateFilterControls';

/**
 * TemplateLibrary Component
 * Displays a searchable, category-filtered list of message templates with favorites.
 * Uses TemplateFilterControls for search, category, and view mode filtering.
 *
 * @param {Array} templates - Array of template objects
 * @param {Array} categories - Array of TemplateCategory objects (for dropdown)
 * @param {Function} onTemplateSelect - Callback when template is clicked: (template) => void
 * @param {Object} user - Current user object for filtering
 */
export default function TemplateLibrary({ templates, categories = [], onTemplateSelect, user }) {
  const [filters, setFilters] = useState({
    search: '',
    viewMode: 'all',
    categoryId: null
  });
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(user?.favoriteTemplateIds || []);

  // Filter templates using the shared filter shape from TemplateFilterControls
  const filteredTemplates = useMemo(() => {
    let filtered = templates || [];

    // View mode filtering
    if (filters.viewMode === 'favorites') {
      filtered = filtered.filter(t => favoriteIds.includes(t.id));
    } else if (filters.viewMode === 'my') {
      filtered = filtered.filter(t => t.createdByUserId === user?.id);
    } else if (filters.viewMode === 'org') {
      filtered = filtered.filter(t => t.type === 'organization');
    }
    // 'all' shows everything

    // Category filtering
    if (filters.categoryId) {
      filtered = filtered.filter(t => t.templateCategoryIds?.includes(filters.categoryId));
    }

    // Search filtering
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [templates, filters, favoriteIds, user, categories]);

  // Toggle favorite status
  const handleToggleFavorite = async (e, templateId) => {
    e.stopPropagation();

    const newFavorites = favoriteIds.includes(templateId)
      ? favoriteIds.filter(id => id !== templateId)
      : [...favoriteIds, templateId];

    setFavoriteIds(newFavorites);

    try {
      await base44.auth.updateMe({ favoriteTemplateIds: newFavorites });
    } catch (error) {
      console.error('Failed to update favorites:', error);
      setFavoriteIds(favoriteIds);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Template Library
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden space-y-3">
        {/* Filter Controls: search + category dropdown + view mode tabs */}
        <div className="flex-shrink-0">
          <TemplateFilterControls
            filters={filters}
            setFilters={setFilters}
            categories={categories}
          />
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {filters.search
                  ? 'No templates match your search'
                  : filters.viewMode === 'favorites'
                  ? 'No favorite templates yet'
                  : filters.viewMode === 'my'
                  ? 'No personal templates yet'
                  : filters.viewMode === 'org'
                  ? 'No organization templates yet'
                  : filters.categoryId
                  ? 'No templates in this category'
                  : 'No templates available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map((template) => {
                const isFavorite = favoriteIds.includes(template.id);
                const isHovered = hoveredTemplate === template.id;

                return (
                  <div
                    key={template.id}
                    className="relative"
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                  >
                    <button
                      onClick={() => onTemplateSelect(template)}
                      className="w-full text-left p-3 rounded-lg border-2 border-border hover:border-primary hover:bg-accent transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground group-hover:text-primary text-sm flex-1">
                          {template.name}
                        </h4>
                        <button
                          onClick={(e) => handleToggleFavorite(e, template.id)}
                          className="flex-shrink-0 p-1 hover:bg-white rounded transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFavorite
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground hover:text-yellow-400'
                            }`}
                          />
                        </button>
                      </div>
                    </button>

                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className="absolute left-full ml-2 top-0 z-50 animate-in fade-in-0 slide-in-from-left-2 duration-200">
                        <div className="bg-card border-2 border-border rounded-lg shadow-xl p-4" style={{ width: '320px' }}>
                          <div className="absolute right-full top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-300" />
                          <div className="absolute right-full top-4 ml-0.5 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white" />
                          <h4 className="font-semibold text-foreground mb-2">{template.name}</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {template.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}