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
import { Plus, Edit, Trash2, Loader2, Phone, Star } from "lucide-react";

export default function SettingsPhones() {
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPhone, setEditingPhone] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, phone: null });
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumber: '',
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

      const phoneList = await base44.entities.UserPhone.filter({
        userId: currentUser.id
      });

      setPhones(phoneList);
    } catch (error) {
      console.error('Failed to load phones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingPhone(null);
    setFormData({
      phoneNumber: '',
      label: '',
      isDefault: phones.length === 0 // Auto-default if first phone
    });
    setShowForm(true);
  };

  const handleEdit = (phone) => {
    setEditingPhone(phone);
    setFormData({
      phoneNumber: phone.phoneNumber,
      label: phone.label,
      isDefault: phone.isDefault
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.phoneNumber.trim() || !formData.label.trim()) {
      alert('Phone number and label are required');
      return;
    }

    try {
      setSaving(true);

      const phoneData = {
        ...formData,
        userId: user.id,
        orgId: user.orgId
      };

      if (editingPhone) {
        await base44.entities.UserPhone.update(editingPhone.id, phoneData);
      } else {
        await base44.entities.UserPhone.create(phoneData);
      }

      // If setting as default, update user's defaultPhoneId
      if (formData.isDefault) {
        const updatedPhones = await base44.entities.UserPhone.filter({
          userId: user.id
        });
        const newDefaultPhone = editingPhone 
          ? updatedPhones.find(p => p.id === editingPhone.id)
          : updatedPhones[updatedPhones.length - 1]; // Last created

        if (newDefaultPhone) {
          await base44.auth.updateMe({ defaultPhoneId: newDefaultPhone.id });
        }
      }

      await loadData();
      setShowForm(false);
      setEditingPhone(null);
    } catch (error) {
      console.error('Failed to save phone:', error);
      alert('Failed to save phone number. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.phone) return;

    try {
      setDeleting(true);
      await base44.entities.UserPhone.delete(deleteDialog.phone.id);
      
      // If deleted phone was default, clear user's defaultPhoneId
      if (deleteDialog.phone.isDefault) {
        await base44.auth.updateMe({ defaultPhoneId: null });
      }

      await loadData();
      setDeleteDialog({ open: false, phone: null });
    } catch (error) {
      console.error('Failed to delete phone:', error);
      alert('Failed to delete phone number. Please try again.');
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
                <Phone className="w-5 h-5" />
                Phone Numbers
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage phone numbers to include in your card signatures
              </p>
            </div>
            <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Phone Number
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {phones.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No phone numbers yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first phone number to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {phones.map((phone) => (
                <div
                  key={phone.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {phone.isDefault && (
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{phone.label}</h3>
                      <p className="text-sm text-gray-600">{phone.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(phone)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, phone })}
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
              <DialogTitle>{editingPhone ? 'Edit Phone Number' : 'Add Phone Number'}</DialogTitle>
              <DialogDescription>
                Add a phone number to include in your card signatures
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
                  placeholder="e.g., Office, Mobile, Direct Line"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                />
                <label htmlFor="isDefault" className="text-sm font-medium">
                  Set as default phone number
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingPhone(null);
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
                  'Save Phone Number'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, phone: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Phone Number</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.phone?.label}</strong>?
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