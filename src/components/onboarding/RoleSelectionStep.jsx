import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, Check } from 'lucide-react';

const roles = [
  {
    key: 'sales_rep',
    icon: User,
    color: 'blue',
    title: 'Individual Sales Rep',
    description: 'I want to send cards to my own clients.',
    features: ['Buy credits directly', 'Manage personal templates', 'Track your sent notes'],
  },
  {
    key: 'company',
    icon: Building2,
    color: 'indigo',
    title: 'Company / Team',
    description: 'I manage a team and want centralized billing.',
    features: ['Manage team members', 'Allocate credits to reps', 'Shared or private pools'],
  },
];

export default function RoleSelectionStep({ onSelect }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <h1 className="text-3xl font-bold text-gray-900">Welcome to NurturInk!</h1>
      <p className="text-gray-600 mt-2">Let's start by choosing the best account type for you.</p>
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-8">
        {roles.map((role) => (
          <RoleCard key={role.key} {...role} onClick={() => onSelect(role.key)} />
        ))}
      </div>
    </motion.div>
  );
}

function RoleCard({ icon: Icon, color, title, description, features, onClick }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 group-hover:border-blue-500',
    indigo: 'bg-indigo-100 text-indigo-600 group-hover:border-indigo-500',
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg relative overflow-hidden group border-2 border-transparent hover:border-opacity-50 ${colorClasses[color].split(' ').pop()}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color].split(' ').slice(0, 2).join(' ')}`}>
          <Icon size={24} />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-gray-600 text-left">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check size={16} className="text-green-500 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}