
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  CreditCard, 
  CheckCircle2, 
  Star,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function Credits() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Data state
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [pricingTiers, setPricingTiers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasingTierId, setPurchasingTierId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    loadData();
    
    // Check for payment status in URL
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    
    if (payment === 'success' && sessionId) {
      setPaymentStatus('success');
      toast({
        title: 'Payment Successful! 🎉',
        description: 'Your credits have been added to your account.',
        duration: 5000,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
      // Clean URL after showing toast
      // We need to keep the 'page' param if it exists, or just clear other params
      const newSearchParams = new URLSearchParams();
      if (urlParams.has('page')) {
          newSearchParams.set('page', urlParams.get('page'));
      }
      window.history.replaceState({}, '', window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''));
      
      // Reload data to show updated balance
      setTimeout(() => loadData(), 500);
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      toast({
        title: 'Payment Cancelled',
        description: 'Your payment was cancelled. No charges were made.',
        duration: 4000,
        className: 'bg-yellow-50 border-yellow-200 text-yellow-900'
      });
      
      // Clean URL
      const newSearchParams = new URLSearchParams();
      if (urlParams.has('page')) {
          newSearchParams.set('page', urlParams.get('page'));
      }
      window.history.replaceState({}, '', window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''));
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load current user
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load organization if user belongs to one
      let org = null;
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ 
          id: currentUser.orgId 
        });
        if (orgList && orgList.length > 0) {
          org = orgList[0];
          setOrganization(org);
        }
      }
      
      // Determine which pricing tiers to load
      let tierQuery = { isActive: true };
      
      if (currentUser.orgId) {
        // User belongs to organization - check for org-specific tiers first
        const orgTiers = await base44.entities.PricingTier.filter({
          orgId: currentUser.orgId,
          isActive: true
        });
        
        if (orgTiers.length > 0) {
          // Use organization-specific tiers
          setPricingTiers(orgTiers.sort((a, b) => a.sortOrder - b.sortOrder));
        } else {
          // Fallback to platform-wide tiers
          const platformTiers = await base44.entities.PricingTier.filter({
            orgId: null,
            isActive: true
          });
          setPricingTiers(platformTiers.sort((a, b) => a.sortOrder - b.sortOrder));
        }
      } else {
        // Solo user - load platform-wide tiers
        const platformTiers = await base44.entities.PricingTier.filter({
          orgId: null,
          isActive: true
        });
        setPricingTiers(platformTiers.sort((a, b) => a.sortOrder - b.sortOrder));
      }
      
      // Load transaction history
      const transactionQuery = currentUser.orgId 
        ? { orgId: currentUser.orgId }
        : { userId: currentUser.id };
      
      const transactionList = await base44.entities.Transaction.filter(
        transactionQuery,
        '-created_date',
        10
      );
      setTransactions(transactionList);
      
    } catch (err) {
      console.error('Failed to load credit data:', err);
      setError(err.message || 'Failed to load credit information');
    } finally {
      setLoading(false);
    }
  };

  // Get current credit balance
  const currentBalance = useMemo(() => {
    if (organization && user?.appRole === 'organization_owner') {
      return organization.creditBalance || 0;
    }
    return user?.creditBalance || 0;
  }, [user, organization]);

  // Format price for display
  const formatPrice = (priceInCents) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  // Calculate price per note
  const getPricePerNote = (priceInCents, creditAmount) => {
    if (creditAmount === 0) return '$0.00'; // Avoid division by zero
    return `$${(priceInCents / 100 / creditAmount).toFixed(2)}`;
  };

  // Handle purchase button click with Stripe checkout
  const handlePurchase = async (tier) => {
    setPurchasingTierId(tier.id);
    
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        pricingTierId: tier.id
      });
      
      if (response.data.success && response.data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to initiate purchase. Please try again.',
        variant: 'destructive',
        duration: 4000
      });
      setPurchasingTierId(null);
    }
  };

  // Format transaction date
  const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading credit information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Credits</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => loadData()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Credit Management</h1>
          <p className="text-lg text-gray-600">
            Purchase credits for yourself or your team. Credits are shared and can be used to send authentic handwritten notes.
          </p>
        </div>

        {/* Current Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2 text-indigo-100">Current Balance</h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold">{currentBalance}</span>
                  <span className="text-2xl text-indigo-100">Notes remaining</span>
                </div>
              </div>
              <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
                <CreditCard className="w-16 h-16" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Tiers Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Choose Your Credit Package
          </h2>

          {pricingTiers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No pricing packages available</p>
                <p className="text-sm text-gray-400">
                  Please contact your administrator or check back later
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier) => {
                const isPurchasing = purchasingTierId === tier.id;
                
                return (
                  <Card 
                    key={tier.id} 
                    className={`relative transition-all duration-300 hover:shadow-xl ${
                      tier.isMostPopular 
                        ? 'border-2 border-orange-500 transform scale-105' 
                        : 'border border-gray-200'
                    }`}
                  >
                    {/* Most Popular Badge */}
                    {tier.isMostPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                          <Star className="w-4 h-4 fill-current" />
                          Most Popular
                        </div>
                      </div>
                    )}

                    <CardHeader className={tier.isMostPopular ? 'pt-8' : ''}>
                      <CardTitle className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {tier.name}
                        </div>
                        <div className="text-4xl font-extrabold text-indigo-600 mb-1">
                          {formatPrice(tier.priceInCents)}
                        </div>
                        <div className="text-base text-gray-600 font-normal">
                          for {tier.creditAmount} {tier.creditAmount === 1 ? 'note' : 'notes'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {getPricePerNote(tier.priceInCents, tier.creditAmount)} per note
                        </div>
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      {/* Highlights */}
                      {tier.highlights && tier.highlights.length > 0 && (
                        <div className="mb-6 space-y-3">
                          {tier.highlights.map((highlight, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{highlight}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Purchase Button */}
                      <Button
                        onClick={() => handlePurchase(tier)}
                        disabled={isPurchasing}
                        className={`w-full ${
                          tier.isMostPopular 
                            ? 'bg-orange-600 hover:bg-orange-700' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {isPurchasing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Purchase Credits'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Credit History Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <CardTitle>Credit History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No credit history yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your purchases and usage will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatTransactionDate(transaction.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        transaction.amount > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                      <div className="text-sm text-gray-500">
                        Balance: {transaction.balanceAfter}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organization Credits Info (if applicable) */}
        {user?.orgId && organization && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Organization Credits</h3>
                  <p className="text-sm text-blue-700">
                    These credits are shared across your entire team. All team members can use credits from this pool.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
