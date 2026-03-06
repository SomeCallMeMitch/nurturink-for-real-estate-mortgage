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
import { Plus, Edit, Trash2, Loader2, Code2, Info, MessageSquare, Star, Copy, Building, Globe, User, ChevronDown, ChevronUp } from "lucide-react";

export default function SettingsWritingStyle() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, profile: null });
  const [deleting, setDeleting] = useState(false);
  
  // New state for Phase 3
  const [personalStyles, setPersonalStyles] = useState([]);
  const [orgStyles, setOrgStyles] = useState([]);
  const [platformStyles, setPlatformStyles] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [togglingFavorite, setTogglingFavorite] = useState(null);
  const [copying, setCopying] = useState(null);
  const [copyDialog, setCopyDialog] = useState({ open: false, style: null, newName: '' });
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    favorites: false,
    personal: false,
    organization: true,
    platform: false // Platform styles start expanded
  });

  const [formData, setFormData] = useState({
    name: '',
    defaultGreeting: '',
    signatureText: '',
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

      // Get all accessible profiles (row-level security handles filtering)
      const profileList = await base44.entities.NoteStyleProfile.list();

      setProfiles(profileList);
      
      // Categorize by type
      const personal = profileList.filter(s => s.type === 'personal');
      const org = profileList.filter(s => s.type === 'organization');
      const platform = profileList.filter(s => s.type === 'platform');
      
      setPersonalStyles(personal);
      setOrgStyles(org);
      setPlatformStyles(platform);
      
      // Set user's favorites
      setFavoriteIds(currentUser.favoriteNoteStyleProfileIds || []);
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
      defaultGreeting: 'Dear {{client.firstName}},',
      signatureText: 'Sincerely,\n{{user.fullName}}',
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
        type: 'personal', // New personal styles
        createdByUserId: user.id,
        organizationId: null,
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

  const handleToggleFavorite = async (profileId, isFavorited) => {
    try {
      setTogglingFavorite(profileId);
      
      const response = await base44.functions.invoke('toggleFavoriteStyle', {
        profileId,
        action: isFavorited ? 'remove' : 'add'
      });

      if (response.data.success) {
        // Update local state
        const newFavorites = isFavorited 
          ? favoriteIds.filter(id => id !== profileId)
          : [...favoriteIds, profileId];
        setFavoriteIds(newFavorites);
        
        // Update user in state
        setUser(prev => ({ ...prev, favoriteNoteStyleProfileIds: newFavorites }));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('Failed to update favorite. Please try again.');
    } finally {
      setTogglingFavorite(null);
    }
  };

  const handleOpenCopyDialog = (style) => {
    setCopyDialog({ 
      open: true, 
      style, 
      newName: `${style.name} (My Copy)` 
    });
  };

  const handleSaveAsMy = async () => {
    if (!copyDialog.style) return;

    try {
      setCopying(copyDialog.style.id);
      
      const response = await base44.functions.invoke('saveAsMyStyle', {
        sourceProfileId: copyDialog.style.id,
        newName: copyDialog.newName || undefined
      });

      if (response.data.success) {
        await loadData();
        setCopyDialog({ open: false, style: null, newName: '' });
        alert(`✓ Created personal copy: "${response.data.profile.name}"`);
      }
    } catch (error) {
      console.error('Failed to copy style:', error);
      alert('Failed to create personal copy. Please try again.');
    } finally {
      setCopying(null);
    }
  };

  const toggleSection = (section) => {
    setSectionsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Placeholder list matching PlaceholderModal.js
  const placeholders = [
    { label: 'Client First Name', value: '{{client.firstName}}' },
    { label: 'Client Last Name', value: '{{client.lastName}}' },
    { label: 'Client Full Name', value: '{{client.fullName}}' },
    { label: 'Client Initials', value: '{{client.initials}}' },
    { label: 'Client Email', value: '{{client.email}}' },
    { label: 'Client Phone', value: '{{client.phone}}' },
    { label: 'Client Street', value: '{{client.street}}' },
    { label: 'Client City', value: '{{client.city}}' },
    { label: 'Client State', value: '{{client.state}}' },
    { label: 'Client ZIP Code', value: '{{client.zipCode}}' },
    { label: 'Client Company', value: '{{client.company}}' },
    { label: 'Your First Name', value: '{{user.firstName}}' },
    { label: 'Your Last Name', value: '{{user.lastName}}' },
    { label: 'Your Full Name', value: '{{user.fullName}}' },
    { label: 'Your Email', value: '{{user.email}}' },
    { label: 'Your Phone', value: '{{user.phone}}' },
    { label: 'Your Title', value: '{{user.title}}' },
    { label: 'Your Company Name', value: '{{user.companyName}}' },
    { label: 'Your Street', value: '{{user.street}}' },
    { label: 'Your City', value: '{{user.city}}' },
    { label: 'Your State', value: '{{user.state}}' },
    { label: 'Your ZIP Code', value: '{{user.zipCode}}' },
    { label: 'Organization Name', value: '{{org.name}}' },
    { label: 'Organization Website', value: '{{org.website}}' },
    { label: 'Organization Email', value: '{{org.email}}' },
    { label: 'Organization Phone', value: '{{org.phone}}' },
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
                <div className="space-y-6">
                  {/* Favorites Section */}
                  {favoriteIds.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('favorites')}
                        className="flex items-center justify-between w-full mb-3 text-left"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          Favorited Styles
                        </h3>
                        {sectionsCollapsed.favorites ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-400" />}
                      </button>
                      {!sectionsCollapsed.favorites && (
                        <div className="space-y-3 pl-7">
                          {profiles.filter(p => favoriteIds.includes(p.id)).map((profile) => (
                            <StyleCard
                              key={profile.id}
                              profile={profile}
                              isFavorited={true}
                              togglingFavorite={togglingFavorite}
                              copying={copying}
                              onToggleFavorite={handleToggleFavorite}
                              onEdit={handleEdit}
                              onDelete={(p) => setDeleteDialog({ open: true, profile: p })}
                              onCopy={handleOpenCopyDialog}
                              profiles={profiles}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Personal Styles Section */}
                  <div>
                    <button
                      onClick={() => toggleSection('personal')}
                      className="flex items-center justify-between w-full mb-3 text-left"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        My Personal Styles
                      </h3>
                      {sectionsCollapsed.personal ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-400" />}
                    </button>
                    {!sectionsCollapsed.personal && (
                      <div className="space-y-3 pl-7">
                        {personalStyles.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No personal styles yet</p>
                            <Button onClick={handleNew} variant="outline" size="sm" className="mt-2">
                              <Plus className="w-4 h-4 mr-2" />
                              Create your first style
                            </Button>
                          </div>
                        ) : (
                          personalStyles.map((profile) => (
                            <StyleCard
                              key={profile.id}
                              profile={profile}
                              isFavorited={favoriteIds.includes(profile.id)}
                              togglingFavorite={togglingFavorite}
                              copying={copying}
                              onToggleFavorite={handleToggleFavorite}
                              onEdit={handleEdit}
                              onDelete={(p) => setDeleteDialog({ open: true, profile: p })}
                              onCopy={handleOpenCopyDialog}
                              profiles={profiles}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Organization Styles Section */}
                  {orgStyles.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('organization')}
                        className="flex items-center justify-between w-full mb-3 text-left"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Building className="w-5 h-5 text-green-600" />
                          Organization Styles
                        </h3>
                        {sectionsCollapsed.organization ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-400" />}
                      </button>
                      {!sectionsCollapsed.organization && (
                        <div className="space-y-3 pl-7">
                          {orgStyles.map((profile) => (
                            <StyleCard
                              key={profile.id}
                              profile={profile}
                              isFavorited={favoriteIds.includes(profile.id)}
                              togglingFavorite={togglingFavorite}
                              copying={copying}
                              onToggleFavorite={handleToggleFavorite}
                              onEdit={handleEdit}
                              onDelete={(p) => setDeleteDialog({ open: true, profile: p })}
                              onCopy={handleOpenCopyDialog}
                              profiles={profiles}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Platform Styles Section */}
                  {platformStyles.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('platform')}
                        className="flex items-center justify-between w-full mb-3 text-left"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-gray-600" />
                          Platform Styles
                        </h3>
                        {sectionsCollapsed.platform ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronUp className="w-5 h-5 text-gray-400" />}
                      </button>
                      {!sectionsCollapsed.platform && (
                        <div className="space-y-3 pl-7">
                          {platformStyles.map((profile) => (
                            <StyleCard
                              key={profile.id}
                              profile={profile}
                              isFavorited={favoriteIds.includes(profile.id)}
                              togglingFavorite={togglingFavorite}
                              copying={copying}
                              onToggleFavorite={handleToggleFavorite}
                              onEdit={handleEdit}
                              onDelete={(p) => setDeleteDialog({ open: true, profile: p })}
                              onCopy={handleOpenCopyDialog}
                              profiles={profiles}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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

                {/* Default Greeting */}
                <div>
                  <Label htmlFor="greeting">Default Greeting</Label>
                  <Textarea
                    id="greeting"
                    value={formData.defaultGreeting}
                    onChange={(e) => setFormData({ ...formData, defaultGreeting: e.target.value })}
                    placeholder="Dear {{client.firstName}},"
                    className="h-20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use placeholders like {'{{client.firstName}}'} for dynamic content
                  </p>
                </div>

                {/* Signature Text */}
                <div>
                  <Label htmlFor="signature">Signature Text</Label>
                  <Textarea
                    id="signature"
                    value={formData.signatureText}
                    onChange={(e) => setFormData({ ...formData, signatureText: e.target.value })}
                    placeholder="Sincerely,&#10;{{user.fullName}}&#10;{{user.companyName}}"
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

      {/* Copy Style Dialog */}
      <AlertDialog open={copyDialog.open} onOpenChange={(open) => setCopyDialog({ open, style: null, newName: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save As My Style</AlertDialogTitle>
            <AlertDialogDescription>
              Create a personal copy of <strong>{copyDialog.style?.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="copyName">New Style Name</Label>
            <Input
              id="copyName"
              value={copyDialog.newName}
              onChange={(e) => setCopyDialog(prev => ({ ...prev, newName: e.target.value }))}
              placeholder="Enter new name..."
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={copying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveAsMy}
              disabled={copying || !copyDialog.newName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {copying ? 'Copying...' : 'Create Copy'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsLayout>
  );
}

// StyleCard Component
function StyleCard({ profile, isFavorited, togglingFavorite, copying, onToggleFavorite, onEdit, onDelete, onCopy, profiles }) {
  const isPersonal = profile.type === 'personal';
  const canEdit = isPersonal;
  
  // Get type badge config
  const typeBadge = {
    personal: { icon: User, label: 'Personal', className: 'bg-indigo-600 text-white' },
    organization: { icon: Building, label: 'Organization', className: 'bg-green-600 text-white' },
    platform: { icon: Globe, label: 'Platform', className: 'bg-gray-600 text-white' }
  }[profile.type];

  // Get parent style name if copied
  const parentStyle = profile.originalNoteStyleProfileId 
    ? profiles.find(p => p.id === profile.originalNoteStyleProfileId)
    : null;

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title and Badge */}
          <div className="flex items-start gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{profile.name}</h3>
            {typeBadge && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${typeBadge.className}`}>
                <typeBadge.icon className="w-3 h-3" />
                {typeBadge.label}
              </span>
            )}
          </div>
          
          {/* Style Details */}
          <div className="text-sm text-gray-600 space-y-1">
            {profile.defaultGreeting && (
              <p>
                <span className="font-medium">Greeting:</span> {profile.defaultGreeting}
              </p>
            )}
            {profile.signatureText && (
              <p>
                <span className="font-medium">Signature:</span>{' '}
                <span className="whitespace-pre-line">{profile.signatureText}</span>
              </p>
            )}
          </div>

          {/* Parent/Origin Indicator */}
          {parentStyle && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Copy className="w-3 h-3" />
              Copied from: <span className="font-medium">{parentStyle.name}</span>
            </p>
          )}
          {profile.originalNoteStyleProfileId && !parentStyle && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Copy className="w-3 h-3" />
              Copied from deleted style
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-4">
          {/* Favorite Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(profile.id, isFavorited)}
            disabled={togglingFavorite === profile.id}
            className="hover:bg-yellow-50"
          >
            {togglingFavorite === profile.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Star className={`w-4 h-4 ${isFavorited ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
            )}
          </Button>

          {/* Edit (Personal Only) */}
          {canEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(profile)}>
              <Edit className="w-4 h-4" />
            </Button>
          )}

          {/* Save As My Style (Org/Platform Only) */}
          {!canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(profile)}
              disabled={copying === profile.id}
              className="text-indigo-600 hover:bg-indigo-50"
            >
              {copying === profile.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Save As My Style
                </>
              )}
            </Button>
          )}

          {/* Delete (Personal Only) */}
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(profile)}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}