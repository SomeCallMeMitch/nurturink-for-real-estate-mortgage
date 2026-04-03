import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { ArrowLeft, Loader2, Rocket, Save, Plus, X, AlertTriangle, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

import CardPreviewNew from '@/components/preview/CardPreviewNew';
import CardDesignPickerModal from '@/components/quicksend/CardDesignPickerModal';
import TemplatePickerModal from '@/components/quicksend/TemplatePickerModal';

// ── Sample client used only for the live preview panel ──────────────────────
const SAMPLE_CLIENT = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  fullName: 'Sarah Johnson',
  company: 'ABC Realty',
  email: 'sarah@abcrealty.com',
  phone: '(555) 123-4567',
  street: '123 Oak Street',
  city: 'Walnut Creek',
  state: 'CA',
  zipCode: '94596',
};

// ── Fallback preview settings if instanceSettings fails to load ──────────────
const FALLBACK_PREVIEW_SETTINGS = {
  fontSize: 22,
  lineHeight: 1,
  baseTextWidth: 360,
  baseMarginLeft: 40,
  shortCardMaxLines: 13,
  maxPreviewLines: 19,
  topHalfPaddingTop: 345,
  longCardTopPadding: 110,
  gapAboveFold: 14,
  gapBelowFold: 14,
  maxIndent: 16,
  indentAmplitude: 6,
  indentNoise: 2,
  indentFrequency: 0.35,
  frameWidth: 412,
  frameHeight: 600,
};

// ── Default step template ────────────────────────────────────────────────────
const makeDefaultStep = (timingDays = -10) => ({
  stepOrder: 1,
  cardDesignId: null,
  templateId: null,
  messageText: '',
  timingDays,
  timingReference: 'trigger_date',
  isEnabled: true,
});

export default function CampaignSetupWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Remote data ────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [campaignTypes, setCampaignTypes] = useState([]);
  const [cardDesigns, setCardDesigns] = useState([]);
  const [cardDesignCategories, setCardDesignCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [noteStyleProfiles, setNoteStyleProfiles] = useState([]);
  const [previewSettings, setPreviewSettings] = useState(FALLBACK_PREVIEW_SETTINGS);
  const [loading, setLoading] = useState(true);

  // ── Eligible client count ──────────────────────────────────────────────────
  const [eligibleCount, setEligibleCount] = useState(null);
  const [loadingCount, setLoadingCount] = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [campaignName, setCampaignName] = useState('');
  const [selectedTypeSlug, setSelectedTypeSlug] = useState(null);
  const [enrollmentMode, setEnrollmentMode] = useState('opt_out');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [returnAddressMode, setReturnAddressMode] = useState('company');

  // Card/message step (single step for now — add second card handled below)
  const [steps, setSteps] = useState([makeDefaultStep(-10)]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [messageMode, setMessageMode] = useState('template'); // 'template' | 'custom'

  // ── Modal state ────────────────────────────────────────────────────────────
  const [designPickerOpen, setDesignPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  // ── Submission state ───────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);

  // ── Load all data on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [
          currentUser,
          types,
          designs,
          designCats,
          msgs,
          profiles,
        ] = await Promise.all([
          base44.auth.me(),
          base44.entities.CampaignType.filter({ isActive: true }),
          base44.entities.CardDesign.filter({ type: 'platform' }),
          base44.entities.CardDesignCategory.filter({ orgId: null }),
          base44.entities.Template.list(),
          base44.entities.NoteStyleProfile.list(),
        ]);

        setUser(currentUser);
        types.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setCampaignTypes(types);
        setCardDesigns(designs || []);
        setCardDesignCategories(
          (designCats || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        );
        setTemplates(msgs || []);
        setNoteStyleProfiles(profiles || []);

        if (currentUser?.orgId) {
          const orgs = await base44.entities.Organization.filter({
            id: currentUser.orgId,
          });
          setOrganization(orgs[0] || null);
        }

        try {
          const settingsResp = await base44.functions.invoke('getInstanceSettings');
          if (settingsResp.data?.cardPreviewSettings) {
            setPreviewSettings({
              ...FALLBACK_PREVIEW_SETTINGS,
              ...settingsResp.data.cardPreviewSettings,
            });
          }
        } catch {
          // Use fallback — already set
        }
      } catch (err) {
        console.error('Failed to load campaign data:', err);
        toast({
          title: 'Error loading data',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Fetch eligible client count when type or dateField changes ─────────────
  useEffect(() => {
    if (!selectedTypeSlug) {
      setEligibleCount(null);
      return;
    }
    const selectedType = campaignTypes.find(t => t.slug === selectedTypeSlug);
    if (!selectedType) return;

    const fetchCount = async () => {
      setLoadingCount(true);
      try {
        const resp = await base44.functions.invoke('getEligibleClientCount', {
          campaignType: selectedTypeSlug,
          dateField: selectedType.triggerField,
        });
        if (resp.data?.success) setEligibleCount(resp.data.count);
      } catch {
        setEligibleCount(0);
      } finally {
        setLoadingCount(false);
      }
    };
    fetchCount();
  }, [selectedTypeSlug, campaignTypes]);

  // ── Derived helpers ────────────────────────────────────────────────────────
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
    if (messageMode === 'template') return selectedTemplate?.content || '';
    return currentStep.messageText || '';
  }, [messageMode, selectedTemplate, currentStep.messageText]);

  const companyAddress = organization?.companyReturnAddress || null;
  const repAddress = user?.street
    ? {
        name: user.returnAddressName || user.fullName || user.full_name || '',
        street: user.street,
        city: user.city,
        state: user.state,
        zip: user.zipCode,
      }
    : null;

  const timingDisplayValue = Math.abs(currentStep.timingDays || 0);

  const timingLabel = useMemo(() => {
    if (!selectedType) return 'days';
    if (selectedType.timingLabel) return selectedType.timingLabel;
    const dir = selectedType.timingDirection || 'before';
    const trigger = selectedType.name?.toLowerCase() || 'trigger date';
    return `days ${dir} their ${trigger}`;
  }, [selectedType]);

  const needsClosingDate =
    selectedType?.triggerField === 'closing_date' ||
    selectedType?.triggerField === 'sale_date' ||
    selectedType?.triggerField === 'loan_date';

  // ── Credit estimates ───────────────────────────────────────────────────────
  const estMonthly = useMemo(() => {
    if (eligibleCount === null || !selectedType) return null;
    if (selectedType.triggerMode === 'one_time') return eligibleCount;
    const stepsCount = steps.length;
    return Math.ceil((eligibleCount * stepsCount) / 12) || 1;
  }, [eligibleCount, selectedType, steps.length]);

  const estAnnual = useMemo(() => {
    if (eligibleCount === null || !selectedType) return null;
    return eligibleCount * steps.length;
  }, [eligibleCount, selectedType, steps.length]);

  // ── Step update helpers ────────────────────────────────────────────────────
  const updateStep = (index, updates) => {
    setSteps(prev =>
      prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  };

  const addStep = () => {
    if (!selectedType) return;
    const maxSteps = selectedType.maxSteps || 2;
    if (steps.length >= maxSteps) return;
    const isBefore = selectedType.timingDirection === 'before';
    const newDays = isBefore
      ? -(Math.abs(currentStep.timingDays || 10) + 30)
      : Math.abs(currentStep.timingDays || 0) + 30;
    setSteps(prev => [
      ...prev,
      {
        ...makeDefaultStep(newDays),
        stepOrder: prev.length + 1,
      },
    ]);
  };

  const removeStep = index => {
    if (steps.length <= 1) return;
    setSteps(prev =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, stepOrder: i + 1 }))
    );
    if (activeStepIndex >= steps.length - 1) {
      setActiveStepIndex(steps.length - 2);
    }
  };

  // ── Type selection ─────────────────────────────────────────────────────────
  const handleTypeSelect = (slug) => {
    const type = campaignTypes.find(t => t.slug === slug);
    setSelectedTypeSlug(slug);
    const isBefore = type?.timingDirection === 'before';
    const days = type?.defaultTimingDays || 10;
    setSteps([makeDefaultStep(isBefore ? -days : days)]);
    setActiveStepIndex(0);
    setMessageMode('template');
  };

  // ── Design / template picker callbacks ────────────────────────────────────
  const handleDesignSelect = design => {
    updateStep(activeStepIndex, { cardDesignId: design.id });
    setDesignPickerOpen(false);
  };

  const handleTemplateSelect = template => {
    updateStep(activeStepIndex, { templateId: template.id, messageText: '' });
    setMessageMode('template');
    setTemplatePickerOpen(false);
  };

  const openDesignPicker = idx => {
    setActiveStepIndex(idx);
    setDesignPickerOpen(true);
  };

  const openTemplatePicker = idx => {
    setActiveStepIndex(idx);
    setTemplatePickerOpen(true);
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const isValid = useMemo(() => {
    if (!campaignName.trim()) return false;
    if (!selectedTypeSlug) return false;
    return steps.every(s => {
      const hasDesign = !!s.cardDesignId;
      const hasMessage = messageMode === 'template'
        ? !!s.templateId
        : !!s.messageText?.trim();
      return hasDesign && hasMessage;
    });
  }, [campaignName, selectedTypeSlug, steps, messageMode]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submit = async (status) => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const stepsPayload = steps.map(s => ({
        ...s,
        templateId: messageMode === 'template' ? s.templateId : null,
        messageText: messageMode === 'custom' ? s.messageText : '',
      }));

      const resp = await base44.functions.invoke('createCampaign', {
        name: campaignName.trim(),
        type: selectedTypeSlug,
        triggerTypeId: selectedType?.id || null,
        dateField: selectedType?.triggerField || null,
        enrollmentMode,
        requiresApproval,
        returnAddressMode,
        status,
        steps: stepsPayload,
      });

      if (!resp.data?.success) {
        throw new Error(resp.data?.error || 'Failed to create campaign');
      }

      toast({
        title: status === 'active' ? 'Campaign activated!' : 'Draft saved',
        description:
          status === 'active'
            ? `${resp.data.enrolledCount || 0} clients enrolled.`
            : 'Your campaign has been saved as a draft.',
      });
      navigate(createPageUrl('Campaigns'));
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Return address tooltip content ─────────────────────────────────────────
  const companyAddressText = companyAddress
    ? `${companyAddress.name || organization?.name || ''}\n${companyAddress.street || ''}\n${companyAddress.city || ''}, ${companyAddress.state || ''} ${companyAddress.zip || ''}`.trim()
    : 'No company address set — add one in Company Settings';

  const repAddressText = repAddress
    ? `${repAddress.name}\n${repAddress.street}\n${repAddress.city}, ${repAddress.state} ${repAddress.zip}`.trim()
    : 'No rep address set — add one in Settings > Addresses';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(createPageUrl('Campaigns'))}
              className="gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Campaigns
            </Button>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-base font-semibold">Create Campaign</h1>
          </div>
          <div className="flex items-center gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <Button
              variant="outline"
              size="sm"
              onClick={() => submit('draft')}
              disabled={!campaignName.trim() || !selectedTypeSlug || submitting}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => submit('active')}
              disabled={!isValid || submitting}
              className="gap-1.5 bg-brand-accent hover:bg-brand-accent/90 text-brand-accent-foreground"
            >
              <Rocket className="w-3.5 h-3.5" />
              Activate Campaign
            </Button>
          </div>
        </div>

        {/* ── Campaign name — full width ── */}
        <div className="px-6 py-3 border-b border-border bg-background">
          <div className="flex items-center gap-3 max-w-[1200px] mx-auto">
            <Label
              htmlFor="campaign-name"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
            >
              Campaign name
            </Label>
            <Input
              id="campaign-name"
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              placeholder="e.g. Home Anniversary — Past Buyers"
              className="text-base font-medium max-w-xl"
            />
            {!campaignName.trim() && selectedTypeSlug && (
              <span className="text-xs text-muted-foreground">
                Give this campaign a name before activating
              </span>
            )}
          </div>
        </div>

        {/* ── Three-column body ── */}
        <div
          className="flex-1 overflow-hidden"
          style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}
        >
          <div className="flex h-full" style={{ minHeight: 0 }}>

            {/* ═══ COL 1: WHAT (220px) ═══════════════════════════════════════ */}
            <div
              className="border-r border-border overflow-y-auto flex-shrink-0"
              style={{ width: '220px', padding: '16px 16px 16px 24px' }}
            >
              {/* Campaign type */}
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Campaign type
              </p>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {campaignTypes.map(ct => (
                  <button
                    key={ct.id}
                    onClick={() => handleTypeSelect(ct.slug)}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedTypeSlug === ct.slug
                        ? 'border-brand-accent bg-brand-accent/5'
                        : 'border-border hover:border-border/80 hover:bg-muted'
                    }`}
                  >
                    <div className="text-lg mb-0.5">{ct.icon || '📋'}</div>
                    <div className="text-[11px] font-medium leading-tight">{ct.name}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                      {ct.triggerMode === 'one_time' ? 'One-time' : 'Annual'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Type info badge */}
              {selectedType && (
                <div className="mb-4 space-y-1.5">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-brand-accent/40 text-brand-accent bg-brand-accent/5">
                    {selectedType.triggerMode === 'recurring' ? 'Recurring' : 'One-time'}
                  </div>
                  {needsClosingDate && (
                    <div className="flex items-start gap-1.5 p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                      <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] leading-snug">
                        Requires <code className="font-mono">closing_date</code> on client records
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-border my-3" />

              {/* Enrollment */}
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Enrollment
              </p>
              <div className="flex rounded-md border border-border overflow-hidden mb-1.5">
                <button
                  className={`flex-1 py-1.5 text-xs text-center transition-colors ${
                    enrollmentMode === 'opt_out'
                      ? 'bg-brand-accent text-brand-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => setEnrollmentMode('opt_out')}
                >
                  Auto-enroll
                </button>
                <button
                  className={`flex-1 py-1.5 text-xs text-center transition-colors ${
                    enrollmentMode === 'opt_in'
                      ? 'bg-brand-accent text-brand-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => setEnrollmentMode('opt_in')}
                >
                  Manual
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mb-4 leading-snug">
                {enrollmentMode === 'opt_out'
                  ? 'All eligible clients enrolled automatically'
                  : 'You manually add clients to this campaign'}
              </p>

              <div className="border-t border-border my-3" />

              {/* Return address */}
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Return address
              </p>
              <div className="flex gap-1.5 flex-wrap mb-4">
                {[
                  { key: 'company', label: 'Company', tip: companyAddressText },
                  { key: 'rep', label: 'Rep', tip: repAddressText },
                  { key: 'none', label: 'None', tip: 'No return address on envelope' },
                ].map(({ key, label, tip }) => (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setReturnAddressMode(key)}
                        className={`px-3 py-1 rounded-md border text-xs font-medium transition-all ${
                          returnAddressMode === key
                            ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {label}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="whitespace-pre-line max-w-[180px] text-xs">
                      {tip}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              {/* Stats */}
              {selectedType && (
                <>
                  <div className="border-t border-border my-3" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Enrollment
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      {
                        val: loadingCount ? '…' : (eligibleCount ?? '—'),
                        lbl: 'clients',
                      },
                      {
                        val: eligibleCount !== null ? `~${eligibleCount * steps.length}` : '—',
                        lbl: 'cards/yr',
                      },
                      {
                        val: organization?.creditBalance ?? '—',
                        lbl: 'credits',
                      },
                    ].map(({ val, lbl }) => (
                      <div
                        key={lbl}
                        className="rounded-md bg-muted px-1 py-1.5 text-center"
                      >
                        <div className="text-sm font-semibold text-brand-accent leading-none">
                          {val}
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">{lbl}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ═══ COL 2: HOW (flex-1, ~450px) ═══════════════════════════════ */}
            <div
              className="flex-1 overflow-y-auto border-r border-border"
              style={{ padding: '16px 20px' }}
            >
              {/* Step tabs (if multi-step) */}
              {steps.length > 1 && (
                <div className="flex items-center gap-2 mb-4">
                  {steps.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveStepIndex(i)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                        activeStepIndex === i
                          ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Card {i + 1}
                      {i > 0 && (
                        <span
                          onClick={e => { e.stopPropagation(); removeStep(i); }}
                          className="ml-1 rounded-full hover:bg-red-100 hover:text-red-600 p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  ))}
                  {selectedType && steps.length < (selectedType.maxSteps || 2) && (
                    <button
                      onClick={addStep}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:border-brand-accent hover:text-brand-accent transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      Add card
                    </button>
                  )}
                </div>
              )}

              {/* Timing */}
              {selectedType && selectedType.timingDirection !== 'on' && (
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Timing
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={365}
                      value={timingDisplayValue}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        const isBefore = selectedType.timingDirection === 'before';
                        updateStep(activeStepIndex, {
                          timingDays: isBefore ? -val : val,
                        });
                      }}
                      className="w-20 text-center text-sm"
                    />
                    <span className="text-sm text-muted-foreground">{timingLabel}</span>
                  </div>
                </div>
              )}

              {/* Card design */}
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Card design
                </p>
                <div className="flex items-start gap-3">
                  {/* Mini thumbnail — click to open picker */}
                  <div
                    className="flex-shrink-0 rounded-lg border border-border overflow-hidden cursor-pointer hover:border-brand-accent transition-colors relative group"
                    style={{ width: '80px', aspectRatio: '11/8' }}
                    onClick={() => openDesignPicker(activeStepIndex)}
                  >
                    {selectedDesign?.frontImageUrl || selectedDesign?.outsideImageUrl ? (
                      <img
                        src={selectedDesign.frontImageUrl || selectedDesign.outsideImageUrl}
                        alt={selectedDesign.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">
                          {selectedDesign ? 'No image' : 'No design'}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <span className="text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Change
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {selectedDesign ? (
                      <>
                        <p className="text-sm font-medium truncate">{selectedDesign.name}</p>
                        <button
                          onClick={() => openDesignPicker(activeStepIndex)}
                          className="text-xs text-brand-accent hover:underline mt-0.5"
                        >
                          Change design
                        </button>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Click card to enlarge preview
                        </p>
                      </>
                    ) : (
                      <button
                        onClick={() => openDesignPicker(activeStepIndex)}
                        className="text-sm text-brand-accent hover:underline"
                      >
                        Select a card design…
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Message
                </p>
                <RadioGroup
                  value={messageMode}
                  onValueChange={val => {
                    setMessageMode(val);
                    if (val === 'template') {
                      updateStep(activeStepIndex, { messageText: '' });
                    } else {
                      updateStep(activeStepIndex, { templateId: null });
                    }
                  }}
                  className="flex gap-4 mb-3"
                >
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="template" id="msg-tmpl" />
                    <Label htmlFor="msg-tmpl" className="text-sm cursor-pointer">
                      Use template
                    </Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="custom" id="msg-custom" />
                    <Label htmlFor="msg-custom" className="text-sm cursor-pointer">
                      Write custom
                    </Label>
                  </div>
                </RadioGroup>

                {messageMode === 'template' ? (
                  <div>
                    <button
                      onClick={() => openTemplatePicker(activeStepIndex)}
                      className={`w-full flex items-center justify-between px-3 py-2 border rounded-md text-sm transition-colors ${
                        selectedTemplate
                          ? 'border-border bg-background'
                          : 'border-dashed border-border text-muted-foreground hover:border-brand-accent hover:text-brand-accent'
                      }`}
                    >
                      <span className="truncate">
                        {selectedTemplate ? selectedTemplate.name : 'Select a message template…'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">Browse</span>
                    </button>
                    {selectedTemplate && (
                      <p className="mt-2 text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
                        {selectedTemplate.content?.substring(0, 120)}…
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <Textarea
                      value={currentStep.messageText || ''}
                      onChange={e =>
                        updateStep(activeStepIndex, { messageText: e.target.value })
                      }
                      placeholder="Write your message here…&#10;&#10;Use {{client.firstName}} for their name, {{me.firstName}} for yours."
                      className="text-sm resize-none"
                      rows={6}
                    />
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      Placeholders: {'{{client.firstName}}'} · {'{{client.lastName}}'} · {'{{me.firstName}}'}
                    </p>
                  </div>
                )}
              </div>

              {/* Require approval toggle */}
              <div className="flex items-center justify-between p-3 border border-border rounded-lg mb-5">
                <div>
                  <p className="text-sm font-medium">Require approval before sending</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cards go to your approval queue before being sent
                  </p>
                </div>
                <Switch
                  checked={requiresApproval}
                  onCheckedChange={setRequiresApproval}
                />
              </div>

              {/* Add second card (if only 1 step and type supports it) */}
              {steps.length === 1 && selectedType && (selectedType.maxSteps || 2) > 1 && (
                <button
                  onClick={addStep}
                  className="w-full py-3 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-brand-accent hover:text-brand-accent transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add a second card to this campaign
                </button>
              )}
            </div>

            {/* ═══ COL 3: PREVIEW (460px fixed) ════════════════════════════════ */}
            <div
              className="flex-shrink-0 overflow-y-auto"
              style={{ width: '460px', padding: '16px 24px 16px 16px' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Live preview — sample client: {SAMPLE_CLIENT.firstName} {SAMPLE_CLIENT.lastName}
              </p>

              {previewMessage && defaultNoteStyle ? (
                <div className="flex justify-center">
                  <CardPreviewNew
                    message={previewMessage}
                    client={SAMPLE_CLIENT}
                    user={user}
                    organization={organization}
                    noteStyleProfile={defaultNoteStyle}
                    selectedDesign={selectedDesign}
                    previewSettings={previewSettings}
                    includeGreeting={true}
                    includeSignature={true}
                    randomIndentEnabled={true}
                    showLineCounter={true}
                  />
                </div>
              ) : (
                <div
                  className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30"
                  style={{ width: '412px', height: '600px' }}
                >
                  <div className="text-center px-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <Info className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {!selectedTypeSlug
                        ? 'Select a campaign type to get started'
                        : messageMode === 'template'
                        ? 'Select a message template to see the handwriting preview'
                        : 'Write a message to see the handwriting preview'}
                    </p>
                  </div>
                </div>
              )}

              {/* Credit estimate */}
              {selectedType && eligibleCount !== null && (
                <div className="mt-4 p-3 rounded-lg border border-border bg-muted/30">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Estimated credit usage
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-lg font-semibold text-brand-accent leading-none">
                        ~{estMonthly ?? '—'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">credits / month</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-brand-accent leading-none">
                        ~{estAnnual ?? '—'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">credits / year</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Based on {eligibleCount} enrolled clients × {steps.length} card
                    {steps.length > 1 ? 's' : ''} per sequence
                    {organization?.creditBalance !== undefined && (
                      <> · Your balance: <strong>{organization.creditBalance}</strong> credits</>
                    )}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* ── Modals (unchanged existing components) ── */}
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
        defaultPurpose={
          selectedTypeSlug === 'birthday' ? 'birthday' : 'all'
        }
      />
    </TooltipProvider>
  );
}