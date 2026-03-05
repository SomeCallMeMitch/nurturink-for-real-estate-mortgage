import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const usStates = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY' ];

export default function BusinessInfoStep({ data, onUpdate, onComplete }) {
  const isCompany = data.role === 'company';

  const handleChange = (e) => {
    onUpdate({ [e.target.id]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    onUpdate({ phone: e.target.value });
  };

  const handleZipChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    onUpdate({ zipCode: value });
  };

  const isFormValid = () => {
    if (isCompany && !data.companyName) return false;
    if (!data.firstName || !data.lastName || !data.jobTitle || !data.phone || !data.state || !data.zipCode) return false;
    if (data.zipCode.length !== 5) return false;
    return true;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Tell us about your business</CardTitle>
          <CardDescription>This information will be used for your account and return addresses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {isCompany && (
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" value={data.companyName} onChange={handleChange} required />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={data.firstName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={data.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input id="jobTitle" value={data.jobTitle} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={data.phone} onChange={handlePhoneChange} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select onValueChange={(value) => onUpdate({ state: value })} value={data.state}>
                <SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger>
                <SelectContent>{usStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input id="zipCode" value={data.zipCode} onChange={handleZipChange} maxLength="5" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input id="website" value={data.website} onChange={handleChange} placeholder="https://yourcompany.com" />
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