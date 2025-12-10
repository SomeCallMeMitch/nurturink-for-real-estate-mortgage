import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Star, User, Users, Grid, Check, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * TemplatePickerModal Component
 * Modal dialog for selecting a message template
 * Reuses patterns from TemplateLibrary component
 * 
 * @param {boolean} open - Whether modal is open
 * @param {Function} onOpenChange - Callback to toggle modal
 * @param {Array} templates - Array of template objects
 * @param {string} selectedId - Currently selected template ID
 * @param {Function} onSelect - Callback when template is selected: (template) => void
 * @param {Object} user - Current user for filtering
 */
export default function TemplatePickerModal({ 
  open, 
  onOpenChange, 
  templates = [], 
  selectedId,
  onSelect,
  user 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  
  const favoriteIds = user?.favoriteTemplateIds || [];
  
  // Filter templates - reuses logic from TemplateLibrary
  const filteredTemplates = useMemo(() => {
    let filtered = templates;
    
    if (activeCategory === 'favorites') {
      filtered = filtered.filter(t => favoriteIds.includes(t.id));
    } else if (activeCategory === 'my') {
      filtered = filtered.filter(t => t.createdByUserId === user?.id);
    } else if (activeCategory === 'org') {
      filtered = filtered.filter(t => t.type === 'organization');
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name?.toLowerCase().includes(query) ||
        t.content?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [templates, activeCategory, searchQuery, favoriteIds, user]);

  const categories = [
    { id: 'all', label: 'All', icon: Grid },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'my', label: 'My', icon: User },
    { id: 'org', label: 'Org', icon: Users },
  ];

  const handleSelect = (template) => {
    onSelect(template);
    onOpenChange(false);
    setSearchQuery('');
    setActiveCategory('all');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Message Template</DialogTitle>
          <DialogDescription>
            Choose the message content for this Quick Send Template
          </DialogDescription>
        </DialogHeader>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Category Tabs - reuses pattern from TemplateLibrary */}
        <div className="flex gap-1 border-b border-gray-200">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>
        
        {/* Template List */}
        <div className="flex-1 overflow-y-auto space-y-2 mt-2">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {searchQuery ? 'No templates match your search' : 
                 activeCategory === 'favorites' ? 'No favorite templates' :
                 activeCategory === 'my' ? 'No personal templates' :
                 activeCategory === 'org' ? 'No organization templates' :
                 'No templates available'}
              </p>
            </div>
          ) : (
            filteredTemplates.map(template => {
              const isSelected = template.id === selectedId;
              const isHovered = hoveredTemplate === template.id;
              
              return (
                <div
                  key={template.id}
                  className="relative"
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                >
                  <button
                    onClick={() => handleSelect(template)}
                    className={`w-full p-4 border rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {template.content}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  
                  {/* Hover tooltip - full content preview */}
                  {isHovered && template.content?.length > 100 && (
                    <div className="absolute left-full ml-2 top-0 z-50 animate-in fade-in-0 slide-in-from-left-2 duration-200 pointer-events-none">
                      <div className="bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 w-80">
                        <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
                          {template.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}