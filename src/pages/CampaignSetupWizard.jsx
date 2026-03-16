import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Plus, Save, Rocket, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Campaign Components
import CampaignTypeSelector from '@/components/campaigns/CampaignTypeSelector';
import EnrollmentModeSelector from '@/components/campaigns/EnrollmentModeSelector';
import CardStepConfigurator from '@/components/campaigns/CardStepConfigurator';
import CampaignReturnAddressSelector from '@/components/campaigns/CampaignReturnAddressSelector';
import CampaignReviewSummary from '@/components/campaigns/CampaignReviewSummary';
import CampaignWorkflowHeader from '@/components/campaigns/CampaignWorkflowHeader';
import CardDesignPickerModal from '@/components/quicksend/CardDesignPickerModal';
import TemplatePickerModal from '@/components/quicksend/TemplatePickerModal';

// Wizard steps configuration (5 steps)
const WIZARD_STEPS = [
  { number: 1, title: 'Campaign Type' },
  { number: 2, title: 'Enrollment' },
  { number: 3, title: 'Cards' },
  { number: 4, title: 'Return Address' },
  { number: 5, title: 'Review' }
];

/**
 * Sprint 3 — Data-driven default steps.
 * Uses the TriggerType record to determine timing defaults.
 */
const getDefaultSteps = (triggerType) => {
  if (!triggerType) return [];
  const daysBefore = triggerType.defaultDaysBefore || 0;
  const daysAfter = triggerType.defaultDaysAfter || 0;
  const defaultTiming = daysBefore > 0 ? -daysBefore : daysAfter;
  return [{
    stepOrder: 1,
    cardDesignId: null,
    templateId: null,
    messageText: '',
    timingDays: defaultTiming,
    timingReference: 'trigger_date'
  }];
};

export default function CampaignSetupWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTriggerType, setSelectedTriggerType] = useState(null);
  const [campaignData, setCampaignData] = useState({
    type: null,
    triggerTypeId: null,
    dateField: null,
    enrollmentMode: 'opt_out',
    requiresApproval: false,
    returnAddressMode: 'company',
    name: '',
    steps: []
  });
  const [eligibleClientCount, setEligibleClientCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data fetching state
  const [designs, setDesigns] = useState([]);
  const [designCategories, setDesignCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoadingDesigns, setIsLoadingDesigns] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);

  // Modal States
  const [designPickerOpen, setDesignPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [currentUser, cardDesigns, cardCategories, messageTemplates] = await Promise.all([
          base44.auth.me(),
          base44.entities.CardDesign.list(),
          base44.entities.CardDesignCategory.list(),
          base44.entities.Template.list()
        ]);
        setUser(currentUser);
        setDesigns(cardDesigns || []);
        setDesignCategories(cardCategories || []);
        setTemplates(messageTemplates || []);

        // Load organization for company address
        if (currentUser?.orgId) {
          const orgs = await base44.entities.Organization.filter({ id: currentUser.orgId });
          setOrganization(orgs[0] || null);
        }
      } catch (err) {
        console.error('Failed to load wizard data:', err);
        toast({ title: 'Error loading data', description: err.message, variant: 'destructive' });
      } finally {
        setIsLoadingDesigns(false);
        setIsLoadingTemplates(false);
      }
    };
    loadData();
  }, []);

  const companyAddress = organization?.companyReturnAddress;

  // Read rep address from user fields directly
  const repAddress = user?.street ? {
    name: user.returnAddressName || user.fullName || user.full_name || '',
    street: user.street,
    address2: user.address2,
    city: user.city,
    state: user.state,
    zip: user.zipCode
  } : null;

  // Read credits from organization, not user
  const currentCredits = organization?.creditBalance ?? undefined;

  // Fetch eligible client count when campaign type changes
  useEffect(() => {
    const fetchEligibleCount = async () => {
      if (!campaignData.type) {
        setEligibleClientCount(0);
        return;
      }
      setIsLoadingCount(true);
      try {
        const response = await base44.functions.invoke('getEligibleClientCount', {
          campaignType: campaignData.type,
          dateField: campaignData.dateField
        });
        if (response.data.success) {
          setEligibleClientCount(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching eligible count:', error);
        setEligibleClientCount(0);
      } finally {
        setIsLoadingCount(false);
      }
    };
    fetchEligibleCount();
  }, [campaignData.type, campaignData.dateField]);

  // Handle type selection (Step 1) — receives full TriggerType record
  const handleTypeSelect = (triggerType) => {
    setSelectedTriggerType(triggerType);
    setCampaignData(prev => ({
      ...prev,
      type: triggerType.key,
      triggerTypeId: triggerType.id,
      dateField: triggerType.dateField,
      steps: getDefaultSteps(triggerType),
      name: ''
    }));
  };

  const handleModeChange = (mode) => {
    setCampaignData(prev => ({ ...prev, enrollmentMode: mode }));
  };

  const handleApprovalChange = (requires) => {
    setCampaignData(prev => ({ ...prev, requiresApproval: requires }));
  };

  const handleReturnAddressChange = (mode) => {
    setCampaignData(prev => ({ ...prev, returnAddressMode: mode }));
  };

  const handleNameChange = (name) => {
    setCampaignData(prev => ({ ...prev, name }));
  };

  const handleStepUpdate = (stepIndex, updates) => {
    setCampaignData(prev => ({
      ...prev,
      steps: prev.steps.map((step, idx) =>
        idx === stepIndex ? { ...step, ...updates } : step
      )
    }));
  };

  // Handle adding second step — data-driven, no hardcoded type checks
  const handleAddStep = () => {
    if (!selectedTriggerType || campaignData.steps.length >= 2) return;
    const daysBefore = selectedTriggerType.defaultDaysBefore || 0;
    const daysAfter = selectedTriggerType.defaultDaysAfter || 0;
    const newStep = {
      stepOrder: 2,
      cardDesignId: null,
      templateId: null,
      messageText: '',
      timingDays: daysBefore > 0 ? -(daysBefore * 2) : (daysAfter > 0 ? daysAfter * 2 : 14),
      timingReference: 'trigger_date'
    };
    setCampaignData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const handleRemoveStep = (stepIndex) => {
    if (stepIndex === 0) return;
    setCampaignData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, idx) => idx !== stepIndex)
    }));
  };

  const handleDesignSelect = (design) => {
    handleStepUpdate(activeStepIndex, { cardDesignId: design.id });
    setDesignPickerOpen(false);
  };

  const handleTemplateSelect = (template) => {
    handleStepUpdate(activeStepIndex, { templateId: template.id, messageText: '' });
    setTemplatePickerOpen(false);
  };

  const openDesignPicker = (stepIndex) => {
    setActiveStepIndex(stepIndex);
    setDesignPickerOpen(true);
  };

  const openTemplatePicker = (stepIndex) => {
    setActiveStepIndex(stepIndex);
    setTemplatePickerOpen(true);
  };

  // Validation for each wizard step
  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return !!campaignData.type;
      case 2:
        return true;
      case 3:
        return campaignData.steps.every(s =>
          s.cardDesignId && (s.templateId || s.messageText?.trim())
        );
      case 4: {
        if (campaignData.returnAddressMode === 'company' && !companyAddress?.street) return false;
        if (campaignData.returnAddressMode === 'rep' && !repAddress?.street) return false;
        return true;
      }
      case 5:
        return campaignData.name?.trim().length > 0;
      default:
        return false;
    }
  };

  const getDesignById = (id) => designs.find(d => d.id === id);
  const getTemplateById = (id) => templates.find(t => t.id === id);

  const handleNext = () => {
    if (currentStep < 5 && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitCampaign = async (status) => {
    setIsSubmitting(true);
    try {
      const response = await base44.functions.invoke('createCampaign', {
        name: campaignData.name,
        type: campaignData.type,
        triggerTypeId: campaignData.triggerTypeId,
        dateField: campaignData.dateField,
        enrollmentMode: campaignData.enrollmentMode,
        requiresApproval: campaignData.requiresApproval,
        returnAddressMode: campaignData.returnAddressMode,
        status,
        steps: campaignData.steps
      });
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create campaign');
      }
      toast({
        title: status === 'active' ? 'Campaign Activated!' : 'Campaign Saved',
        description: status === 'active'
          ? `Your campaign is now active with ${response.data.enrolledCount || 0} enrolled clients.`
          : 'Your campaign has been saved as a draft.'
      });
      navigate('/Campaigns');
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => submitCampaign('draft');
  const handleActivate = () => submitCampaign('active');

  const getCurrentStepTitle = () => {
    const step = WIZARD_STEPS.find(s => s.number === currentStep);
    return step ? step.title : 'Create Campaign';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CampaignWorkflowHeader
        currentStep={currentStep}
        pageTitle={getCurrentStepTitle()}
        onBackClick={currentStep > 1 ? handleBack : null}
        isFirstStep={currentStep === 1}
        steps={WIZARD_STEPS}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Campaign Type */}
        {currentStep === 1 && (
          <CampaignTypeSelector
            selectedType={campaignData.type}
            onSelect={handleTypeSelect}
          />
        )}

        {/* Step 2: Enrollment */}
        {currentStep === 2 && (
          <EnrollmentModeSelector
            selectedMode={campaignData.enrollmentMode}
            onModeChange={handleModeChange}
            eligibleCount={eligibleClientCount}
            isLoadingCount={isLoadingCount}
            requiresApproval={campaignData.requiresApproval}
            onApprovalChange={handleApprovalChange}
          />
        )}

        {/* Step 3: Card Configuration */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-foreground">Configure Your Cards</h2>
              <p className="text-muted-foreground mt-2">
                Set up the card design, message, and timing for each send
              </p>
            </div>
            {isLoadingDesigns || isLoadingTemplates ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <>
                {campaignData.steps.map((step, index) => (
                  <CardStepConfigurator
                    key={step.stepOrder}
                    step={step}
                    triggerType={selectedTriggerType}
                    onUpdate={(updates) => handleStepUpdate(index, updates)}
                    onRemove={() => handleRemoveStep(index)}
                    onOpenDesignPicker={() => openDesignPicker(index)}
                    onOpenTemplatePicker={() => openTemplatePicker(index)}
                    selectedDesign={getDesignById(step.cardDesignId)}
                    selectedTemplate={getTemplateById(step.templateId)}
                    canRemove={index > 0}
                  />
                ))}
                {campaignData.steps.length < 2 && (
                  <Button
                    variant="outline"
                    onClick={handleAddStep}
                    className="w-full py-6 border-dashed"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Second Card
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 4: Return Address */}
        {currentStep === 4 && (
          <CampaignReturnAddressSelector
            returnAddressMode={campaignData.returnAddressMode}
            onChange={handleReturnAddressChange}
            companyAddress={companyAddress}
            repAddress={repAddress}
          />
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <CampaignReviewSummary
            campaignData={campaignData}
            campaignName={campaignData.name}
            onNameChange={handleNameChange}
            eligibleClientCount={eligibleClientCount}
            designs={designs}
            templates={templates}
            currentCredits={currentCredits}
          />
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-end pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            {currentStep >= 2 && (
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={!isStepValid(currentStep) || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save as Draft
              </Button>
            )}
            {currentStep < 5 && (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep) || isSubmitting}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {currentStep === 5 && (
              <Button
                onClick={handleActivate}
                disabled={!isStepValid(5) || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4 mr-2" />
                )}
                Activate Campaign
              </Button>
            )}
          </div>
        </div>
      </div>

      <CardDesignPickerModal
        open={designPickerOpen}
        onOpenChange={setDesignPickerOpen}
        designs={designs}
        categories={designCategories}
        selectedId={campaignData.steps[activeStepIndex]?.cardDesignId}
        onSelect={handleDesignSelect}
      />
      <TemplatePickerModal
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        templates={templates}
        selectedId={campaignData.steps[activeStepIndex]?.templateId}
        onSelect={handleTemplateSelect}
        user={user}
      />
    </div>
  );
}