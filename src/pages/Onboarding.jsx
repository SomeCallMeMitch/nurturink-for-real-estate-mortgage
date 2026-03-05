import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import RequireAuth from '@/components/auth/RequireAuth';
import { Loader2 } from 'lucide-react';

// Import Step Components
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import RoleSelectionStep from '@/components/onboarding/RoleSelectionStep';
import IndustrySelectionStep from '@/components/onboarding/IndustrySelectionStep';
import BusinessInfoStep from '@/components/onboarding/BusinessInfoStep';
import AddressStep from '@/components/onboarding/AddressStep';
import PreferencesStep from '@/components/onboarding/PreferencesStep';
import TeamInviteStep from '@/components/onboarding/TeamInviteStep';
import MobileOnboardingModal from '@/components/onboarding/MobileOnboardingModal';
// OnboardingLoader is not needed for Phase 1

const TOTAL_STEPS_INDIVIDUAL = 5;
const TOTAL_STEPS_COMPANY = 6;

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [onboardingData, setOnboardingData] = useState({
    role: null,
    industry: null,
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

  const totalSteps = onboardingData.role === 'company' ? TOTAL_STEPS_COMPANY : TOTAL_STEPS_INDIVIDUAL;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const updateData = (data) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  // PHASE 1: LOG PAYLOAD TO CONSOLE, DO NOT CALL BACKEND
  const handleComplete = async (invites = []) => {
    console.log('--- ONBOARDING COMPLETE (PHASE 1) ---');
    const finalPayload = {
      role: onboardingData.role,
      companyName: onboardingData.companyName,
      details: {
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

    console.log('Final payload to be sent to setupAccount:', JSON.stringify(finalPayload, null, 2));
    alert('Phase 1 complete! Check the developer console for the final payload. Redirecting to dashboard.');

    // For testing, navigate to the dashboard as if it were successful.
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      setShowMobileModal(true);
    } else {
      navigate('/Dashboard');
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4">
        <div className="w-full max-w-5xl mx-auto">
          <OnboardingProgress currentStep={step} totalSteps={totalSteps} onBack={step > 1 ? handleBack : null} role={onboardingData.role} />
          <main className="mt-8">
            {step === 1 && <RoleSelectionStep onSelect={(role) => { updateData({ role }); handleNext(); }} />}
            {step === 2 && <IndustrySelectionStep onSelect={(industry) => { updateData({ industry }); handleNext(); }} />}
            {step === 3 && <BusinessInfoStep data={onboardingData} onUpdate={updateData} onComplete={handleNext} />}
            {step === 4 && <AddressStep data={onboardingData} onUpdate={updateData} onComplete={handleNext} />}
            {step === 5 && onboardingData.role === 'company' && (
              <PreferencesStep
                onSelect={(style) => { updateData({ writingStyle: style }); handleNext(); }}
                onSkip={handleNext}
              />
            )}
            {step === 5 && onboardingData.role !== 'company' && (
              <PreferencesStep
                onSelect={(style) => { updateData({ writingStyle: style }); handleComplete(); }}
                onSkip={handleComplete}
              />
            )}
            {step === 6 && onboardingData.role === 'company' && <TeamInviteStep onComplete={handleComplete} onSkip={() => handleComplete([])} />}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}