// pages/QuickSendTemplates.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import QuickSendFilterControls from '@/components/quicksend/QuickSendFilterControls';
import QuickSendTemplateCard   from '@/components/quicksend/QuickSendTemplateCard';
import QuickSendSendModal      from '@/components/quicksend/QuickSendSendModal';

export default function QuickSendTemplates() {
  const navigate   = useNavigate();
  const { toast }  = useToast();

  // ── Data state ─────────────────────────────────────────────────────────────
  const [quickSendTemplates, setQuickSendTemplates] = useState([]);
  const [templates, setTemplates]   = useState([]);
  const [cardDesigns, setCardDesigns] = useState([]);
  const [user, setUser]             = useState(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);

  // ── Filter state ───────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({ search: '', viewMode: 'all', purpose: 'all' });

  // ── Delete dialog state ────────────────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // ── Send modal state ───────────────────────────────────────────────────────
  const [sendModalOpen, setSendModalOpen]     = useState(false);
  const [templateToSend, setTemplateToSend]   = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [personal, organization, platform] = await Promise.all([
        base44.entities.QuickSendTemplate.filter({ createdByUserId: currentUser.id, type: 'personal' }),
        base44.entities.QuickSendTemplate.filter({ orgId: currentUser.orgId, type: 'organization', isActive: true }),
        base44.entities.QuickSendTemplate.filter({ type: 'platform', isActive: true }),
      ]);

      const all = [...personal, ...organization, ...platform];
      setQuickSendTemplates(all);

      const templateIds   = [...new Set(all.map(t => t.templateId).filter(Boolean))];
      const cardDesignIds = [...new Set(all.map(t => t.cardDesignId).filter(Boolean))];

      if (templateIds.length > 0) {
        const list = await base44.entities.Template.filter({ id: { $in: templateIds } });
        setTemplates(list);
      }
      if (cardDesignIds.length > 0) {
        const list = await base44.entities.CardDesign.filter({ id: { $in: cardDesignIds } });
        setCardDesigns(list);
      }
    } catch (err) {
      console.error('Failed to fetch QuickSends:', err);
      setError('Could not load QuickSends. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Lookup maps ────────────────────────────────────────────────────────────
  const templateMap = useMemo(() => {
    const map = {};
    templates.forEach(t => { map[t.id] = t; });
    return map;
  }, [templates]);

  const cardDesignMap = useMemo(() => {
    const map = {};
    cardDesigns.forEach(d => { map[d.id] = d; });
    return map;
  }, [cardDesigns]);

  // ── Filter logic ───────────────────────────────────────────────────────────
  const filteredTemplates = useMemo(() => {
    let filtered = quickSendTemplates;

    if (filters.viewMode === 'my')       filtered = filtered.filter(t => t.createdByUserId === user?.id);
    else if (filters.viewMode === 'org') filtered = filtered.filter(t => t.type === 'organization');
    else if (filters.viewMode === 'platform') filtered = filtered.filter(t => t.type === 'platform');

    if (filters.purpose !== 'all') filtered = filtered.filter(t => t.purpose === filters.purpose);

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(t => {
        const nameMatch    = t.name?.toLowerCase().includes(q);
        const contentMatch = templateMap[t.templateId]?.content?.toLowerCase().includes(q);
        return nameMatch || contentMatch;
      });
    }

    filtered.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return (a.sortOrder || 0) - (b.sortOrder || 0);
      return (a.name || '').localeCompare(b.name || '');
    });

    return filtered;
  }, [quickSendTemplates, filters, user, templateMap]);

  // ── Permission helper ──────────────────────────────────────────────────────
  const canEditTemplate = (template) => {
    if (!user) return false;
    if (template.type === 'platform')      return user.appRole === 'super_admin';
    if (template.type === 'organization')  return user.appRole === 'organization_owner' || user.appRole === 'super_admin';
    return template.createdByUserId === user.id;
  };

  // ── Display helpers ────────────────────────────────────────────────────────
  const getPreviewSnippet = (qst) => {
    if (qst.previewSnippet) return qst.previewSnippet;
    const linked = templateMap[qst.templateId];
    if (linked?.content) return linked.content.substring(0, 100) + (linked.content.length > 100 ? '...' : '');
    return 'No message content';
  };

  const getCardDesignThumbnail = (qst) => {
    const design = cardDesignMap[qst.cardDesignId];
    return design?.frontImageUrl || design?.outsideImageUrl || design?.imageUrl || null;
  };

  // ── Action handlers ────────────────────────────────────────────────────────
  const handleSend = (template) => {
    setTemplateToSend(template);
    setSendModalOpen(true);
  };

  const handleEdit = (template) => {
    navigate(createPageUrl(`EditQuickSendTemplate?id=${template.id}`));
  };

  const handleDuplicate = (template) => {
    navigate(createPageUrl(`EditQuickSendTemplate?id=new&duplicate=${template.id}`));
  };

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      await base44.entities.QuickSendTemplate.delete(templateToDelete.id);
      setQuickSendTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
      toast({ title: 'QuickSend deleted', description: 'The QuickSend has been permanently deleted.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto py-4 px-6 max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">QuickSends</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Pre-configured card bundles for fast sending. Skip the wizard and send in seconds.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate(createPageUrl('EditQuickSendTemplate?id=new'))}
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            New QuickSend
          </Button>
        </div>

        {/* Filters */}
        <QuickSendFilterControls filters={filters} setFilters={setFilters} />

        {/* Loading */}
        {isLoading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filteredTemplates.length === 0 && (
          <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No QuickSends</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.viewMode !== 'all' || filters.purpose !== 'all'
                ? 'No QuickSends match your filters.'
                : 'Create your first QuickSend to start sending cards faster.'}
            </p>
            {filters.viewMode === 'all' && filters.purpose === 'all' && !filters.search && (
              <Button
                onClick={() => navigate(createPageUrl('EditQuickSendTemplate?id=new'))}
                className="bg-amber-500 hover:bg-amber-600"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First QuickSend
              </Button>
            )}
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && filteredTemplates.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              QuickSends ({filteredTemplates.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <QuickSendTemplateCard
                  key={template.id}
                  template={template}
                  thumbnailUrl={getCardDesignThumbnail(template)}
                  previewSnippet={getPreviewSnippet(template)}
                  canEdit={canEditTemplate(template)}
                  onSend={() => handleSend(template)}
                  onEdit={() => handleEdit(template)}
                  onDuplicate={() => handleDuplicate(template)}
                  onDelete={() => handleDeleteClick(template)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Send modal */}
        <QuickSendSendModal
          open={sendModalOpen}
          onOpenChange={setSendModalOpen}
          template={templateToSend}
          thumbnailUrl={templateToSend ? getCardDesignThumbnail(templateToSend) : null}
          previewSnippet={templateToSend ? getPreviewSnippet(templateToSend) : ''}
        />

        {/* Delete dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete QuickSend?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </TooltipProvider>
  );
}