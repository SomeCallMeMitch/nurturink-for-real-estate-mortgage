
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2, Globe, Star, ExternalLink } from "lucide-react";

export default function SettingsUrls() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUrl, setEditingUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, url: null });
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    url: '',
    label: '',
    isDefault: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const urlList = await base44.entities.UserUrl.filter({
        userId: currentUser.id
      });

      setUrls(urlList);
    } catch (error) {
      console.error('Failed to load URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingUrl(null);
    setFormData({
      url: '',
      label: '',
      isDefault: urls.length === 0 // Auto-default if first URL
    });
    setShowForm(true);
  };

  const handleEdit = (url) => {
    setEditingUrl(url);
    setFormData({
      url: url.url,
      label: url.label,
      isDefault: url.isDefault
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.url.trim() || !formData.label.trim()) {
      alert('URL and label are required');
      return;
    }

    try {
      setSaving(true);

      const urlData = {
        ...formData,
        userId: user.id,
        orgId: user.orgId
      };

      if (editingUrl) {
        await base44.entities.UserUrl.update(editingUrl.id, urlData);
      } else {
        await base44.entities.UserUrl.create(urlData);
      }

      // If setting as default, update user's defaultUrlId
      if (formData.isDefault) {
        const updatedUrls = await base44.entities.UserUrl.filter({
          userId: user.id
        });
        const newDefaultUrl = editingUrl 
          ? updatedUrls.find(u => u.id === editingUrl.id)
          : updatedUrls[updatedUrls.length - 1]; // Last created

        if (newDefaultUrl) {
          await base44.auth.updateMe({ defaultUrlId: newDefaultUrl.id });
        }
      }

      await loadData();
      setShowForm(false);
      setEditingUrl(null);
    } catch (error) {
      console.error('Failed to save URL:', error);
      alert('Failed to save URL. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.url) return;

    try {
      setDeleting(true);
      await base44.entities.UserUrl.delete(deleteDialog.url.id);
      
      // If deleted URL was default, clear user's defaultUrlId
      if (deleteDialog.url.isDefault) {
        await base44.auth.updateMe({ defaultUrlId: null });
      }

      await loadData();
      setDeleteDialog({ open: false, url: null });
    } catch (error) {
      console.error('Failed to delete URL:', error);
      alert('Failed to delete URL. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Websites & URLs
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage website URLs to include in your card signatures as placeholders
              </p>
            </div>
            <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add URL
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {urls.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No URLs yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first website or URL to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urls.map((url) => (
                <div
                  key={url.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {url.isDefault && (
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{url.label}</h3>
                      <p className="text-sm text-gray-600 truncate">{url.url}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(url)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, url })}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingUrl ? 'Edit URL' : 'Add URL'}</DialogTitle>
              <DialogDescription>
                Add a website or URL to include in your card signatures as a placeholder
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="label">
                  Label <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Website, LinkedIn, Portfolio"
                  required
                />
              </div>

              <div>
                <Label htmlFor="url">
                  URL <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="url"
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="www.example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be written on your cards, not used as a clickable link
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                />
                <label htmlFor="isDefault" className="text-sm font-medium">
                  Set as default URL
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingUrl(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save URL'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, url: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete URL</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.url?.label}</strong>?
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
    </SettingsLayout>
  );
}
