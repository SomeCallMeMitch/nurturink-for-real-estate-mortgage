import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layout, Mail, ArrowRight, Loader2, ImageIcon, DollarSign, Tag, Palette, ClipboardList } from 'lucide-react';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    cardLayoutExists: false,
    envelopeLayoutExists: false,
    contentLayoutExists: false
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Check if settings exist
      // Note: These invocations were duplicated for cardSettings and envelopeSettings.
      // Assuming they refer to distinct layout settings, I'm keeping the original pattern,
      // but if getInstanceSettings is meant for a single type of setting, it should be clarified.
      // For now, these are placeholder checks, as the actual layout settings are different.
      // The current implementation is a best guess based on the existing code structure.
      const [cardLayoutCheck, envelopeLayoutCheck, contentLayoutCheck] = await Promise.all([
        base44.functions.invoke('getCardLayoutSettings').catch(() => null), // Assuming a specific function for card layout settings
        base44.functions.invoke('getEnvelopeLayoutSettings').catch(() => null), // Assuming a specific function for envelope layout settings
        base44.functions.invoke('getCreateContentLayoutSettings').catch(() => null)
      ]);
      
      setStats({
        cardLayoutExists: !!cardLayoutCheck,
        envelopeLayoutExists: !!envelopeLayoutCheck,
        contentLayoutExists: !!contentLayoutCheck
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminCards = [
    {
      title: 'Card Design Management',
      description: 'Manage platform-wide card designs, categories, and templates',
      icon: ImageIcon, // Changed from Mail to ImageIcon, as it seems more fitting for 'Card Design'
      path: 'SuperAdminCardManagement',
      color: 'orange'
    },
    {
      title: 'Whitelabel Settings',
      description: 'Configure branding, theming, colors, fonts, and notification appearance',
      icon: Palette,
      path: 'SuperAdminWhitelabel',
      color: 'purple'
    },
    {
      title: 'Pricing Management',
      description: 'Configure pricing tiers, credit packages, and default pricing',
      icon: DollarSign,
      path: 'AdminPricing',
      color: 'green'
    },
    {
      title: 'Coupon Management',
      description: 'Create and manage discount coupons and promotional codes',
      icon: Tag,
      path: 'AdminCoupons',
      color: 'blue'
    },
    {
      title: 'Card Layout Settings',
      description: 'Configure card preview rendering, dimensions, and spacing',
      icon: Layout,
      path: 'AdminCardLayout',
      color: 'indigo'
    },
    {
      title: 'Envelope Layout Settings',
      description: 'Configure envelope preview, address positioning, and fonts',
      icon: Mail,
      path: 'AdminEnvelopeLayout',
      color: 'pink'
    },
    {
      title: 'Content Layout Settings',
      description: 'Configure CreateContent page column widths and layout',
      icon: Layout,
      path: 'AdminCreateContentLayout',
      color: 'teal'
    }
  ];

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage global application settings and configurations
          </p>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card) => {
            const Icon = card.icon;
            const colorClasses = {
              orange: {
                bg: 'bg-orange-100',
                text: 'text-orange-600',
                hover: 'hover:border-orange-400',
                button: 'bg-orange-600 hover:bg-orange-700'
              },
              purple: {
                bg: 'bg-purple-100',
                text: 'text-purple-600',
                hover: 'hover:border-purple-400',
                button: 'bg-purple-600 hover:bg-purple-700'
              },
              green: {
                bg: 'bg-green-100',
                text: 'text-green-600',
                hover: 'hover:border-green-400',
                button: 'bg-green-600 hover:bg-green-700'
              },
              blue: {
                bg: 'bg-blue-100',
                text: 'text-blue-600',
                hover: 'hover:border-blue-400',
                button: 'bg-blue-600 hover:bg-blue-700'
              },
              indigo: {
                bg: 'bg-indigo-100',
                text: 'text-indigo-600',
                hover: 'hover:border-indigo-400',
                button: 'bg-indigo-600 hover:bg-indigo-700'
              },
              pink: {
                bg: 'bg-pink-100',
                text: 'text-pink-600',
                hover: 'hover:border-pink-400',
                button: 'bg-pink-600 hover:bg-pink-700'
              },
              teal: {
                bg: 'bg-teal-100',
                text: 'text-teal-600',
                hover: 'hover:border-teal-400',
                button: 'bg-teal-600 hover:bg-teal-700'
              }
            };
            const colors = colorClasses[card.color];

            return (
              <Card 
                key={card.path} // Using path as key since id was removed from new definition
                className={`border-2 border-gray-200 ${colors.hover} transition-all hover:shadow-lg`}
              >
                <CardHeader>
                  <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{card.title}</CardTitle>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => navigate(createPageUrl(card.path))}
                    className={`w-full ${colors.button} gap-2`}
                  >
                    Configure
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 About Super Admin Settings</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Card Design Management:</strong> Upload and organize card designs with categories and templates for users to choose from.</li>
            <li>• <strong>Whitelabel Settings:</strong> Configure branding, themes, fonts, colors, and notification settings for the platform.</li>
            <li>• <strong>Pricing Management:</strong> Set up credit packages, pricing models, and default pricing options.</li>
            <li>• <strong>Coupon Management:</strong> Create and manage promotional discount codes and vouchers.</li>
            <li>• <strong>Card Layout Settings:</strong> Controls how card previews render, including dimensions and spacing for elements.</li>
            <li>• <strong>Envelope Layout Settings:</strong> Positions addresses correctly on physical envelopes and defines envelope specific fonts.</li>
            <li>• <strong>Content Layout Settings:</strong> Adjusts column widths in the Create Content page editor for optimal workflow.</li>
            <li>• All changes take effect immediately for all users system-wide.</li>
            <li>• Test changes thoroughly before finalizing to ensure proper rendering.</li>
          </ul>
        </div>
      </div>
    </SuperAdminLayout>
  );
}