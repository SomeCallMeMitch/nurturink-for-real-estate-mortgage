import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Shield, TrendingUp, Sun, Sailboat, House, Building, Car, Briefcase, Check } from 'lucide-react';

const industries = [
  { key: 'real_estate', name: 'Real Estate', icon: Home },
  { key: 'insurance', name: 'Insurance', icon: Shield },
  { key: 'financial_services', name: 'Financial Services', icon: TrendingUp },
  { key: 'solar_home_services', name: 'Solar & Home', icon: Sun },
  { key: 'auto_yacht_sales', name: 'Auto & Yacht Sales', icon: Sailboat },
  { key: 'airbnb_hosts', name: 'Air B&B Hosts', icon: House },
  { key: 'roofing_solar', name: 'Roofing & Solar', icon: Building },
  { key: 'auto_rv_rental', name: 'Auto & RV Rental', icon: Car },
  { key: 'other', name: 'Other / General', icon: Briefcase },
];

export default function IndustrySelectionStep({ onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <h1 className="text-3xl font-bold text-gray-900">What industry are you in?</h1>
      <p className="text-gray-600 mt-2">This helps us tailor templates and tags for you.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto mt-8">
        {industries.map((industry) => (
          <IndustryCard
            key={industry.key}
            {...industry}
            isSelected={selected === industry.key}
            onClick={() => setSelected(industry.key)}
          />
        ))}
      </div>
      <div className="mt-8">
        <Button size="lg" onClick={() => onSelect(selected)} disabled={!selected}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
}

function IndustryCard({ icon: Icon, name, isSelected, onClick }) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 relative border-2 ${isSelected ? 'border-[var(--brand-accent)] shadow-lg' : 'border-transparent'}`}
      onClick={onClick}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--brand-accent)] text-white rounded-full flex items-center justify-center">
          <Check size={16} />
        </div>
      )}
      <CardContent className="flex flex-col items-center justify-center p-6">
        <Icon className="w-10 h-10 md:w-12 md:h-12 text-gray-700 mb-3" />
        <span className="font-semibold text-center text-sm md:text-base">{name}</span>
      </CardContent>
    </Card>
  );
}