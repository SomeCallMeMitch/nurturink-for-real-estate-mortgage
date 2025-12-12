import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { User, Mail, Phone, MapPin, CreditCard, Building2, Save, Loader2, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function MobileProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
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

      if (currentUser.organizationId) {
        const orgs = await base44.entities.Organization.filter({ 
          id: currentUser.organizationId 
        });
        if (orgs.length > 0) {
          setOrganization(orgs[0]);
        }
      }

      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        fullName: currentUser.fullName || '',
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
        fullName: formData.fullName,
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
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const personalCredits = user?.personalCredits || 0;
  const orgCredits = organization?.creditBalance || 0;
  const totalCredits = personalCredits + orgCredits;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#c87533] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
        <p className="text-xs text-gray-500">Manage your account information</p>
      </div>

      <div className="px-4 space-y-3 pt-4">
        <div className="bg-[#c87533] rounded-lg shadow-md p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Your Credits</h2>
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-orange-100">Total Balance:</span>
              <span className="text-2xl font-bold">{totalCredits}</span>
            </div>
            <div className="flex justify-between text-xs text-orange-100 pt-2 border-t border-orange-400">
              <span>Personal:</span>
              <span>{personalCredits}</span>
            </div>
            {organization && orgCredits > 0 && (
              <div className="flex justify-between text-xs text-orange-100">
                <span>Organization:</span>
                <span>{orgCredits}</span>
              </div>
            )}
          </div>
        </div>

        {organization && (
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-gray-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Organization</h2>
            </div>
            <p className="text-sm text-gray-700">{organization.name}</p>
            {organization.creditBalance > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                Company Pool: {organization.creditBalance} credits
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal Information
          </h2>

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                placeholder="John"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                placeholder="Smith"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address
          </h2>

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.address2}
                onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                placeholder="Apt 4B"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                  placeholder="San Francisco"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                placeholder="94102"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#c87533] text-white rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#b5682e] active:bg-[#a55a28] transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 active:bg-gray-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}