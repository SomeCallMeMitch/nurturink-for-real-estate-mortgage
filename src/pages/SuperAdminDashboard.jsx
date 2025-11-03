import React from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layout, Users, CreditCard, BarChart, ImageIcon, Building, Settings, Mail } from 'lucide-react';

const adminSections = [
  {
    title: 'Card Layout Settings',
    description: 'Fine-tune the rendering settings for notecards.',
    link: '/super-admin/card-layout',
    icon: Layout,
    status: 'Live',
  },
  {
    title: 'Envelope Layout',
    description: 'Configure envelope address positioning and format.',
    link: '/super-admin/envelope-layout',
    icon: Mail,
    status: 'Live',
  },
  {
    title: 'Client Management',
    description: 'View, edit, and manage all clients across the platform.',
    link: '/admin/clients',
    icon: Users,
    status: 'Live',
  },
  {
    title: 'Organization Management',
    description: 'Manage all organizations using the platform.',
    link: '/super-admin/organizations',
    icon: Building,
    status: 'Coming Soon',
  },
  {
    title: 'User Management',
    description: 'View, edit, and manage all users and their roles.',
    link: '/super-admin/users',
    icon: Users,
    status: 'Coming Soon',
  },
  {
    title: 'Design Library',
    description: 'Upload and manage the library of available card designs.',
    link: '/super-admin/designs',
    icon: ImageIcon,
    status: 'Coming Soon',
  },
  {
    title: 'Analytics & Reports',
    description: 'View mailing statistics, cost analysis, and other reports.',
    link: '/super-admin/analytics',
    icon: BarChart,
    status: 'Coming Soon',
  },
  {
    title: 'Billing & Credits',
    description: 'Manage platform-wide billing and credit packages.',
    link: '/super-admin/billing',
    icon: CreditCard,
    status: 'Coming Soon',
  },
  {
    title: 'Platform Settings',
    description: 'Configure global settings and preferences.',
    link: '/super-admin/settings',
    icon: Settings,
    status: 'Coming Soon',
  },
];

const AdminCard = ({ title, description, link, icon: Icon, status }) => {
  const navigate = useNavigate();
  const isLive = status === 'Live';

  return (
    <Card 
      className={`transition-all hover:shadow-lg ${
        isLive 
          ? 'cursor-pointer hover:border-indigo-500 hover:scale-105' 
          : 'cursor-not-allowed bg-gray-50 opacity-60'
      }`}
      onClick={() => isLive && navigate(link)}
    >
      <CardHeader className="flex flex-col items-center text-center p-6">
        <Icon className="w-10 h-10 mb-4 text-indigo-600" />
        <CardTitle className="text-lg mb-2">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
        {!isLive && (
          <span className="mt-3 text-xs font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
            {status}
          </span>
        )}
        {isLive && (
          <span className="mt-3 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
            Active
          </span>
        )}
      </CardHeader>
    </Card>
  );
};

export default function SuperAdminDashboard() {
  return (
    <SuperAdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage all aspects of the RoofScribe platform from this central hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <AdminCard key={section.title} {...section} />
          ))}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardDescription className="text-sm text-gray-500">Total Users</CardDescription>
              <CardTitle className="text-3xl text-indigo-600">-</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardDescription className="text-sm text-gray-500">Total Organizations</CardDescription>
              <CardTitle className="text-3xl text-indigo-600">-</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardDescription className="text-sm text-gray-500">Cards Sent (All Time)</CardDescription>
              <CardTitle className="text-3xl text-indigo-600">-</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardDescription className="text-sm text-gray-500">Revenue (MTD)</CardDescription>
              <CardTitle className="text-3xl text-indigo-600">-</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
}