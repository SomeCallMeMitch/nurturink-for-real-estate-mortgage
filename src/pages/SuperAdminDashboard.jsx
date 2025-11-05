import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layout, Mail, Settings, ImageIcon } from 'lucide-react';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const adminTools = [
    {
      id: 'card-designs',
      title: 'Card Designs',
      description: 'Manage platform-wide card designs and categories',
      icon: ImageIcon,
      path: 'SuperAdminCardManagement',
      color: 'orange'
    },
    {
      id: 'preview-layout',
      title: 'Preview Layout',
      description: 'Configure card preview rendering settings',
      icon: Layout,
      path: 'AdminCardLayout',
      color: 'blue'
    },
    {
      id: 'content-layout',
      title: 'Content Layout',
      description: 'Adjust Create Content page column widths',
      icon: Layout,
      path: 'AdminCreateContentLayout',
      color: 'purple'
    },
    {
      id: 'envelope-layout',
      title: 'Envelope Layout',
      description: 'Configure envelope address positioning',
      icon: Mail,
      path: 'AdminEnvelopeLayout',
      color: 'green'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      orange: 'bg-orange-100 text-orange-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage platform-wide settings and configurations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${getColorClasses(tool.color)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{tool.title}</CardTitle>
                        <CardDescription className="mt-1">{tool.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => navigate(createPageUrl(tool.path))}
                    className="w-full"
                  >
                    Manage {tool.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </SuperAdminLayout>
  );
}