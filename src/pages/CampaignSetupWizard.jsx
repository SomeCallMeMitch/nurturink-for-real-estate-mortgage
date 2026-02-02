import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

// UI Components
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

// Icons
import { ArrowLeft, ArrowRight, Save, Rocket, Loader2, Plus } from 'lucide-react';

// Wizard Step Components
import CampaignTypeSelector from '@/components/campaigns/CampaignTypeSelector';
import EnrollmentModeSelector from '@/components/campaigns/EnrollmentModeSelector';
import CardStepConfigurator from '@/components/campaigns/CardStepConfigurator';
import CampaignReturnAddressSelector from '@/components/campaigns/CampaignReturnAddressSelector';
import CampaignReviewSummary from '@/components/campaigns/CampaignReviewSummary';
import WizardProgressIndicator from '@/components/campaigns/WizardProgressIndicator';

// Existing Picker Modals
import CardDesignPickerModal from '@/components/quicksend/CardDesignPickerModal';
import TemplatePickerModal from '@/components/quicksend/TemplatePickerModal';

// Wizard steps configuration (now 5 steps)
const WIZARD_STEPS = [
  { number: 1, title: 'Campaign Type' },
  { number: 2, title: 'Enrollment' },
  { number: 3, title: 'Cards' },
  { number: 4, title: 'Return Address' },
  { number: 5, title: 'Review' }
];

// Default step configuration based on campaign type
const getDefaultSteps = (type) => {
  if (type === 'birthday' || type === 'renewal') {
    return [{
      stepOrder: 1,
      cardDesignId: null,
      templateId: null,
      messageText: '',
      timingDays: -7, // 7 days before
      timingReference: 'trigger_date'
    }];
  } else if (type === 'welcome') {
    return [{
      stepOrder: 1,
      cardDesignId: null,
      templateId: null,
      messageText: '',
      timingDays: 0, // Immediately
      timingReference: 'trigger_date'
    }];
  }
  return [];
};

export default function CampaignSetupWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    type: null,
    enrollmentMode: 'opt_out',
    requiresApproval: false,
    returnAddressMode: 'company',
    name: '',
    steps: []
  });
  const [eligibleClientCount, setEligibleClientCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Modal States
  const [designPickerOpen, setDesignPickerOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0); // Which step is being edited

  // Fetch Card Designs
  const { data: designs = [], isLoading: isLoadingDesigns } = useQuery({
    queryKey: ['cardDesigns'],
    queryFn: () => base44.entities.CardDesign.list()
  });

  // Fetch Card Design Categories
  const { data: designCategories = [] } = useQuery({
    queryKey: ['cardDesignCategories'],
    queryFn: () => base44.entities.CardDesignCategory.list()
  });

  // Fetch Templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list()
  });

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch user profile to get orgId
  const { data: userProfiles = [] } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => base44.entities.UserProfile.filter({ userId: user.id }),
    enabled: !!user?.id
  });

  const userProfile = userProfiles[0];
  const orgId = userProfile?.orgId;

  // Fetch organization for company address
  const { data: organizations = [] } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => base44.entities.Organization.filter({ id: orgId }),
    enabled: !!orgId
  });

  const organization = organizations[0];
  const companyAddress = organization?.companyReturnAddress;

  // Rep address would come from the user's profile or a related entity
  // For now, we'll show null if not available
  const repAddress = user?.returnAddress || null;

  // Fetch eligible client count when type changes
  useEffect(() => {
    const fetchEligibleCount = async () => {
      if (!campaignData.type) {
        setEligibleClientCount(0);
        return;
      }

      setIsLoadingCount(true);
      try {
        const response = await base44.functions.invoke('getEligibleClientCount', {
          campaignType: campaignData.type
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
  }, [campaignData.type]);

  // Create Campaign Mutation
  const createCampaignMutation = useMutation({
    mutationFn: async ({ status }) => {
      const response = await base44.functions.invoke('createCampaign', {
        name: campaignData.name,
        type: campaignData.type,
        enrollmentMode: campaignData.enrollmentMode,
        requiresApproval: campaignData.requiresApproval,
        returnAddressMode: campaignData.returnAddressMode,
        status,
        steps: campaignData.steps
      });
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create campaign');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.status === 'active' ? 'Campaign Activated!' : 'Campaign Saved',
        description: variables.status === 'active' 
          ? `Your campaign is now active with ${data.enrolledCount || 0} enrolled clients.`
          : 'Your campaign has been saved as a draft.'
      });
      navigate(createPageUrl('Campaigns'));
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Handle type selection (Step 1)
  const handleTypeSelect = (type) => {
    setCampaignData(prev => ({
      ...prev,
      type,
      steps: getDefaultSteps(type),
      name: '' // Reset name when type changes
    }));
  };

  // Handle enrollment mode change
  const handleModeChange = (mode) => {
    setCampaignData(prev => ({ ...prev, enrollmentMode: mode }));
  };

  // Handle approval setting change
  const handleApprovalChange = (requires) => {
    setCampaignData(prev => ({ ...prev, requiresApproval: requires }));
  };

  // Handle return address mode change
  const handleReturnAddressChange = (mode) => {
    setCampaignData(prev => ({ ...prev, returnAddressMode: mode }));
  };

  // Handle campaign name change
  const handleNameChange = (name) => {
    setCampaignData(prev => ({ ...prev, name }));
  };

  // Handle step update
  const handleStepUpdate = (stepIndex, updates) => {
    setCampaignData(prev => ({
      ...prev,
      steps: prev.steps.map((step, idx) => 
        idx === stepIndex ? { ...step, ...updates } : step
      )
    }));
  };

  // Handle adding second Welcome step
  const handleAddStep = () => {
    if (campaignData.type !== 'welcome' || campaignData.steps.length >= 2) return;
    
    setCampaignData(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          stepOrder: 2,
          cardDesignId: null,
          templateId: null,
          messageText: '',
          timingDays: 14, // 14 days after previous card
          timingReference: 'previous_step'
        }
      ]
    }));
  };

  // Handle removing a step
  const handleRemoveStep = (stepIndex) => {
    if (stepIndex === 0) return; // Can't remove first step
    
    setCampaignData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, idx) => idx !== stepIndex)
    }));
  };

  // Handle design selection from modal
  const handleDesignSelect = (design) => {
    handleStepUpdate(activeStepIndex, { cardDesignId: design.id });
    setDesignPickerOpen(false);
  };

  // Handle template selection from modal
  const handleTemplateSelect = (template) => {
    handleStepUpdate(activeStepIndex, { templateId: template.id, messageText: '' });
    setTemplatePickerOpen(false);
  };

  // Open design picker for a specific step
  const openDesignPicker = (stepIndex) => {
    setActiveStepIndex(stepIndex);
    setDesignPickerOpen(true);
  };

  // Open template picker for a specific step
  const openTemplatePicker = (stepIndex) => {
    setActiveStepIndex(stepIndex);
    setTemplatePickerOpen(true);
  };

  // Validation for each step (now 5 steps)
  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return !!campaignData.type;
      case 2:
        return true; // Mode is pre-selected
      case 3:
        // Each card step must have design and either template or message
        return campaignData.steps.every(s => 
          s.cardDesignId && (s.templateId || s.messageText?.trim())
        );
      case 4:
        return true; // Return address mode is pre-selected
      case 5:
        return campaignData.name?.trim().length > 0;
      default:
        return false;
    }
  };

  // Get design/template objects for display
  const getDesignById = (id) => designs.find(d => d.id === id);
  const getTemplateById = (id) => templates.find(t => t.id === id);

  // Navigation (now 5 steps)
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

  const handleSaveDraft = () => {
    createCampaignMutation.mutate({ status: 'draft' });
  };

  const handleActivate = () => {
    createCampaignMutation.mutate({ status: 'active' });
  };

  const isSubmitting = createCampaignMutation.isPending;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to={createPageUrl('Campaigns')} 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Campaigns
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Create New Campaign</h1>
      </div>

      {/* Progress Indicator (now with 5 steps) */}
      <div className="mb-10">
        <WizardProgressIndicator currentStep={currentStep} steps={WIZARD_STEPS} />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] mb-8">
        {/* Step 1: Campaign Type */}
        {currentStep === 1 && (
          <CampaignTypeSelector
            selectedType={campaignData.type}
            onSelect={handleTypeSelect}
          />
        )}

        {/* Step 2: Enrollment Mode */}
        {currentStep === 2 && (
          <EnrollmentModeSelector
            enrollmentMode={campaignData.enrollmentMode}
            requiresApproval={campaignData.requiresApproval}
            eligibleClientCount={isLoadingCount ? 0 : eligibleClientCount}
            onModeChange={handleModeChange}
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
                    campaignType={campaignData.type}
                    isFirstStep={index === 0}
                    onUpdate={(updates) => handleStepUpdate(index, updates)}
                    onRemove={() => handleRemoveStep(index)}
                    onOpenDesignPicker={() => openDesignPicker(index)}
                    onOpenTemplatePicker={() => openTemplatePicker(index)}
                    selectedDesign={getDesignById(step.cardDesignId)}
                    selectedTemplate={getTemplateById(step.templateId)}
                  />
                ))}

                {/* Add Second Card Button (Welcome campaigns only) */}
                {campaignData.type === 'welcome' && campaignData.steps.length < 2 && (
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
          />
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-3">
          {/* Save as Draft (steps 2-5) */}
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

          {/* Next Button (steps 1-4) */}
          {currentStep < 5 && (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep) || isSubmitting}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Activate Button (step 5 only) */}
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

      {/* Card Design Picker Modal */}
      <CardDesignPickerModal
        open={designPickerOpen}
        onOpenChange={setDesignPickerOpen}
        designs={designs}
        categories={designCategories}
        selectedId={campaignData.steps[activeStepIndex]?.cardDesignId}
        onSelect={handleDesignSelect}
      />

      {/* Template Picker Modal */}
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