import React from 'react';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tag, Loader2 } from 'lucide-react';

export default function AdminCoupons() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage promotional discount codes
          </p>
        </div>

        {/* Coming Soon Placeholder */}
        <Card>
          <CardContent className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Coupon Management Coming Soon
              </h3>
              <p className="text-gray-600 mb-6">
                This feature is currently under development. You'll soon be able to:
              </p>
              <ul className="text-left space-y-2 text-gray-700 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-1">✓</span>
                  <span>Create percentage or fixed-amount discount codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-1">✓</span>
                  <span>Set expiration dates and usage limits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-1">✓</span>
                  <span>Track coupon redemptions and performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-1">✓</span>
                  <span>Link coupons to specific pricing tiers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-1">✓</span>
                  <span>Manage influencer and referral codes</span>
                </li>
              </ul>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                In Development
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Note */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="py-4">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> The Coupon entity schema is already defined in your database. 
              The management interface will be implemented in the next development phase.
            </p>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}