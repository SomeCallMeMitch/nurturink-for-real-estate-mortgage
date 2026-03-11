import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BusinessInfoStep({ data, onUpdate, onComplete }) {
  const handleChange = (e) => {
    onUpdate({ [e.target.id]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    onUpdate({ phone: e.target.value });
  };

  const isFormValid = () => {
    if (!data.firstName || !data.lastName || !data.jobTitle || !data.phone) return false;
    return true;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Tell us about your business</CardTitle>
          <CardDescription>This information will be used for your account profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name (Optional)</Label>
              <Input id="companyName" value={data.companyName || ''} onChange={handleChange} placeholder="Your company or agency name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationEmail">Organization Email (Optional)</Label>
              <Input id="organizationEmail" type="email" value={data.organizationEmail || ''} onChange={handleChange} placeholder="info@yourcompany.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={data.firstName || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={data.lastName || ''} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input id="jobTitle" value={data.jobTitle || ''} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={data.phone || ''} onChange={handlePhoneChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input id="website" value={data.website || ''} onChange={handleChange} placeholder="https://yourcompany.com" />
          </div>
          <div className="pt-4">
            <Button size="lg" className="w-full" onClick={onComplete} disabled={!isFormValid()}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}