import React from "react";
import SuperAdminLayout from "@/components/sa/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function AdminEnvelopeLayout() {
  return (
    <SuperAdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Envelope Layout Settings</h1>
          <p className="text-gray-600">
            Configure global settings for envelope preview and printing
          </p>
        </div>

        {/* Placeholder Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-400" />
              Coming Soon
            </CardTitle>
            <CardDescription>
              Envelope layout configuration will be available in a future update
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Envelope Settings Placeholder
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                This page will contain settings for envelope address positioning, 
                return address formatting, and print layout configuration.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Future Features Preview */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Planned Features:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Recipient address positioning</li>
            <li>• Return address positioning</li>
            <li>• Font size and style settings</li>
            <li>• Envelope size templates (A2, A6, etc.)</li>
            <li>• Print margin configuration</li>
          </ul>
        </div>
      </div>
    </SuperAdminLayout>
  );
}