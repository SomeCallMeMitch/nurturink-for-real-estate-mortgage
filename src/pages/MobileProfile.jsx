import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MobileLayout from '@/components/mobile/MobileLayout';
import { User, Mail, Phone, MapPin, CreditCard, Building2, Save, Loader2, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function MobileProfile() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    full_name: '',
    phone: '',
    street: '',
    address2: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.orgId) {
        const orgs = await base44.entities.Organization.filter({ 
          id: currentUser.orgId 
        });
        if (orgs.length > 0) {
          setOrganization(orgs[0]);
        }
      }

      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        full_name: currentUser.full_name || '',
        phone: currentUser.phone || '',
        street: currentUser.street || '',
        address2: currentUser.address2 || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        zipCode: currentUser.zipCode || ''
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await base44.auth.updateMe({
        firstName: formData.firstName,
        lastName: formData.lastName,
        full_name: formData.full_name,
        phone: formData.phone,
        street: formData.street,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully',
        duration: 3000
      });

      await loadUserData();
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to update your profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const personalCredits = user?.personalPurchasedCredits || 0;
  const allocatedCredits = user?.companyAllocatedCredits || 0;
  const totalPersonalCredits = personalCredits + allocatedCredits;

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Credits Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Your Credits</h2>
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-blue-100">Total Balance:</span>
              <span className="text-3xl font-bold">{totalPersonalCredits}</span>
            </div>
            <div className="pt-2 border-t border-blue-400 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Allocated:</span>
                <span className="font-semibold">{allocatedCredits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Purchased:</span>
                <span className="font-semibold">{personalCredits}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Info */}
        {organization && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Organization</h2>
            </div>
            <p className="text-gray-700">{organization.name}</p>
            {organization.creditBalance > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Company Pool: {organization.creditBalance} credits
              </p>
            )}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Address Form */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.address2}
                onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Apt 4B"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="San Francisco"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="94102"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 font-medium flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}