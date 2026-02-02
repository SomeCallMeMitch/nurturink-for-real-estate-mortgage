import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, ArrowRight, Save, Loader2, Target } from 'lucide-react';

// Import wizard step components
import CampaignWizardStepInfo from '@/components/campaigns/CampaignWizardStepInfo';
import CampaignWizardStepSequence from '@/components/campaigns/CampaignWizardStepSequence';
import CampaignWizardStepReview from '@/components/campaigns/CampaignWizardStepReview';

// Wizard step configuration
const WIZARD_STEPS = [
  { id: 1, label: 'Campaign Info', description: 'Basic settings' },
  { id: 2, label: 'Card Sequence', description: 'Define steps' },
  { id: 3, label: 'Review & Save', description: 'Confirm details' },
];

export default function CampaignWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get campaign ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');
  const duplicateFromId = urlParams.get('duplicate');
  const isNew = campaignId === 'new';
  const isEditing = !isNew && campaignId;

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);

  // User and reference data
  const [user, setUser] = useState(null);
  const [cardDesigns, setCardDesigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [cardDesignCategories, setCardDesignCategories] = useState([]);

  // Campaign form data
  const [campaignData, setCampaignData] = useState({
    name: '',
    type: 'birthday',
    enrollmentMode: 'opt_out',
    requiresApproval: false,
    description: '',
  });

  // Campaign steps (sequence of cards)
  const [campaignSteps, setCampaignSteps] = useState([
    {
      stepOrder: 1,
      cardDesignId: '',
      templateId: '',
      messageText: '',
      timingDays: 0,
      timingReference: 'trigger_date',
      isEnabled: true,
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load reference data in parallel
      const [designsResponse, templatesResponse, categoriesResponse] = await Promise.all([
        base44.entities.CardDesign.filter({}),
        base44.entities.Template.filter({}),
        base44.entities.CardDesignCategory.filter({}),
      ]);

      setCardDesigns(designsResponse);
      setTemplates(templatesResponse);
      setCardDesignCategories(categoriesResponse);

      // If editing or duplicating, load existing campaign
      const loadCampaignId = isEditing ? campaignId : duplicateFromId;
      if (loadCampaignId) {
        const response = await base44.functions.invoke('getCampaignDetails', {
          campaignId: loadCampaignId,
        });

        if (response.data.success) {
          const { campaign, steps } = response.data;

          setCampaignData({
            name: duplicateFromId ? `${campaign.name} (Copy)` : campaign.name,
            type: campaign.type,
            enrollmentMode: campaign.enrollmentMode,
            requiresApproval: campaign.requiresApproval || false,
            description: campaign.description || '',
          });

          if (steps && steps.length > 0) {
            setCampaignSteps(
              steps.map((step) => ({
                stepOrder: step.stepOrder,
                cardDesignId: step.cardDesignId || '',
                templateId: step.templateId || '',
                messageText: step.messageText || '',
                timingDays: step.timingDays,
                timingReference: step.timingReference || 'trigger_date',
                isEnabled: step.isEnabled !== false,
              }))
            );
          }
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load campaign data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation helpers
  const validateStep1 = () => {
    if (!campaignData.name.trim()) {
      toast({ title: 'Error', description: 'Campaign name is required.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (campaignSteps.length === 0) {
      toast({ title: 'Error', description: 'At least one campaign step is required.', variant: 'destructive' });
      return false;
    }

    for (let i = 0; i < campaignSteps.length; i++) {
      const step = campaignSteps[i];
      if (!step.cardDesignId) {
        toast({
          title: 'Error',
          description: `Step ${i + 1} requires a card design.`,
          variant: 'destructive',
        });
        return false;
      }
      if (!step.templateId && !step.messageText?.trim()) {
        toast({
          title: 'Error',
          description: `Step ${i + 1} requires a message template or custom message.`,
          variant: 'destructive',
        });
        return false;
      }
    }
    return true;
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCancel = () => {
    navigate(createPageUrl('Campaigns'));
  };

  // Save campaign
  const handleSave = async (activateAfterSave = false) => {
    if (!validateStep1() || !validateStep2()) return;

    setIsSaving(true);
    try {
      if (isEditing) {
        // Update existing campaign
        const response = await base44.functions.invoke('updateCampaign', {
          campaignId,
          updates: {
            ...campaignData,
            status: activateAfterSave ? 'active' : undefined,
            steps: campaignSteps,
          },
        });

        if (response.data.success) {
          toast({
            title: 'Campaign Updated',
            description: `"${campaignData.name}" has been saved.`,
            className: 'bg-green-50 border-green-200 text-green-900',
          });
          navigate(createPageUrl('Campaigns'));
        }
      } else {
        // Create new campaign
        const response = await base44.functions.invoke('createCampaign', {
          ...campaignData,
          steps: campaignSteps,
        });

        if (response.data.success) {
          // If activating, update status
          if (activateAfterSave) {
            await base44.functions.invoke('updateCampaign', {
              campaignId: response.data.campaignId,
              updates: { status: 'active' },
            });
          }

          toast({
            title: 'Campaign Created',
            description: `"${campaignData.name}" has been created.`,
            className: 'bg-green-50 border-green-200 text-green-900',
          });
          navigate(createPageUrl('Campaigns'));
        }
      }
    } catch (err) {
      console.error('Failed to save campaign:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to save campaign.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {WIZARD_STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.id}
              </div>
              <p
                className={`mt-2 text-sm font-medium ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
            {index < WIZARD_STEPS.length - 1 && (
              <div
                className={`w-20 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground mt-2">Loading campaign...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-6 max-w-4xl">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={loadData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? 'Edit Campaign' : 'Create Campaign'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? 'Update your automated card campaign'
                : 'Set up a new automated card sending campaign'}
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <CampaignWizardStepInfo
              campaignData={campaignData}
              setCampaignData={setCampaignData}
            />
          )}

          {currentStep === 2 && (
            <CampaignWizardStepSequence
              campaignData={campaignData}
              campaignSteps={campaignSteps}
              setCampaignSteps={setCampaignSteps}
              cardDesigns={cardDesigns}
              templates={templates}
              cardDesignCategories={cardDesignCategories}
              user={user}
            />
          )}

          {currentStep === 3 && (
            <CampaignWizardStepReview
              campaignData={campaignData}
              campaignSteps={campaignSteps}
              cardDesigns={cardDesigns}
              templates={templates}
              isEditing={isEditing}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>

        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={isSaving}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          {currentStep < 3 && (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {currentStep === 3 && (
            <>
              <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save as Draft
              </Button>
              <Button onClick={() => handleSave(true)} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save & Activate
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}