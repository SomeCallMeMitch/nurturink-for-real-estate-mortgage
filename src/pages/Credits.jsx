
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
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Receipt,
  CheckCircle,
  Building2,
  User as UserIcon,
  Send
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
  const [companyPoolStats, setCompanyPoolStats] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Transaction filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [exporting, setExporting] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // NEW: Credit allocation state
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);
  const [allocations, setAllocations] = useState({});
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    loadData();
    
    // Check for payment status in URL
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    
    if (payment === 'success') {
      navigate(createPageUrl(`PaymentSuccess?session_id=${sessionId || ''}`));
    } else if (payment === 'cancelled') {
      navigate(createPageUrl('PaymentCancel'));
    }
  }, [navigate]);

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
      
      // Load company pool stats if user is org owner (check both appRole and isOrgOwner flag)
      const isOrgOwner = currentUser.appRole === 'organization_owner' || currentUser.isOrgOwner === true;
      
      if (isOrgOwner && currentUser.orgId) {
        try {
          const statsResponse = await base44.functions.invoke('getCompanyPoolStats');
          setCompanyPoolStats(statsResponse.data);
        } catch (err) {
          console.error('Failed to load company pool stats:', err);
        }

        // NEW: Load team members for allocation
        try {
          setLoadingTeamMembers(true);
          const teamResponse = await base44.functions.invoke('getTeamMemberUsage');
          setTeamMembers(teamResponse.data.teamMembers || []);
        } catch (err) {
          console.error('Failed to load team members:', err);
          setTeamMembers([]); // Ensure it's empty on error
        } finally {
          setLoadingTeamMembers(false);
        }
      } else {
        setTeamMembers([]); // If not org owner, ensure teamMembers is empty
      }
      
      // Determine which pricing tiers to load
      if (currentUser.orgId) {
        const orgTiers = await base44.entities.PricingTier.filter({
          orgId: currentUser.orgId,
          isActive: true
        });
        
        if (orgTiers.length > 0) {
          setPricingTiers(orgTiers.sort((a, b) => a.sortOrder - b.sortOrder));
        } else {
          const platformTiers = await base44.entities.PricingTier.filter({
            orgId: null,
            isActive: true
          });
          setPricingTiers(platformTiers.sort((a, b) => a.sortOrder - b.sortOrder));
        }
      } else {
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
        100
      );
      setTransactions(transactionList);
      
    } catch (err) {
      console.error('Failed to load credit data:', err);
      setError(err.message || 'Failed to load credit information');
    } finally {
      setLoading(false);
    }
  };

  // Determine if this is individual or company view (check both appRole and isOrgOwner flag)
  const isCompanyView = (user?.appRole === 'organization_owner' || user?.isOrgOwner === true) && organization;

  // Get current balance for display - UPDATED FOR NEW SYSTEM
  const companyAllocatedBalance = user?.companyAllocatedCredits || 0;
  const personalPurchasedBalance = user?.personalPurchasedCredits || 0;
  const personalTotalBalance = companyAllocatedBalance + personalPurchasedBalance;
  const companyPoolBalance = organization?.creditBalance || 0;
  
  // Check if user can access company pool
  const canAccessCompanyPool = user?.canAccessCompanyPool !== false;

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
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(query) ||
        t.type.toLowerCase().includes(query)
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }
    
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

  const transactionTypes = useMemo(() => {
    const types = new Set(transactions.map(t => t.type));
    return Array.from(types);
  }, [transactions]);

  const formatPrice = (priceInCents) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const getPricePerNote = (priceInCents, creditAmount) => {
    if (creditAmount === 0) return '$0.00';
    const actualPrice = Math.max(0, priceInCents); 
    return `$${(actualPrice / 100 / creditAmount).toFixed(2)}`;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Coupon code required',
        description: 'Please enter a coupon code',
        variant: 'destructive'
      });
      return;
    }

    const referenceTier = pricingTiers.find(t => t.isMostPopular) || pricingTiers[0];
    
    if (!referenceTier) {
      toast({
        title: 'No pricing tiers available',
        description: 'Cannot validate coupon without pricing tiers',
        variant: 'destructive'
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
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      }
    } catch (err) {
      console.error('Coupon validation error:', err);
      setAppliedCoupon(null);
      toast({
        title: 'Invalid Coupon',
        description: err.response?.data?.error || 'This coupon code is not valid',
        variant: 'destructive'
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    toast({
      title: 'Coupon removed',
      description: 'Coupon has been removed from your purchase'
    });
  };

  const calculateDiscountedPrice = (tier) => {
    if (!appliedCoupon || !appliedCoupon.pricing) return tier.priceInCents;

    const discountRatio = appliedCoupon.pricing.discountApplied / appliedCoupon.pricing.originalPrice;
    const discountAmountForThisTier = Math.round(tier.priceInCents * discountRatio);
    const finalPrice = tier.priceInCents - discountAmountForThisTier;
    
    return finalPrice > 0 ? finalPrice : 0;
  };

  const handlePurchase = (tier) => {
    const discountedPrice = calculateDiscountedPrice(tier);
    const hasDiscount = appliedCoupon && discountedPrice < tier.priceInCents;
    
    const packageData = {
      pricingTierId: tier.id,
      title: tier.name,
      credits: tier.creditAmount,
      price: discountedPrice,
      originalPrice: tier.priceInCents,
      couponCode: hasDiscount ? appliedCoupon.coupon.code : null,
      discountAmount: hasDiscount ? (tier.priceInCents - discountedPrice) : 0
    };
    
    localStorage.setItem('selectedPackage', JSON.stringify(packageData));
    navigate(createPageUrl('Order'));
  };

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

  const getTransactionIcon = (type) => {
    if (type.includes('purchase') || type === 'allocation_in' || type === 'voucher') {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else {
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      const response = await base44.functions.invoke('exportTransactionHistory', {
        format: 'csv'
      });
      
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
        className: 'bg-green-50 border-green-200 text-green-900'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error.response?.data?.error || 'Failed to export transaction history',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  // NEW: Handle allocation amount change
  const handleAllocationChange = (userId, value) => {
    const numValue = parseInt(value);
    setAllocations(prev => ({
      ...prev,
      [userId]: isNaN(numValue) || numValue < 0 ? '' : numValue
    }));
  };

  // NEW: Calculate total allocation
  const totalAllocation = useMemo(() => {
    return Object.values(allocations).reduce((sum, amount) => sum + (typeof amount === 'number' ? amount : 0), 0);
  }, [allocations]);

  // NEW: Handle allocate credits
  const handleAllocateCredits = async () => {
    // Filter out zero, empty, or invalid allocations
    const validAllocations = Object.entries(allocations).reduce((acc, [userId, amount]) => {
      const numAmount = parseInt(amount);
      if (!isNaN(numAmount) && numAmount > 0) {
        acc[userId] = numAmount;
      }
      return acc;
    }, {});

    if (Object.keys(validAllocations).length === 0) {
      toast({
        title: 'No allocations specified',
        description: 'Please enter credit amounts for at least one team member',
        variant: 'destructive'
      });
      return;
    }

    if (totalAllocation > companyPoolBalance) {
      toast({
        title: 'Insufficient credits',
        description: `You are trying to allocate ${totalAllocation} credits but only have ${companyPoolBalance} available in the company pool`,
        variant: 'destructive'
      });
      return;
    }

    try {
      setAllocating(true);

      const response = await base44.functions.invoke('allocateCredits', {
        allocations: validAllocations
      });

      if (response.data.success) {
        toast({
          title: 'Credits Allocated Successfully! 🎉',
          description: `Allocated ${response.data.totalAllocated} credits to ${response.data.allocations.length} team ${response.data.allocations.length === 1 ? 'member' : 'members'}`,
          className: 'bg-green-50 border-green-200 text-green-900'
        });

        // Clear allocations
        setAllocations({});

        // Reload data to reflect changes
        await loadData();
      }
    } catch (error) {
      console.error('Failed to allocate credits:', error);
      toast({
        title: 'Allocation Failed',
        description: error.response?.data?.error || 'Failed to allocate credits. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setAllocating(false);
    }
  };

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
            Purchase credits to send authentic handwritten notes
          </p>
        </div>

        {/* Balance Display - Different for Individual vs Company */}
        {isCompanyView ? (
          // Company Admin View - UPDATED WITH BREAKDOWN
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Company Pool */}
            <Card className="md:col-span-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-xl">
              <CardContent className="py-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5" />
                      <h2 className="text-xl font-semibold text-orange-100">Company Credit Pool</h2>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold">{companyPoolBalance}</span>
                      <span className="text-2xl text-orange-100">Credits Available</span>
                    </div>
                    {companyPoolStats && (
                      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-orange-400">
                        <div>
                          <p className="text-sm text-orange-100">Team Size</p>
                          <p className="text-2xl font-bold">{companyPoolStats.teamSize}</p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-100">Used This Month</p>
                          <p className="text-2xl font-bold">{companyPoolStats.creditsUsedThisMonth}</p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-100">Avg per User</p>
                          <p className="text-2xl font-bold">{companyPoolStats.avgCreditsPerUser}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
                    <CreditCard className="w-16 h-16" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Balance - WITH BREAKDOWN */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <UserIcon className="w-4 h-4 text-gray-600" />
                      <p className="text-sm text-gray-600">Your Personal Balance</p>
                    </div>
                    <p className="text-3xl font-bold text-indigo-600">{personalTotalBalance}</p>
                  </div>
                </div>
                
                {/* Credit Breakdown */}
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Company Allocated:</span>
                    <span className="font-semibold text-green-600">{companyAllocatedBalance}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">You Purchased:</span>
                    <span className="font-semibold text-blue-600">{personalPurchasedBalance}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                  💡 Allocated used first, then pool, then personal
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Individual User View - WITH BREAKDOWN AND CONDITIONAL POOL VISIBILITY
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="md:col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-xl">
              <CardContent className="py-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2 text-blue-100">Your Personal Balance</h2>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold">{personalTotalBalance}</span>
                      <span className="text-2xl text-blue-100">Credits</span>
                    </div>
                    
                    {/* Credit Breakdown */}
                    <div className="mt-4 pt-4 border-t border-blue-400 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-100">Company Allocated:</span>
                        <span className="font-semibold">{companyAllocatedBalance}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-100">You Purchased:</span>
                        <span className="font-semibold">{personalPurchasedBalance}</span>
                      </div>
                    </div>
                    
                    {/* CONDITIONAL: Only show company pool if user has access */}
                    {organization && companyPoolBalance > 0 && canAccessCompanyPool && (
                      <div className="mt-4 pt-4 border-t border-blue-400">
                        <p className="text-sm text-blue-100 mb-1">Company Pool Available</p>
                        <p className="text-3xl font-bold">{companyPoolBalance} credits</p>
                        <p className="text-xs text-blue-100 mt-2">
                          💡 Credits used: Allocated → Pool → Personal
                        </p>
                      </div>
                    )}
                    
                    {/* Show message if user doesn't have pool access */}
                    {organization && !canAccessCompanyPool && (
                      <div className="mt-4 pt-4 border-t border-blue-400">
                        <p className="text-xs text-blue-100">
                          ℹ️ You currently don't have access to the company pool
                        </p>
                      </div>
                    )}
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
        )}

        {/* NEW: Allocate Credits Section (Only for Org Owners) */}
        {isCompanyView && (
          <Card className="mb-12 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Allocate Credits to Team</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Distribute credits from the company pool ({companyPoolBalance} available) to team members
                    </p>
                  </div>
                </div>
                {totalAllocation > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total to Allocate</p>
                    <p className={`text-3xl font-bold ${
                      totalAllocation > companyPoolBalance ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {totalAllocation}
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {loadingTeamMembers ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin mr-3" />
                  <p className="text-gray-600">Loading team members...</p>
                </div>
              ) : teamMembers.length === 0 ? (
                // No team members warning
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">
                        No Team Members to Allocate Credits To
                      </h3>
                      <p className="text-sm text-yellow-800 mb-3">
                        You currently have no team members in your organization. Credits can only be allocated to sales reps and other team members.
                      </p>
                      <p className="text-sm text-yellow-700">
                        <strong>Next Steps:</strong> Add team members to your organization through the Team Management page, then return here to allocate credits.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Team members table
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                            Team Member
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            Current Balance
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            Used This Month
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                            Allocate Credits
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {teamMembers.map((member) => (
                          <tr key={member.userId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{member.name}</p>
                                <p className="text-sm text-gray-500">{member.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                                {member.personalBalance} credits
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-gray-700 font-medium">
                                {member.creditsUsed}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max={companyPoolBalance}
                                  value={allocations[member.userId] || ''}
                                  onChange={(e) => handleAllocationChange(member.userId, e.target.value)}
                                  placeholder="0"
                                  className="w-24 text-right"
                                />
                                <span className="text-sm text-gray-500">credits</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary and Action */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">
                        Company Pool: <span className="font-semibold text-gray-900">{companyPoolBalance} credits</span>
                      </p>
                      {totalAllocation > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          After allocation: <span className={`font-semibold ${
                            totalAllocation > companyPoolBalance ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {companyPoolBalance - totalAllocation} credits remaining
                          </span>
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleAllocateCredits}
                      disabled={allocating || totalAllocation === 0 || totalAllocation > companyPoolBalance}
                      className="bg-orange-600 hover:bg-orange-700 gap-2"
                      size="lg"
                    >
                      {allocating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Allocating...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Allocate {totalAllocation} Credits
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Helper text */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Tip:</strong> Enter the number of credits you want to give to each team member. 
                      Credits will be deducted from the company pool and added to their personal balances.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pricing Tiers Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Choose Your Credit Package
          </h2>

          {/* Coupon Section */}
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

          {/* Pricing Tier Cards */}
          {pricingTiers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No pricing packages available</p>
                <p className="text-sm text-gray-400 mt-1">
                  Please contact your administrator or check back later
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier) => {
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
                    {tier.isMostPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                          <Star className="w-4 h-4 fill-current" />
                          Most Popular
                        </div>
                      </div>
                    )}

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

                      <Button
                        onClick={() => handlePurchase(tier)}
                        className={`w-full ${
                          tier.isMostPopular 
                            ? 'bg-orange-600 hover:bg-orange-700' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        Purchase Credits
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
            {transactions.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b">
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

        {/* Info Card for Organization Users - UPDATED */}
        {user?.orgId && organization && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    {isCompanyView ? 'Organization Credit Pool' : 'Credit Usage Priority'}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {isCompanyView 
                      ? 'These credits are shared across your team. Purchase credits to allocate to team members or keep in the company pool.'
                      : canAccessCompanyPool
                        ? 'When sending notes, credits are used in this order: Company allocated → Company pool → Your personal credits.'
                        : 'When sending notes, credits are used in this order: Company allocated → Your personal credits. You currently don\'t have access to the company pool.'
                    }
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
