
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } => '@/utils';
import TemplateFilterControls from '@/components/templates/TemplateFilterControls';
import TemplateGrid from '@/components/templates/TemplateGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TemplatesPage() {
    const navigate = useNavigate();
    const [allTemplates, setAllTemplates] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ 
      search: '', 
      viewMode: 'all', // favorites, my, org, all
      categoryId: null 
    });

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);

            const [personal, organization, platform, categoryResponse] = await Promise.all([
                // Personal templates
                base44.entities.Template.filter({ 
                    createdByUserId: currentUser.id, 
                    type: 'personal' 
                }),
                
                // Organization templates
                base44.entities.Template.filter({ 
                    orgId: currentUser.orgId, 
                    type: 'organization',
                    status: 'approved'
                }),
                
                // Platform templates
                base44.entities.Template.filter({ 
                    type: 'platform',
                    isDefault: true, 
                    status: 'approved' 
                }),
                
                // Load categories via backend function
                base44.functions.invoke('getTemplateCategories')
            ]);

            // Combine all templates into single array
            const combined = [...personal, ...organization, ...platform];

            console.log('📊 Templates loaded:', {
                personal: personal.length,
                organization: organization.length,
                platform: platform.length,
                total: combined.length
            });

            setAllTemplates(combined);
            setAllCategories(categoryResponse.data);
        } catch (err) {
            console.error("Failed to fetch templates:", err);
            setError("Could not load templates. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFavoriteToggle = async (templateId) => {
        if (!user) return;

        try {
            const currentFavorites = user.favoriteTemplateIds || [];
            const isFavorited = currentFavorites.includes(templateId);
            
            const newFavoriteTemplateIds = isFavorited
                ? currentFavorites.filter(id => id !== templateId)
                : [...currentFavorites, templateId];

            await base44.auth.updateMe({ favoriteTemplateIds: newFavoriteTemplateIds });
            
            setUser(prev => ({
                ...prev,
                favoriteTemplateIds: newFavoriteTemplateIds
            }));
        } catch (error) {
            console.error("Failed to update favorite status:", error);
        }
    };
    
    const handleTemplateDeleted = (deletedTemplateId) => {
        setAllTemplates(prev => prev.filter(t => t.id !== deletedTemplateId));
    };

    // Apply all filters
    const filteredTemplates = useMemo(() => {
      let filtered = allTemplates;

      // View mode filter
      if (filters.viewMode === 'favorites') {
        const favoriteIds = user?.favoriteTemplateIds || [];
        filtered = filtered.filter(t => favoriteIds.includes(t.id));
      } else if (filters.viewMode === 'my') {
        filtered = filtered.filter(t => t.createdByUserId === user?.id);
      } else if (filters.viewMode === 'org') {
        filtered = filtered.filter(t => t.type === 'organization');
      }

      // Category filter
      if (filters.categoryId) {
        filtered = filtered.filter(t => 
          t.templateCategoryIds && t.templateCategoryIds.includes(filters.categoryId)
        );
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.name.toLowerCase().includes(searchLower) ||
          t.content.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    }, [allTemplates, filters, user]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
                    <p className="mt-1 text-gray-600">Browse, create, and manage your message templates.</p>
                </div>
                <Button
                    onClick={() => navigate(createPageUrl('TemplatePreview?id=new'))}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Template
                </Button>
            </div>
            
            <TemplateFilterControls 
                filters={filters}
                setFilters={setFilters}
                categories={allCategories}
            />

            {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                </div>
            )}

            {!isLoading && !error && (
                <TemplateGrid
                    title={`Templates (${filteredTemplates.length})`}
                    templates={filteredTemplates}
                    categories={allCategories}
                    user={user}
                    onFavoriteToggle={handleFavoriteToggle}
                    onTemplateDeleted={handleTemplateDeleted}
                    emptyMessage="No templates match your filters. Try adjusting your search or filters."
                />
            )}
        </div>
    );
}
