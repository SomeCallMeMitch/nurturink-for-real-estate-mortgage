import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TemplateFilterControls from '@/components/templates/TemplateFilterControls';
import TemplateGrid from '@/components/templates/TemplateGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function TemplatesPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [allTemplates, setAllTemplates] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ 
      search: '', 
      viewMode: 'all',
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
                    type: 'organization'
                }),
                
                // Platform templates — seeder creates them with orgId set to user's org
                base44.entities.Template.filter({ 
                    orgId: currentUser.orgId,
                    type: 'platform',
                    status: 'approved' 
                }),
                
                // Load categories via backend function
                base44.functions.invoke('getTemplateCategories')
            ]);

            // Combine all templates into single array
            const combined = [...personal, ...organization, ...platform];

            console.log('[DIAG] Templates loaded:', {
                personal: personal.length,
                organization: organization.length,
                platform: platform.length,
                total: combined.length
            });

            // DIAGNOSTIC: Check orgId on platform templates
            console.log('[DIAG] First 3 platform templates (orgId check):',
                platform.slice(0, 3).map(t => ({
                    id: t.id,
                    name: t.name,
                    orgId: t.orgId,
                    type: t.type,
                    templateCategoryIds: t.templateCategoryIds
                }))
            );

            // DIAGNOSTIC: Check what categories came back
            const cats = categoryResponse.data || [];
            console.log('[DIAG] Categories returned by getTemplateCategories:', cats.length);
            console.log('[DIAG] Category list:', cats.map(c => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                orgId: c.orgId
            })));

            setAllTemplates(combined);
            setAllCategories(cats);
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

            toast({
                title: isFavorited ? "Removed from favorites" : "Added to favorites",
                description: isFavorited 
                    ? "Template removed from your favorites" 
                    : "Template added to your favorites",
                duration: 3000,
                className: "bg-green-50 border-green-200 text-green-900",
            });
        } catch (error) {
            console.error("Failed to update favorite status:", error);
            toast({
                title: "Error",
                description: "Failed to update favorite status. Please try again.",
                variant: "destructive",
                duration: 5000,
            });
        }
    };

    const handleDuplicateTemplate = async (template) => {
        if (!user) return;

        // Navigate to EditTemplate with duplicate parameter
        // Template data will be loaded there and user must save to create
        navigate(createPageUrl(`EditTemplate?id=new&duplicate=${template.id}`));
    };

    const handleDeleteTemplate = async (templateId) => {
        try {
            await base44.entities.Template.delete(templateId);

            // Remove from local state
            setAllTemplates(prev => prev.filter(t => t.id !== templateId));

            // Remove from user favorites if it was favorited
            if (user?.favoriteTemplateIds?.includes(templateId)) {
                const newFavorites = user.favoriteTemplateIds.filter(id => id !== templateId);
                await base44.auth.updateMe({ favoriteTemplateIds: newFavorites });
                setUser(prev => ({
                    ...prev,
                    favoriteTemplateIds: newFavorites
                }));
            }

            toast({
                title: "Template deleted",
                description: "The template has been permanently deleted.",
                duration: 3000,
                className: "bg-green-50 border-green-200 text-green-900",
            });

        } catch (error) {
            console.error("Failed to delete template:", error);
            toast({
                title: "Error",
                description: "Failed to delete template. Please try again.",
                variant: "destructive",
                duration: 5000,
            });
        }
    };

    // Apply all filters
    const filteredTemplates = useMemo(() => {
      let filtered = allTemplates;

      // View mode filter
      if (filters.viewMode === 'favorites') {
        const favoriteIds = user?.favoriteTemplateIds || [];
        filtered = filtered.filter(t => favoriteIds.includes(t.id));
      } else if (filters.viewMode === 'my') {
        filtered = filtered.filter(t => t.createdByUserId === user?.id && t.type !== 'platform');
      } else if (filters.viewMode === 'org') {
        filtered = filtered.filter(t => t.type === 'organization');
      }

      // Category filter
      if (filters.categoryId) {
        console.log('[DIAG] Category filter selected:', filters.categoryId);
        console.log('[DIAG] Templates before category filter:', filtered.length);
        console.log('[DIAG] Sample templateCategoryIds:', filtered.slice(0, 5).map(t => ({ name: t.name, ids: t.templateCategoryIds })));
        filtered = filtered.filter(t => 
          t.templateCategoryIds && t.templateCategoryIds.includes(filters.categoryId)
        );
        console.log('[DIAG] Templates after category filter:', filtered.length);
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
                    <h1 className="text-3xl font-bold text-foreground">Content Library</h1>
                    <p className="mt-1 text-muted-foreground">Browse, create, and manage your message templates.</p>
                </div>
                <Button
                    onClick={() => navigate(createPageUrl('EditTemplate?id=new'))}
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
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
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
                    onDuplicateTemplate={handleDuplicateTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                    emptyMessage="No templates match your filters. Try adjusting your search or filters."
                />
            )}
        </div>
    );
}