import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layout, Mail, ArrowRight, Loader2, ImageIcon, DollarSign, Tag } from 'lucide-react';

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
      const [cardSettings, envelopeSettings, contentSettings] = await Promise.all([
        base44.functions.invoke('getInstanceSettings').catch(() => null),
        base44.functions.invoke('getInstanceSettings').catch(() => null),
        base44.functions.invoke('getCreateContentLayoutSettings').catch(() => null)
      ]);
      
      setStats({
        cardLayoutExists: !!cardSettings,
        envelopeLayoutExists: !!envelopeSettings,
        contentLayoutExists: !!contentSettings
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminCards = [
    {
      id: 'card-designs',
      title: 'Card Designs',
      description: 'Manage platform-wide card designs and categories',
      icon: ImageIcon,
      path: 'SuperAdminCardManagement',
      color: 'orange'
    },
    {
      id: 'pricing-tiers',
      title: 'Pricing Tiers',
      description: 'Configure credit packages and pricing options for the platform',
      icon: DollarSign,
      path: 'AdminPricing',
      color: 'emerald'
    },
    {
      id: 'coupons',
      title: 'Coupons',
      description: 'Create and manage promotional discount codes and vouchers',
      icon: Tag,
      path: 'AdminCoupons',
      color: 'pink'
    },
    {
      id: 'preview-layout',
      title: 'Preview Layout Settings',
      description: 'Configure card preview rendering, text positioning, and handwritten effects',
      icon: Layout,
      path: 'AdminCardLayout',
      color: 'indigo'
    },
    {
      id: 'content-layout',
      title: 'Content Layout Settings',
      description: 'Adjust column widths for the Create Content page editor interface',
      icon: Layout,
      path: 'AdminCreateContentLayout',
      color: 'purple'
    },
    {
      id: 'envelope-layout',
      title: 'Envelope Layout Settings',
      description: 'Configure recipient and return address positioning on envelopes',
      icon: Mail,
      path: 'AdminEnvelopeLayout',
      color: 'blue'
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
              emerald: {
                bg: 'bg-emerald-100',
                text: 'text-emerald-600',
                hover: 'hover:border-emerald-400',
                button: 'bg-emerald-600 hover:bg-emerald-700'
              },
              pink: {
                bg: 'bg-pink-100',
                text: 'text-pink-600',
                hover: 'hover:border-pink-400',
                button: 'bg-pink-600 hover:bg-pink-700'
              },
              indigo: {
                bg: 'bg-indigo-100',
                text: 'text-indigo-600',
                hover: 'hover:border-indigo-400',
                button: 'bg-indigo-600 hover:bg-indigo-700'
              },
              purple: {
                bg: 'bg-purple-100',
                text: 'text-purple-600',
                hover: 'hover:border-purple-400',
                button: 'bg-purple-600 hover:bg-purple-700'
              },
              blue: {
                bg: 'bg-blue-100',
                text: 'text-blue-600',
                hover: 'hover:border-blue-400',
                button: 'bg-blue-600 hover:bg-blue-700'
              }
            };
            const colors = colorClasses[card.color];

            return (
              <Card 
                key={card.id}
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
            <li>• <strong>Card Designs:</strong> Upload and organize card designs with categories for users to choose from</li>
            <li>• <strong>Pricing Tiers:</strong> Set up credit packages with pricing and feature highlights</li>
            <li>• <strong>Coupons:</strong> Create promotional codes for discounts and special offers</li>
            <li>• <strong>Preview Layout:</strong> Controls how handwritten text appears on cards (spacing, indentation, font sizes)</li>
            <li>• <strong>Content Layout:</strong> Adjusts the column widths in the content editor for optimal workflow</li>
            <li>• <strong>Envelope Layout:</strong> Positions addresses correctly on physical envelopes</li>
            <li>• All changes take effect immediately for all users system-wide</li>
            <li>• Test changes thoroughly before finalizing to ensure proper rendering</li>
          </ul>
        </div>
      </div>
    </SuperAdminLayout>
  );
}