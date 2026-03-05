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
import OnboardingLoader from '@/components/onboarding/OnboardingLoader';

const TOTAL_STEPS_INDIVIDUAL = 5;
const TOTAL_STEPS_COMPANY = 6;

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
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

  const handleComplete = async (invites = []) => {
    setIsCompleting(true);
    try {
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