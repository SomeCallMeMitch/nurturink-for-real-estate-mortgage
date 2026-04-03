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
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  ArrowLeft, Loader2, Rocket, Save, Plus, X, AlertTriangle, Info,
  Check, HelpCircle, Cake, Gift, RefreshCw, Calendar, Home,
  Shield, Heart, Star, Clock, AlertCircle, Settings2, Mail,
  Users, Sparkles, PartyPopper, Award, Bell, Zap, Key, TrendingUp,
  Handshake, HardHat, Building
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

import CardPreviewNew from '@/components/preview/CardPreviewNew';
import CardDesignPickerModal from '@/components/quicksend/CardDesignPickerModal';
import TemplatePickerModal from '@/components/quicksend/TemplatePickerModal';

// ── Icon map: resolves CampaignType.icon string to Lucide component ──────────
const ICON_MAP = {
  Cake, Gift, RefreshCw, Calendar, Home, Shield, Heart, Star,
  Clock, AlertCircle, Settings2, Mail, Users, Sparkles,
  PartyPopper, Award, Bell, Zap, Check, Key, TrendingUp,
  Handshake, HardHat, Building, HelpCircle,
};
const getIcon = (iconName) => ICON_MAP[iconName] || HelpCircle;

// ── Sample client for live preview ──────────────────────────────────────────
const SAMPLE_CLIENT = {
  firstName: 'Sarah', lastName: 'Johnson', fullName: 'Sarah Johnson',
  company: 'ABC Realty', email: 'sarah@abcrealty.com', phone: '(555) 123-4567',
  street: '123 Oak Street', city: 'Walnut Creek', state: 'CA', zipCode: '94596',
};

// ── Fallback preview settings ────────────────────────────────────────────────
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

export default function CampaignSetupWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [campaignTypes, setCampaignTypes] = useState([]);
  const [cardDesigns, setCardDesigns] = useState([]);
  const [cardDesignCategories, setCardDesignCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [noteStyleProfiles, setNoteStyleProfiles] = useState([]);
  const [previewSettings, setPreviewSettings] = useState(FALLBACK_PREVIEW);
  const [loading, setLoading] = useState(true);

  const [eligibleCount, setEligibleCount] = useState(null);
  const [loadingCount, setLoadingCount] = useState(false);

  const [campaignName, setCampaignName] = useState('');
  const [selectedTypeSlug, setSelectedTypeSlug] = useState(null);
  const [enrollmentMode, setEnrollmentMode] = useState('opt_out');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [returnAddressMode, setReturnAddressMode] = useState('company');
  const [steps, setSteps] = useState([makeDefaultStep(-10)]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [messageMode, setMessageMode] = useState('template');

  const [designPickerOpen, setDesignPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const [types, designs, designCats, msgs, profiles] = await Promise.all([
          base44.entities.CampaignType.filter({ isActive: true }),
          base44.entities.CardDesign.filter({ type: 'platform' }),
          base44.entities.CardDesignCategory.filter({ orgId: null }),
          base44.entities.Template.list(),
          base44.entities.NoteStyleProfile.list(),
        ]);
        types.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setCampaignTypes(types);
        setCardDesigns(designs || []);
        setCardDesignCategories((designCats || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
        setTemplates(msgs || []);
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

  useEffect(() => {
    if (!selectedTypeSlug) { setEligibleCount(null); return; }
    const t = campaignTypes.find(ct => ct.slug === selectedTypeSlug);
    if (!t) return;
    setLoadingCount(true);
    base44.functions.invoke('getEligibleClientCount', {
      campaignType: selectedTypeSlug, dateField: t.triggerField,
    }).then(r => { if (r.data?.success) setEligibleCount(r.data.count); })
      .catch(() => setEligibleCount(0))
      .finally(() => setLoadingCount(false));
  }, [selectedTypeSlug, campaignTypes]);

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
    !['birthday', 'renewal_date', 'policy_start_date'].includes(selectedType.triggerField);

  const estAnnual = eligibleCount !== null && selectedType ? eligibleCount * steps.length : null;
  const estMonthly = estAnnual !== null && selectedType
    ? (selectedType.triggerMode === 'one_time' ? estAnnual : Math.ceil(estAnnual / 12) || 1)
    : null;

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

  const handleTypeSelect = (slug) => {
    const type = campaignTypes.find(t => t.slug === slug);
    setSelectedTypeSlug(slug);
    const isBefore = type?.timingDirection === 'before';
    const isOn = type?.timingDirection === 'on';
    const days = type?.defaultTimingDays || 10;
    setSteps([makeDefaultStep(isOn ? 0 : isBefore ? -days : days)]);
    setActiveStepIndex(0);
    setMessageMode('template');
  };

  const handleDesignSelect = (design) => {
    updateStep(activeStepIndex, { cardDesignId: design.id });
    setDesignPickerOpen(false);
  };

  const handleTemplateSelect = (template) => {
    updateStep(activeStepIndex, { templateId: template.id, messageText: '' });
    setMessageMode('template');
    setTemplatePickerOpen(false);
  };

  const isValid = useMemo(() => {
    if (!campaignName.trim() || !selectedTypeSlug) return false;
    return steps.every(s => {
      const hasDesign = !!s.cardDesignId;
      const hasMsg = messageMode === 'template' ? !!s.templateId : !!s.messageText?.trim();
      return hasDesign && hasMsg;
    });
  }, [campaignName, selectedTypeSlug, steps, messageMode]);

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

  const companyTip = companyAddress
    ? `${companyAddress.name || organization?.name || ''}\n${companyAddress.street || ''}\n${companyAddress.city || ''}, ${companyAddress.state || ''} ${companyAddress.zip || ''}`.trim()
    : 'No company address set.\nAdd one in Company Settings.';

  const repTip = repAddress
    ? `${repAddress.name}\n${repAddress.street}\n${repAddress.city}, ${repAddress.state} ${repAddress.zip}`.trim()
    : 'No rep address set.\nAdd one in Settings > Addresses.';

  return (
    <TooltipProvider>
      <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost" size="sm"
              onClick={() => navigate(createPageUrl('Campaigns'))}
              className="gap-1.5 text-muted-foreground"
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
              variant="outline" size="sm"
              onClick={() => submit('draft')}
              disabled={!campaignName.trim() || submitting}
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

        {/* Campaign name */}
        <div className="px-6 py-3 border-b border-border bg-background flex-shrink-0">
          <div className="flex items-center gap-3">
            <Label
              htmlFor="camp-name"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap"
            >
              Campaign name
            </Label>
            <Input
              id="camp-name"
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              placeholder="e.g. Home Anniversary — Past Buyers"
              className="text-base font-medium max-w-2xl"
            />
            {!campaignName.trim() && selectedTypeSlug && (
              <span className="text-xs text-muted-foreground italic">Name required before activating</span>
            )}
          </div>
        </div>

        {/* Three columns */}
        <div className="flex flex-1 overflow-hidden">

          {/* COL 1 — 240px */}
          <div
            className="border-r border-border overflow-y-auto flex-shrink-0"
            style={{ width: '240px', padding: '14px 16px' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Campaign type
            </p>

            {campaignTypes.length === 0 ? (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800 leading-snug">
                  No campaign types found. Run <code className="font-mono text-[10px]">seedCampaignTypes</code> from the Base44 dashboard.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {campaignTypes.map(ct => {
                  const Icon = getIcon(ct.icon);
                  const isActive = selectedTypeSlug === ct.slug;
                  return (
                    <button
                      key={ct.id}
                      onClick={() => handleTypeSelect(ct.slug)}
                      className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                        isActive
                          ? 'border-brand-accent bg-brand-accent/5 shadow-sm'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex justify-center mb-1.5">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-brand-accent' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="text-[11px] font-medium leading-tight">{ct.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {ct.triggerMode === 'one_time' ? 'One-time' : 'Annual'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedType && (
              <div className="mb-3 space-y-1.5">
                {selectedType.description && (
                  <p className="text-[10px] text-muted-foreground leading-snug">{selectedType.description}</p>
                )}
                {needsNewField && (
                  <div className="flex items-start gap-1.5 p-2 rounded bg-amber-50 border border-amber-200">
                    <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-amber-800 leading-snug">
                      Requires <code className="font-mono">{selectedType.triggerField}</code> on client records
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-border my-3" />

            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Enrollment
            </p>
            <div className="flex rounded-md border border-border overflow-hidden mb-1.5">
              {[{ val: 'opt_out', label: 'Auto-enroll' }, { val: 'opt_in', label: 'Manual' }].map(({ val, label }) => (
                <button
                  key={val}
                  className={`flex-1 py-1.5 text-xs text-center transition-colors ${
                    enrollmentMode === val
                      ? 'bg-brand-accent text-brand-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => setEnrollmentMode(val)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mb-4 leading-snug">
              {enrollmentMode === 'opt_out'
                ? 'All eligible clients enrolled automatically'
                : 'You manually add clients to this campaign'}
            </p>

            <div className="border-t border-border my-3" />

            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Return address
            </p>
            <div className="flex gap-1.5 flex-wrap mb-4">
              {[
                { key: 'company', label: 'Company', tip: companyTip },
                { key: 'rep', label: 'Rep', tip: repTip },
                { key: 'none', label: 'None', tip: 'No return address\nprinted on envelope' },
              ].map(({ key, label, tip }) => (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setReturnAddressMode(key)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                        returnAddressMode === key
                          ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="whitespace-pre-line text-xs max-w-[200px]">
                    {tip}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {selectedType && (
              <>
                <div className="border-t border-border my-3" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Estimated reach
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { val: loadingCount ? '…' : (eligibleCount ?? '—'), lbl: 'clients' },
                    { val: estAnnual !== null ? `~${estAnnual}` : '—', lbl: 'cards/yr' },
                    { val: organization?.creditBalance ?? '—', lbl: 'balance' },
                  ].map(({ val, lbl }) => (
                    <div key={lbl} className="rounded-md bg-muted px-1 py-2 text-center">
                      <div className="text-sm font-semibold text-brand-accent leading-none">{val}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">{lbl}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* COL 2 — flex-1 */}
          <div
            className="flex-1 overflow-y-auto border-r border-border"
            style={{ padding: '14px 24px' }}
          >
            {/* Step tabs */}
            {steps.length > 1 && (
              <div className="flex items-center gap-2 mb-5">
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
                    type="number" min={0} max={365}
                    value={timingDisplayValue}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      const isBefore = selectedType.timingDirection === 'before';
                      updateStep(activeStepIndex, { timingDays: isBefore ? -val : val });
                    }}
                    className="w-20 text-center"
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
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 rounded-lg border border-border overflow-hidden cursor-pointer hover:border-brand-accent transition-colors relative group"
                  style={{ width: '88px', aspectRatio: '11/8' }}
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
                      <span className="text-[10px] text-muted-foreground text-center px-1 leading-snug">
                        {cardDesigns.length === 0 ? 'No designs\nloaded' : 'No design\nselected'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white text-[10px] font-medium bg-black/40 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Change
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  {cardDesigns.length === 0 ? (
                    <div className="flex items-start gap-1.5 p-2 rounded bg-amber-50 border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800 leading-snug">
                        No card designs loaded. Add designs via Admin Portal &gt; Card Designs.
                      </p>
                    </div>
                  ) : selectedDesign ? (
                    <>
                      <p className="text-sm font-medium truncate">{selectedDesign.name}</p>
                      <button
                        onClick={() => openDesignPicker(activeStepIndex)}
                        className="text-xs text-brand-accent hover:underline mt-0.5 block"
                      >
                        Change design
                      </button>
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
                  if (val === 'template') updateStep(activeStepIndex, { messageText: '' });
                  else updateStep(activeStepIndex, { templateId: null });
                }}
                className="flex gap-4 mb-3"
              >
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="template" id="msg-tmpl" />
                  <Label htmlFor="msg-tmpl" className="text-sm cursor-pointer font-normal">Use template</Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="custom" id="msg-custom" />
                  <Label htmlFor="msg-custom" className="text-sm cursor-pointer font-normal">Write custom</Label>
                </div>
              </RadioGroup>

              {messageMode === 'template' ? (
                <div>
                  <button
                    onClick={() => openTemplatePicker(activeStepIndex)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-md text-sm transition-colors ${
                      selectedTemplate
                        ? 'border-border bg-background text-foreground'
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
                      {selectedTemplate.content?.substring(0, 140)}…
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <Textarea
                    value={currentStep.messageText || ''}
                    onChange={e => updateStep(activeStepIndex, { messageText: e.target.value })}
                    placeholder={'Write your message here…\n\nUse {{client.firstName}} for their first name, {{me.firstName}} for yours.'}
                    className="text-sm resize-none"
                    rows={6}
                  />
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    {'{{client.firstName}}'} · {'{{client.lastName}}'} · {'{{me.firstName}}'} · {'{{me.companyName}}'}
                  </p>
                </div>
              )}
            </div>

            {/* Approval toggle */}
            <div className="flex items-center justify-between p-3.5 border border-border rounded-lg mb-5">
              <div>
                <p className="text-sm font-medium">Require approval before sending</p>
                <p className="text-xs text-muted-foreground mt-0.5">Cards go to your approval queue before being sent</p>
              </div>
              <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} />
            </div>

            {/* Add second card */}
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

          {/* COL 3 — 480px fixed */}
          <div
            className="flex-shrink-0 overflow-y-auto"
            style={{ width: '480px', padding: '14px 24px' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
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
                  includeGreeting={true}
                  includeSignature={true}
                  randomIndentEnabled={true}
                  showLineCounter={true}
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/20"
                  style={{ width: '412px', height: '480px' }}
                >
                  <div className="text-center px-8">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <Info className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
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

            {selectedType && eligibleCount !== null && (
              <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Estimated credit usage
                </p>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-xl font-semibold text-brand-accent leading-none">~{estMonthly ?? '—'}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">credits / month</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-brand-accent leading-none">~{estAnnual ?? '—'}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">credits / year</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  {eligibleCount} clients × {steps.length} card{steps.length > 1 ? 's' : ''}
                  {organization?.creditBalance !== undefined ? ` · Balance: ${organization.creditBalance} credits` : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
        defaultPurpose={selectedTypeSlug === 'birthday' ? 'birthday' : 'all'}
      />
    </TooltipProvider>
  );
}