import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Mail, User, Building2 } from 'lucide-react';
import ContextPanel from './ContextPanel';

const usStates = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY' ];

/**
 * Phase 3: Added section header icons, improved divider styling,
 * orange accent CTA, and animated section entrance.
 */
export default function AddressStep({ data, onUpdate, onComplete, onBack }) {
  const handleChange = (e) => {
    const { id, value } = e.target;
    onUpdate({ [id]: value });
  };

  return (
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-1 max-w-2xl mx-auto"
      >
        <Card className="shadow-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl">Return Address (Optional)</CardTitle>
            <CardDescription>This address can be used as the return address on your cards.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">

            {/* Phase 3: Personal Address section with icon header */}
            <motion.div
              className="space-y-4 p-4 border rounded-lg bg-gray-50/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-base">Personal Address</h3>
              </div>
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
            </motion.div>

            {/* Phase 3: Company Address section with icon header */}
            <motion.div
              className="space-y-4 p-4 border rounded-lg bg-gray-50/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-base">Company Address</h3>
              </div>
              <div className="space-y-4">
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
            </motion.div>

            {/* Phase 3: Orange accent footer */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              {onBack && (
                <Button variant="outline" onClick={onBack} className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              )}
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={onComplete}
                style={{ backgroundColor: 'var(--onboarding-primary)', color: '#fff' }}
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