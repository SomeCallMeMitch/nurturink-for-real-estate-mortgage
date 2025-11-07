import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  XCircle, 
  CreditCard, 
  Home, 
  Mail, 
  Package,
  AlertCircle 
} from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  const [savedPackage, setSavedPackage] = useState(null);

  useEffect(() => {
    // Try to retrieve the package that was being purchased
    try {
      const packageData = localStorage.getItem('selectedPackage');
      if (packageData) {
        setSavedPackage(JSON.parse(packageData));
      }
    } catch (e) {
      console.error('Failed to load saved package:', e);
    }
  }, []);

  const formatPrice = (priceInCents) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const handleTryAgain = () => {
    // Keep the package in localStorage so it's still selected
    navigate(createPageUrl('Credits'));
  };

  const handleClearAndReturn = () => {
    // Clear saved package and return to credits page
    try {
      localStorage.removeItem('selectedPackage');
    } catch (e) {
      console.error('Failed to clear package:', e);
    }
    navigate(createPageUrl('Credits'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <XCircle className="w-12 h-12 text-gray-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-lg text-gray-600">
            Your order was not completed and you have not been charged.
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-xl">What Happened?</CardTitle>
            <CardDescription>
              It looks like you cancelled the payment process or closed the checkout window.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Package Info if Available */}
            {savedPackage && (
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Package className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-indigo-900 mb-1">
                      Your Selected Package
                    </h3>
                    <div className="text-sm text-indigo-800 space-y-1">
                      <p>
                        <span className="font-medium">{savedPackage.title}</span> - {savedPackage.credits} credits
                      </p>
                      <p>
                        Price: {formatPrice(savedPackage.price)}
                        {savedPackage.discountAmount > 0 && (
                          <span className="ml-2 text-green-700">
                            (Save {formatPrice(savedPackage.discountAmount)})
                          </span>
                        )}
                      </p>
                      {savedPackage.couponCode && (
                        <p className="font-mono text-xs">
                          Coupon: {savedPackage.couponCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm mb-1">No Charge Applied</h4>
                  <p className="text-sm text-blue-800">
                    Your payment method was not charged. You can safely try again or choose 
                    a different package.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {savedPackage ? (
                <>
                  <Button
                    onClick={handleTryAgain}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Try Again with Same Package
                  </Button>
                  
                  <Button
                    onClick={handleClearAndReturn}
                    variant="outline"
                    className="w-full h-12 text-base gap-2"
                  >
                    <Package className="w-5 h-5" />
                    View All Credit Packages
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate(createPageUrl('Credits'))}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  View Credit Packages
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alternative Actions */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Or Explore Other Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl('FindClients'))}
                className="h-auto py-4 flex-col gap-2"
              >
                <Mail className="w-6 h-6 text-indigo-600" />
                <div className="text-center">
                  <div className="font-semibold">Send a Card</div>
                  <div className="text-xs text-gray-500">Start the workflow</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl('Home'))}
                className="h-auto py-4 flex-col gap-2"
              >
                <Home className="w-6 h-6 text-indigo-600" />
                <div className="text-center">
                  <div className="font-semibold">Go to Dashboard</div>
                  <div className="text-xs text-gray-500">Return home</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team for assistance with your purchase.
          </p>
        </div>
      </div>
    </div>
  );
}