import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import CardDesignForm from '@/components/sa/CardDesignForm';
import CardDesignGrid from '@/components/sa/CardDesignGrid';
import CategoryList, { CategoryForm } from '@/components/sa/CategoryList';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SuperAdminCardManagement() {
  const { toast } = useToast();
  
  // Data state
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [activeTab, setActiveTab] = useState('designs');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showDesignForm, setShowDesignForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, item: null });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [designsData, categoriesData] = await Promise.all([
        base44.entities.CardDesign.filter({ type: 'platform' }, '-created_date'),
        base44.entities.CardDesignCategory.filter({ orgId: null }, 'sortOrder')
      ]);
      
      setDesigns(designsData);
      setCategories(categoriesData);
      
      // Load favorites (would typically come from user preferences)
      setFavoriteIds([]);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load card designs and categories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (e, designId) => {
    e.stopPropagation();
    setFavoriteIds(prev =>
      prev.includes(designId)
        ? prev.filter(id => id !== designId)
        : [...prev, designId]
    );
  };

  // Design handlers
  const handleSaveDesign = async (formData, editingDesign) => {
    try {
      if (!formData.name?.trim() || !formData.insideImageUrl?.trim() || !formData.outsideImageUrl?.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Design name, inside image, and outside image are required',
          variant: 'destructive'
        });
        return;
      }

      // If setting as default, unset all other defaults
      if (formData.isDefault) {
        const otherDefaults = designs.filter(d => d.isDefault && d.id !== editingDesign?.id);
        await Promise.all(
          otherDefaults.map(d => base44.entities.CardDesign.update(d.id, { isDefault: false }))
        );
      }

      if (editingDesign) {
        await base44.entities.CardDesign.update(editingDesign.id, formData);
        toast({ title: 'Success', description: 'Card design updated successfully' });
      } else {
        await base44.entities.CardDesign.create(formData);
        toast({ title: 'Success', description: 'Card design created successfully' });
      }

      setShowDesignForm(false);
      setEditingDesign(null);
      loadData();
    } catch (error) {
      console.error('Failed to save design:', error);
      toast({
        title: 'Error',
        description: 'Failed to save card design',
        variant: 'destructive'
      });
    }
  };

  const handleEditDesign = (design) => {
    setEditingDesign(design);
    setShowDesignForm(true);
  };

  const handleDeleteDesign = (design) => {
    setDeleteDialog({ open: true, type: 'design', item: design });
  };

  const confirmDeleteDesign = async () => {
    try {
      await base44.entities.CardDesign.delete(deleteDialog.item.id);
      toast({ title: 'Success', description: 'Card design deleted successfully' });
      setDeleteDialog({ open: false, type: null, item: null });
      loadData();
    } catch (error) {
      console.error('Failed to delete design:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete card design',
        variant: 'destructive'
      });
    }
  };

  // Category handlers
  const handleSaveCategory = async (formData, editingCategory) => {
    try {
      if (!formData.name?.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Category name is required',
          variant: 'destructive'
        });
        return;
      }

      const categoryData = {
        ...formData,
        orgId: null,
        createdByUserId: null
      };

      if (editingCategory) {
        await base44.entities.CardDesignCategory.update(editingCategory.id, categoryData);
        toast({ title: 'Success', description: 'Category updated successfully' });
      } else {
        await base44.entities.CardDesignCategory.create(categoryData);
        toast({ title: 'Success', description: 'Category created successfully' });
      }

      setShowCategoryForm(false);
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive'
      });
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = (category) => {
    setDeleteDialog({ open: true, type: 'category', item: category });
  };

  const confirmDeleteCategory = async () => {
    try {
      await base44.entities.CardDesignCategory.delete(deleteDialog.item.id);
      toast({ title: 'Success', description: 'Category deleted successfully' });
      setDeleteDialog({ open: false, type: null, item: null });
      loadData();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive'
      });
    }
  };

  // File upload handler
  const handleUploadFile = async (file) => {
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      return response.file_url;
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Filter designs by search
  const filteredDesigns = designs.filter(design =>
    design.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Card Design Management</h1>
          <p className="text-gray-600 mt-1">Manage platform-wide card designs and categories</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="designs">Card Designs</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Card Designs Tab */}
          <TabsContent value="designs" className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => {
                  setEditingDesign(null);
                  setShowDesignForm(true);
                }}
                className="bg-[#c87533] hover:bg-[#b5682e] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Card Design
              </Button>
            </div>

            <CardDesignGrid
              designs={filteredDesigns}
              categories={categories}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              onEdit={handleEditDesign}
              onDelete={handleDeleteDesign}
            />
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryForm(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            <CategoryList
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          </TabsContent>
        </Tabs>

        {/* Card Design Form Modal */}
        <CardDesignForm
          open={showDesignForm}
          onOpenChange={(open) => {
            setShowDesignForm(open);
            if (!open) setEditingDesign(null);
          }}
          editingDesign={editingDesign}
          categories={categories}
          onSave={handleSaveDesign}
          onUploadFile={handleUploadFile}
        />

        {/* Category Form Modal */}
        <CategoryForm
          open={showCategoryForm}
          onOpenChange={(open) => {
            setShowCategoryForm(open);
            if (!open) setEditingCategory(null);
          }}
          editingCategory={editingCategory}
          defaultSortOrder={categories.length}
          onSave={handleSaveCategory}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: null, item: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteDialog.type === 'design' 
                  ? `This will permanently delete the card design "${deleteDialog.item?.name}". This action cannot be undone.`
                  : `This will permanently delete the category "${deleteDialog.item?.name}". This action cannot be undone.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteDialog.type === 'design' ? confirmDeleteDesign : confirmDeleteCategory}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SuperAdminLayout>
  );
}