// ─────────────────────────────────────────────────────────────────────────────
// CampaignSetupWizard.jsx  — main orchestrator (refactored)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Save, Rocket } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

import CardDesignPickerModal from '@/components/quicksend/CardDesignPickerModal';
import TemplatePickerModal from '@/components/quicksend/TemplatePickerModal';

import {
  DEFAULT_SOI_QUARTERLY_SCHEDULE,
  FALLBACK_PREVIEW,
  MONTH_LABELS_LONG,
  SOI_QUARTERLY_SLUG,
  TYPE_TO_CATEGORY_SLUG,
  formatMonthList,
  formatOrdinalDay,
  makeDefaultStep,
  sanitizeMessage,
} from '@/components/campaigns/campaignWizardConfig';

import CampaignTypePanel     from '@/components/campaigns/CampaignTypePanel';
import CampaignCardSetupPanel from '@/components/campaigns/CampaignCardSetupPanel';
import CampaignPreviewPanel  from '@/components/campaigns/CampaignPreviewPanel';
import CustomMessageModal    from '@/components/campaigns/CustomMessageModal';
import CardEnlargeModal      from '@/components/campaigns/CardEnlargeModal';

const isStepEnabled = (step) => step.isEnabled !== false;
const stepHasMessage = (step) => !!step.templateId || !!step.messageText?.trim();
const isStepComplete = (step) => !!step.cardDesignId && stepHasMessage(step);
const isManualOrNullTriggerType = (type) =>
  type?.slug !== SOI_QUARTERLY_SLUG && (type?.triggerMode === 'manual' || !type?.triggerField);

export default function CampaignSetupWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const textareaRef = useRef(null);

  // DEBUG ADDED: request-scoped browser logging so runtime logs show the exact save payload and response.
  const logCampaignSaveDebug = useCallback((event, details = {}) => {
    console.log('[CampaignSetupWizard]', event, {
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
      ...details,
    });
  }, []);

  // ── Remote data ────────────────────────────────────────────────────────────
  const [user, setUser]                           = useState(null);
  const [organization, setOrganization]           = useState(null);
  const [campaignTypes, setCampaignTypes]         = useState([]);
  const [cardDesigns, setCardDesigns]             = useState([]);
  const [cardDesignCategories, setCardDesignCategories] = useState([]);
  const [templates, setTemplates]                 = useState([]);
  const [templateCategories, setTemplateCategories] = useState([]);
  const [noteStyleProfiles, setNoteStyleProfiles] = useState([]);
  const [previewSettings, setPreviewSettings]     = useState(FALLBACK_PREVIEW);
  const [loading, setLoading]                     = useState(true);

  // ── Eligible count ─────────────────────────────────────────────────────────
  const [eligibleCount, setEligibleCount] = useState(null);
  const [loadingCount, setLoadingCount]   = useState(false);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [campaignName, setCampaignName]         = useState('');
  const [selectedTypeSlug, setSelectedTypeSlug] = useState(null);
  const [enrollmentMode, setEnrollmentMode]     = useState('opt_out');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [returnAddressMode, setReturnAddressMode] = useState('company');
  const [scheduleConfig, setScheduleConfig]     = useState(DEFAULT_SOI_QUARTERLY_SCHEDULE);
  const [steps, setSteps]                       = useState([makeDefaultStep(-10)]);
  const [activeStepIndex, setActiveStepIndex]   = useState(0);
  const [messageMode, setMessageMode]           = useState('template');

  // ── Custom message modal state ─────────────────────────────────────────────
  const [customMsgOpen, setCustomMsgOpen]       = useState(false);
  const [customMsgDraft, setCustomMsgDraft]     = useState('');
  const [includeGreeting, setIncludeGreeting]   = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);

  // ── Other modal state ──────────────────────────────────────────────────────
  const [designPickerOpen, setDesignPickerOpen]   = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [cardEnlargeOpen, setCardEnlargeOpen]     = useState(false);
  const [cardEnlargeFace, setCardEnlargeFace]     = useState('front');
  const [submitting, setSubmitting]               = useState(false);

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

  const isSoiQuarterly = selectedTypeSlug === SOI_QUARTERLY_SLUG;

  const scheduleSummary = useMemo(() => {
    if (!isSoiQuarterly) return null;
    return {
      monthsShort: formatMonthList(scheduleConfig.scheduleMonths),
      monthsLong: formatMonthList(scheduleConfig.scheduleMonths, MONTH_LABELS_LONG),
      day: formatOrdinalDay(scheduleConfig.scheduleDayOfMonth),
    };
  }, [isSoiQuarterly, scheduleConfig]);

  const currentStep = steps[activeStepIndex] || steps[0];
  const setupLocked = !selectedTypeSlug;

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

  const scheduledRunsPerYear = isSoiQuarterly ? scheduleConfig.scheduleMonths.length : 1;

  const estAnnual = eligibleCount !== null && selectedType
    ? eligibleCount * steps.length * scheduledRunsPerYear : null;
  const estMonthly = estAnnual !== null && selectedType
    ? (selectedType.triggerMode === 'one_time'
        ? estAnnual
        : Math.ceil(estAnnual / 12) || 1)
    : null;

  const companyTip = companyAddress
    ? [
        companyAddress.name || organization?.name || '',
        companyAddress.street || '',
        `${companyAddress.city || ''}, ${companyAddress.state || ''} ${companyAddress.zip || ''}`,
      ].filter(Boolean).join('\n')
    : 'No company address set.\nAdd one in Company Settings.';

  const repTip = repAddress
    ? [repAddress.name, repAddress.street, `${repAddress.city}, ${repAddress.state} ${repAddress.zip}`]
        .filter(Boolean).join('\n')
    : 'No rep address set.\nAdd one in Settings > Addresses.';

  const enlargeUrl = cardEnlargeFace === 'front'
    ? (selectedDesign?.frontImageUrl || selectedDesign?.outsideImageUrl)
    : (selectedDesign?.backImageUrl || selectedDesign?.insideImageUrl);

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

  // ── Type selection ─────────────────────────────────────────────────────────
  const handleTypeSelect = useCallback((slug) => {
    const type = campaignTypes.find(t => t.slug === slug);
    if (isManualOrNullTriggerType(type)) return;

    setSelectedTypeSlug(slug);
    const isBefore = type?.timingDirection === 'before';
    const isOn     = type?.timingDirection === 'on';
    const days     = type?.defaultTimingDays || 10;
    const defaultTimingDays = slug === SOI_QUARTERLY_SLUG ? 0 : isOn ? 0 : isBefore ? -days : days;

    const catSlug  = TYPE_TO_CATEGORY_SLUG[slug];
    const matchCat = catSlug ? templateCategories.find(c => c.slug === catSlug) : null;
    let autoTemplateId = null;
    if (matchCat) {
      const match = templates.find(t =>
        Array.isArray(t.templateCategoryIds) && t.templateCategoryIds.includes(matchCat.id)
      );
      autoTemplateId = match?.id || null;
    }

    const preservedCardDesignId =
      currentStep?.cardDesignId && cardDesigns.some(d => d.id === currentStep.cardDesignId)
        ? currentStep.cardDesignId
        : null;
    const customMessageText = currentStep?.messageText?.trim() || '';
    const preserveCustomMessage = messageMode === 'custom' && customMessageText.length > 0;

    if (slug === SOI_QUARTERLY_SLUG) {
      setScheduleConfig(DEFAULT_SOI_QUARTERLY_SCHEDULE);
    }

    setSteps([{
      ...makeDefaultStep(defaultTimingDays),
      cardDesignId: preservedCardDesignId,
      templateId: preserveCustomMessage ? null : autoTemplateId,
      messageText: preserveCustomMessage ? sanitizeMessage(customMessageText) : '',
    }]);
    setActiveStepIndex(0);
    setMessageMode(preserveCustomMessage ? 'custom' : 'template');
  }, [campaignTypes, templates, templateCategories, currentStep, cardDesigns, messageMode]);

  // ── Design / template handlers ─────────────────────────────────────────────
  const handleDesignSelect   = (design)   => { updateStep(activeStepIndex, { cardDesignId: design.id }); setDesignPickerOpen(false); };
  const handleTemplateSelect = (template) => { updateStep(activeStepIndex, { templateId: template.id, messageText: '' }); setMessageMode('template'); setTemplatePickerOpen(false); };
  const openDesignPicker     = (idx) => {
    if (!selectedTypeSlug) {
      toast({ title: 'Choose a campaign type first.' });
      return;
    }
    setActiveStepIndex(idx);
    setDesignPickerOpen(true);
  };
  const openTemplatePicker   = (idx) => {
    if (!selectedTypeSlug) {
      toast({ title: 'Choose a campaign type first.' });
      return;
    }
    setActiveStepIndex(idx);
    setTemplatePickerOpen(true);
  };

  // ── Custom message handlers ────────────────────────────────────────────────
  const openCustomModal = () => { setCustomMsgDraft(currentStep.messageText || ''); setCustomMsgOpen(true); };

  const saveCustomMessage = () => {
    const sanitized = sanitizeMessage(customMsgDraft);
    updateStep(activeStepIndex, { messageText: sanitized, templateId: null });
    setMessageMode('custom');
    setCustomMsgOpen(false);
  };

  const handlePlaceholderInsert = (placeholder) => {
    const el = textareaRef.current;
    if (!el) { setCustomMsgDraft(prev => prev + placeholder); return; }
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const next  = customMsgDraft.substring(0, start) + placeholder + customMsgDraft.substring(end);
    setCustomMsgDraft(next);
    requestAnimationFrame(() => {
      el.selectionStart = start + placeholder.length;
      el.selectionEnd   = start + placeholder.length;
      el.focus();
    });
  };

  // Message mode change — opens modal when switching to custom
  const handleMessageModeChange = (val) => {
    if (val === 'custom') {
      openCustomModal();
    } else {
      setMessageMode('template');
      updateStep(activeStepIndex, { messageText: '' });
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const canSaveDraft = useMemo(
    () => !!campaignName.trim() && !!selectedTypeSlug,
    [campaignName, selectedTypeSlug]
  );

  const hasValidSchedule = useMemo(() => {
    if (!isSoiQuarterly) return true;
    return scheduleConfig.scheduleMode === 'calendar' &&
      scheduleConfig.scheduleFrequency === 'quarterly' &&
      Array.isArray(scheduleConfig.scheduleMonths) &&
      scheduleConfig.scheduleMonths.length > 0 &&
      scheduleConfig.scheduleMonths.every(month => Number.isInteger(month) && month >= 1 && month <= 12) &&
      Number.isInteger(scheduleConfig.scheduleDayOfMonth) &&
      scheduleConfig.scheduleDayOfMonth >= 1 &&
      scheduleConfig.scheduleDayOfMonth <= 31;
  }, [isSoiQuarterly, scheduleConfig]);

  const isValid = useMemo(() => {
    if (!canSaveDraft) return false;
    if (!hasValidSchedule) return false;
    return steps.every(s => !isStepEnabled(s) || isStepComplete(s));
  }, [canSaveDraft, hasValidSchedule, steps]);

  const buildStepsPayload = (status) => {
    const payloadSteps = status === 'draft'
      ? steps.filter(isStepComplete)
      : steps.filter(s => isStepEnabled(s) || isStepComplete(s));

    return payloadSteps.map((s, index) => ({
      ...s,
      stepOrder: s.stepOrder || index + 1,
      templateId: s.templateId || null,
      messageText: s.messageText?.trim() ? sanitizeMessage(s.messageText) : '',
      isEnabled: s.isEnabled !== false,
    }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submit = async (status) => {
    if (status === 'active' && !isValid) return;
    if (status === 'draft' && !canSaveDraft) return;
    setSubmitting(true);
    try {
      const stepsPayload = buildStepsPayload(status);
      const payload = {
        name: campaignName.trim(), type: selectedTypeSlug,
        triggerTypeId: selectedType?.id || null,
        dateField: selectedType?.triggerField || null,
        enrollmentMode, requiresApproval, returnAddressMode, status,
        steps: stepsPayload,
      };
      if (isSoiQuarterly) {
        payload.scheduleMode = scheduleConfig.scheduleMode;
        payload.scheduleFrequency = scheduleConfig.scheduleFrequency;
        payload.scheduleMonths = scheduleConfig.scheduleMonths;
        payload.scheduleDayOfMonth = scheduleConfig.scheduleDayOfMonth;
      }
      // DEBUG ADDED: captures the exact client payload before invoking the backend.
      logCampaignSaveDebug('submit:createCampaign:start', {
        status,
        selectedTypeSlug,
        selectedTypeId: selectedType?.id || null,
        triggerField: selectedType?.triggerField || null,
        stepsCount: stepsPayload.length,
        rawStepsCount: steps.length,
        payload,
      });
      const resp = await base44.functions.invoke('createCampaign', payload);
      // DEBUG ADDED: captures backend response details for failed and successful saves.
      logCampaignSaveDebug('submit:createCampaign:response', {
        httpStatus: resp.status,
        data: resp.data,
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
      // DEBUG ADDED: Axios errors include response data here; this is what we need for the 500 root cause.
      logCampaignSaveDebug('submit:createCampaign:error', {
        message: err.message,
        responseStatus: err.response?.status || null,
        responseData: err.response?.data || null,
      });
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
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
              disabled={!canSaveDraft || submitting}
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

        {/* ── Campaign name ─────────────────────────────────────────────── */}
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

        {/* ── Three columns ─────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          <CampaignTypePanel
            campaignTypes={campaignTypes}
            selectedTypeSlug={selectedTypeSlug}
            onTypeSelect={handleTypeSelect}
            isTypeDisabled={isManualOrNullTriggerType}
            enrollmentMode={enrollmentMode}
            setEnrollmentMode={setEnrollmentMode}
            returnAddressMode={returnAddressMode}
            setReturnAddressMode={setReturnAddressMode}
            companyTip={companyTip}
            repTip={repTip}
            selectedType={selectedType}
            needsNewField={needsNewField}
            eligibleCount={eligibleCount}
            loadingCount={loadingCount}
            estAnnual={estAnnual}
            organization={organization}
            steps={steps}
          />

          <CampaignCardSetupPanel
            steps={steps}
            activeStepIndex={activeStepIndex}
            setActiveStepIndex={setActiveStepIndex}
            selectedType={selectedType}
            updateStep={updateStep}
            addStep={addStep}
            removeStep={removeStep}
            timingDisplayValue={timingDisplayValue}
            timingLabel={timingLabel}
            isSoiQuarterly={isSoiQuarterly}
            scheduleConfig={scheduleConfig}
            scheduleSummary={scheduleSummary}
            cardDesigns={cardDesigns}
            selectedDesign={selectedDesign}
            openDesignPicker={openDesignPicker}
            openTemplatePicker={openTemplatePicker}
            messageMode={messageMode}
            onMessageModeChange={handleMessageModeChange}
            selectedTemplate={selectedTemplate}
            currentStep={currentStep}
            setupLocked={setupLocked}
            requiresApproval={requiresApproval}
            setRequiresApproval={setRequiresApproval}
            onOpenCustomModal={openCustomModal}
            setCardEnlargeOpen={setCardEnlargeOpen}
            setCardEnlargeFace={setCardEnlargeFace}
          />

          <CampaignPreviewPanel
            previewMessage={previewMessage}
            defaultNoteStyle={defaultNoteStyle}
            selectedDesign={selectedDesign}
            user={user}
            organization={organization}
            previewSettings={previewSettings}
            includeGreeting={includeGreeting}
            includeSignature={includeSignature}
            selectedType={selectedType}
            eligibleCount={eligibleCount}
            estMonthly={estMonthly}
            estAnnual={estAnnual}
            steps={steps}
            returnAddressMode={returnAddressMode}
            isSoiQuarterly={isSoiQuarterly}
            scheduleSummary={scheduleSummary}
          />
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <CustomMessageModal
        open={customMsgOpen}
        onOpenChange={setCustomMsgOpen}
        customMsgDraft={customMsgDraft}
        setCustomMsgDraft={setCustomMsgDraft}
        includeGreeting={includeGreeting}
        setIncludeGreeting={setIncludeGreeting}
        includeSignature={includeSignature}
        setIncludeSignature={setIncludeSignature}
        onSave={saveCustomMessage}
        textareaRef={textareaRef}
        onPlaceholderInsert={handlePlaceholderInsert}
      />

      <CardEnlargeModal
        open={cardEnlargeOpen}
        onOpenChange={setCardEnlargeOpen}
        selectedDesign={selectedDesign}
        cardEnlargeFace={cardEnlargeFace}
        setCardEnlargeFace={setCardEnlargeFace}
        enlargeUrl={enlargeUrl}
      />

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
