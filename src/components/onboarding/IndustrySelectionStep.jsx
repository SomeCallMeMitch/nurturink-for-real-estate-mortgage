import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, TrendingUp, LayoutGrid, HardHat, Briefcase, Check } from 'lucide-react';

const roles = [
  { key: 'real_estate', name: 'Real Estate Agent', icon: Home, description: 'Buyers agents, listing agents, and agents who do both' },
  { key: 'mortgage', name: 'Mortgage / Lending', icon: TrendingUp, description: 'Loan officers, mortgage brokers, and lenders' },
  { key: 'both', name: 'RE & Mortgage', icon: LayoutGrid, description: 'Brokers and teams working across both sides' },
  { key: 'contractor', name: 'Contractor', icon: HardHat, description: 'Home services, remodeling, and construction' },
  { key: 'other', name: 'Other / General', icon: Briefcase, description: 'Other real estate adjacent roles' },
];

export default function IndustrySelectionStep({ onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <h1 className="text-3xl font-bold text-gray-900">What best describes your role?</h1>
      <p className="text-gray-600 mt-2">We'll tailor your templates and automations to fit how you work.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto mt-8">
        {roles.map((role) => (
          <RoleCard
            key={role.key}
            {...role}
            isSelected={selected === role.key}
            onClick={() => setSelected(role.key)}
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

function RoleCard({ icon: Icon, name, description, isSelected, onClick }) {
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
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <Icon className="w-10 h-10 md:w-12 md:h-12 text-gray-700 mb-3" />
        <span className="font-semibold text-sm md:text-base">{name}</span>
        {description && (
          <span className="text-xs text-gray-500 mt-1 leading-snug">{description}</span>
        )}
      </CardContent>
    </Card>
  );
}