import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Pencil, 
  Trash, 
  Palette
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * CategoryForm Component
 * Modal form for creating/editing categories
 */
export function CategoryForm({
  open,
  onOpenChange,
  editingCategory,
  defaultSortOrder = 0,
  onSave
}) {
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    sortOrder: 0,
    isActive: true
  });

  React.useEffect(() => {
    if (open) {
      if (editingCategory) {
        setForm({
          name: editingCategory.name || '',
          description: editingCategory.description || '',
          sortOrder: editingCategory.sortOrder || 0,
          isActive: editingCategory.isActive !== false
        });
      } else {
        setForm({
          name: '',
          description: '',
          sortOrder: defaultSortOrder,
          isActive: true
        });
      }
    }
  }, [open, editingCategory, defaultSortOrder]);

  const handleSave = () => {
    onSave(form, editingCategory);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Holiday, Professional, Thank You"
            />
          </div>

          <div>
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this category"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="cat-sort">Sort Order</Label>
            <Input
              id="cat-sort"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="cat-active"
              checked={form.isActive}
              onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
            />
            <label htmlFor="cat-active" className="text-sm cursor-pointer">
              Active (visible to users)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * CategoryList Component
 * List display of categories with actions
 * 
 * @param {Array} categories - List of categories
 * @param {Function} onEdit - Edit category callback
 * @param {Function} onDelete - Delete category callback
 */
export default function CategoryList({
  categories = [],
  onEdit,
  onDelete
}) {
  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Palette className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No categories yet. Create your first category!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  {!category.isActive && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      Inactive
                    </span>
                  )}
                  <span className="text-xs text-gray-400">Order: {category.sortOrder}</span>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(category)}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(category)}
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
  );
}