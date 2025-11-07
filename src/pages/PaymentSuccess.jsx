
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Loader2, 
  RefreshCcw, 
  CreditCard, 
  Package, 
  TrendingUp,
  Send,
  Users,
  Home,
  Receipt,
  Sparkles
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [pricingTier, setPricingTier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Get session_id from URL
  const sessionId = new URLSearchParams(location.search).get("session_id");

  useEffect(() => {
    loadData();
    
    // Clear selectedPackage from localStorage after successful payment
    setTimeout(() => {
      try {
        localStorage.removeItem("selectedPackage");
      } catch (e) {
        console.error("Failed to clear selectedPackage:", e);
      }
    }, 1000);
  }, [sessionId]);

  const loadData = async () => {
    try {
      setLoading(true);
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
      
      // Load transaction details if sessionId is available
      if (sessionId) {
        // Find the most recent transaction with this Stripe session ID
        const transactionQuery = currentUser.orgId 
          ? { orgId: currentUser.orgId }
          : { userId: currentUser.id };
        
        const transactions = await base44.entities.Transaction.filter(
          transactionQuery,
          '-created_date',
          50 // Get recent transactions
        );
        
        // Find transaction with matching Stripe session ID in metadata
        const matchingTransaction = transactions.find(t => 
          t.metadata?.stripeSessionId === sessionId
        );
        
        if (matchingTransaction) {
          setTransaction(matchingTransaction);
          
          // Load pricing tier details if available
          if (matchingTransaction.relatedPricingTierId) {
            const tiers = await base44.entities.PricingTier.filter({
              id: matchingTransaction.relatedPricingTierId
            });
            if (tiers && tiers.length > 0) {
              setPricingTier(tiers[0]);
            }
          }
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to load payment success data:", err);
      setError("Failed to load payment details. Your payment was successful, but we couldn't load the details.");
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Determine if this was a company purchase (check both appRole and isOrgOwner flag)
  const isCompanyPurchase = useMemo(() => {
    const isOrgOwner = user?.appRole === 'organization_owner' || user?.isOrgOwner === true;
    return isOrgOwner && organization && transaction?.type === 'purchase_org';
  }, [user, organization, transaction]);

  // Get current credit balance
  const getCurrentBalance = () => {
    if (isCompanyPurchase) {
      return organization?.creditBalance || 0;
    }
    return user?.creditBalance || 0;
  };

  // Format price
  const formatPrice = (priceInCents) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  // Calculate discount percentage
  const discountPercentage = useMemo(() => {
    if (!transaction?.metadata?.originalPrice || !transaction?.metadata?.discountApplied) {
      return 0;
    }
    const original = transaction.metadata.originalPrice;
    const discount = transaction.metadata.discountApplied;
    return Math.round((discount / original) * 100);
  }, [transaction]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-md">
          <Loader2 className="h-16 w-16 animate-spin text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing Payment...</h1>
          <p className="text-gray-600">Please wait while we confirm your purchase and add credits to your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-4xl mx-auto p-6 pt-12">
        {/* Success Header with Animation */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-block relative mb-4">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            Payment Successful! <Sparkles className="w-8 h-8 text-yellow-500" />
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase! Your credits have been added to your account.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-yellow-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance Card */}
          <Card className={`md:col-span-2 border-0 shadow-xl ${
            isCompanyPurchase 
              ? 'bg-gradient-to-br from-orange-500 to-orange-600' 
              : 'bg-gradient-to-br from-blue-600 to-indigo-700'
          } text-white`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5" />
                    <p className="text-white/80 text-sm font-medium">
                      {isCompanyPurchase ? 'Company Credit Pool' : 'Your Personal Balance'}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-5xl font-bold">{getCurrentBalance()}</span>
                    <span className="text-2xl text-white/80">Credits</span>
                  </div>
                  <p className="text-white/70 text-sm">Ready to send handwritten notes</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="w-12 h-12" />
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="mt-4 text-white hover:bg-white/20 border border-white/30"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4 mr-2" />
                )}
                Refresh Balance
              </Button>
            </CardContent>
          </Card>

          {/* Credits Added Card */}
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-green-600" />
                <p className="text-sm text-gray-600 font-medium">Credits Added</p>
              </div>
              <p className="text-4xl font-bold text-green-600 mb-1">
                +{transaction?.amount || 0}
              </p>
              <p className="text-sm text-gray-500">
                {pricingTier?.name || 'Credits'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Details */}
        {transaction && (
          <Card className="mb-6 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gray-600" />
                <CardTitle className="text-xl">Transaction Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Package</span>
                    <span className="font-semibold text-gray-900">
                      {pricingTier?.name || 'Credit Package'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Credits Received</span>
                    <span className="font-semibold text-gray-900">
                      {transaction.amount} credits
                    </span>
                  </div>
                  
                  {transaction.metadata?.originalPrice && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Original Price</span>
                      <span className={transaction.metadata.discountApplied > 0 ? "line-through text-gray-400" : "font-semibold text-gray-900"}>
                        {formatPrice(transaction.metadata.originalPrice)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  {transaction.couponCode && (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Coupon Applied</span>
                        <span className="font-mono font-semibold text-green-600">
                          {transaction.couponCode}
                        </span>
                      </div>
                      
                      {transaction.metadata?.discountApplied > 0 && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-semibold text-green-600">
                            -{formatPrice(transaction.metadata.discountApplied)} ({discountPercentage}%)
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="flex justify-between py-2 border-b-2 border-gray-300">
                    <span className="text-gray-900 font-semibold text-lg">Amount Paid</span>
                    <span className="font-bold text-gray-900 text-lg">
                      {formatPrice(transaction.metadata?.amountPaid || transaction.metadata?.finalPrice || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 text-sm">Transaction Date</span>
                    <span className="text-gray-900 text-sm">
                      {new Date(transaction.created_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment ID */}
              {transaction.stripePaymentId && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="text-xs text-gray-500 font-mono break-all">
                    Payment ID: {transaction.stripePaymentId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Allocate Credits - Only for Org Owners with Company Purchase */}
          {isCompanyPurchase && (
            <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-lg cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">Allocate to Team</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Distribute credits from the company pool to individual team members
                    </p>
                    <Button 
                      onClick={() => navigate(createPageUrl('Credits'))}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Allocate Credits
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Sending */}
          <Card className={`border-2 border-indigo-200 hover:border-indigo-400 transition-all hover:shadow-lg cursor-pointer group ${
            isCompanyPurchase ? '' : 'md:col-span-2'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Send className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">Start Sending Notes</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Use your credits to send personalized handwritten cards to clients
                  </p>
                  <Button 
                    onClick={() => navigate(createPageUrl('FindClients'))}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Send a Card Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl('Credits'))}
            className="gap-2"
          >
            <Receipt className="w-4 h-4" />
            View Credit History
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl('Home'))}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>
        </div>

        {/* Info Box */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">What's Next?</h4>
                <p className="text-sm text-blue-800">
                  Your credits are ready to use! Head to "Send a Card" to start creating personalized 
                  handwritten notes for your clients. Each note uses one credit and includes envelope, 
                  postage, and mailing service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
