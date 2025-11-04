import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, Star, Search, User, Users, Grid } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * TemplateLibrary Component
 * Displays a searchable, categorized list of message templates with favorites
 * 
 * @param {Array} templates - Array of template objects
 * @param {Function} onTemplateSelect - Callback when template is clicked: (template) => void
 * @param {Object} user - Current user object for filtering
 */
export default function TemplateLibrary({ templates, onTemplateSelect, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(user?.favoriteTemplateIds || []);
  
  // Filter templates by category and search
  const filteredTemplates = useMemo(() => {
    let filtered = templates || [];
    
    // Category filtering
    if (activeCategory === 'favorites') {
      filtered = filtered.filter(t => favoriteIds.includes(t.id));
    } else if (activeCategory === 'my') {
      filtered = filtered.filter(t => t.createdByUserId === user?.id);
    } else if (activeCategory === 'org') {
      filtered = filtered.filter(t => t.type === 'organization');
    }
    // 'all' shows everything
    
    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [templates, activeCategory, searchQuery, favoriteIds, user]);
  
  // Toggle favorite status
  const handleToggleFavorite = async (e, templateId) => {
    e.stopPropagation(); // Prevent template selection
    
    const newFavorites = favoriteIds.includes(templateId)
      ? favoriteIds.filter(id => id !== templateId)
      : [...favoriteIds, templateId];
    
    setFavoriteIds(newFavorites);
    
    // Update user's favorite templates
    try {
      await base44.auth.updateMe({
        favoriteTemplateIds: newFavorites
      });
    } catch (error) {
      console.error('Failed to update favorites:', error);
      // Revert on error
      setFavoriteIds(favoriteIds);
    }
  };
  
  const categories = [
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'my', label: 'My', icon: User },
    { id: 'org', label: 'Org', icon: Users },
    { id: 'all', label: 'All', icon: Grid }
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Template Library
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col overflow-hidden space-y-3">
        {/* Search Bar */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-1 border-b border-gray-200 flex-shrink-0">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" fill={isActive ? "currentColor" : "none"} />
                {category.label}
              </button>
            );
          })}
        </div>
        
        {/* Template List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {searchQuery ? 'No templates match your search' : 
                 activeCategory === 'favorites' ? 'No favorite templates yet' :
                 activeCategory === 'my' ? 'No personal templates yet' :
                 activeCategory === 'org' ? 'No organization templates yet' :
                 'No templates available'}
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
                      className="w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-gray-900 group-hover:text-indigo-700 text-sm flex-1">
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
                                : 'text-gray-400 hover:text-yellow-400'
                            }`}
                          />
                        </button>
                      </div>
                    </button>
                    
                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className="absolute left-full ml-2 top-0 z-50 animate-in fade-in-0 slide-in-from-left-2 duration-200">
                        <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4" style={{ width: '320px' }}>
                          {/* Arrow */}
                          <div className="absolute right-full top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-300" />
                          <div className="absolute right-full top-4 ml-0.5 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white" />
                          
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
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