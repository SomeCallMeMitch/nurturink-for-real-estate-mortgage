
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  CreditCard, 
  CheckCircle2, 
  Star,
  Clock,
  Users,
  AlertCircle,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Receipt,
  CheckCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Transaction filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [exporting, setExporting] = useState(false);

  // COUPON STATE
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    loadData();
    
    // Check for payment status in URL
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    
    if (payment === 'success' && sessionId) {
      // Process payment success
      handlePaymentSuccess(sessionId);
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      toast({
        title: 'Payment Cancelled',
        description: 'Your payment was cancelled. No charges were made.',
        duration: 4000,
        className: 'bg-yellow-50 border-yellow-200 text-yellow-900'
      });
      
      // Clean URL
      cleanUrl();
    }
  }, []);

  const cleanUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const newSearchParams = new URLSearchParams();
    if (urlParams.has('page')) {
      newSearchParams.set('page', urlParams.get('page'));
    }
    window.history.replaceState({}, '', window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''));
  };

  /**
   * Handle successful payment by fetching session data and updating credits
   * This follows Base44's security model where the frontend (with user session)
   * performs the credit update, not an external webhook
   */
  const handlePaymentSuccess = async (sessionId) => {
    try {
      setProcessingPayment(true);
      console.log('💳 Processing payment success for session:', sessionId);
      
      // Step 1: Fetch and validate session from Stripe via our backend
      const sessionResponse = await base44.functions.invoke('fetchStripeSession', {
        sessionId: sessionId
      });
      
      if (!sessionResponse.data.success) {
        throw new Error('Failed to validate payment session');
      }
      
      const { session } = sessionResponse.data;
      console.log('✅ Session validated:', session);
      
      // Extract metadata
      const {
        userId,
        orgId,
        pricingTierId,
        creditAmount,
        purchaseType,
        couponCode,
        originalPrice,
        discountApplied,
        finalPrice
      } = session.metadata;
      
      const credits = parseInt(creditAmount);
      const isOrgPurchase = purchaseType === 'organization';
      
      // Step 2: Load current user data to get fresh balance
      const currentUser = await base44.auth.me();
      
      // Step 3: Update credit balance based on purchase type
      let newBalance;
      let balanceType;
      
      if (isOrgPurchase && orgId) {
        // Organization purchase - update organization balance
        const orgs = await base44.entities.Organization.filter({ id: orgId });
        if (!orgs || orgs.length === 0) {
          throw new Error('Organization not found');
        }
        
        const org = orgs[0];
        newBalance = (org.creditBalance || 0) + credits;
        balanceType = 'organization';
        
        // Update organization credit balance
        await base44.entities.Organization.update(orgId, {
          creditBalance: newBalance
        });
        
        console.log(`✅ Updated organization balance: ${org.creditBalance} → ${newBalance}`);
      } else {
        // Individual user purchase - update user balance
        newBalance = (currentUser.creditBalance || 0) + credits;
        balanceType = 'user';
        
        // Update user credit balance
        await base44.auth.updateMe({
          creditBalance: newBalance
        });
        
        console.log(`✅ Updated user balance: ${currentUser.creditBalance} → ${newBalance}`);
      }
      
      // Step 4: Load pricing tier for transaction description
      const tiers = await base44.entities.PricingTier.filter({ id: pricingTierId });
      const tier = tiers && tiers.length > 0 ? tiers[0] : null;
      
      // Step 5: Build transaction description
      let description = `Purchased ${tier?.name || 'credits'} - ${credits} notes`;
      if (couponCode) {
        const discountAmount = discountApplied ? parseInt(discountApplied) : 0;
        description += ` (${couponCode}: -$${(discountAmount / 100).toFixed(2)})`;
      }
      
      // Step 6: Create transaction record
      await base44.entities.Transaction.create({
        orgId: orgId || currentUser.orgId || '',
        userId: currentUser.id,
        type: isOrgPurchase ? 'purchase_org' : 'purchase_user',
        amount: credits,
        balanceAfter: newBalance,
        balanceType: balanceType,
        description: description,
        metadata: {
          stripeSessionId: session.id,
          stripePaymentIntent: session.paymentIntent,
          amountPaid: session.amountTotal,
          currency: session.currency,
          originalPrice: originalPrice ? parseInt(originalPrice) : null,
          discountApplied: discountApplied ? parseInt(discountApplied) : 0,
          finalPrice: finalPrice ? parseInt(finalPrice) : session.amountTotal,
          pricingTierName: tier?.name || null
        },
        relatedPricingTierId: pricingTierId,
        stripePaymentId: session.paymentIntent,
        couponCode: couponCode || null
      });
      
      console.log('✅ Transaction record created');
      
      // Step 7: Increment coupon usage count if coupon was used
      if (couponCode) {
        try {
          const coupons = await base44.entities.Coupon.filter({ 
            code: couponCode.trim().toUpperCase() 
          });
          
          if (coupons && coupons.length > 0) {
            const coupon = coupons[0];
            await base44.entities.Coupon.update(coupon.id, {
              usedCount: (coupon.usedCount || 0) + 1
            });
            console.log(`✅ Incremented coupon usage for ${couponCode}`);
          }
        } catch (couponError) {
          console.error('⚠️ Failed to update coupon usage:', couponError);
          // Don't fail the entire flow if coupon update fails
        }
      }
      
      // Step 8: Show success message
      setPaymentStatus('success');
      toast({
        title: `Payment Successful! 🎉`,
        description: `${credits} credits have been added to your account.${couponCode ? ` Coupon ${couponCode} applied!` : ''}`,
        duration: 5000,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
      // Clean URL
      cleanUrl();
      
      // Reload data to show updated balance
      await loadData();
      
    } catch (error) {
      console.error('❌ Failed to process payment:', error);
      setPaymentStatus('error');
      toast({
        title: 'Payment Processing Error',
        description: error.response?.data?.error || error.message || 'Failed to add credits to your account. Please contact support.',
        variant: 'destructive',
        duration: 8000
      });
      
      // Clean URL even on error
      cleanUrl();
    } finally {
      setProcessingPayment(false);
    }
  };

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
      
      // Load transaction history - get more for filtering
      const transactionQuery = currentUser.orgId 
        ? { orgId: currentUser.orgId }
        : { userId: currentUser.id };
      
      const transactionList = await base44.entities.Transaction.filter(
        transactionQuery,
        '-created_date',
        100 // Load more for filtering
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

  // Calculate transaction statistics
  const transactionStats = useMemo(() => {
    const purchases = transactions.filter(t => 
      t.type === 'purchase_user' || t.type === 'purchase_org'
    );
    const usages = transactions.filter(t => t.type === 'deduction');
    
    return {
      totalPurchased: purchases.reduce((sum, t) => sum + t.amount, 0),
      totalSpent: Math.abs(usages.reduce((sum, t) => sum + t.amount, 0)),
      purchaseCount: purchases.length,
      usageCount: usages.length
    };
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(query) ||
        t.type.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        break;
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case 'amount-asc':
        filtered.sort((a, b) => a.amount - b.amount);
        break;
      case 'amount-desc':
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      default:
        break;
    }
    
    return filtered;
  }, [transactions, searchQuery, typeFilter, sortBy]);

  // Get unique transaction types for filter
  const transactionTypes = useMemo(() => {
    const types = new Set(transactions.map(t => t.type));
    return Array.from(types);
  }, [transactions]);

  // Format price for display
  const formatPrice = (priceInCents) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  // Calculate price per note
  const getPricePerNote = (priceInCents, creditAmount) => {
    if (creditAmount === 0) return '$0.00';
    // Ensure priceInCents is not negative before division
    const actualPrice = Math.max(0, priceInCents); 
    return `$${(actualPrice / 100 / creditAmount).toFixed(2)}`;
  };

  // COUPON VALIDATION HANDLER
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Coupon code required',
        description: 'Please enter a coupon code',
        variant: 'destructive',
        duration: 3000
      });
      return;
    }

    // Validate against first available tier (or most popular)
    const referenceTier = pricingTiers.find(t => t.isMostPopular) || pricingTiers[0];
    
    if (!referenceTier) {
      toast({
        title: 'No pricing tiers available',
        description: 'Cannot validate coupon without pricing tiers',
        variant: 'destructive',
        duration: 3000
      });
      return;
    }

    try {
      setValidatingCoupon(true);
      
      const response = await base44.functions.invoke('validateCouponForTier', {
        pricingTierId: referenceTier.id,
        couponCode: couponCode.trim()
      });

      if (response.data.valid) {
        setAppliedCoupon(response.data);
        toast({
          title: `Coupon Applied! 🎉`,
          description: `${response.data.coupon.description}`,
          duration: 5000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      }
    } catch (err) {
      console.error('Coupon validation error:', err);
      setAppliedCoupon(null);
      toast({
        title: 'Invalid Coupon',
        description: err.response?.data?.error || 'This coupon code is not valid',
        variant: 'destructive',
        duration: 4000
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  // REMOVE COUPON HANDLER
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    toast({
      title: 'Coupon removed',
      description: 'Coupon has been removed from your purchase',
      duration: 2000
    });
  };

  // Calculate discounted price for a tier
  const calculateDiscountedPrice = (tier) => {
    if (!appliedCoupon || !appliedCoupon.pricing) return tier.priceInCents;

    // For simplicity, apply the same discount percentage to all tiers
    // In a more sophisticated implementation, you'd call validateCouponForTier for each tier
    // Assuming appliedCoupon.pricing.discountApplied is the discount amount for the reference tier
    // and appliedCoupon.pricing.originalPrice is the original price of the reference tier.
    // We calculate a discount ratio and apply it to the current tier.
    const discountRatio = appliedCoupon.pricing.discountApplied / appliedCoupon.pricing.originalPrice;
    
    // Calculate the actual discount for THIS tier
    const discountAmountForThisTier = Math.round(tier.priceInCents * discountRatio);
    
    const finalPrice = tier.priceInCents - discountAmountForThisTier;
    
    return finalPrice > 0 ? finalPrice : 0;
  };

  // Handle purchase button click with Stripe checkout
  const handlePurchase = async (tier) => {
    setPurchasingTierId(tier.id);
    
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        pricingTierId: tier.id,
        couponCode: appliedCoupon ? appliedCoupon.coupon.code : null // Pass coupon code if applied
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

  // Get transaction type label
  const getTransactionTypeLabel = (type) => {
    const labels = {
      'purchase_user': 'Purchase (Individual)',
      'purchase_org': 'Purchase (Organization)',
      'deduction': 'Note Sent',
      'refund_user': 'Refund (Individual)',
      'refund_org': 'Refund (Organization)',
      'allocation_in': 'Credit Allocation',
      'allocation_out': 'Credit Deallocation',
      'voucher': 'Voucher Applied'
    };
    return labels[type] || type;
  };

  // Get transaction icon
  const getTransactionIcon = (type) => {
    if (type.includes('purchase') || type === 'allocation_in' || type === 'voucher') {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else {
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      setExporting(true);
      
      const response = await base44.functions.invoke('exportTransactionHistory', {
        format: 'csv'
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast({
        title: 'Export Successful',
        description: 'Transaction history exported to CSV',
        duration: 3000,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error.response?.data?.error || 'Failed to export transaction history',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setExporting(false);
    }
  };

  // Loading state
  if (loading || processingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">
            {processingPayment ? 'Processing your payment...' : 'Loading credit information...'}
          </p>
          {processingPayment && (
            <p className="text-sm text-gray-500 mt-2">
              Please wait while we add credits to your account
            </p>
          )}
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

        {/* Current Balance and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Current Balance Card */}
          <Card className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-0 shadow-xl">
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

          {/* Stats Cards */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Purchased</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{transactionStats.totalPurchased}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {transactionStats.purchaseCount} {transactionStats.purchaseCount === 1 ? 'purchase' : 'purchases'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-red-600">
                    -{transactionStats.totalSpent}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {transactionStats.usageCount} {transactionStats.usageCount === 1 ? 'note' : 'notes'} sent
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Tiers Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Choose Your Credit Package
          </h2>

          {/* COUPON INPUT SECTION */}
          <Card className="mb-8 bg-white border-2 border-indigo-200">
            <CardContent className="py-6">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="coupon-code" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Have a coupon code?
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="coupon-code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code (e.g., SAVE20)"
                        className="uppercase font-mono text-base"
                        disabled={validatingCoupon || !!appliedCoupon}
                      />
                      {appliedCoupon ? (
                        <Button
                          onClick={handleRemoveCoupon}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon || !couponCode.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {validatingCoupon ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Validating...
                            </>
                          ) : (
                            'Apply Coupon'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Coupon Applied Banner */}
                {appliedCoupon && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 mb-1">
                          Coupon Applied: {appliedCoupon.coupon.code}
                        </h3>
                        <p className="text-sm text-green-700 mb-2">
                          {appliedCoupon.coupon.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-green-600">Discount:</span>{' '}
                            <strong className="text-green-900">
                              {formatPrice(appliedCoupon.pricing.discountApplied)} 
                              ({appliedCoupon.pricing.discountPercentage}% off)
                            </strong>
                          </div>
                          <div>
                            <span className="text-green-600">Reference Price:</span>{' '}
                            <strong className="text-green-900">
                              <span className="line-through text-gray-400">
                                {formatPrice(appliedCoupon.pricing.originalPrice)}
                              </span>
                              {' → '}
                              {formatPrice(appliedCoupon.pricing.finalPrice)}
                            </strong>
                          </div>
                        </div>
                        <p className="text-xs text-green-600 mt-2">
                          * Based on {appliedCoupon.pricing.tierName}. Discount will be applied at checkout.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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
                const discountedPrice = calculateDiscountedPrice(tier);
                const hasDiscount = appliedCoupon && discountedPrice < tier.priceInCents;
                
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

                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="absolute -top-4 right-4 z-10">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          {appliedCoupon.pricing.discountPercentage}% OFF
                        </div>
                      </div>
                    )}

                    <CardHeader className={tier.isMostPopular ? 'pt-8' : ''}>
                      <CardTitle className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {tier.name}
                        </div>
                        {hasDiscount ? (
                          <div>
                            <div className="text-2xl line-through text-gray-400 mb-1">
                              {formatPrice(tier.priceInCents)}
                            </div>
                            <div className="text-4xl font-extrabold text-green-600 mb-1">
                              {formatPrice(discountedPrice)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-4xl font-extrabold text-indigo-600 mb-1">
                            {formatPrice(tier.priceInCents)}
                          </div>
                        )}
                        <div className="text-base text-gray-600 font-normal">
                          for {tier.creditAmount} {tier.creditAmount === 1 ? 'note' : 'notes'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {hasDiscount ? (
                            <>
                              <span className="line-through text-gray-400">
                                {getPricePerNote(tier.priceInCents, tier.creditAmount)}
                              </span>
                              {' → '}
                              <span className="text-green-600 font-semibold">
                                {getPricePerNote(discountedPrice, tier.creditAmount)}
                              </span>
                              {' per note'}
                            </>
                          ) : (
                            `${getPricePerNote(tier.priceInCents, tier.creditAmount)} per note`
                          )}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <CardTitle>Credit History</CardTitle>
                <span className="text-sm text-gray-500">
                  ({filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'})
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadData()}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExport}
                  disabled={exporting || transactions.length === 0}
                >
                  {exporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            {transactions.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {transactionTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {getTransactionTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                    <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                    <SelectItem value="amount-desc">Amount (Highest First)</SelectItem>
                    <SelectItem value="amount-asc">Amount (Lowest First)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Transaction List */}
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                {transactions.length === 0 ? (
                  <>
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No credit history yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Your purchases and usage will appear here
                    </p>
                  </>
                ) : (
                  <>
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No transactions match your filters</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setTypeFilter('all');
                      }}
                      className="mt-3"
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {getTransactionIcon(transaction.type)}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-medium text-gray-900">
                            {transaction.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTransactionDate(transaction.created_date)}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                            {getTransactionTypeLabel(transaction.type)}
                          </span>
                          {transaction.stripePaymentId && (
                            <span className="flex items-center gap-1 text-xs">
                              <Receipt className="w-3 h-3" />
                              {transaction.stripePaymentId.substring(0, 20)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
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
