// ─────────────────────────────────────────────────────────────────────────────
// EditQuickSendTemplate.jsx  (redesigned)
// Paste to: src/pages/EditQuickSendTemplate.jsx  (replaces existing file)
//
// Layout matches CampaignSetupWizard — viewport-height, 3 fixed-width columns,
// same section header style, same card thumbnail + zoom, same preview panel.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft, Save, Loader2, Zap, ChevronRight, ZoomIn, AlertTriangle,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { PURPOSE_OPTIONS } from '@/components/utils/quickSendConstants';

import CardDesignPickerModal from '@/components/quicksend/CardDesignPickerModal';
import TemplatePickerModal   from '@/components/quicksend/TemplatePickerModal';
import CampaignPreviewPanel  from '@/components/campaigns/CampaignPreviewPanel';
import CardEnlargeModal      from '@/components/campaigns/CardEnlargeModal';
import { FALLBACK_PREVIEW, sanitizeMessage } from '@/components/campaigns/campaignWizardConfig';

// ── Default form state ────────────────────────────────────────────────────────
const DEFAULT_FORM = {
  name: '', purpose: 'thank_you', templateId: '', noteStyleProfileId: '',
  cardDesignId: '', returnAddressMode: 'company', includeGreeting: true,
  includeSignature: true, type: 'personal', isDefault: false,
  isActive: true, sortOrder: 0,
};

export default function EditQuickSendTemplate() {
  const navigate  = useNavigate();
  const { toast } = useToast();

  // ── URL params ─────────────────────────────────────────────────────────────
  const urlParams   = new URLSearchParams(window.location.search);
  const templateId  = urlParams.get('id');
  const duplicateId = urlParams.get('duplicate');
  const isNew       = templateId === 'new';
  const isDuplicate = isNew && duplicateId;

  // ── Remote data ────────────────────────────────────────────────────────────
  const [user, setUser]                           = useState(null);
  const [organization, setOrganization]           = useState(null);
  const [templates, setTemplates]                 = useState([]);
  const [templateCategories, setTemplateCategories] = useState([]);
  const [noteStyleProfiles, setNoteStyleProfiles] = useState([]);
  const [cardDesigns, setCardDesigns]             = useState([]);
  const [cardDesignCategories, setCardDesignCategories] = useState([]);
  const [previewSettings, setPreviewSettings]     = useState(FALLBACK_PREVIEW);
  const [loading, setLoading]                     = useState(true);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData]           = useState(DEFAULT_FORM);
  const [initialFormData, setInitialFormData] = useState(null);
  const [saving, setSaving]               = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showDesignPicker, setShowDesignPicker]     = useState(false);
  const [cardEnlargeOpen, setCardEnlargeOpen]       = useState(false);
  const [cardEnlargeFace, setCardEnlargeFace]       = useState('front');

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (currentUser.orgId) {
          const orgs = await base44.entities.Organization.filter({ id: currentUser.orgId });
          setOrganization(orgs[0] || null);
        }

        const [personal, org, platform, tmplCats, profiles, designs, designCats] =
          await Promise.all([
            base44.entities.Template.filter({ createdByUserId: currentUser.id, type: 'personal' }),
            base44.entities.Template.filter({ orgId: currentUser.orgId, type: 'organization', status: 'approved' }),
            base44.entities.Template.filter({ orgId: currentUser.orgId, type: 'platform', status: 'approved' }),
            base44.entities.TemplateCategory.list().catch(() => []),
            base44.entities.NoteStyleProfile.filter({ orgId: currentUser.orgId }),
            base44.entities.CardDesign.filter({ type: 'platform' }),
            base44.entities.CardDesignCategory.filter({ orgId: null }),
          ]);

        setTemplates([...personal, ...org, ...platform]);
        setTemplateCategories(tmplCats || []);
        setNoteStyleProfiles(profiles || []);
        setCardDesigns(designs || []);
        setCardDesignCategories(
          (designCats || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        );

        try {
          const s = await base44.functions.invoke('getInstanceSettings');
          if (s.data?.cardPreviewSettings) {
            setPreviewSettings({ ...FALLBACK_PREVIEW, ...s.data.cardPreviewSettings });
          }
        } catch { /* use fallback */ }

        await initForm(currentUser, profiles, designs);
      } catch (err) {
        toast({ title: 'Error loading data', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [templateId, duplicateId]);

  // ── Unsaved changes tracking ───────────────────────────────────────────────
  useEffect(() => {
    if (!initialFormData) return;
    if (isDuplicate)  { setHasUnsavedChanges(true); return; }
    if (isNew)        { setHasUnsavedChanges(formData.name.trim() !== ''); return; }
    setHasUnsavedChanges(JSON.stringify(formData) !== JSON.stringify(initialFormData));
  }, [formData, initialFormData, isDuplicate, isNew]);

  useEffect(() => {
    const handler = (e) => { if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // ── Init form ──────────────────────────────────────────────────────────────
  const initForm = async (currentUser, profiles, designs) => {
    const defaultProfile = profiles.find(p => p.isDefault) || profiles[0];
    const defaultDesign  = designs.find(d => d.isDefault)  || designs[0];

    if (isNew && !isDuplicate) {
      const d = { ...DEFAULT_FORM, noteStyleProfileId: defaultProfile?.id || '', cardDesignId: defaultDesign?.id || '' };
      setFormData(d); setInitialFormData(d);
      return;
    }

    const sourceId = isDuplicate ? duplicateId : templateId;
    const existing = await base44.entities.QuickSendTemplate.filter({ id: sourceId });
    if (!existing?.length) {
      toast({ title: 'QuickSend not found', variant: 'destructive' });
      navigate(createPageUrl('QuickSendTemplates'));
      return;
    }

    const src = existing[0];
    const d = {
      name:              isDuplicate ? `${src.name} (Copy)` : (src.name || ''),
      purpose:           src.purpose           || 'thank_you',
      templateId:        src.templateId        || '',
      noteStyleProfileId: src.noteStyleProfileId || '',
      cardDesignId:      src.cardDesignId      || '',
      returnAddressMode: src.returnAddressMode || 'company',
      includeGreeting:   src.includeGreeting   ?? true,
      includeSignature:  src.includeSignature  ?? true,
      type:              isDuplicate ? 'personal' : (src.type || 'personal'),
      isDefault:         isDuplicate ? false : (src.isDefault || false),
      isActive:          src.isActive          ?? true,
      sortOrder:         src.sortOrder         || 0,
      ...(isDuplicate ? {} : { id: src.id }),
    };
    setFormData(d); setInitialFormData(d);
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const update = (updates) => setFormData(prev => ({ ...prev, ...updates }));

  const selectedTemplate = useMemo(
    () => templates.find(t => t.id === formData.templateId) || null,
    [templates, formData.templateId]
  );

  const selectedNoteStyle = useMemo(
    () => noteStyleProfiles.find(p => p.id === formData.noteStyleProfileId) || noteStyleProfiles.find(p => p.isDefault) || noteStyleProfiles[0] || null,
    [noteStyleProfiles, formData.noteStyleProfileId]
  );

  const selectedDesign = useMemo(
    () => cardDesigns.find(d => d.id === formData.cardDesignId) || null,
    [cardDesigns, formData.cardDesignId]
  );

  const previewMessage = useMemo(
    () => sanitizeMessage(selectedTemplate?.content || ''),
    [selectedTemplate]
  );

  const canSetOrgVisibility      = user?.appRole === 'organization_owner' || user?.appRole === 'super_admin';
  const canSetPlatformVisibility = user?.appRole === 'super_admin';

  const purposeLabel = PURPOSE_OPTIONS.find(p => p.value === formData.purpose)?.label || formData.purpose;

  const companyAddress = organization?.companyReturnAddress || null;
  const repAddress     = user?.street ? { name: user.returnAddressName || user.fullName || '', street: user.street, city: user.city, state: user.state, zip: user.zipCode } : null;

  const companyTip = companyAddress
    ? [companyAddress.name || organization?.name || '', companyAddress.street || '', `${companyAddress.city || ''}, ${companyAddress.state || ''} ${companyAddress.zip || ''}`].filter(Boolean).join('\n')
    : 'No company address set.\nAdd one in Company Settings.';

  const repTip = repAddress
    ? [repAddress.name, repAddress.street, `${repAddress.city}, ${repAddress.state} ${repAddress.zip}`].filter(Boolean).join('\n')
    : 'No rep address set.\nAdd one in Settings > Addresses.';

  const enlargeUrl = cardEnlargeFace === 'front'
    ? (selectedDesign?.frontImageUrl || selectedDesign?.outsideImageUrl)
    : (selectedDesign?.backImageUrl  || selectedDesign?.insideImageUrl);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.name.trim())         return toast({ title: 'Name required', variant: 'destructive' });
    if (!formData.templateId)          return toast({ title: 'Message template required', variant: 'destructive' });
    if (!formData.noteStyleProfileId)  return toast({ title: 'Writing style required', variant: 'destructive' });
    if (!formData.cardDesignId)        return toast({ title: 'Card design required', variant: 'destructive' });

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(), purpose: formData.purpose,
        templateId: formData.templateId, noteStyleProfileId: formData.noteStyleProfileId,
        cardDesignId: formData.cardDesignId, returnAddressMode: formData.returnAddressMode,
        includeGreeting: formData.includeGreeting, includeSignature: formData.includeSignature,
        type: formData.type, isDefault: formData.isDefault,
        isActive: formData.isActive, sortOrder: formData.sortOrder,
        previewSnippet: selectedTemplate?.content?.substring(0, 100) || '',
        createdByUserId: user.id,
        orgId: formData.type === 'organization' ? user.orgId : null,
      };

      if (isNew || isDuplicate) {
        await base44.entities.QuickSendTemplate.create(payload);
        toast({ title: 'QuickSend created' });
      } else {
        await base44.entities.QuickSendTemplate.update(templateId, payload);
        toast({ title: 'QuickSend updated' });
      }
      navigate(createPageUrl('QuickSendTemplates'));
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) setShowUnsavedDialog(true);
    else navigate(createPageUrl('QuickSendTemplates'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>

        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-1.5 text-foreground">
              <ArrowLeft className="w-4 h-4" />
              QuickSends
            </Button>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-base font-bold text-foreground">
              {isNew ? (isDuplicate ? 'Duplicate' : 'Create') : 'Edit'} QuickSend
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-accent-foreground"
            >
              <Save className="w-4 h-4" />
              {isNew || isDuplicate ? 'Create' : 'Update'} QuickSend
            </Button>
          </div>
        </div>

        {/* ── Three columns ─────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ═══ COL 1 — 420px ══════════════════════════════════════════ */}
          <div
            className="border-r border-border overflow-y-auto flex-shrink-0"
            style={{ width: '420px', padding: '16px 20px' }}
          >
            {/* Name */}
            <p className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              QuickSend name
            </p>
            <Input
              value={formData.name}
              onChange={e => update({ name: e.target.value })}
              placeholder="e.g. Post-Closing Thank You"
              className="text-sm font-medium mb-5"
            />

            <div className="border-t border-border my-4" />

            {/* Purpose */}
            <p className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Purpose
            </p>
            <Select value={formData.purpose} onValueChange={val => update({ purpose: val })}>
              <SelectTrigger className="mb-5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PURPOSE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="border-t border-border my-4" />

            {/* Writing style */}
            <p className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Writing style
            </p>
            <Select value={formData.noteStyleProfileId} onValueChange={val => update({ noteStyleProfileId: val })}>
              <SelectTrigger className="mb-1">
                <SelectValue placeholder="Select a writing style…" />
              </SelectTrigger>
              <SelectContent>
                {noteStyleProfiles.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}{p.isDefault ? ' (Default)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mb-5">
              Controls the greeting and signature format
            </p>

            <div className="border-t border-border my-4" />

            {/* Return address */}
            <p className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Return address
            </p>
            <div className="flex gap-2 flex-wrap mb-5">
              {[
                { key: 'company', label: 'Company', tip: companyTip },
                { key: 'rep',     label: 'Rep',     tip: repTip },
                { key: 'none',    label: 'None',    tip: 'No return address\nprinted on envelope' },
              ].map(({ key, label, tip }) => (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => update({ returnAddressMode: key })}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        formData.returnAddressMode === key
                          ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                          : 'border-border text-foreground hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="whitespace-pre-line text-sm max-w-[220px] p-3">
                    {tip}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            <div className="border-t border-border my-4" />

            {/* Visibility */}
            <p className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Visibility
            </p>
            <Select value={formData.type} onValueChange={val => update({ type: val })}>
              <SelectTrigger className="mb-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal — only you</SelectItem>
                {canSetOrgVisibility && (
                  <SelectItem value="organization">Organization — all team members</SelectItem>
                )}
                {canSetPlatformVisibility && (
                  <SelectItem value="platform">Platform — all users</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mb-4">
              {formData.type === 'personal'     && 'Only you can see and use this QuickSend'}
              {formData.type === 'organization' && 'All members of your organization can use this QuickSend'}
              {formData.type === 'platform'     && 'All users across the platform can use this QuickSend'}
            </p>

            {(formData.type === 'organization' || formData.type === 'platform') && (
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={checked => update({ isDefault: checked })}
                />
                <Label htmlFor="isDefault" className="text-sm cursor-pointer font-normal">
                  Set as default for "{purposeLabel}"
                </Label>
              </div>
            )}

            {formData.id && (
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={checked => update({ isActive: checked })}
                />
                <Label htmlFor="isActive" className="text-sm cursor-pointer font-normal">
                  QuickSend is active
                </Label>
              </div>
            )}
          </div>

          {/* ═══ COL 2 — flex-1 ════════════════════════════════════════ */}
          <div
            className="flex-1 overflow-y-auto border-r border-border"
            style={{ padding: '16px 28px' }}
          >
            {/* Card design */}
            <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
              Card design
            </p>
            <div className="flex items-start gap-5 mb-7">
              {/* Thumbnail — click to enlarge */}
              <div
                className={`flex-shrink-0 rounded-xl border-2 overflow-hidden relative group ${
                  selectedDesign
                    ? 'border-border cursor-zoom-in hover:border-brand-accent'
                    : 'border-dashed border-border cursor-pointer'
                }`}
                style={{ width: '200px', aspectRatio: '11/8' }}
                onClick={() => {
                  if (selectedDesign) { setCardEnlargeFace('front'); setCardEnlargeOpen(true); }
                  else setShowDesignPicker(true);
                }}
              >
                {selectedDesign?.frontImageUrl || selectedDesign?.outsideImageUrl ? (
                  <>
                    <img
                      src={selectedDesign.frontImageUrl || selectedDesign.outsideImageUrl}
                      alt={selectedDesign.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-400 text-center px-2 leading-snug">
                      {cardDesigns.length === 0 ? 'No designs\nloaded' : 'No design\nselected'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                {cardDesigns.length === 0 ? (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800 leading-snug">
                      No card designs loaded. Add designs via Admin Portal.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      {selectedDesign ? selectedDesign.name : 'No card selected'}
                    </p>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setShowDesignPicker(true)}
                      className="gap-2 w-full justify-center font-medium"
                    >
                      {selectedDesign ? 'Change card design' : 'Select card design'}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    {selectedDesign && (
                      <p className="text-xs text-gray-500">Click the image to preview larger</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Message template */}
            <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
              Message
            </p>
            <div className="mb-7 space-y-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplatePicker(true)}
                className={`w-full justify-between text-sm font-medium ${
                  !selectedTemplate ? 'border-dashed text-gray-500' : 'text-foreground'
                }`}
              >
                <span className="truncate">
                  {selectedTemplate ? selectedTemplate.name : 'Select a message template…'}
                </span>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">Browse</span>
              </Button>
              {selectedTemplate && (
                <p className="text-sm text-gray-500 italic leading-relaxed line-clamp-2 px-1">
                  {selectedTemplate.content?.substring(0, 160)}…
                </p>
              )}
            </div>

            {/* Greeting / Signature */}
            <div className="border-t border-border my-4" />
            <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
              Card formatting
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="incGreeting"
                  checked={formData.includeGreeting}
                  onCheckedChange={checked => update({ includeGreeting: checked })}
                />
                <Label htmlFor="incGreeting" className="text-sm cursor-pointer font-normal">
                  Include greeting
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="incSignature"
                  checked={formData.includeSignature}
                  onCheckedChange={checked => update({ includeSignature: checked })}
                />
                <Label htmlFor="incSignature" className="text-sm cursor-pointer font-normal">
                  Include signature
                </Label>
              </div>
            </div>
          </div>

          {/* ═══ COL 3 — 480px preview ════════════════════════════════ */}
          <CampaignPreviewPanel
            previewMessage={previewMessage}
            defaultNoteStyle={selectedNoteStyle}
            selectedDesign={selectedDesign}
            user={user}
            organization={organization}
            previewSettings={previewSettings}
            includeGreeting={formData.includeGreeting}
            includeSignature={formData.includeSignature}
            selectedType={null}
            eligibleCount={null}
            estMonthly={null}
            estAnnual={null}
            steps={[]}
          />
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <CardEnlargeModal
        open={cardEnlargeOpen}
        onOpenChange={setCardEnlargeOpen}
        selectedDesign={selectedDesign}
        cardEnlargeFace={cardEnlargeFace}
        setCardEnlargeFace={setCardEnlargeFace}
        enlargeUrl={enlargeUrl}
      />

      <CardDesignPickerModal
        open={showDesignPicker}
        onOpenChange={setShowDesignPicker}
        designs={cardDesigns}
        categories={cardDesignCategories}
        selectedId={formData.cardDesignId}
        onSelect={d => { update({ cardDesignId: d.id }); setShowDesignPicker(false); }}
      />

      <TemplatePickerModal
        open={showTemplatePicker}
        onOpenChange={setShowTemplatePicker}
        templates={templates}
        selectedId={formData.templateId}
        onSelect={t => { update({ templateId: t.id }); setShowTemplatePicker(false); }}
        user={user}
        templateCategories={templateCategories}
        defaultCategoryId={null}
        defaultPurpose={formData.purpose !== 'custom' ? formData.purpose : 'all'}
      />

      {/* ── Unsaved changes dialog ───────────────────────────────────────────── */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setShowUnsavedDialog(false); navigate(createPageUrl('QuickSendTemplates')); }}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}