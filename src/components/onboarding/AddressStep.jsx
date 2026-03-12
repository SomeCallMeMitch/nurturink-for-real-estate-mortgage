import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail } from 'lucide-react';
import ContextPanel from './ContextPanel';

const usStates = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY' ];

export default function AddressStep({ data, onUpdate, onComplete, onBack }) {
  const handleChange = (e) => {
    const { id, value } = e.target;
    onUpdate({ [id]: value });
  };

  return (
    /* Phase 2: Two-column layout with ContextPanel + Back button in footer */
    <div className="flex gap-8 items-start">
      <ContextPanel
        icon={Mail}
        heading="About return addresses"
        bullets={[
          'Personal address is used when sending as yourself',
          'Company address appears on business mailings',
          'Both are optional — you can add them later',
        ]}
        note="Addresses are never shared with recipients or third parties."
      />

      {/* Step form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Return Address (Optional)</CardTitle>
            <CardDescription>This address can be used as the return address on your cards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-4">

            {/* Personal Address */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Personal Address</h3>
              <div className="space-y-2">
                <Label htmlFor="personalStreet">Street Address</Label>
                <Input id="personalStreet" value={data.personalStreet || ''} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="personalCity">City</Label>
                  <Input id="personalCity" value={data.personalCity || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personalState">State</Label>
                  <Select onValueChange={(value) => onUpdate({ personalState: value })} value={data.personalState || ''}>
                    <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent>{usStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalZipCode">Zip Code</Label>
                <Input id="personalZipCode" value={data.personalZipCode || ''} onChange={handleChange} maxLength="5" />
              </div>
            </div>

            {/* Company Address */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Company Address</h3>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="companyStreet">Street Address</Label>
                  <Input id="companyStreet" value={data.companyStreet || ''} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="companyCity">City</Label>
                    <Input id="companyCity" value={data.companyCity || ''} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyState">State</Label>
                    <Select onValueChange={(value) => onUpdate({ companyState: value })} value={data.companyState || ''}>
                      <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                      <SelectContent>{usStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyZipCode">Zip Code</Label>
                  <Input id="companyZipCode" value={data.companyZipCode || ''} onChange={handleChange} maxLength="5" />
                </div>
              </div>
            </div>

            {/* Phase 2: Footer with Back + Continue */}
            <div className="flex items-center gap-4 pt-4">
              {onBack && (
                <Button variant="outline" onClick={onBack} className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              )}
              <Button size="lg" className="flex-1" onClick={onComplete}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}