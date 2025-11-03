import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Star, Edit, Trash2, Loader2, FileText } from "lucide-react";

export default function Templates() {
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, template: null });
  const [deleting, setDeleting] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setFavoriteIds(currentUser.favoriteTemplateIds || []);

      // Load templates (personal, org, and platform)
      const templateList = await base44.entities.Template.filter({
        $or: [
          { orgId: currentUser.orgId },
          { type: 'platform' }
        ]
      });

      console.log('✅ Templates loaded:', templateList.length, 'templates');
      console.log('📝 Template details:', templateList);

      setTemplates(templateList);

      // Load categories
      const categoryList = await base44.entities.TemplateCategory.filter({
        $or: [
          { orgId: currentUser.orgId },
          { orgId: null }
        ]
      });

      setCategories(categoryList);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (e, templateId) => {
    e.stopPropagation();
    
    const newFavorites = favoriteIds.includes(templateId)
      ? favoriteIds.filter(id => id !== templateId)
      : [...favoriteIds, templateId];
    
    setFavoriteIds(newFavorites);
    
    try {
      await base44.auth.updateMe({
        favoriteTemplateIds: newFavorites
      });
    } catch (error) {
      console.error('Failed to update favorites:', error);
      setFavoriteIds(favoriteIds); // Revert on error
    }
  };

  // Delete template
  const handleDelete = async () => {
    if (!deleteDialog.template) return;

    try {
      setDeleting(true);
      await base44.entities.Template.delete(deleteDialog.template.id);
      await loadData();
      setDeleteDialog({ open: false, template: null });
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter and group templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory === 'favorites') {
      filtered = filtered.filter(t => favoriteIds.includes(t.id));
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => 
        t.templateCategoryIds && t.templateCategoryIds.includes(selectedCategory)
      );
    }

    return filtered;
  }, [templates, searchQuery, selectedCategory, favoriteIds]);

  // Group templates by type
  const groupedTemplates = useMemo(() => {
    const groups = {
      favorites: [],
      personal: [],
      organization: [],
      platform: []
    };

    filteredTemplates.forEach(template => {
      if (favoriteIds.includes(template.id) && selectedCategory === 'all') {
        groups.favorites.push(template);
      }
      
      if (template.type === 'personal') {
        groups.personal.push(template);
      } else if (template.type === 'organization') {
        groups.organization.push(template);
      } else if (template.type === 'platform') {
        groups.platform.push(template);
      }
    });

    return groups;
  }, [filteredTemplates, favoriteIds, selectedCategory]);

  const TemplateCard = ({ template }) => {
    const isFavorite = favoriteIds.includes(template.id);
    const canEdit = template.createdByUserId === user?.id || user?.appRole === 'super_admin';
    const canDelete = template.createdByUserId === user?.id;

    return (
      <Card className="hover:shadow-lg transition-all">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-gray-900 flex-1">{template.name}</h3>
            <button
              onClick={(e) => handleToggleFavorite(e, template.id)}
              className="flex-shrink-0"
            >
              <Star
                className={`w-5 h-5 ${
                  isFavorite
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-400 hover:text-yellow-400'
                }`}
              />
            </button>
          </div>

          <p className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[60px]">
            {template.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {template.type === 'platform' && (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                  Platform
                </span>
              )}
              {template.type === 'organization' && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  Shared
                </span>
              )}
              {template.usageCount > 0 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  Used {template.usageCount}x
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(createPageUrl(`EditTemplate?id=${template.id}`))}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteDialog({ open: true, template })}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TemplateGroup = ({ title, templates }) => {
    if (templates.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
              <p className="text-gray-600 mt-1">
                Manage your message templates for quick card creation
              </p>
            </div>
            <Button
              onClick={() => navigate(createPageUrl('EditTemplate?id=new'))}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Template
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search templates by name or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="favorites">Favorites</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'No templates match your search or filters'
                    : 'No templates yet'}
                </p>
                <Button
                  onClick={() => navigate(createPageUrl('EditTemplate?id=new'))}
                  variant="outline"
                  className="mt-4"
                >
                  Create Your First Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {selectedCategory === 'all' && groupedTemplates.favorites.length > 0 && (
              <TemplateGroup title="⭐ Favorites" templates={groupedTemplates.favorites} />
            )}
            
            {selectedCategory !== 'favorites' && (
              <>
                <TemplateGroup title="My Personal Templates" templates={groupedTemplates.personal} />
                <TemplateGroup title="Company Templates" templates={groupedTemplates.organization} />
                <TemplateGroup title="Platform Templates" templates={groupedTemplates.platform} />
              </>
            )}

            {selectedCategory === 'favorites' && (
              <TemplateGroup title="Favorites" templates={groupedTemplates.favorites} />
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, template: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.template?.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}