
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  CreditCard, 
  Loader2, 
  ShieldCheck, 
  CheckCircle,
  Tag,
  Package,
  AlertCircle,
  Users,
  Zap
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function OrderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [pkg, setPkg] = useState(null);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [allocateNow, setAllocateNow] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Load user, organization, and package data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load current user
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load organization if user belongs to one
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ 
          id: currentUser.orgId 
        });
        if (orgList && orgList.length > 0) {
          setOrganization(orgList[0]);
        }
      }
      
      // Load package from localStorage
      const storedPackage = localStorage.getItem('selectedPackage');
      
      if (!storedPackage) {
        setError("No package selected. Please go back and choose a package.");
        setIsLoading(false);
        return;
      }
      
      const parsedPkg = JSON.parse(storedPackage);
      
      // Validate package structure
      if (!parsedPkg.pricingTierId) {
        setError("Selected package is missing required information. Please go back and choose a package again.");
        setIsLoading(false);
        return;
      }
      
      setPkg(parsedPkg);
      setIsLoading(false);
      
    } catch (err) {
      console.error("Failed to load order data:", err);
      setError("Could not load order information. Please try again.");
      setIsLoading(false);
    }
  };

  // Determine if this is a company purchase (check both appRole and isOrgOwner flag)
  const isCompanyPurchase = useMemo(() => {
    const isOrgOwner = user?.appRole === 'organization_owner' || user?.isOrgOwner === true;
    return isOrgOwner && organization;
  }, [user, organization]);

  // Format price helper
  const formatPrice = (priceInCents) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  // Calculate savings percentage
  const savingsPercentage = useMemo(() => {
    if (!pkg?.discountAmount || !pkg?.originalPrice) return 0;
    return Math.round((pkg.discountAmount / pkg.originalPrice) * 100);
  }, [pkg]);

  // Handle real Stripe checkout
  const handleCheckout = async () => {
    if (!pkg || !user) {
      setError("Missing order details or user information.");
      return;
    }
    
    if (!pkg.pricingTierId) {
      setError("Selected package is missing pricing tier ID. Please go back and pick a package again.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    // Store allocation preference in localStorage for success page
    if (isCompanyPurchase && allocateNow) {
      localStorage.setItem('allocateAfterPurchase', 'true');
    } else {
      localStorage.removeItem('allocateAfterPurchase');
    }
    
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        pricingTierId: pkg.pricingTierId,
        couponCode: pkg.couponCode || undefined,
        simulateSuccess: false
      });

      const url = response?.data?.checkoutUrl;
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error("Checkout session did not return a URL.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err?.response?.data?.error ||
        err?.message ||
        "An unexpected error occurred. Please try again."
      );
      setIsProcessing(false);
    }
  };

  // NEW: Handle simulated purchase (for testing)
  const handleSimulatePurchase = async () => {
    if (!pkg || !user) {
      setError("Missing order details or user information.");
      return;
    }
    
    if (!pkg.pricingTierId) {
      setError("Selected package is missing pricing tier ID.");
      return;
    }

    setIsSimulating(true);
    setError(null);
    
    // Store allocation preference in localStorage for success page
    if (isCompanyPurchase && allocateNow) {
      localStorage.setItem('allocateAfterPurchase', 'true');
    } else {
      localStorage.removeItem('allocateAfterPurchase');
    }
    
    try {
      console.log('🎭 Simulating purchase for testing...');
      
      const response = await base44.functions.invoke('createCheckoutSession', {
        pricingTierId: pkg.pricingTierId,
        couponCode: pkg.couponCode || undefined,
        simulateSuccess: true
      });

      console.log('✅ Simulation response:', response.data);
      
      if (response.data.success && response.data.redirectToSuccess) {
        // Show success toast
        toast({
          title: 'Purchase Simulated! 🎉',
          description: `Successfully added ${response.data.creditsAdded} credits`,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
        
        // Navigate to success page with fake session ID
        setTimeout(() => {
          navigate(createPageUrl(`PaymentSuccess?session_id=${response.data.sessionId}`));
        }, 500);
      } else {
        throw new Error("Simulation did not return expected response.");
      }
    } catch (err) {
      console.error("Simulation error:", err);
      setError(
        err?.response?.data?.error ||
        err?.message ||
        "Failed to simulate purchase. Please try again."
      );
      
      toast({
        title: 'Simulation Failed',
        description: err?.response?.data?.error || 'Failed to simulate purchase',
        variant: 'destructive'
      });
      
      setIsSimulating(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !pkg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">Order Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate(createPageUrl('Credits'))}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Credit Packages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-4xl mx-auto p-6 pt-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Credits'))}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Packages
        </Button>

        {/* Main Order Card */}
        <Card className="shadow-xl mb-6">
          <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900">
                  Complete Your Order
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Review your purchase details before proceeding to secure checkout
                </CardDescription>
              </div>
              <div className="hidden md:block p-3 bg-white rounded-xl shadow-sm">
                <CreditCard className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Package Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-lg text-gray-900">Package Details</h3>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">{pkg.title}</h4>
                    <p className="text-gray-600 mt-1">
                      {pkg.credits} handwritten {pkg.credits === 1 ? 'notecard' : 'notecards'}
                    </p>
                  </div>
                  <div className="text-right">
                    {pkg.discountAmount > 0 ? (
                      <>
                        <p className="text-lg line-through text-gray-400">
                          {formatPrice(pkg.originalPrice)}
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {formatPrice(pkg.price)}
                        </p>
                      </>
                    ) : (
                      <p className="text-3xl font-bold text-indigo-600">
                        {formatPrice(pkg.price)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-indigo-200">
                  <div className="text-sm">
                    <p className="text-gray-600">Price per note</p>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(Math.round(pkg.price / pkg.credits))}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">Total notes</p>
                    <p className="font-semibold text-gray-900">{pkg.credits}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Applied */}
            {pkg.couponCode && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-lg text-gray-900">Discount Applied</h3>
                </div>
                
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-green-900 text-lg">
                          Coupon: {pkg.couponCode}
                        </h4>
                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {savingsPercentage}% OFF
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-800">Original Price:</span>
                          <span className="font-semibold text-green-900">
                            {formatPrice(pkg.originalPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-800">Discount:</span>
                          <span className="font-semibold text-green-900">
                            -{formatPrice(pkg.discountAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-green-200">
                          <span className="text-green-900 font-semibold">You Pay:</span>
                          <span className="text-xl font-bold text-green-900">
                            {formatPrice(pkg.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Allocation Option (Company Owners Only) */}
            {isCompanyPurchase && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-lg text-gray-900">Credit Allocation</h3>
                </div>
                
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      id="allocate-now"
                      checked={allocateNow}
                      onCheckedChange={setAllocateNow}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="allocate-now" 
                        className="text-base font-semibold text-orange-900 cursor-pointer"
                      >
                        Allocate credits to team members after purchase
                      </Label>
                      <p className="text-sm text-orange-800 mt-2">
                        If checked, you'll be taken to the allocation screen after successful payment 
                        to distribute these credits among your team members. Otherwise, credits will 
                        remain in the company pool.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Total Summary */}
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-center justify-between text-2xl font-bold">
                <span className="text-gray-900">Total Due Today:</span>
                <span className="text-indigo-600">{formatPrice(pkg.price)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                You will be redirected to Stripe's secure checkout to complete your payment
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900">Payment Error</h4>
                    <p className="text-sm text-red-800 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-sm">Secure Payment</h4>
                  <p className="text-xs text-blue-800 mt-1">
                    Your payment information is processed securely through Stripe. We never store 
                    your credit card details on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Real Stripe Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={isProcessing || isSimulating}
                className="w-full h-14 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Secure Payment
                  </>
                )}
              </Button>

              {/* NEW: Simulate Purchase Button (Testing Only) */}
              <Button
                onClick={handleSimulatePurchase}
                disabled={isProcessing || isSimulating}
                variant="outline"
                className="w-full h-14 text-lg font-semibold border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 gap-2"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Simulating Purchase...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Simulate Purchase (Testing)
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-gray-500">
                ⚠️ Use "Simulate Purchase" for testing the complete flow without real payment
              </p>
            </div>

            {/* Purchase Info */}
            <p className="text-xs text-center text-gray-500">
              By proceeding, you agree to our Terms of Service and 
              confirm that you have read our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* What's Included Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Handwritten Cards</h4>
                  <p className="text-sm text-gray-600">
                    Authentic handwritten notes on premium cardstock
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Envelopes & Postage</h4>
                  <p className="text-sm text-gray-600">
                    Hand-addressed envelopes with postage included
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Mailing Service</h4>
                  <p className="text-sm text-gray-600">
                    We handle printing, addressing, and mailing for you
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Custom Templates</h4>
                  <p className="text-sm text-gray-600">
                    Access to professional templates and designs
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
