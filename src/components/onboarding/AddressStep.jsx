import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const usStates = [ 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY' ];

export default function AddressStep({ data, onUpdate, onComplete }) {
  const handleChange = (e) => {
    const { id, value } = e.target;
    onUpdate({ [id]: value });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Return Address (Optional)</CardTitle>
          <CardDescription>This address can be used as the return address on your cards.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-4">
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Your Address</h3>
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