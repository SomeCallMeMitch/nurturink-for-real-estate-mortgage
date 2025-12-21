import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pill, getPurposeVariant } from '@/components/ui/Pill';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Search, 
  Zap, 
  Star, 
  User, 
  Users, 
  Grid,
  Check,
  ArrowRight
} from 'lucide-react';
import { PURPOSE_CONFIG, PURPOSE_OPTIONS } from '@/components/utils/quickSendConstants';
import { getSelectionStyles } from '@/components/utils/selectionStyles';

/**
 * QuickSendPickerModal Component
 * Modal for selecting a Quick Send Template to use for sending cards
 * 
 * @param {boolean} open - Whether modal is open
 * @param {Function} onOpenChange - Toggle modal
 * @param {number} selectedClientCount - Number of clients selected (for display)
 * @param {Function} onSelectTemplate - Callback when template is selected and confirmed
 * @param {Object} user - Current user
 */
export default function QuickSendPickerModal({
  open,
  onOpenChange,
  selectedClientCount = 0,
  onSelectTemplate,
  user
}) {
  // Data state
  const [quickSendTemplates, setQuickSendTemplates] = useState([]);
  const [cardDesigns, setCardDesigns] = useState({});
  const [messageTemplates, setMessageTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('all');
  
  // Selection state
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const currentUser = user || await base44.auth.me();
      
      // Fetch Quick Send Templates
      const [personal, organization, platform] = await Promise.all([
        base44.entities.QuickSendTemplate.filter({
          createdByUserId: currentUser.id,
          type: 'personal',
          isActive: true
        }),
        base44.entities.QuickSendTemplate.filter({
          orgId: currentUser.orgId,
          type: 'organization',
          isActive: true
        }),
        base44.entities.QuickSendTemplate.filter({
          type: 'platform',
          isActive: true
        })
      ]);
      
      const allTemplates = [...personal, ...organization, ...platform];
      setQuickSendTemplates(allTemplates);
      
      // Fetch related card designs and message templates for display
      const cardDesignIds = [...new Set(allTemplates.map(t => t.cardDesignId).filter(Boolean))];
      const templateIds = [...new Set(allTemplates.map(t => t.templateId).filter(Boolean))];
      
      if (cardDesignIds.length > 0) {
        const designs = await base44.entities.CardDesign.filter({ id: { $in: cardDesignIds } });
        const designMap = {};
        designs.forEach(d => { designMap[d.id] = d; });
        setCardDesigns(designMap);
      }
      
      if (templateIds.length > 0) {
        const templates = await base44.entities.Template.filter({ id: { $in: templateIds } });
        const templateMap = {};
        templates.forEach(t => { templateMap[t.id] = t; });
        setMessageTemplates(templateMap);
      }
      
    } catch (err) {
      console.error('Failed to load Quick Send Templates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = quickSendTemplates;
    
    // View mode filter
    if (viewMode === 'my') {
      filtered = filtered.filter(t => t.createdByUserId === user?.id);
    } else if (viewMode === 'org') {
      filtered = filtered.filter(t => t.type === 'organization');
    } else if (viewMode === 'platform') {
      filtered = filtered.filter(t => t.type === 'platform');
    }
    
    // Purpose filter
    if (purposeFilter !== 'all') {
      filtered = filtered.filter(t => t.purpose === purposeFilter);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        const nameMatch = t.name?.toLowerCase().includes(query);
        const linkedTemplate = messageTemplates[t.templateId];
        const contentMatch = linkedTemplate?.content?.toLowerCase().includes(query);
        return nameMatch || contentMatch;
      });
    }
    
    // Sort: defaults first, then by name
    filtered.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
    
    return filtered;
  }, [quickSendTemplates, viewMode, purposeFilter, searchQuery, user, messageTemplates]);

  const selectedTemplate = quickSendTemplates.find(t => t.id === selectedTemplateId);

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onOpenChange(false);
      // Reset state
      setSelectedTemplateId(null);
      setSearchQuery('');
      setPurposeFilter('all');
      setViewMode('all');
    }
  };

  const viewModes = [
    { id: 'all', label: 'All', icon: Grid },
    { id: 'my', label: 'My', icon: User },
    { id: 'org', label: 'Org', icon: Users },
    { id: 'platform', label: 'Platform', icon: Star }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-accent" />
            Quick Send
          </DialogTitle>
          <DialogDescription>
            Select a pre-configured template to send to {selectedClientCount} client{selectedClientCount !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>
        
        {/* Search and Purpose Filter Row */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={purposeFilter} onValueChange={setPurposeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Purposes" />
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
        
        {/* View Mode Tabs */}
        <div className="flex gap-2">
          {viewModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {mode.label}
              </button>
            );
          })}
        </div>
        
        {/* Template List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || purposeFilter !== 'all'
                  ? 'No templates match your filters'
                  : viewMode === 'my' ? 'No personal templates' :
                    viewMode === 'org' ? 'No organization templates' :
                    viewMode === 'platform' ? 'No platform templates' :
                    'No Quick Send Templates available'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map(template => {
                const isSelected = template.id === selectedTemplateId;
                const purposeConfig = PURPOSE_CONFIG[template.purpose] || PURPOSE_CONFIG.custom;
                const PurposeIcon = purposeConfig.icon;
                const cardDesign = cardDesigns[template.cardDesignId];
                const messageTemplate = messageTemplates[template.templateId];
                
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-primary shadow-md'
                        : 'border-border hover:border-border hover:bg-muted'
                    }`}
                    style={getSelectionStyles(isSelected)}
                  >
                    <div className="flex gap-4">
                      {/* Card Thumbnail */}
                      <div className="w-16 h-20 flex-shrink-0 bg-muted rounded overflow-hidden">
                        {cardDesign ? (
                          <img
                            src={cardDesign.outsideImageUrl || cardDesign.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Zap className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Template Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-foreground">{template.name}</h4>
                          {isSelected && (
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                        
                        {/* Pills */}
                        <div className="flex gap-2 mt-1 mb-2">
                          <Pill variant={getPurposeVariant(template.purpose)} size="sm" icon={PurposeIcon}>
                            {purposeConfig.label}
                          </Pill>
                          {template.isDefault && (
                            <Pill variant="warning" size="sm">
                              Default
                            </Pill>
                          )}
                        </div>
                        
                        {/* Message Preview */}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {messageTemplate?.content || template.previewSnippet || 'No message content'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTemplateId}
            className="gap-2"
          >
            Continue with Template
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}