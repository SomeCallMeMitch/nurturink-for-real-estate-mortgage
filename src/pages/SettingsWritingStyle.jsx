import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Edit, Trash2, Loader2, Code2, Info } from "lucide-react";

export default function SettingsWritingStyle() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, profile: null });
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    defaultGreeting: '',
    signatureText: '',
    handwritingFont: 'Caveat',
    includeSignatureByDefault: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const profileList = await base44.entities.NoteStyleProfile.filter({
        orgId: currentUser.orgId
      });

      setProfiles(profileList);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingProfile(null);
    setFormData({
      name: '',
      defaultGreeting: 'Dear {{firstName}},',
      signatureText: 'Sincerely,\n{{rep_full_name}}\n{{rep_company_name}}\n{{rep_phone}}',
      handwritingFont: 'Caveat',
      includeSignatureByDefault: true
    });
    setShowForm(true);
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      defaultGreeting: profile.defaultGreeting || '',
      signatureText: profile.signatureText || '',
      handwritingFont: profile.handwritingFont || 'Caveat',
      includeSignatureByDefault: profile.includeSignatureByDefault ?? true
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Style name is required');
      return;
    }

    try {
      setSaving(true);

      const profileData = {
        ...formData,
        userId: user.id,
        orgId: user.orgId,
        isOrgWide: false,
        isDefault: false
      };

      if (editingProfile) {
        await base44.entities.NoteStyleProfile.update(editingProfile.id, profileData);
      } else {
        await base44.entities.NoteStyleProfile.create(profileData);
      }

      await loadData();
      setShowForm(false);
      setEditingProfile(null);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save writing style. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.profile) return;

    try {
      setDeleting(true);
      await base44.entities.NoteStyleProfile.delete(deleteDialog.profile.id);
      await loadData();
      setDeleteDialog({ open: false, profile: null });
    } catch (error) {
      console.error('Failed to delete profile:', error);
      alert('Failed to delete writing style. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const placeholders = [
    { label: 'Client First Name', value: '{{firstName}}' },
    { label: 'Client Last Name', value: '{{lastName}}' },
    { label: 'Client Full Name', value: '{{fullName}}' },
    { label: 'Your Name', value: '{{rep_full_name}}' },
    { label: 'Your Company', value: '{{rep_company_name}}' },
    { label: 'Your Phone', value: '{{rep_phone}}' },
  ];

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
      <div className="space-y-6">
        {/* Header */}
        {!showForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Writing Styles</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Create reusable greeting and signature combinations for your cards
                  </p>
                </div>
                <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Style
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profiles.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No writing styles yet</p>
                  <p className="text-sm text-gray-400 mt-1">Create your first style to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{profile.name}</h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            {profile.defaultGreeting && (
                              <p>
                                <span className="font-medium">Greeting:</span> {profile.defaultGreeting}
                              </p>
                            )}
                            {profile.signatureText && (
                              <p>
                                <span className="font-medium">Signature:</span>{' '}
                                {profile.signatureText.split('\n')[0]}
                                {profile.signatureText.split('\n').length > 1 && '...'}
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Font:</span> {profile.handwritingFont}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(profile)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, profile })}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle>{editingProfile ? 'Edit Writing Style' : 'Create Writing Style'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Style Name */}
                <div>
                  <Label htmlFor="name">
                    Style Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Professional, Casual, Friendly"
                    required
                  />
                </div>

                {/* Font Selection */}
                <div>
                  <Label htmlFor="font">Handwriting Font</Label>
                  <Select
                    value={formData.handwritingFont}
                    onValueChange={(value) => setFormData({ ...formData, handwritingFont: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Caveat">Caveat</SelectItem>
                      <SelectItem value="Kalam">Kalam</SelectItem>
                      <SelectItem value="Patrick Hand">Patrick Hand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Default Greeting */}
                <div>
                  <Label htmlFor="greeting">Default Greeting</Label>
                  <Textarea
                    id="greeting"
                    value={formData.defaultGreeting}
                    onChange={(e) => setFormData({ ...formData, defaultGreeting: e.target.value })}
                    placeholder="Dear {{firstName}},"
                    className="h-20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use placeholders like {'{{firstName}}'} for dynamic content
                  </p>
                </div>

                {/* Signature Text */}
                <div>
                  <Label htmlFor="signature">Signature Text</Label>
                  <Textarea
                    id="signature"
                    value={formData.signatureText}
                    onChange={(e) => setFormData({ ...formData, signatureText: e.target.value })}
                    placeholder="Sincerely,&#10;{{rep_full_name}}&#10;{{rep_company_name}}"
                    className="h-32"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use multiple lines for formatted signatures
                  </p>
                </div>

                {/* Include Signature by Default */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSignature"
                    checked={formData.includeSignatureByDefault}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, includeSignatureByDefault: checked })
                    }
                  />
                  <label htmlFor="includeSignature" className="text-sm font-medium">
                    Include signature by default when using this style
                  </label>
                </div>

                {/* Placeholder Reference */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2 mb-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-blue-900 mb-2">
                          Available Placeholders
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {placeholders.map((placeholder) => (
                            <div key={placeholder.value} className="flex items-center gap-2">
                              <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200">
                                {placeholder.value}
                              </code>
                              <span className="text-xs text-blue-800">{placeholder.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProfile(null);
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
                      'Save Writing Style'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, profile: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Writing Style</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.profile?.name}</strong>?
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