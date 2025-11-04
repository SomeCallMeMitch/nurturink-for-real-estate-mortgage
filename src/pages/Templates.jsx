import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TemplateFilterControls from '@/components/templates/TemplateFilterControls';
import TemplateGrid from '@/components/templates/TemplateGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TemplatesPage() {
    const navigate = useNavigate();
    const [allTemplates, setAllTemplates] = useState({
        personal: [],
        organization: [],
        platform: []
    });
    const [allCategories, setAllCategories] = useState([]);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ search: '', categoryIds: [] });

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);

            const [personal, organization, platform, categories] = await Promise.all([
                // Personal templates: created by this user, type='personal'
                base44.entities.Template.filter({ 
                    createdByUserId: currentUser.id, 
                    type: 'personal' 
                }),
                
                // Organization templates: match orgId, type='organization', status='approved'
                base44.entities.Template.filter({ 
                    orgId: currentUser.orgId, 
                    type: 'organization',
                    status: 'approved'
                }),
                
                // Platform templates: type='platform', isDefault=true, status='approved'
                base44.entities.Template.filter({ 
                    type: 'platform',
                    isDefault: true, 
                    status: 'approved' 
                }),
                
                // Load categories
                base44.entities.TemplateCategory.list()
            ]);

            console.log('📊 Templates loaded:', {
                personal: personal.length,
                organization: organization.length,
                platform: platform.length
            });

            setAllTemplates({ personal, organization, platform });
            setAllCategories(categories);
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
        setAllTemplates(prev => ({
            ...prev,
            personal: prev.personal.filter(t => t.id !== deletedTemplateId),
            organization: prev.organization.filter(t => t.id !== deletedTemplateId),
            platform: prev.platform.filter(t => t.id !== deletedTemplateId), 
        }));
    };

    const filterTemplates = (templates) => {
        return templates.filter(template => {
            const searchLower = filters.search.toLowerCase();
            const nameMatch = template.name.toLowerCase().includes(searchLower);
            const contentMatch = template.content.toLowerCase().includes(searchLower);
            
            const categoryMatch = !filters.categoryIds?.length || 
              (template.templateCategoryIds && 
               filters.categoryIds.some(catId => template.templateCategoryIds.includes(catId)));

            return (nameMatch || contentMatch) && categoryMatch;
        });
    };

    const filteredPersonal = filterTemplates(allTemplates.personal);
    const filteredOrganization = filterTemplates(allTemplates.organization);
    const filteredPlatform = filterTemplates(allTemplates.platform);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
                    <p className="mt-1 text-gray-600">Browse, create, and manage your message templates.</p>
                </div>
                <Button
                    onClick={() => navigate(createPageUrl('EditTemplate?id=new'))}
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
                <>
                    {/* Organization Templates */}
                    <TemplateGrid
                        title="Organization Templates"
                        templates={filteredOrganization}
                        user={user}
                        onFavoriteToggle={handleFavoriteToggle}
                        onTemplateDeleted={handleTemplateDeleted}
                        emptyMessage="No organization templates yet. Create one to share with your team!"
                    />

                    {/* Personal Templates */}
                    <TemplateGrid
                        title="My Templates"
                        templates={filteredPersonal}
                        user={user}
                        onFavoriteToggle={handleFavoriteToggle}
                        onTemplateDeleted={handleTemplateDeleted}
                        emptyMessage="No personal templates yet. Create your first template!"
                    />

                    {/* Platform Templates */}
                    <TemplateGrid
                        title="Platform Templates"
                        templates={filteredPlatform}
                        user={user}
                        onFavoriteToggle={handleFavoriteToggle}
                        onTemplateDeleted={handleTemplateDeleted}
                        emptyMessage="No platform templates available."
                    />
                </>
            )}
        </div>
    );
}