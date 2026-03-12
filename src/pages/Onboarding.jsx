import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import RequireAuth from '@/components/auth/RequireAuth';
import { Loader2 } from 'lucide-react';

// Import Step Components
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import OnboardingStepWrapper from '@/components/onboarding/OnboardingStepWrapper';
import IndustrySelectionStep from '@/components/onboarding/IndustrySelectionStep';
import BusinessInfoStep from '@/components/onboarding/BusinessInfoStep';
import AddressStep from '@/components/onboarding/AddressStep';
import PreferencesStep from '@/components/onboarding/PreferencesStep';
import TeamInviteStep from '@/components/onboarding/TeamInviteStep';
import MobileOnboardingModal from '@/components/onboarding/MobileOnboardingModal';
import OnboardingLoader from '@/components/onboarding/OnboardingLoader';

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    industry: null,
    fullName: '',
    firstName: '',
    lastName: '',
    companyName: '',
    organizationEmail: '',
    website: '',
    phone: '',
    jobTitle: '',
    personalStreet: '',
    personalCity: '',
    personalState: '',
    personalZipCode: '',
    companyStreet: '',
    companyCity: '',
    companyState: '',
    companyZipCode: '',
    writingStyle: 'Friendly',
    teamInvites: [],
  });
  const [showMobileModal, setShowMobileModal] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.onboardingComplete) {
          navigate('/Dashboard');
        }
      } catch (error) {
        console.error('Auth check failed', error);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, [navigate]);

  const handleNext = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const updateData = (data) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const handleComplete = async (invites = []) => {
    setIsCompleting(true);
    try {
      const finalPayload = {
        role: 'company',
        companyName: onboardingData.companyName,
        details: {
          fullName: onboardingData.fullName,
          firstName: onboardingData.firstName,
          lastName: onboardingData.lastName,
          website: onboardingData.website,
          phone: onboardingData.phone,
          jobTitle: onboardingData.jobTitle,
          industry: onboardingData.industry,
          writingStyle: onboardingData.writingStyle,
          organizationEmail: onboardingData.organizationEmail,
          personalStreet: onboardingData.personalStreet,
          personalCity: onboardingData.personalCity,
          personalState: onboardingData.personalState,
          personalZipCode: onboardingData.personalZipCode,
          companyStreet: onboardingData.companyStreet,
          companyCity: onboardingData.companyCity,
          companyState: onboardingData.companyState,
          companyZipCode: onboardingData.companyZipCode,
        },
        teamInvites: invites,
      };

      await base44.functions.invoke('setupAccount', finalPayload);

      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        setShowMobileModal(true);
      } else {
        navigate('/Dashboard');
      }

    } catch (error) {
      console.error("Onboarding completion failed:", error);
      alert(`An error occurred while setting up your account: ${error.message}. Please try again.`);
      setIsCompleting(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (showMobileModal) {
    return <MobileOnboardingModal onClose={() => navigate('/Dashboard')} />;
  }

  return (
    <RequireAuth>
      {isCompleting && <OnboardingLoader />}
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-5xl mx-auto">
          {/* Phase 1: Removed onBack from stepper — back button now lives in each step's footer */}
          <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />
          {/* Phase 3: Step wrapper with cross-fade transition between steps */}
          <main className="mt-8">
            <OnboardingStepWrapper stepKey={step}>
              {step === 1 && <IndustrySelectionStep onSelect={(industry) => { updateData({ industry }); handleNext(); }} />}
              {step === 2 && <BusinessInfoStep data={onboardingData} onUpdate={updateData} onComplete={handleNext} onBack={handleBack} />}
              {step === 3 && <AddressStep data={onboardingData} onUpdate={updateData} onComplete={handleNext} onBack={handleBack} />}
              {step === 4 && (
                <PreferencesStep
                  onSelect={(style) => { updateData({ writingStyle: style }); handleNext(); }}
                  onSkip={handleNext}
                  onBack={handleBack}
                />
              )}
              {step === 5 && <TeamInviteStep onComplete={handleComplete} onSkip={() => handleComplete([])} onBack={handleBack} />}
            </OnboardingStepWrapper>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}