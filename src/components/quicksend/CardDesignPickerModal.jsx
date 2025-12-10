import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * CardDesignPickerModal Component
 * Modal dialog for selecting a card design
 * Reuses patterns from Pages-SelectDesign.jsx
 * 
 * @param {boolean} open - Whether modal is open
 * @param {Function} onOpenChange - Callback to toggle modal
 * @param {Array} designs - Array of CardDesign objects
 * @param {Array} categories - Array of CardDesignCategory objects (optional)
 * @param {string} selectedId - Currently selected design ID
 * @param {Function} onSelect - Callback when design is selected: (design) => void
 * @param {Array} favoriteIds - Array of favorite design IDs (optional)
 * @param {Function} onToggleFavorite - Callback to toggle favorite: (designId) => void (optional)
 */
export default function CardDesignPickerModal({ 
  open, 
  onOpenChange, 
  designs = [], 
  categories = [],
  selectedId,
  onSelect,
  favoriteIds = [],
  onToggleFavorite
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredDesignId, setHoveredDesignId] = useState(null);
  
  // Filter designs - reuses logic from SelectDesign
  const filteredDesigns = useMemo(() => {
    let filtered = designs;
    
    // Tab filter
    if (activeTab === 'favorites') {
      filtered = filtered.filter(d => favoriteIds.includes(d.id));
    }
    
    // Category filter
    if (selectedCategoryId !== 'all') {
      filtered = filtered.filter(d => 
        d.cardDesignCategoryIds?.includes(selectedCategoryId) || 
        d.categoryId === selectedCategoryId
      );
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.name?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [designs, activeTab, selectedCategoryId, searchQuery, favoriteIds]);

  const favoriteCount = designs.filter(d => favoriteIds.includes(d.id)).length;

  const handleSelect = (design) => {
    onSelect(design);
    onOpenChange(false);
    setSearchQuery('');
    setSelectedCategoryId('all');
    setActiveTab('all');
  };

  const handleToggleFavorite = (e, designId) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(designId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Card Design</DialogTitle>
          <DialogDescription>
            Choose the card artwork for this Quick Send Template
          </DialogDescription>
        </DialogHeader>
        
        {/* Search and Category Filter Row */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {categories.length > 0 && (
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {/* Tabs - reuses pattern from SelectDesign */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            All Designs ({designs.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'favorites'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Favorites ({favoriteCount})
          </button>
        </div>
        
        {/* Design Grid - reuses pattern from SelectDesign */}
        <div className="flex-1 overflow-y-auto mt-2">
          {filteredDesigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery || selectedCategoryId !== 'all' 
                  ? 'No designs match your filters' 
                  : activeTab === 'favorites'
                  ? 'No favorite designs yet'
                  : 'No card designs available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredDesigns.map(design => {
                const isSelected = design.id === selectedId;
                const isFavorite = favoriteIds.includes(design.id);
                const isHovered = hoveredDesignId === design.id;
                const displayImageUrl = isHovered 
                  ? (design.insideImageUrl || design.imageUrl)
                  : (design.outsideImageUrl || design.imageUrl);
                
                return (
                  <div
                    key={design.id}
                    onClick={() => handleSelect(design)}
                    onMouseEnter={() => setHoveredDesignId(design.id)}
                    onMouseLeave={() => setHoveredDesignId(null)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                      isSelected
                        ? 'ring-2 ring-orange-500 ring-offset-2'
                        : 'hover:shadow-lg'
                    }`}
                  >
                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    
                    {/* Favorite Toggle */}
                    {onToggleFavorite && (
                      <button
                        onClick={(e) => handleToggleFavorite(e, design.id)}
                        className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-full transition-colors"
                      >
                        <Star 
                          className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                        />
                      </button>
                    )}
                    
                    {/* Card Image */}
                    <img
                      src={displayImageUrl}
                      alt={design.name}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Card Name */}
                    <div className="p-3 bg-white">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {design.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isHovered ? 'Inside view' : 'Outside view'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}