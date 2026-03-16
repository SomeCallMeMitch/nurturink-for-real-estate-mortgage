import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Plus, Pencil, Trash2, Cake, Gift, RefreshCw, Calendar, Home,
  Shield, Heart, Star, Clock, AlertCircle, Loader2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Map of available Lucide icon names to components
const ICON_MAP = {
  Cake, Gift, RefreshCw, Calendar, Home, Shield, Heart, Star, Clock, AlertCircle
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const EMPTY_FORM = {
  name: '',
  key: '',
  description: '',
  dateField: '',
  defaultDaysBefore: 0,
  defaultDaysAfter: 0,
  icon: 'Calendar',
  isActive: true
};

export default function AdminCampaignTypes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [deletingType, setDeletingType] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Fetch all TriggerType records
  const { data: triggerTypes = [], isLoading } = useQuery({
    queryKey: ['triggerTypes'],
    queryFn: () => base44.entities.TriggerType.list()
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TriggerType.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggerTypes'] });
      toast({ title: 'Campaign type created successfully' });
      closeDialog();
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TriggerType.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggerTypes'] });
      toast({ title: 'Campaign type updated successfully' });
      closeDialog();
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TriggerType.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggerTypes'] });
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

  const openEdit = (tt) => {
    setEditingType(tt);
    setForm({
      name: tt.name || '',
      key: tt.key || '',
      description: tt.description || '',
      dateField: tt.dateField || '',
      defaultDaysBefore: tt.defaultDaysBefore || 0,
      defaultDaysAfter: tt.defaultDaysAfter || 0,
      icon: tt.icon || 'Calendar',
      isActive: tt.isActive !== false
    });
    setDialogOpen(true);
  };

  const openDelete = (tt) => {
    setDeletingType(tt);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.key.trim() || !form.dateField.trim()) {
      toast({ title: 'Missing required fields', description: 'Name, Key, and Date Field are required.', variant: 'destructive' });
      return;
    }
    // Auto-generate key from name if not manually set
    const cleanKey = form.key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const payload = { ...form, key: cleanKey };

    if (editingType) {
      updateMutation.mutate({ id: editingType.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleNameChange = (name) => {
    const autoKey = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    setForm(prev => ({
      ...prev,
      name,
      key: editingType ? prev.key : autoKey // Only auto-generate key for new types
    }));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const getIconComponent = (iconName) => {
    const Icon = ICON_MAP[iconName] || Calendar;
    return <Icon className="w-5 h-5" />;
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
      ) : triggerTypes.length === 0 ? (
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
                <TableHead>Key</TableHead>
                <TableHead>Client Date Field</TableHead>
                <TableHead>Default Timing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {triggerTypes.map(tt => (
                <TableRow key={tt.id}>
                  <TableCell>{getIconComponent(tt.icon)}</TableCell>
                  <TableCell className="font-medium">{tt.name}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{tt.key}</TableCell>
                  <TableCell className="font-mono text-sm">{tt.dateField}</TableCell>
                  <TableCell>
                    {(tt.defaultDaysBefore || 0) > 0
                      ? `${tt.defaultDaysBefore} days before`
                      : (tt.defaultDaysAfter || 0) > 0
                        ? `${tt.defaultDaysAfter} days after`
                        : 'On the date'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tt.isActive !== false
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tt.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(tt)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDelete(tt)}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingType ? 'Edit Campaign Type' : 'Create Campaign Type'}</DialogTitle>
            <DialogDescription>
              {editingType
                ? 'Update the settings for this campaign type.'
                : 'Define a new trigger type for automated campaigns. This will appear as an option when users create campaigns.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Name *</Label>
              <Input
                placeholder="e.g., Birthday, Closing Anniversary"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div>
              <Label>Key *</Label>
              <Input
                placeholder="e.g., birthday, closing_anniversary"
                value={form.key}
                onChange={(e) => setForm(prev => ({ ...prev, key: e.target.value }))}
                className="font-mono"
                disabled={!!editingType}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unique identifier used internally. Auto-generated from name.
              </p>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe when this campaign triggers and why it's useful"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div>
              <Label>Client Date Field *</Label>
              <Input
                placeholder="e.g., birthday, renewal_date, closing_date"
                value={form.dateField}
                onChange={(e) => setForm(prev => ({ ...prev, dateField: e.target.value }))}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The field name on the Client record that holds the trigger date. Must match exactly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Days Before</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.defaultDaysBefore}
                  onChange={(e) => setForm(prev => ({ ...prev, defaultDaysBefore: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground mt-1">Send card X days before the date</p>
              </div>
              <div>
                <Label>Days After</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.defaultDaysAfter}
                  onChange={(e) => setForm(prev => ({ ...prev, defaultDaysAfter: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground mt-1">Send card X days after the date</p>
              </div>
            </div>

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