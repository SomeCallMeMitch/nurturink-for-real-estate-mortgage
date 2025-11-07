import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Tag, 
  Loader2, 
  Plus,
  Pencil,
  Trash,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

export default function AdminCoupons() {
  const { toast } = useToast();
  
  // Data
  const [coupons, setCoupons] = useState([]);
  const [pricingTiers, setPricingTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    isActive: true,
    maxUsesGlobal: null,
    maxUsesPerUser: null,
    applyMode: 'percentage',
    discountValue: null,
    targetTierId: null,
    applyNextTierUp: false,
    eligibleTierIds: [],
    capTierId: null,
    bonusDiscountType: 'none',
    bonusDiscountValue: null,
    influencerName: '',
    trackingNotes: ''
  });
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [couponList, tierList] = await Promise.all([
        base44.entities.Coupon.list('-created_date'),
        base44.entities.PricingTier.filter({ isActive: true })
      ]);
      
      setCoupons(couponList);
      setPricingTiers(tierList.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load coupon data',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Open form for new coupon
  const handleAddCoupon = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      isActive: true,
      maxUsesGlobal: null,
      maxUsesPerUser: null,
      applyMode: 'percentage',
      discountValue: null,
      targetTierId: null,
      applyNextTierUp: false,
      eligibleTierIds: [],
      capTierId: null,
      bonusDiscountType: 'none',
      bonusDiscountValue: null,
      influencerName: '',
      trackingNotes: ''
    });
    setFormOpen(true);
  };

  // Open form for editing coupon
  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      isActive: coupon.isActive ?? true,
      maxUsesGlobal: coupon.maxUsesGlobal,
      maxUsesPerUser: coupon.maxUsesPerUser,
      applyMode: coupon.applyMode || 'percentage',
      discountValue: coupon.discountValue,
      targetTierId: coupon.targetTierId,
      applyNextTierUp: coupon.applyNextTierUp ?? false,
      eligibleTierIds: coupon.eligibleTierIds || [],
      capTierId: coupon.capTierId,
      bonusDiscountType: coupon.bonusDiscountType || 'none',
      bonusDiscountValue: coupon.bonusDiscountValue,
      influencerName: coupon.influencerName || '',
      trackingNotes: coupon.trackingNotes || ''
    });
    setFormOpen(true);
  };

  // Save coupon
  const handleSaveCoupon = async () => {
    // Validation
    if (!formData.code.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Coupon code is required',
        variant: 'destructive',
        duration: 3000
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Description is required',
        variant: 'destructive',
        duration: 3000
      });
      return;
    }

    // Validate apply mode specific fields
    if (formData.applyMode === 'percentage' || formData.applyMode === 'fixed_amount') {
      if (!formData.discountValue || formData.discountValue <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Discount value must be greater than 0',
          variant: 'destructive',
          duration: 3000
        });
        return;
      }
    }

    if (formData.applyMode === 'tier_price_match') {
      if (!formData.applyNextTierUp && !formData.targetTierId) {
        toast({
          title: 'Validation Error',
          description: 'Either select a target tier or enable "Next Tier Up" rule',
          variant: 'destructive',
          duration: 3000
        });
        return;
      }
    }

    // Validate bonus discount
    if (formData.bonusDiscountType !== 'none') {
      if (!formData.bonusDiscountValue || formData.bonusDiscountValue <= 0) {
        toast({
          title: 'Validation Error',
          description: 'Bonus discount value must be greater than 0',
          variant: 'destructive',
          duration: 3000
        });
        return;
      }
    }

    try {
      const user = await base44.auth.me();
      
      // Prepare data
      const couponData = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        createdByUserId: user.id,
        usedCount: editingCoupon?.usedCount || 0
      };

      if (editingCoupon) {
        await base44.entities.Coupon.update(editingCoupon.id, couponData);
        toast({
          title: 'Coupon Updated',
          description: `Coupon "${couponData.code}" has been updated successfully`,
          duration: 3000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      } else {
        await base44.entities.Coupon.create(couponData);
        toast({
          title: 'Coupon Created',
          description: `Coupon "${couponData.code}" has been created successfully`,
          duration: 3000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      }

      setFormOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save coupon:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save coupon',
        variant: 'destructive',
        duration: 3000
      });
    }
  };

  // Delete coupon
  const handleDeleteClick = (coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await base44.entities.Coupon.delete(couponToDelete.id);
      toast({
        title: 'Coupon Deleted',
        description: `Coupon "${couponToDelete.code}" has been deleted`,
        duration: 3000,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
      loadData();
    } catch (error) {
      console.error('Failed to delete coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete coupon',
        variant: 'destructive',
        duration: 3000
      });
    }
  };

  // Toggle eligible tier
  const handleToggleEligibleTier = (tierId) => {
    setFormData(prev => ({
      ...prev,
      eligibleTierIds: prev.eligibleTierIds.includes(tierId)
        ? prev.eligibleTierIds.filter(id => id !== tierId)
        : [...prev.eligibleTierIds, tierId]
    }));
  };

  // Get tier name by ID
  const getTierName = (tierId) => {
    const tier = pricingTiers.find(t => t.id === tierId);
    return tier ? `${tier.name} ($${(tier.priceInCents / 100).toFixed(2)})` : 'Unknown Tier';
  };

  // Calculate price per note for display
  const getPricePerNote = (tier) => {
    if (!tier) return '$0.00';
    const pricePerNote = tier.priceInCents / tier.creditAmount / 100;
    return `$${pricePerNote.toFixed(2)}/note`;
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Coupons</h1>
            <p className="text-gray-600 mt-1">
              Create and manage promotional discount codes
            </p>
          </div>
          <Button onClick={handleAddCoupon} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Coupon
          </Button>
        </div>

        {/* Coupons List */}
        {coupons.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No coupons yet. Create your first coupon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Code and Status */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{coupon.code}</h3>
                        {coupon.isActive ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                        
                        {/* Apply Mode Badge */}
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          {coupon.applyMode === 'percentage' ? 'Percentage' : 
                           coupon.applyMode === 'fixed_amount' ? 'Fixed Amount' : 
                           'Tier Price-Match'}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-3">{coupon.description}</p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>
                          Used: <strong className="text-gray-900">{coupon.usedCount || 0}</strong>
                          {coupon.maxUsesGlobal && ` / ${coupon.maxUsesGlobal}`}
                        </span>
                        
                        {coupon.maxUsesPerUser && (
                          <span>
                            Max per user: <strong className="text-gray-900">{coupon.maxUsesPerUser}</strong>
                          </span>
                        )}

                        {coupon.applyMode === 'percentage' && coupon.discountValue && (
                          <span>
                            Discount: <strong className="text-gray-900">{coupon.discountValue}% off</strong>
                          </span>
                        )}

                        {coupon.applyMode === 'fixed_amount' && coupon.discountValue && (
                          <span>
                            Discount: <strong className="text-gray-900">${(coupon.discountValue / 100).toFixed(2)} off</strong>
                          </span>
                        )}

                        {coupon.applyMode === 'tier_price_match' && (
                          <span>
                            {coupon.applyNextTierUp ? (
                              <strong className="text-gray-900">Next Tier Up pricing</strong>
                            ) : coupon.targetTierId ? (
                              <>Target: <strong className="text-gray-900">{getTierName(coupon.targetTierId)}</strong></>
                            ) : null}
                          </span>
                        )}

                        {coupon.influencerName && (
                          <span>
                            Influencer: <strong className="text-gray-900">{coupon.influencerName}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCoupon(coupon)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(coupon)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Coupon Form Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </DialogTitle>
              <DialogDescription>
                {editingCoupon ? 'Update coupon details and settings' : 'Create a new promotional discount code'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., BETADEAL, GETMORE"
                    className="uppercase"
                  />
                  <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase</p>
                </div>

                <div>
                  <Label htmlFor="isActive">Active</Label>
                  <Select 
                    value={formData.isActive ? 'active' : 'inactive'}
                    onValueChange={(val) => setFormData({ ...formData, isActive: val === 'active' })}
                  >
                    <SelectTrigger id="isActive">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Beta deal for first beta"
                />
              </div>

              {/* Apply Mode */}
              <div>
                <Label htmlFor="applyMode">Apply Mode *</Label>
                <Select 
                  value={formData.applyMode}
                  onValueChange={(val) => setFormData({ ...formData, applyMode: val })}
                >
                  <SelectTrigger id="applyMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    <SelectItem value="tier_price_match">Tier Price-Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Value (for percentage and fixed_amount) */}
              {(formData.applyMode === 'percentage' || formData.applyMode === 'fixed_amount') && (
                <div>
                  <Label htmlFor="discountValue">
                    {formData.applyMode === 'percentage' ? 'Discount Percentage' : 'Discount Amount (in cents)'}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    value={formData.discountValue || ''}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || null })}
                    placeholder={formData.applyMode === 'percentage' ? 'e.g., 20 for 20% off' : 'e.g., 1000 for $10.00 off'}
                  />
                </div>
              )}

              {/* Max Uses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxUsesGlobal">Max Uses (Global, optional)</Label>
                  <Input
                    id="maxUsesGlobal"
                    type="number"
                    min="0"
                    value={formData.maxUsesGlobal || ''}
                    onChange={(e) => setFormData({ ...formData, maxUsesGlobal: parseInt(e.target.value) || null })}
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <Label htmlFor="maxUsesPerUser">Max Uses (Per User, optional)</Label>
                  <Input
                    id="maxUsesPerUser"
                    type="number"
                    min="0"
                    value={formData.maxUsesPerUser || ''}
                    onChange={(e) => setFormData({ ...formData, maxUsesPerUser: parseInt(e.target.value) || null })}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              {/* Tier Price-Match Settings */}
              {formData.applyMode === 'tier_price_match' && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Tier Price-Match Settings</h3>

                  {/* Apply Next Tier Up Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="applyNextTierUp"
                      checked={formData.applyNextTierUp}
                      onCheckedChange={(checked) => setFormData({ ...formData, applyNextTierUp: checked })}
                    />
                    <label htmlFor="applyNextTierUp" className="text-sm font-medium cursor-pointer">
                      Apply "Next Tier Up" Rule
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    If checked, the price-per-note from the next higher tier will be applied
                  </p>

                  {/* Target Tier (disabled if Next Tier Up is checked) */}
                  {!formData.applyNextTierUp && (
                    <div>
                      <Label htmlFor="targetTierId">Target Tier for Price-Match</Label>
                      <Select 
                        value={formData.targetTierId || ''}
                        onValueChange={(val) => setFormData({ ...formData, targetTierId: val })}
                      >
                        <SelectTrigger id="targetTierId">
                          <SelectValue placeholder="Select target tier..." />
                        </SelectTrigger>
                        <SelectContent>
                          {pricingTiers.map(tier => (
                            <SelectItem key={tier.id} value={tier.id}>
                              {tier.name} ({getPricePerNote(tier)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        The price-per-note of this tier will be applied to the purchase
                      </p>
                    </div>
                  )}

                  {/* Eligible Tiers */}
                  <div>
                    <Label>Eligible Tiers (optional)</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      If specified, coupon only applies to these tiers. If empty, applies to all tiers.
                    </p>
                    <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded p-3 bg-white max-h-48 overflow-y-auto">
                      {pricingTiers.map(tier => (
                        <div key={tier.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tier-${tier.id}`}
                            checked={formData.eligibleTierIds.includes(tier.id)}
                            onCheckedChange={() => handleToggleEligibleTier(tier.id)}
                          />
                          <label htmlFor={`tier-${tier.id}`} className="text-sm cursor-pointer">
                            {tier.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cap Target Tier */}
                  <div>
                    <Label htmlFor="capTierId">Cap Target Tier (optional)</Label>
                    <Select 
                      value={formData.capTierId || 'none'}
                      onValueChange={(val) => setFormData({ ...formData, capTierId: val === 'none' ? null : val })}
                    >
                      <SelectTrigger id="capTierId">
                        <SelectValue placeholder="No cap" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No cap</SelectItem>
                        {pricingTiers.map(tier => (
                          <SelectItem key={tier.id} value={tier.id}>
                            {tier.name} ({getPricePerNote(tier)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      If set, the matched price cannot be lower than this tier's price
                    </p>
                  </div>
                </div>
              )}

              {/* Bonus Discount */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Bonus Discount (optional)</h3>

                <div>
                  <Label htmlFor="bonusDiscountType">Bonus Type</Label>
                  <Select 
                    value={formData.bonusDiscountType}
                    onValueChange={(val) => setFormData({ ...formData, bonusDiscountType: val })}
                  >
                    <SelectTrigger id="bonusDiscountType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="per_note_discount">Per Note Discount</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.bonusDiscountType !== 'none' && (
                  <div>
                    <Label htmlFor="bonusDiscountValue">
                      {formData.bonusDiscountType === 'per_note_discount' 
                        ? 'Bonus Amount (in cents per note)' 
                        : 'Bonus Percentage'}
                    </Label>
                    <Input
                      id="bonusDiscountValue"
                      type="number"
                      min="0"
                      value={formData.bonusDiscountValue || ''}
                      onChange={(e) => setFormData({ ...formData, bonusDiscountValue: parseInt(e.target.value) || null })}
                      placeholder={formData.bonusDiscountType === 'per_note_discount' ? 'e.g., 50 for $0.50 off per note' : 'e.g., 10 for 10% off'}
                    />
                  </div>
                )}
              </div>

              {/* Tracking */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="influencerName">Influencer Name (optional)</Label>
                  <Input
                    id="influencerName"
                    value={formData.influencerName}
                    onChange={(e) => setFormData({ ...formData, influencerName: e.target.value })}
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="trackingNotes">Tracking Notes (optional)</Label>
                  <Input
                    id="trackingNotes"
                    value={formData.trackingNotes}
                    onChange={(e) => setFormData({ ...formData, trackingNotes: e.target.value })}
                    placeholder="Internal notes"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSaveCoupon} className="bg-pink-600 hover:bg-pink-700">
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
                <Button variant="outline" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete coupon "{couponToDelete?.code}"? This action cannot be undone.
                {couponToDelete?.usedCount > 0 && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <strong>Warning:</strong> This coupon has been used {couponToDelete.usedCount} time(s). 
                      Deleting it may affect historical transaction records.
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SuperAdminLayout>
  );
}