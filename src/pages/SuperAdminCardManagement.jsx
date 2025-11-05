
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Pencil, 
  Trash, 
  Loader2, 
  Upload,
  X,
  Image as ImageIcon,
  Palette
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useToast } from '@/components/ui/use-toast';

export default function SuperAdminCardManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Active tab
  const [activeTab, setActiveTab] = useState('designs');
  
  // Data
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Design form state
  const [designFormOpen, setDesignFormOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);
  const [designForm, setDesignForm] = useState({
    name: '',
    insideImageUrl: '',
    outsideImageUrl: '',
    cardDesignCategoryIds: [],
    type: 'platform',
    printReadyFrontUrl: '',
    printReadyBackUrl: ''
  });
  const [uploadingInside, setUploadingInside] = useState(false);
  const [uploadingOutside, setUploadingOutside] = useState(false);
  
  // Category form state
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    sortOrder: 0,
    isActive: true
  });
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [designList, categoryList] = await Promise.all([
        base44.entities.CardDesign.filter({ type: 'platform' }),
        base44.entities.CardDesignCategory.filter({ orgId: null })
      ]);
      
      setDesigns(designList);
      setCategories(categoryList.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load card data',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Design handlers
  const handleAddDesign = () => {
    setEditingDesign(null);
    setDesignForm({
      name: '',
      insideImageUrl: '',
      outsideImageUrl: '',
      cardDesignCategoryIds: [],
      type: 'platform',
      printReadyFrontUrl: '',
      printReadyBackUrl: ''
    });
    setDesignFormOpen(true);
  };

  const handleEditDesign = (design) => {
    setEditingDesign(design);
    setDesignForm({
      name: design.name,
      insideImageUrl: design.insideImageUrl || design.imageUrl || '', // Fallback to imageUrl for existing designs
      outsideImageUrl: design.outsideImageUrl || '',
      cardDesignCategoryIds: design.cardDesignCategoryIds || [],
      type: design.type,
      printReadyFrontUrl: design.printReadyFrontUrl || '',
      printReadyBackUrl: design.printReadyBackUrl || ''
    });
    setDesignFormOpen(true);
  };

  const handleInsideImageUpload = async (file) => {
    try {
      setUploadingInside(true);
      const response = await base44.integrations.Core.UploadFile({ file });
      setDesignForm(prev => ({ ...prev, insideImageUrl: response.file_url }));
      toast({
        title: 'Inside image uploaded',
        description: 'Inside card image uploaded successfully',
        duration: 3000,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
    } catch (error) {
      console.error('Failed to upload inside image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload inside image',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setUploadingInside(false);
    }
  };

  const handleOutsideImageUpload = async (file) => {
    try {
      setUploadingOutside(true);
      const response = await base44.integrations.Core.UploadFile({ file });
      setDesignForm(prev => ({ ...prev, outsideImageUrl: response.file_url }));
      toast({
        title: 'Outside image uploaded',
        description: 'Outside card image uploaded successfully',
        duration: 3000,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
    } catch (error) {
      console.error('Failed to upload outside image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload outside image',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setUploadingOutside(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!designForm.name.trim() || !designForm.insideImageUrl.trim() || !designForm.outsideImageUrl.trim()) {
      toast({
        title: 'Validation error',
        description: 'Name, inside image, and outside image are required',
        variant: 'destructive',
        duration: 5000
      });
      return;
    }

    try {
      if (editingDesign) {
        await base44.entities.CardDesign.update(editingDesign.id, designForm);
        toast({
          title: 'Design updated',
          description: 'Card design updated successfully',
          duration: 3000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      } else {
        await base44.entities.CardDesign.create(designForm);
        toast({
          title: 'Design created',
          description: 'Card design created successfully',
          duration: 3000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      }
      
      setDesignFormOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save design:', error);
      toast({
        title: 'Error',
        description: 'Failed to save card design',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      sortOrder: categories.length,
      isActive: true
    });
    setCategoryFormOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      sortOrder: category.sortOrder,
      isActive: category.isActive
    });
    setCategoryFormOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: 'Validation error',
        description: 'Category name is required',
        variant: 'destructive',
        duration: 5000
      });
      return;
    }

    try {
      const categoryData = {
        ...categoryForm,
        orgId: null,
        createdByUserId: null
      };

      if (editingCategory) {
        await base44.entities.CardDesignCategory.update(editingCategory.id, categoryData);
        toast({
          title: 'Category updated',
          description: 'Card category updated successfully',
          duration: 3000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      } else {
        await base44.entities.CardDesignCategory.create(categoryData);
        toast({
          title: 'Category created',
          description: 'Card category created successfully',
          duration: 3000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      }
      
      setCategoryFormOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast({
        title: 'Error',
        description: 'Failed to save card category',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  // Delete handlers
  const handleDeleteClick = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteType === 'design') {
        await base44.entities.CardDesign.delete(itemToDelete.id);
        toast({
          title: 'Design deleted',
          description: 'Card design deleted successfully',
          duration: 3000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      } else {
        await base44.entities.CardDesignCategory.delete(itemToDelete.id);
        toast({
          title: 'Category deleted',
          description: 'Card category deleted successfully',
          duration: 3000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      }
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType(null);
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setDesignForm(prev => ({
      ...prev,
      cardDesignCategoryIds: prev.cardDesignCategoryIds.includes(categoryId)
        ? prev.cardDesignCategoryIds.filter(id => id !== categoryId)
        : [...prev.cardDesignCategoryIds, categoryId]
    }));
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Card Design Management</h1>
          <p className="text-gray-600 mt-1">Manage platform-wide card designs and categories</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('designs')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'designs'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Card Designs ({designs.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'categories'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Categories ({categories.length})
              </div>
            </button>
          </div>
        </div>

        {/* Card Designs Tab */}
        {activeTab === 'designs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Platform-wide card designs available to all users
              </p>
              <Button onClick={handleAddDesign} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                New Design
              </Button>
            </div>

            {designs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No card designs yet. Create your first design!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs.map((design) => (
                  <Card key={design.id} className="overflow-hidden">
                    {/* Show both inside and outside images */}
                    <div className="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-200">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={design.outsideImageUrl || design.imageUrl} // Fallback for old designs
                          alt={`${design.name} - Outside`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          Outside
                        </div>
                      </div>
                      <div className="aspect-[3/4] relative">
                        <img
                          src={design.insideImageUrl || design.imageUrl} // Fallback for old designs
                          alt={`${design.name} - Inside`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          Inside
                        </div>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{design.name}</h3>
                      
                      {/* Categories */}
                      {design.cardDesignCategoryIds && design.cardDesignCategoryIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {design.cardDesignCategoryIds.map((catId) => {
                            const cat = categories.find(c => c.id === catId);
                            return cat ? (
                              <span key={catId} className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                                {cat.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDesign(design)}
                          className="flex-1"
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(design, 'design')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Organize card designs into categories
              </p>
              <Button onClick={handleAddCategory} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                New Category
              </Button>
            </div>

            {categories.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Palette className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No categories yet. Create your first category!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            {!category.isActive && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-600">{category.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">Sort order: {category.sortOrder}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(category, 'category')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Design Form Dialog */}
        <Dialog open={designFormOpen} onOpenChange={setDesignFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDesign ? 'Edit Card Design' : 'New Card Design'}
              </DialogTitle>
              <DialogDescription>
                {editingDesign ? 'Update card design details' : 'Create a new platform-wide card design'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Design Name */}
              <div>
                <Label htmlFor="design-name">Design Name *</Label>
                <Input
                  id="design-name"
                  value={designForm.name}
                  onChange={(e) => setDesignForm({ ...designForm, name: e.target.value })}
                  placeholder="e.g., Thank You - Elegant Blue"
                />
              </div>

              {/* Image Uploads - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inside Image Upload */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Inside Image *</Label>
                  <p className="text-sm text-gray-600 mb-3">Upload the inside view of the card (688x1000px recommended)</p>
                  
                  {designForm.insideImageUrl ? (
                    <div className="relative w-full aspect-[3/4] border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={designForm.insideImageUrl}
                        alt="Inside Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setDesignForm({ ...designForm, insideImageUrl: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Inside
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors aspect-[3/4] flex flex-col justify-center items-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-3 font-medium">Inside View</p>
                      <label className="cursor-pointer">
                        <span className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 inline-block text-sm font-medium">
                          {uploadingInside ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> : ''}Choose File
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleInsideImageUpload(file);
                          }}
                          disabled={uploadingInside}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Outside Image Upload */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Outside Image *</Label>
                  <p className="text-sm text-gray-600 mb-3">Upload the front/cover view of the card (688x1000px recommended)</p>
                  
                  {designForm.outsideImageUrl ? (
                    <div className="relative w-full aspect-[3/4] border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={designForm.outsideImageUrl}
                        alt="Outside Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setDesignForm({ ...designForm, outsideImageUrl: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Outside
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors aspect-[3/4] flex flex-col justify-center items-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-3 font-medium">Outside View</p>
                      <label className="cursor-pointer">
                        <span className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 inline-block text-sm font-medium">
                          {uploadingOutside ? <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> : ''}Choose File
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleOutsideImageUpload(file);
                          }}
                          disabled={uploadingOutside}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div>
                <Label>Categories</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-500">No categories available. Create categories in the Categories tab first.</p>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${category.id}`}
                          checked={designForm.cardDesignCategoryIds.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                        />
                        <label htmlFor={`cat-${category.id}`} className="text-sm cursor-pointer">
                          {category.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Print-Ready URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="front-url">Print-Ready Front URL (Optional)</Label>
                  <Input
                    id="front-url"
                    value={designForm.printReadyFrontUrl}
                    onChange={(e) => setDesignForm({ ...designForm, printReadyFrontUrl: e.target.value })}
                    placeholder="https://example.com/high-res-front.pdf"
                  />
                </div>

                <div>
                  <Label htmlFor="back-url">Print-Ready Back URL (Optional)</Label>
                  <Input
                    id="back-url"
                    value={designForm.printReadyBackUrl}
                    onChange={(e) => setDesignForm({ ...designForm, printReadyBackUrl: e.target.value })}
                    placeholder="https://example.com/high-res-back.pdf"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSaveDesign} className="bg-indigo-600 hover:bg-indigo-700">
                  {editingDesign ? 'Update Design' : 'Create Design'}
                </Button>
                <Button variant="outline" onClick={() => setDesignFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Form Dialog */}
        <Dialog open={categoryFormOpen} onOpenChange={setCategoryFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update category details' : 'Create a new card design category'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cat-name">Category Name *</Label>
                <Input
                  id="cat-name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g., Holiday, Professional, Thank You"
                />
              </div>

              <div>
                <Label htmlFor="cat-desc">Description</Label>
                <Textarea
                  id="cat-desc"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="cat-sort">Sort Order</Label>
                <Input
                  id="cat-sort"
                  type="number"
                  value={categoryForm.sortOrder}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cat-active"
                  checked={categoryForm.isActive}
                  onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
                />
                <label htmlFor="cat-active" className="text-sm cursor-pointer">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveCategory} className="bg-indigo-600 hover:bg-indigo-700">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                <Button variant="outline" onClick={() => setCategoryFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {deleteType === 'design' ? 'Card Design' : 'Category'}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
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
