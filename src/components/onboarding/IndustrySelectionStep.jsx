import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Shield, TrendingUp, Sun, Sailboat, House, Building, Car, Briefcase, Check, Sparkles, ArrowRight } from 'lucide-react';
import ContextPanel from './ContextPanel';

const industries = [
  { key: 'real_estate', name: 'Real Estate', icon: Home },
  { key: 'insurance', name: 'Insurance', icon: Shield },
  { key: 'mortgage', name: 'Mortgage', icon: TrendingUp },
  { key: 'solar_home_services', name: 'Solar & Home', icon: Sun },
  { key: 'auto_yacht_sales', name: 'Auto & Yacht Sales', icon: Sailboat },
  { key: 'airbnb_hosts', name: 'Air B&B Hosts', icon: House },
  { key: 'roofing_solar', name: 'Roofing & Solar', icon: Building },
  { key: 'auto_rv_rental', name: 'Auto & RV Rental', icon: Car },
  { key: 'other', name: 'Other / General', icon: Briefcase },
];

/* Phase 3: Staggered grid animation variants */
const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function IndustrySelectionStep({ onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex gap-8 items-start">
      <ContextPanel
        icon={Sparkles}
        heading="Why we ask"
        bullets={[
          'Pre-loaded templates for your industry',
          'Smart tags & categories tailored to you',
          'Relevant card designs shown first',
        ]}
        note="You can always change your industry later in Settings."
      />

      <div className="flex-1 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-3xl font-bold text-gray-900">What industry are you in?</h1>
          <p className="text-gray-600 mt-2">This helps us tailor templates and tags for you.</p>
        </motion.div>

        {/* Phase 3: Staggered grid entrance */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto mt-8"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
        >
          {industries.map((industry) => (
            <IndustryCard
              key={industry.key}
              {...industry}
              isSelected={selected === industry.key}
              onClick={() => setSelected(industry.key)}
            />
          ))}
        </motion.div>

        {/* Continue CTA — always visible, no delay animation */}
        <div className="mt-8">
          <Button
            size="lg"
            onClick={() => onSelect(selected)}
            disabled={!selected}
            className="gap-2"
            style={{
              backgroundColor: selected ? 'var(--onboarding-primary)' : undefined,
              color: selected ? '#fff' : undefined,
            }}
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* Phase 3: Animated IndustryCard with scale on select + orange accent */
function IndustryCard({ icon: Icon, name, isSelected, onClick }) {
  return (
    <motion.div variants={cardVariants}>
      <Card
        className={`cursor-pointer transition-all relative border-2 ${
          isSelected
            ? 'shadow-lg'
            : 'border-transparent hover:shadow-md hover:-translate-y-0.5'
        }`}
        style={{
          borderColor: isSelected ? 'var(--onboarding-primary)' : undefined,
        }}
        onClick={onClick}
      >
        {/* Phase 3: Animated checkmark badge */}
        {isSelected && (
          <motion.div
            className="absolute top-2 right-2 w-6 h-6 text-white rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--onboarding-primary)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Check size={14} />
          </motion.div>
        )}
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Icon
            className="w-10 h-10 md:w-12 md:h-12 mb-3 transition-colors"
            style={{ color: isSelected ? 'var(--onboarding-primary)' : '#374151' }}
          />
          <span className="font-semibold text-center text-sm md:text-base">{name}</span>
        </CardContent>
      </Card>
    </motion.div>
  );
}