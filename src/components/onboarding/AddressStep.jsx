import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";

const usStates = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY' ];

export default function AddressStep({ data, onUpdate, onComplete }) {
  const isCompany = data.role === 'company';
  const [usePersonalForCompany, setUsePersonalForCompany] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    onUpdate({ [id]: value });
  };

  const handleCheckboxChange = (checked) => {
    setUsePersonalForCompany(checked);
    if (checked) {
      onUpdate({
        companyStreet: data.personalStreet,
        companyCity: data.personalCity,
        companyState: data.personalState,
        companyZipCode: data.personalZipCode,
      });
    } else {
      onUpdate({
        companyStreet: '',
        companyCity: '',
        companyState: '',
        companyZipCode: '',
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
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
          {isCompany && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Company Address</h3>
              <div className="flex items-center space-x-2">
                <Checkbox id="usePersonalForCompany" checked={usePersonalForCompany} onCheckedChange={handleCheckboxChange} />
                <Label htmlFor="usePersonalForCompany" className="cursor-pointer">Use my personal address</Label>
              </div>
              {!usePersonalForCompany && (
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
              )}
            </div>
          )}

          <div className="pt-4">
            <Button size="lg" className="w-full" onClick={onComplete}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}