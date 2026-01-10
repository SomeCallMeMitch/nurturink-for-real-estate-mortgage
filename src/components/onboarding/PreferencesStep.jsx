import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const styles = [
  { key: 'Friendly', name: 'Friendly', description: 'Warm and approachable.' },
  { key: 'Casual', name: 'Casual', description: 'Relaxed and informal.' },
  { key: 'Professional', name: 'Professional', description: 'Formal and business-like.' },
  { key: 'Grateful', name: 'Grateful', description: 'Expresses thanks and appreciation.' },
  { key: 'Direct', name: 'Direct', description: 'Clear and to the point.' },
];

const stylePreviews = {
    Friendly: { greeting: 'Hi [Client Name],', signature: 'Best,\n[Your Name]' },
    Casual: { greeting: 'Hey [Client Name],', signature: 'Cheers,\n[Your Name]' },
    Professional: { greeting: 'Dear [Client Name],', signature: 'Sincerely,\n[Your Full Name]\n[Your Title]' },
    Grateful: { greeting: 'Hi [Client Name],', signature: 'With gratitude,\n[Your Name]' },
    Direct: { greeting: '[Client Name],', signature: 'Regards,\n[Your Name]' },
};

export default function PreferencesStep({ onSelect, onSkip }) {
  const [selectedStyle, setSelectedStyle] = useState('Friendly');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Set Your Writing Style</CardTitle>
          <CardDescription>Choose a default style for your notes. You can change this and create your own later.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="writing-style">Default Style</Label>
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger id="writing-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map(style => (
                  <SelectItem key={style.key} value={style.key}>
                    <div className="flex flex-col">
                      <span className="font-semibold">{style.name}</span>
                      <span className="text-xs text-gray-500">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Style Preview</Label>
            <div className="p-4 border rounded-md bg-gray-50 text-sm text-gray-700 whitespace-pre-wrap font-serif">
                {stylePreviews[selectedStyle].greeting}
                <br /><br />
                ...your message will go here...
                <br /><br />
                {stylePreviews[selectedStyle].signature}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Button variant="outline" className="w-full" onClick={onSkip}>Skip for Now</Button>
            <Button className="w-full" onClick={() => onSelect(selectedStyle)}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}