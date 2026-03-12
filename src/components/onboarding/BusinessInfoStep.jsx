import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Building } from 'lucide-react';
import ContextPanel from './ContextPanel';

/**
 * Phase 3: Added required field indicators (*), section dividers,
 * orange accent on Continue CTA, and improved card styling.
 */
export default function BusinessInfoStep({ data, onUpdate, onComplete, onBack }) {
  const handleChange = (e) => {
    onUpdate({ [e.target.id]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    onUpdate({ phone: e.target.value });
  };

  const isFormValid = () => {
    if (!data.fullName || !data.firstName || !data.lastName || !data.jobTitle || !data.phone) return false;
    return true;
  };

  return (
    <div className="flex gap-8 items-start">
      <ContextPanel
        icon={Building}
        heading="Your profile matters"
        bullets={[
          'Your name appears on every handwritten note',
          'Company info is used for return addresses',
          'Phone & website can be added to your signature',
        ]}
        note="All fields can be updated later in your Settings."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-1 max-w-lg mx-auto"
      >
        <Card className="shadow-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl">Tell us about your business</CardTitle>
            <CardDescription>This information will be used for your account profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            {/* Phase 3: Required indicator helper */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Your Full Name <span className="text-red-400">*</span></Label>
              <Input id="fullName" value={data.fullName || ''} onChange={handleChange} placeholder="e.g. Jane Smith" />
            </div>

            {/* Phase 3: Visual section divider */}
            <div className="border-t border-gray-100 pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name <span className="text-gray-400 text-xs font-normal">(Optional)</span></Label>
                <Input id="companyName" value={data.companyName || ''} onChange={handleChange} placeholder="Your company or agency name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizationEmail">Organization Email <span className="text-gray-400 text-xs font-normal">(Optional)</span></Label>
                <Input id="organizationEmail" type="email" value={data.organizationEmail || ''} onChange={handleChange} placeholder="info@yourcompany.com" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name <span className="text-red-400">*</span></Label>
                <Input id="firstName" value={data.firstName || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name <span className="text-red-400">*</span></Label>
                <Input id="lastName" value={data.lastName || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title <span className="text-red-400">*</span></Label>
              <Input id="jobTitle" value={data.jobTitle || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-red-400">*</span></Label>
              <Input id="phone" value={data.phone || ''} onChange={handlePhoneChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website <span className="text-gray-400 text-xs font-normal">(Optional)</span></Label>
              <Input id="website" value={data.website || ''} onChange={handleChange} placeholder="https://yourcompany.com" />
            </div>

            {/* Phase 3: Orange accent footer */}
            <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
              {onBack && (
                <Button variant="outline" onClick={onBack} className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              )}
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={onComplete}
                disabled={!isFormValid()}
                style={{
                  backgroundColor: isFormValid() ? 'var(--onboarding-primary)' : undefined,
                  color: isFormValid() ? '#fff' : undefined,
                }}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}