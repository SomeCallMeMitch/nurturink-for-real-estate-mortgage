import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Pencil, 
  Trash, 
  Loader2, 
  DollarSign,
  X,
  Star
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

export default function AdminPricing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Data
  const [pricingTiers, setPricingTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Tier form state
  const [tierFormOpen, setTierFormOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [tierForm, setTierForm] = useState({
    name: '',
    creditAmount: 5,
    priceInCents: 1997,
    sortOrder: 0,
    isMostPopular: false,
    highlights: [''],
    isActive: true
  });
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tierToDelete, setTierToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Determine which tiers to load based on user role
      let query = {};
      if (currentUser.appRole === 'super_admin') {
        // Super admin sees platform-wide tiers (orgId: null)
        query = { orgId: null };
      } else if (currentUser.appRole === 'organization_owner') {
        // Org owner sees their organization's tiers
        query = { orgId: currentUser.orgId };
      } else {
        // Other roles shouldn't access this page
        throw new Error('Unauthorized access');
      }
      
      const tierList = await base44.entities.PricingTier.filter(query);
      setPricingTiers(tierList.sort((a, b) => a.sortOrder - b.sortOrder));
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load pricing data',
        variant: 'destructive',
        duration: 3000
      });
      
      // Redirect unauthorized users
      if (error.message === 'Unauthorized access') {
        navigate(createPageUrl('Home'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Tier handlers
  const handleAddTier = () => {
    setEditingTier(null);
    setTierForm({
      name: '',
      creditAmount: 5,
      priceInCents: 1997,
      sortOrder: pricingTiers.length,
      isMostPopular: false,
      highlights: [''],
      isActive: true
    });
    setTierFormOpen(true);
  };

  const handleEditTier = (tier) => {
    setEditingTier(tier);
    setTierForm({
      name: tier.name,
      creditAmount: tier.creditAmount,
      priceInCents: tier.priceInCents,
      sortOrder: tier.sortOrder,
      isMostPopular: tier.isMostPopular || false,
      highlights: tier.highlights && tier.highlights.length > 0 ? tier.highlights : [''],
      isActive: tier.isActive
    });
    setTierFormOpen(true);
  };

  const handleSaveTier = async () => {
    // Validation
    if (!tierForm.name.trim()) {
      toast({
        title: 'Validation error',
        description: 'Tier name is required',
        variant: 'destructive',
        duration: 3000
      });
      return;
    }
    
    if (tierForm.creditAmount <= 0) {
      toast({
        title: 'Validation error',
        description: 'Credit amount must be greater than 0',
        variant: 'destructive',
        duration: 3000
      });
      return;
    }
    
    if (tierForm.priceInCents <= 0) {
      toast({
        title: 'Validation error',
        description: 'Price must be greater than 0',
        variant: 'destructive',
        duration: 3000
      });
      return;
    }

    try {
      // Filter out empty highlights
      const filteredHighlights = tierForm.highlights.filter(h => h.trim() !== '');
      
      // Determine orgId based on user role
      let orgId = null;
      if (user.appRole === 'organization_owner') {
        orgId = user.orgId;
      }
      // super_admin keeps orgId as null for platform-wide tiers
      
      const tierData = {
        ...tierForm,
        highlights: filteredHighlights,
        orgId: orgId
      };

      // If setting this as most popular, unset all others first
      if (tierForm.isMostPopular && !editingTier?.isMostPopular) {
        const popularTiers = pricingTiers.filter(t => t.isMostPopular);
        for (const t of popularTiers) {
          await base44.entities.PricingTier.update(t.id, { isMostPopular: false });
        }
      }

      if (editingTier) {
        await base44.entities.PricingTier.update(editingTier.id, tierData);
        toast({
          title: 'Tier updated',
          description: 'Pricing tier updated successfully',
          duration: 3000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      } else {
        await base44.entities.PricingTier.create(tierData);
        toast({
          title: 'Tier created',
          description: 'Pricing tier created successfully',
          duration: 3000,
          className: 'bg-green-50 border-green-200 text-green-900'
        });
      }
      
      setTierFormOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to save pricing tier',
        variant: 'destructive',
        duration: 3000
      });
    }
  };

  const handleDeleteClick = (tier) => {
    setTierToDelete(tier);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await base44.entities.PricingTier.delete(tierToDelete.id);
      toast({
        title: 'Tier deleted',
        description: 'Pricing tier deleted successfully',
        duration: 3000,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
      setDeleteDialogOpen(false);
      setTierToDelete(null);
      loadData();
    } catch (error) {
      console.error('Failed to delete tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete pricing tier',
        variant: 'destructive',
        duration: 3000
      });
    }
  };

  // Highlight management
  const handleAddHighlight = () => {
    if (tierForm.highlights.length < 5) {
      setTierForm({
        ...tierForm,
        highlights: [...tierForm.highlights, '']
      });
    }
  };

  const handleUpdateHighlight = (index, value) => {
    const newHighlights = [...tierForm.highlights];
    newHighlights[index] = value;
    setTierForm({
      ...tierForm,
      highlights: newHighlights
    });
  };

  const handleRemoveHighlight = (index) => {
    const newHighlights = tierForm.highlights.filter((_, i) => i !== index);
    setTierForm({
      ...tierForm,
      highlights: newHighlights.length > 0 ? newHighlights : ['']
    });
  };

  // Format price for display
  const formatPrice = (priceInCents) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  // Calculate price per credit
  const getPricePerCredit = (priceInCents, creditAmount) => {
    return `$${(priceInCents / 100 / creditAmount).toFixed(2)}`;
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600 mt-1">
            {user?.appRole === 'super_admin' 
              ? 'Manage platform-wide pricing tiers' 
              : 'Manage your organization\'s pricing tiers'}
          </p>
        </div>

        {/* REMOVED: Tab navigation between Pricing Tiers and Coupons */}
        {/* Coupons now has its own dedicated page accessible from the sidebar */}

        {/* Pricing Tiers Content (no longer in a tab) */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Create and manage pricing packages for credit purchases
            </p>
            <Button onClick={handleAddTier} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Tier
            </Button>
          </div>

          {pricingTiers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pricing tiers yet. Create your first tier!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingTiers.map((tier) => (
                <Card key={tier.id} className={`relative ${tier.isMostPopular ? 'border-2 border-orange-500' : ''}`}>
                  {/* Most Popular Badge */}
                  {tier.isMostPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <CardHeader className={tier.isMostPopular ? 'pt-8' : ''}>
                    <CardTitle className="flex items-center justify-between">
                      <span>{tier.name}</span>
                      {!tier.isActive && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-normal">
                          Inactive
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {/* Price Display */}
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-gray-900">
                        {formatPrice(tier.priceInCents)}
                      </div>
                      <div className="text-sm text-gray-600">
                        for {tier.creditAmount} {tier.creditAmount === 1 ? 'note' : 'notes'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getPricePerCredit(tier.priceInCents, tier.creditAmount)} per note
                      </div>
                    </div>

                    {/* Highlights */}
                    {tier.highlights && tier.highlights.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {tier.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-gray-500 mb-4 pt-4 border-t">
                      Sort order: {tier.sortOrder}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTier(tier)}
                        className="flex-1"
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(tier)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Tier Form Dialog */}
        <Dialog open={tierFormOpen} onOpenChange={setTierFormOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTier ? 'Edit Pricing Tier' : 'New Pricing Tier'}
              </DialogTitle>
              <DialogDescription>
                {editingTier ? 'Update pricing tier details' : 'Create a new pricing tier for credit purchases'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tier-name">Tier Name *</Label>
                  <Input
                    id="tier-name"
                    value={tierForm.name}
                    onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                    placeholder="e.g., Starter Pack, Professional"
                  />
                </div>

                <div>
                  <Label htmlFor="tier-credits">Credits *</Label>
                  <Input
                    id="tier-credits"
                    type="number"
                    min="1"
                    value={tierForm.creditAmount}
                    onChange={(e) => setTierForm({ ...tierForm, creditAmount: parseInt(e.target.value) || 0 })}
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tier-price">Price ($) *</Label>
                  <Input
                    id="tier-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={(tierForm.priceInCents / 100).toFixed(2)}
                    onChange={(e) => {
                      const dollars = parseFloat(e.target.value) || 0;
                      setTierForm({ ...tierForm, priceInCents: Math.round(dollars * 100) });
                    }}
                    placeholder="19.97"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Price per credit: {tierForm.creditAmount > 0 ? getPricePerCredit(tierForm.priceInCents, tierForm.creditAmount) : '$0.00'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="tier-sort">Sort Order</Label>
                  <Input
                    id="tier-sort"
                    type="number"
                    min="0"
                    value={tierForm.sortOrder}
                    onChange={(e) => setTierForm({ ...tierForm, sortOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Highlights (up to 5)</Label>
                  {tierForm.highlights.length < 5 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddHighlight}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Highlight
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {tierForm.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={highlight}
                        onChange={(e) => handleUpdateHighlight(index, e.target.value)}
                        placeholder="e.g., AI Assisted BallPoint Pen Note Cards"
                      />
                      {tierForm.highlights.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveHighlight(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="most-popular"
                    checked={tierForm.isMostPopular}
                    onCheckedChange={(checked) => setTierForm({ ...tierForm, isMostPopular: checked })}
                  />
                  <label htmlFor="most-popular" className="text-sm font-medium cursor-pointer">
                    Mark as "Most Popular" (recommended tier)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-active"
                    checked={tierForm.isActive}
                    onCheckedChange={(checked) => setTierForm({ ...tierForm, isActive: checked })}
                  />
                  <label htmlFor="is-active" className="text-sm font-medium cursor-pointer">
                    Active (show on pricing page)
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSaveTier} className="bg-indigo-600 hover:bg-indigo-700">
                  {editingTier ? 'Update Tier' : 'Create Tier'}
                </Button>
                <Button variant="outline" onClick={() => setTierFormOpen(false)}>
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
              <AlertDialogTitle>Delete Pricing Tier?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{tierToDelete?.name}"? This action cannot be undone.
                Existing purchases will not be affected.
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