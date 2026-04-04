import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  ArrowLeft, Loader2, Rocket, Save, Plus, X, AlertTriangle, Info,
  Check, HelpCircle, Cake, Gift, RefreshCw, Calendar, Home,
  Shield, Heart, Star, Clock, AlertCircle, Settings2, Mail,
  Users, Sparkles, PartyPopper, Award, Bell, Zap, Key, TrendingUp,
  Handshake, HardHat, Building, ChevronRight, ZoomIn
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

import CardPreviewNew from '@/components/preview/CardPreviewNew';
import CardDesignPickerModal from '@/components/quicksend/CardDesignPickerModal';
import TemplatePickerModal from '@/components/quicksend/TemplatePickerModal';
import PlaceholderSelector from '@/components/mailing/PlaceholderSelector';

// ── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP = {
  Cake, Gift, RefreshCw, Calendar, Home, Shield, Heart, Star,
  Clock, AlertCircle, Settings2, Mail, Users, Sparkles,
  PartyPopper, Award, Bell, Zap, Check, Key, TrendingUp,
  Handshake, HardHat, Building, HelpCircle,
};
const getIcon = (name) => ICON_MAP[name] || HelpCircle;

// ── Per-slug icon accent colors ───────────────────────────────────────────────
const TYPE_COLORS = {
  birthday:         { hex: '#db2777', bg: '#fdf2f8' },
  welcome:          { hex: '#2563eb', bg: '#eff6ff' },
  renewal:          { hex: '#16a34a', bg: '#f0fdf4' },
  home_anniversary: { hex: '#16a34a', bg: '#f0fdf4' },
  post_close:       { hex: '#d97706', bg: '#fffbeb' },
  loan_anniversary: { hex: '#0d9488', bg: '#f0fdfa' },
  soi_quarterly:    { hex: '#7c3aed', bg: '#f5f3ff' },
};
const getTypeColor = (slug) => TYPE_COLORS[slug] || { hex: '#6b7280', bg: '#f9fafb' };

// ── Campaign type → TemplateCategory slug mapping ────────────────────────────
// Slugs match the TemplateCategory records seeded by seedInitialContent / seedInitialData
const TYPE_TO_CATEGORY_SLUG = {
  birthday:         'birthday',
  welcome:          'welcome',
  renewal:          'just-because',
  home_anniversary: 'anniversary',
  post_close:       'congratulations',
  loan_anniversary: 'anniversary',
  soi_quarterly:    'just-because',
};

// ── Sample client for live preview ───────────────────────────────────────────
const SAMPLE_CLIENT = {
  firstName: 'Sarah', lastName: 'Johnson', fullName: 'Sarah Johnson',
  company: 'ABC Realty', email: 'sarah@abcrealty.com', phone: '(555) 123-4567',
  street: '123 Oak Street', city: 'Walnut Creek', state: 'CA', zipCode: '94596',
};

// ── Fallback preview settings ─────────────────────────────────────────────────
const FALLBACK_PREVIEW = {
  fontSize: 22, lineHeight: 1, baseTextWidth: 360, baseMarginLeft: 40,
  shortCardMaxLines: 13, maxPreviewLines: 19, topHalfPaddingTop: 345,
  longCardTopPadding: 110, gapAboveFold: 14, gapBelowFold: 14,
  maxIndent: 16, indentAmplitude: 6, indentNoise: 2, indentFrequency: 0.35,
  frameWidth: 412, frameHeight: 600,
};

const makeDefaultStep = (timingDays = -10) => ({
  stepOrder: 1, cardDesignId: null, templateId: null,
  messageText: '', timingDays, timingReference: 'trigger_date', isEnabled: true,
});

// ── Strip characters the robot pen cannot write ───────────────────────────────
const sanitizeMessage = (text) => {
  if (!text) return '';
  return Array.from(text).filter(char => {
    const cp = char.codePointAt(0);
    if (cp === 0x000A) return true;
    if (cp >= 0x0020 && cp <= 0x007E) return true;
    if (cp >= 0x00A0 && cp <= 0x024F) return true;
    if (cp === 0x2013 || cp === 0x2014) return true;
    if (cp >= 0x2018 && cp <= 0x201D) return true;
    if (cp === 0x2026) return true;
    return false;
  }).join('');
};

export default function CampaignSetupWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const textareaRef = useRef(null);

  // Remote data
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [campaignTypes, setCampaignTypes] = useState([]);
  const [cardDesigns, setCardDesigns] = useState([]);
  const [cardDesignCategories, setCardDesignCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateCategories, setTemplateCategories] = useState([]);
  const [noteStyleProfiles, setNoteStyleProfiles] = useState([]);
  const [previewSettings, setPreviewSettings] = useState(FALLBACK_PREVIEW);
  const [loading, setLoading] = useState(true);

  // Eligible count
  const [eligibleCount, setEligibleCount] = useState(null);
  const [loadingCount, setLoadingCount] = useState(false);

  // Form state
  const [campaignName, setCampaignName] = useState('');
  const [selectedTypeSlug, setSelectedTypeSlug] = useState(null);
  const [enrollmentMode, setEnrollmentMode] = useState('opt_out');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [returnAddressMode, setReturnAddressMode] = useState('company');
  const [steps, setSteps] = useState([makeDefaultStep(-10)]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [messageMode, setMessageMode] = useState('template');

  // Custom message modal state
  const [customMsgOpen, setCustomMsgOpen] = useState(false);
  const [customMsgDraft, setCustomMsgDraft] = useState('');
  const [includeGreeting, setIncludeGreeting] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);

  // Modal state
  const [designPickerOpen, setDesignPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [cardEnlargeOpen, setCardEnlargeOpen] = useState(false);
  const [cardEnlargeFace, setCardEnlargeFace] = useState('front');
  const [submitting, setSubmitting] = useState(false);

  // ── Load all data ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const [types, designs, designCats, msgs, tmplCats, profiles] = await Promise.all([
          base44.entities.CampaignType.filter({ isActive: true }),
          base44.entities.CardDesign.filter({ type: 'platform' }),
          base44.entities.CardDesignCategory.filter({ orgId: null }),
          base44.entities.Template.list(),
          // Load TemplateCategory records so we can filter by them
          base44.entities.TemplateCategory.list().catch(() => []),
          base44.entities.NoteStyleProfile.list(),
        ]);

        types.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setCampaignTypes(types);
        setCardDesigns(designs || []);
        setCardDesignCategories(
          (designCats || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        );
        setTemplates(msgs || []);
        setTemplateCategories(tmplCats || []);
        setNoteStyleProfiles(profiles || []);

        if (currentUser?.orgId) {
          const orgs = await base44.entities.Organization.filter({ id: currentUser.orgId });
          setOrganization(orgs[0] || null);
        }

        try {
          const s = await base44.functions.invoke('getInstanceSettings');
          if (s.data?.cardPreviewSettings) {
            setPreviewSettings({ ...FALLBACK_PREVIEW, ...s.data.cardPreviewSettings });
          }
        } catch { /* use fallback */ }
      } catch (err) {
        toast({ title: 'Error loading data', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Eligible count ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedTypeSlug) { setEligibleCount(null); return; }
    const t = campaignTypes.find(ct => ct.slug === selectedTypeSlug);
    if (!t) return;
    setLoadingCount(true);
    base44.functions.invoke('getEligibleClientCount', {
      campaignType: selectedTypeSlug, dateField: t.triggerField,
    })
      .then(r => { if (r.data?.success) setEligibleCount(r.data.count); })
      .catch(() => setEligibleCount(0))
      .finally(() => setLoadingCount(false));
  }, [selectedTypeSlug, campaignTypes]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const selectedType = useMemo(
    () => campaignTypes.find(t => t.slug === selectedTypeSlug) || null,
    [campaignTypes, selectedTypeSlug]
  );

  const currentStep = steps[activeStepIndex] || steps[0];

  const selectedDesign = useMemo(
    () => cardDesigns.find(d => d.id === currentStep.cardDesignId) || null,
    [cardDesigns, currentStep.cardDesignId]
  );

  const selectedTemplate = useMemo(
    () => templates.find(t => t.id === currentStep.templateId) || null,
    [templates, currentStep.templateId]
  );

  const defaultNoteStyle = useMemo(
    () => noteStyleProfiles.find(p => p.isDefault) || noteStyleProfiles[0] || null,
    [noteStyleProfiles]
  );

  const previewMessage = useMemo(() => {
    const raw = messageMode === 'template'
      ? (selectedTemplate?.content || '')
      : (currentStep.messageText || '');
    return sanitizeMessage(raw);
  }, [messageMode, selectedTemplate, currentStep.messageText]);

  // ── Category ID for current campaign type ─────────────────────────────────
  // Maps campaign slug → TemplateCategory slug → TemplateCategory ID
  const defaultCategoryId = useMemo(() => {
    if (!selectedTypeSlug || templateCategories.length === 0) return null;
    const catSlug = TYPE_TO_CATEGORY_SLUG[selectedTypeSlug];
    if (!catSlug) return null;
    const cat = templateCategories.find(c => c.slug === catSlug);
    return cat?.id || null;
  }, [selectedTypeSlug, templateCategories]);

  const companyAddress = organization?.companyReturnAddress || null;
  const repAddress = user?.street ? {
    name: user.returnAddressName || user.fullName || user.full_name || '',
    street: user.street, city: user.city, state: user.state, zip: user.zipCode,
  } : null;

  const timingDisplayValue = Math.abs(currentStep.timingDays || 0);

  const timingLabel = useMemo(() => {
    if (!selectedType) return 'days';
    if (selectedType.timingLabel) return selectedType.timingLabel;
    const dir = selectedType.timingDirection || 'before';
    return `days ${dir} their ${selectedType.name.toLowerCase()} date`;
  }, [selectedType]);

  const needsNewField = selectedType?.triggerField &&
    !['birthday', 'renewal_date', 'policy_start_date', 'createdAt'].includes(
      selectedType.triggerField
    );

  const estAnnual = eligibleCount !== null && selectedType
    ? eligibleCount * steps.length : null;
  const estMonthly = estAnnual !== null && selectedType
    ? (selectedType.triggerMode === 'one_time'
        ? estAnnual
        : Math.ceil(estAnnual / 12) || 1)
    : null;

  // ── Step helpers ───────────────────────────────────────────────────────────
  const updateStep = (index, updates) =>
    setSteps(prev => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));

  const addStep = () => {
    if (!selectedType || steps.length >= (selectedType.maxSteps || 2)) return;
    const isBefore = selectedType.timingDirection === 'before';
    const newDays = isBefore
      ? -(Math.abs(currentStep.timingDays || 10) + 30)
      : Math.abs(currentStep.timingDays || 0) + 30;
    setSteps(prev => [...prev, { ...makeDefaultStep(newDays), stepOrder: prev.length + 1 }]);
  };

  const removeStep = (index) => {
    if (steps.length <= 1) return;
    setSteps(prev =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepOrder: i + 1 }))
    );
    if (activeStepIndex >= steps.length - 1) setActiveStepIndex(steps.length - 2);
  };

  // ── Type selection — auto-select first matching template by category ────────
  const handleTypeSelect = useCallback((slug) => {
    const type = campaignTypes.find(t => t.slug === slug);
    setSelectedTypeSlug(slug);
    const isBefore = type?.timingDirection === 'before';
    const isOn = type?.timingDirection === 'on';
    const days = type?.defaultTimingDays || 10;
    const defaultTimingDays = isOn ? 0 : isBefore ? -days : days;

    // Find matching TemplateCategory
    const catSlug = TYPE_TO_CATEGORY_SLUG[slug];
    const matchCat = catSlug
      ? templateCategories.find(c => c.slug === catSlug)
      : null;

    // Auto-select first template in that category
    let autoTemplateId = null;
    if (matchCat) {
      const match = templates.find(t =>
        Array.isArray(t.templateCategoryIds) &&
        t.templateCategoryIds.includes(matchCat.id)
      );
      autoTemplateId = match?.id || null;
    }

    setSteps([{ ...makeDefaultStep(defaultTimingDays), templateId: autoTemplateId }]);
    setActiveStepIndex(0);
    setMessageMode('template');
  }, [campaignTypes, templates, templateCategories]);

  // ── Design / template handlers ─────────────────────────────────────────────
  const handleDesignSelect = (design) => {
    updateStep(activeStepIndex, { cardDesignId: design.id });
    setDesignPickerOpen(false);
  };

  const handleTemplateSelect = (template) => {
    updateStep(activeStepIndex, { templateId: template.id, messageText: '' });
    setMessageMode('template');
    setTemplatePickerOpen(false);
  };

  const openDesignPicker = (idx) => { setActiveStepIndex(idx); setDesignPickerOpen(true); };
  const openTemplatePicker = (idx) => { setActiveStepIndex(idx); setTemplatePickerOpen(true); };

  // ── Custom message modal ───────────────────────────────────────────────────
  const openCustomModal = () => {
    setCustomMsgDraft(currentStep.messageText || '');
    setCustomMsgOpen(true);
  };

  const saveCustomMessage = () => {
    const sanitized = sanitizeMessage(customMsgDraft);
    updateStep(activeStepIndex, { messageText: sanitized, templateId: null });
    setMessageMode('custom');
    setCustomMsgOpen(false);
  };

  const handlePlaceholderInsert = (placeholder) => {
    const el = textareaRef.current;
    if (!el) {
      setCustomMsgDraft(prev => prev + placeholder);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = customMsgDraft.substring(0, start) + placeholder + customMsgDraft.substring(end);
    setCustomMsgDraft(next);
    // Restore cursor after React re-render
    requestAnimationFrame(() => {
      el.selectionStart = start + placeholder.length;
      el.selectionEnd = start + placeholder.length;
      el.focus();
    });
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const isValid = useMemo(() => {
    if (!campaignName.trim() || !selectedTypeSlug) return false;
    return steps.every(s => {
      const hasDesign = !!s.cardDesignId;
      const hasMsg = messageMode === 'template'
        ? !!s.templateId
        : !!s.messageText?.trim();
      return hasDesign && hasMsg;
    });
  }, [campaignName, selectedTypeSlug, steps, messageMode]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submit = async (status) => {
    if (status === 'active' && !isValid) return;
    if (!campaignName.trim()) return;
    setSubmitting(true);
    try {
      const stepsPayload = steps.map(s => ({
        ...s,
        templateId: messageMode === 'template' ? s.templateId : null,
        messageText: messageMode === 'custom' ? s.messageText : '',
      }));
      const resp = await base44.functions.invoke('createCampaign', {
        name: campaignName.trim(), type: selectedTypeSlug,
        triggerTypeId: selectedType?.id || null,
        dateField: selectedType?.triggerField || null,
        enrollmentMode, requiresApproval, returnAddressMode, status,
        steps: stepsPayload,
      });
      if (!resp.data?.success) throw new Error(resp.data?.error || 'Failed to create campaign');
      toast({
        title: status === 'active' ? 'Campaign activated!' : 'Draft saved',
        description: status === 'active'
          ? `${resp.data.enrolledCount || 0} clients enrolled.`
          : 'Campaign saved as draft.',
      });
      navigate(createPageUrl('Campaigns'));
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Address tooltip text ───────────────────────────────────────────────────
  const companyTip = companyAddress
    ? [
        companyAddress.name || organization?.name || '',
        companyAddress.street || '',
        `${companyAddress.city || ''}, ${companyAddress.state || ''} ${companyAddress.zip || ''}`,
      ].filter(Boolean).join('\n')
    : 'No company address set.\nAdd one in Company Settings.';

  const repTip = repAddress
    ? [
        repAddress.name,
        repAddress.street,
        `${repAddress.city}, ${repAddress.state} ${repAddress.zip}`,
      ].filter(Boolean).join('\n')
    : 'No rep address set.\nAdd one in Settings > Addresses.';

  // ── Enlarge modal image ────────────────────────────────────────────────────
  const enlargeUrl = cardEnlargeFace === 'front'
    ? (selectedDesign?.frontImageUrl || selectedDesign?.outsideImageUrl)
    : (selectedDesign?.backImageUrl || selectedDesign?.insideImageUrl);

  return (
    <TooltipProvider>
      <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost" size="sm"
              onClick={() => navigate(createPageUrl('Campaigns'))}
              className="gap-1.5 text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Campaigns
            </Button>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-base font-bold text-foreground">Create Campaign</h1>
          </div>
          <div className="flex items-center gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <Button
              variant="outline" size="sm"
              onClick={() => submit('draft')}
              disabled={!campaignName.trim() || submitting}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => submit('active')}
              disabled={!isValid || submitting}
              className="gap-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-accent-foreground"
            >
              <Rocket className="w-4 h-4" />
              Activate Campaign
            </Button>
          </div>
        </div>

        {/* ── Campaign name ────────────────────────────────────────────────── */}
        <div className="px-6 py-3 border-b border-border bg-background flex-shrink-0">
          <div className="flex items-center gap-4">
            <Label
              htmlFor="camp-name"
              className="text-sm font-bold text-foreground whitespace-nowrap"
            >
              Campaign name
            </Label>
            <Input
              id="camp-name"
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              placeholder="e.g. Home Anniversary — Past Buyers"
              className="text-base font-medium max-w-2xl text-foreground"
            />
            {!campaignName.trim() && selectedTypeSlug && (
              <span className="text-sm text-muted-foreground">
                Enter a name before activating
              </span>
            )}
          </div>
        </div>

        {/* ── Three columns ────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ═══ COL 1 — 320px ══════════════════════════════════════════════ */}
          <div
            className="border-r border-border overflow-y-auto flex-shrink-0"
            style={{ width: '420px', padding: '16px 20px' }}
          >
            <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
              Campaign type
            </p>

            {campaignTypes.length === 0 ? (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800 leading-snug">
                  No campaign types found. Run{' '}
                  <code className="font-mono text-xs">seedCampaignTypes</code> from the
                  Base44 dashboard.
                </p>
              </div>
            ) : (
              <div className="space-y-2 mb-5">
                {campaignTypes.map(ct => {
                  const Icon = getIcon(ct.icon);
                  const isActive = selectedTypeSlug === ct.slug;
                  const { hex, bg } = getTypeColor(ct.slug);
                  return (
                    <button
                      key={ct.id}
                      onClick={() => handleTypeSelect(ct.slug)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all text-left ${
                        isActive
                          ? 'border-brand-accent shadow-sm'
                          : 'border-border hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      style={isActive ? { background: bg } : {}}
                    >
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: bg }}
                      >
                        <Icon className="w-5 h-5" style={{ color: hex }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground leading-tight">
                          {ct.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-snug truncate">
                          {ct.description ||
                            (ct.triggerMode === 'one_time' ? 'One-time send' : 'Annual recurring')}
                        </div>
                      </div>
                      {isActive && (
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: hex }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedType && needsNewField && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800 leading-snug">
                  Requires{' '}
                  <code className="font-mono text-xs">{selectedType.triggerField}</code> on
                  client records
                </p>
              </div>
            )}

            <div className="border-t border-border my-4" />

            {/* Enrollment mode */}
            <p className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Enrollment mode
            </p>
            <div className="flex rounded-xl border-2 border-border overflow-hidden mb-2">
              {[
                { val: 'opt_out', label: 'Auto-enroll' },
                { val: 'opt_in', label: 'Manual only' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  className="flex-1 py-2.5 text-sm text-center font-semibold transition-colors"
                  style={enrollmentMode === val
                    ? { background: '#E86C2C', color: '#ffffff' }
                    : { color: '#6b7280' }}
                  onClick={() => setEnrollmentMode(val)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mb-5 leading-snug">
              {enrollmentMode === 'opt_out'
                ? 'Every eligible client is enrolled automatically when this campaign activates. You can exclude individuals at any time.'
                : 'No clients are enrolled until you add them manually from the Clients page.'}
            </p>

            <div className="border-t border-border my-4" />

            {/* Return address */}
            <p className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
              Return address
            </p>
            <div className="flex gap-2 flex-wrap mb-5">
              {[
                { key: 'company', label: 'Company', tip: companyTip },
                { key: 'rep', label: 'Rep', tip: repTip },
                { key: 'none', label: 'None', tip: 'No return address\nprinted on envelope' },
              ].map(({ key, label, tip }) => (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setReturnAddressMode(key)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        returnAddressMode === key
                          ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                          : 'border-border text-foreground hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="whitespace-pre-line text-sm max-w-[220px] p-3"
                  >
                    {tip}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Stats */}
            {selectedType && (
              <>
                <div className="border-t border-border my-4" />
                <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
                  Estimated reach
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: loadingCount ? '…' : (eligibleCount ?? '—'), lbl: 'clients' },
                    { val: estAnnual !== null ? `~${estAnnual}` : '—', lbl: 'cards/yr' },
                    { val: organization?.creditBalance ?? '—', lbl: 'balance' },
                  ].map(({ val, lbl }) => (
                    <div key={lbl} className="rounded-lg bg-gray-100 px-2 py-3 text-center">
                      <div className="text-lg font-bold text-brand-accent leading-none">{val}</div>
                      <div className="text-xs text-gray-500 mt-1">{lbl}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ═══ COL 2 — flex-1 ═════════════════════════════════════════════ */}
          <div
            className="flex-1 overflow-y-auto border-r border-border"
            style={{ padding: '16px 28px' }}
          >
            {/* Step tabs */}
            {steps.length > 1 && (
              <div className="flex items-center gap-2 mb-6">
                {steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStepIndex(i)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                      activeStepIndex === i
                        ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                        : 'border-border text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Card {i + 1}
                    {i > 0 && (
                      <span
                        role="button"
                        onClick={e => { e.stopPropagation(); removeStep(i); }}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                ))}
                {selectedType && steps.length < (selectedType.maxSteps || 2) && (
                  <button
                    onClick={addStep}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-dashed border-border text-sm font-medium text-gray-500 hover:border-brand-accent hover:text-brand-accent transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add card
                  </button>
                )}
              </div>
            )}

            {/* Timing */}
            {selectedType && selectedType.timingDirection !== 'on' && (
              <div className="mb-7">
                <p className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                  Timing
                </p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number" min={0} max={365}
                    value={timingDisplayValue}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      const isBefore = selectedType.timingDirection === 'before';
                      updateStep(activeStepIndex, { timingDays: isBefore ? -val : val });
                    }}
                    className="w-24 text-center text-base font-semibold"
                  />
                  <span className="text-sm text-foreground">{timingLabel}</span>
                </div>
              </div>
            )}

            {/* Card design */}
            <div className="mb-7">
              <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
                Card design
              </p>
              <div className="flex items-start gap-5">
                {/* Thumbnail — click to ENLARGE */}
                <div
                  className={`flex-shrink-0 rounded-xl border-2 overflow-hidden relative group ${
                    selectedDesign
                      ? 'border-border cursor-zoom-in hover:border-brand-accent'
                      : 'border-dashed border-border cursor-pointer'
                  }`}
                  style={{ width: '200px', aspectRatio: '11/8' }}
                  onClick={() => {
                    if (selectedDesign) {
                      setCardEnlargeFace('front');
                      setCardEnlargeOpen(true);
                    } else {
                      openDesignPicker(activeStepIndex);
                    }
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
                        No card designs loaded. Add designs via Admin Portal &gt; Card Designs.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">
                        {selectedDesign ? selectedDesign.name : 'No card selected'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDesignPicker(activeStepIndex)}
                        className="gap-2 w-full justify-center font-medium"
                      >
                        {selectedDesign ? 'Change card design' : 'Select card design'}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      {selectedDesign && (
                        <p className="text-xs text-gray-500">
                          Click the image to preview larger
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="mb-7">
              <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
                Message
              </p>
              <RadioGroup
                value={messageMode}
                onValueChange={val => {
                  if (val === 'custom') {
                    openCustomModal();
                  } else {
                    setMessageMode('template');
                    updateStep(activeStepIndex, { messageText: '' });
                  }
                }}
                className="flex gap-6 mb-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="template" id="msg-tmpl" />
                  <Label htmlFor="msg-tmpl" className="text-sm cursor-pointer text-foreground font-normal">
                    Use a saved template
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="custom" id="msg-custom" />
                  <Label htmlFor="msg-custom" className="text-sm cursor-pointer text-foreground font-normal">
                    Write a custom message
                  </Label>
                </div>
              </RadioGroup>

              {messageMode === 'template' ? (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => openTemplatePicker(activeStepIndex)}
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
              ) : (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-gray-50 border border-border">
                    <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3 mb-2">
                      {currentStep.messageText || '(No message written yet)'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openCustomModal}
                      className="gap-2"
                    >
                      Edit message
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Require approval */}
            <div className="flex items-center justify-between p-4 border-2 border-border rounded-xl mb-6">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Require approval before sending
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Cards go to your approval queue — you review before anything is sent
                </p>
              </div>
              <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} />
            </div>

            {/* Add second card */}
            {steps.length === 1 && selectedType && (selectedType.maxSteps || 2) > 1 && (
              <button
                onClick={addStep}
                className="w-full py-4 border-2 border-dashed border-border rounded-xl text-sm font-medium text-gray-500 hover:border-brand-accent hover:text-brand-accent transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add a second card to this campaign
              </button>
            )}
          </div>

          {/* ═══ COL 3: PREVIEW — 480px ══════════════════════════════════════ */}
          <div
            className="flex-shrink-0 overflow-y-auto"
            style={{ width: '480px', padding: '16px 24px' }}
          >
            <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
              Live preview — sample: {SAMPLE_CLIENT.firstName} {SAMPLE_CLIENT.lastName}
            </p>

            <div className="flex justify-center mb-4">
              {previewMessage && defaultNoteStyle ? (
                <CardPreviewNew
                  message={previewMessage}
                  client={SAMPLE_CLIENT}
                  user={user}
                  organization={organization}
                  noteStyleProfile={defaultNoteStyle}
                  selectedDesign={selectedDesign}
                  previewSettings={previewSettings}
                  includeGreeting={includeGreeting}
                  includeSignature={includeSignature}
                  randomIndentEnabled={true}
                  showLineCounter={true}
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-gray-50"
                  style={{ width: '412px', height: '480px' }}
                >
                  <div className="text-center px-8">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Info className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {!selectedTypeSlug
                        ? 'Select a campaign type to get started'
                        : !defaultNoteStyle
                        ? 'No writing styles loaded. Run seedNoteStyleProfiles from the Base44 dashboard.'
                        : messageMode === 'template'
                        ? 'Select a message template to see the handwriting preview'
                        : 'Write a message to see the handwriting preview'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Credit estimate */}
            {selectedType && eligibleCount !== null && (
              <div className="p-4 rounded-xl border-2 border-border bg-gray-50">
                <p className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">
                  Estimated credit usage
                </p>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-2xl font-bold text-brand-accent leading-none">
                      ~{estMonthly ?? '—'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">credits / month</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-brand-accent leading-none">
                      ~{estAnnual ?? '—'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">credits / year</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-snug">
                  {eligibleCount} client{eligibleCount !== 1 ? 's' : ''} × {steps.length} card
                  {steps.length > 1 ? 's' : ''}
                  {organization?.creditBalance !== undefined
                    ? ` · Balance: ${organization.creditBalance} credits`
                    : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Custom message modal ────────────────────────────────────────────── */}
      <Dialog open={customMsgOpen} onOpenChange={setCustomMsgOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write a Custom Message</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              ref={textareaRef}
              value={customMsgDraft}
              onChange={e => setCustomMsgDraft(sanitizeMessage(e.target.value))}
              onPaste={e => {
                e.preventDefault();
                const pasted = e.clipboardData.getData('text');
                const sanitized = sanitizeMessage(pasted);
                const el = e.target;
                const start = el.selectionStart;
                const end = el.selectionEnd;
                const next =
                  customMsgDraft.substring(0, start) +
                  sanitized +
                  customMsgDraft.substring(end);
                setCustomMsgDraft(next);
              }}
              placeholder={'Write your message here…\n\nUse placeholders like {{client.firstName}} for personalization.'}
              className="min-h-[200px] text-sm resize-none"
              rows={8}
            />

            {/* Placeholder selector */}
            <div className="flex items-center gap-4">
              <PlaceholderSelector onPlaceholderSelect={handlePlaceholderInsert} />
              <span className="text-xs text-gray-400">
                Placeholders are replaced with real data when each card is sent
              </span>
            </div>

            {/* Include greeting / signature */}
            <div className="flex items-center gap-6 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="inc-greeting"
                  checked={includeGreeting}
                  onCheckedChange={setIncludeGreeting}
                />
                <Label htmlFor="inc-greeting" className="text-sm cursor-pointer font-normal">
                  Include greeting
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="inc-signature"
                  checked={includeSignature}
                  onCheckedChange={setIncludeSignature}
                />
                <Label htmlFor="inc-signature" className="text-sm cursor-pointer font-normal">
                  Include signature
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomMsgOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveCustomMessage}
              disabled={!customMsgDraft.trim()}
              className="bg-brand-accent hover:bg-brand-accent/90 text-brand-accent-foreground"
            >
              Save Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Card enlarge modal ────────────────────────────────────────────── */}
      <Dialog open={cardEnlargeOpen} onOpenChange={setCardEnlargeOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedDesign?.name || 'Card Preview'}</DialogTitle>
          </DialogHeader>

          {/* Front / Back toggle — styled like segmented control */}
          <div className="flex rounded-xl border-2 border-border overflow-hidden w-36 mb-4">
            {['front', 'back'].map(face => (
              <button
                key={face}
                className="flex-1 py-2 text-sm font-semibold capitalize transition-colors"
                style={cardEnlargeFace === face
                  ? { background: '#E86C2C', color: '#ffffff' }
                  : { color: '#6b7280' }}
                onClick={() => setCardEnlargeFace(face)}
              >
                {face}
              </button>
            ))}
          </div>

          <div
            className="w-full rounded-xl overflow-hidden border-2 border-border"
            style={{ aspectRatio: '11/8' }}
          >
            {enlargeUrl ? (
              <img
                src={enlargeUrl}
                alt={`${selectedDesign?.name} ${cardEnlargeFace}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <p className="text-sm text-gray-400">
                  No {cardEnlargeFace} image available
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 text-center">
            5.5″ × 4″ physical card · Handwritten inside by our robots
          </p>
        </DialogContent>
      </Dialog>

      {/* ── Design / Template pickers ─────────────────────────────────────── */}
      <CardDesignPickerModal
        open={designPickerOpen}
        onOpenChange={setDesignPickerOpen}
        designs={cardDesigns}
        categories={cardDesignCategories}
        selectedId={steps[activeStepIndex]?.cardDesignId}
        onSelect={handleDesignSelect}
      />

      <TemplatePickerModal
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        templates={templates}
        selectedId={steps[activeStepIndex]?.templateId}
        onSelect={handleTemplateSelect}
        user={user}
        defaultCategoryId={defaultCategoryId}
        templateCategories={templateCategories}
        defaultPurpose="all"
      />
    </TooltipProvider>
  );
}