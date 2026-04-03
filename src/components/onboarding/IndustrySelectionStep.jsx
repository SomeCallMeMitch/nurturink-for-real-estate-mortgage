import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Key, Home, Star, TrendingUp, Users, HardHat, Briefcase, Check } from 'lucide-react';

const roles = [
  { key: 'buyers_agent', name: "Buyer's Agent", icon: Key },
  { key: 'listing_agent', name: 'Listing Agent', icon: Home },
  { key: 'buyers_and_listing', name: 'Buyer & Listing', icon: Star },
  { key: 'mortgage', name: 'Mortgage / Lending', icon: TrendingUp },
  { key: 'team_leader_broker', name: 'Team Leader / Broker', icon: Users },
  { key: 'contractor', name: 'Contractor', icon: HardHat },
  { key: 'other', name: 'Other / General', icon: Briefcase },
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

function RoleCard({ icon: Icon, name, isSelected, onClick }) {
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