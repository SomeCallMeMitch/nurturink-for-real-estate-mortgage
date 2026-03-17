import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Plus, Pencil, Trash2, Cake, Gift, RefreshCw, Calendar, Home,
  Shield, Heart, Star, Clock, AlertCircle, Loader2, Settings2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Map of available Lucide icon names to components
const ICON_MAP = {
  Cake, Gift, RefreshCw, Calendar, Home, Shield, Heart, Star, Clock, AlertCircle, Settings2
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  triggerField: '',
  triggerMode: 'recurring',
  timingDirection: 'before',
  defaultTimingDays: 10,
  maxSteps: 1,
  icon: 'Calendar',
  color: '',
  selectedColor: '',
  isActive: true,
  scope: 'platform',
  orgId: null,
  timingLabel: '',
  sortOrder: 0
};

export default function AdminCampaignTypes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [deletingType, setDeletingType] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Fetch all CampaignType records
  const { data: campaignTypes = [], isLoading } = useQuery({
    queryKey: ['campaignTypes'],
    queryFn: () => base44.entities.CampaignType.list('sortOrder')
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CampaignType.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaignTypes'] });
      toast({ title: 'Campaign type created successfully' });
      closeDialog();
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CampaignType.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaignTypes'] });
      toast({ title: 'Campaign type updated successfully' });
      closeDialog();
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CampaignType.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaignTypes'] });
      toast({ title: 'Campaign type deleted' });
      setDeleteDialogOpen(false);
      setDeletingType(null);
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingType(null);
    setForm({ ...EMPTY_FORM });
  };

  const openCreate = () => {
    setEditingType(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const openEdit = (ct) => {
    setEditingType(ct);
    setForm({
      name: ct.name || '',
      slug: ct.slug || '',
      description: ct.description || '',
      triggerField: ct.triggerField || '',
      triggerMode: ct.triggerMode || 'recurring',
      timingDirection: ct.timingDirection || 'before',
      defaultTimingDays: ct.defaultTimingDays || 10,
      maxSteps: ct.maxSteps || 1,
      icon: ct.icon || 'Calendar',
      color: ct.color || '',
      selectedColor: ct.selectedColor || '',
      isActive: ct.isActive !== false,
      scope: ct.scope || 'platform',
      orgId: ct.orgId || null,
      timingLabel: ct.timingLabel || '',
      sortOrder: ct.sortOrder || 0
    });
    setDialogOpen(true);
  };

  const openDelete = (ct) => {
    setDeletingType(ct);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.slug.trim() || !form.triggerField.trim()) {
      toast({ title: 'Missing required fields', description: 'Name, Slug, and Trigger Field are required.', variant: 'destructive' });
      return;
    }
    const cleanSlug = form.slug.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const payload = { ...form, slug: cleanSlug };

    if (editingType) {
      updateMutation.mutate({ id: editingType.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleNameChange = (name) => {
    const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    setForm(prev => ({
      ...prev,
      name,
      slug: editingType ? prev.slug : autoSlug
    }));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const getIconComponent = (iconName) => {
    const Icon = ICON_MAP[iconName] || Calendar;
    return <Icon className="w-5 h-5" />;
  };

  // Format timing display
  const formatTiming = (ct) => {
    if (ct.timingLabel) return ct.timingLabel;
    const days = ct.defaultTimingDays || 0;
    const direction = ct.timingDirection || 'before';
    if (days === 0 && direction === 'after') return 'Immediately';
    return `${days} days ${direction}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campaign Types</h1>
          <p className="text-muted-foreground mt-1">
            Define the trigger types available for automated campaigns. Each type maps to a date field on the client record.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Campaign Type
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : campaignTypes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Campaign Types Defined</h3>
            <p className="text-muted-foreground mb-4">
              Create your first campaign type to get started. Common types include Birthday, Welcome, and Renewal.
            </p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Trigger Field</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Default Timing</TableHead>
                <TableHead>Max Steps</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignTypes.map(ct => (
                <TableRow key={ct.id}>
                  <TableCell>{getIconComponent(ct.icon)}</TableCell>
                  <TableCell className="font-medium">{ct.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{ct.slug}</TableCell>
                  <TableCell className="font-mono text-sm">{ct.triggerField}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      ct.triggerMode === 'recurring'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {ct.triggerMode === 'recurring' ? 'Recurring' : 'One-time'}
                    </span>
                  </TableCell>
                  <TableCell>{formatTiming(ct)}</TableCell>
                  <TableCell>{ct.maxSteps}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      ct.isActive !== false
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {ct.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(ct)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDelete(ct)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingType ? 'Edit Campaign Type' : 'Create Campaign Type'}</DialogTitle>
            <DialogDescription>
              {editingType
                ? 'Update the settings for this campaign type.'
                : 'Define a new trigger type for automated campaigns. This will appear as an option when users create campaigns.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div>
              <Label>Name *</Label>
              <Input
                placeholder="e.g., Birthday, Closing Anniversary"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            {/* Slug */}
            <div>
              <Label>Slug *</Label>
              <Input
                placeholder="e.g., birthday, closing_anniversary"
                value={form.slug}
                onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                className="font-mono"
                disabled={!!editingType}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unique identifier used internally. Auto-generated from name. Cannot be changed after creation.
              </p>
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe when this campaign triggers and why it's useful"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Trigger Field */}
            <div>
              <Label>Trigger Field *</Label>
              <Input
                placeholder="e.g., birthday, renewal_date, closing_date"
                value={form.triggerField}
                onChange={(e) => setForm(prev => ({ ...prev, triggerField: e.target.value }))}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The field name on the Client record that holds the trigger date. Must match exactly.
              </p>
            </div>

            {/* Trigger Mode + Timing Direction */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Trigger Mode</Label>
                <Select
                  value={form.triggerMode}
                  onValueChange={(val) => setForm(prev => ({ ...prev, triggerMode: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recurring">Recurring (annual)</SelectItem>
                    <SelectItem value="one_time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Timing Direction</Label>
                <Select
                  value={form.timingDirection}
                  onValueChange={(val) => setForm(prev => ({ ...prev, timingDirection: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before the date</SelectItem>
                    <SelectItem value="after">After the date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Default Timing Days + Max Steps */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Default Timing Days</Label>
                <Input
                  type="number"
                  min="0"
                  max="365"
                  value={form.defaultTimingDays}
                  onChange={(e) => setForm(prev => ({ ...prev, defaultTimingDays: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground mt-1">Default days shown in the wizard</p>
              </div>
              <div>
                <Label>Max Steps</Label>
                <Input
                  type="number"
                  min="1"
                  max="3"
                  value={form.maxSteps}
                  onChange={(e) => setForm(prev => ({ ...prev, maxSteps: parseInt(e.target.value) || 1 }))}
                />
                <p className="text-xs text-muted-foreground mt-1">Max cards in a sequence (1-3)</p>
              </div>
            </div>

            {/* Timing Label */}
            <div>
              <Label>Timing Label (optional)</Label>
              <Input
                placeholder="e.g., days before their birthday"
                value={form.timingLabel}
                onChange={(e) => setForm(prev => ({ ...prev, timingLabel: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Override the auto-generated timing label. Leave blank to auto-generate.
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
              />
            </div>

            {/* Icon Picker */}
            <div>
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {ICON_OPTIONS.map(iconName => {
                  const Icon = ICON_MAP[iconName];
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, icon: iconName }))}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        form.icon === iconName
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent hover:border-gray-200'
                      }`}
                      title={iconName}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label>Active (visible to users when creating campaigns)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingType ? 'Save Changes' : 'Create Type'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingType?.name}&quot;? This will not affect existing campaigns that use this type, but users will no longer be able to create new campaigns with it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deletingType.id)}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}