import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { User, Mail, Phone, MapPin, CreditCard, Building2, Save, Loader2, LogOut, Briefcase } from 'lucide-react';
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
    full_name: '',
    phone: '',
    title: '',
    companyName: '',
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
        try {
          const orgs = await base44.entities.Organization.filter({ id: currentUser.organizationId });
          if (orgs.length > 0) setOrganization(orgs[0]);
        } catch (e) { console.error('Failed to load org:', e); }
      }

      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        full_name: currentUser.full_name || '',
        phone: currentUser.phone || '',
        title: currentUser.title || '',
        companyName: currentUser.companyName || '',
        street: currentUser.street || '',
        address2: currentUser.address2 || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        zipCode: currentUser.zipCode || ''
      });
    } catch (error) {
      console.error('Failed to load user:', error);
      toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      toast({ title: 'Required', description: 'Full Name is required', variant: 'destructive' });
      return;
    }
    try {
      setSaving(true);
      await base44.auth.updateMe({
        firstName: formData.firstName,
        lastName: formData.lastName,
        full_name: formData.full_name,
        phone: formData.phone,
        title: formData.title,
        companyName: formData.companyName,
        street: formData.street,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      });
      toast({ title: 'Saved', description: 'Profile updated successfully', className: 'bg-green-50 border-green-200' });
      await loadUserData();
    } catch (error) {
      console.error('Save failed:', error);
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      navigate('/');
    } catch (e) { console.error('Logout failed:', e); }
  };

  const personalCredits = user?.personalCredits || user?.personalPurchasedCredits || 0;
  const companyPoolCredits = organization?.creditBalance || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#c87533] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">Manage your account</p>
      </div>

      <div className="px-4 space-y-4 pt-4">
        {/* Credits Card */}
        <div className="bg-[#c87533] rounded-xl shadow-md p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Your Credits</h2>
            <CreditCard className="w-5 h-5 opacity-80" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-orange-100">Personal:</span>
            <span className="text-2xl font-bold">{personalCredits}</span>
          </div>
          {organization && companyPoolCredits > 0 && (
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-orange-400/50">
              <span className="text-orange-100">Company Pool:</span>
              <span className="text-xl font-bold">{companyPoolCredits}</span>
            </div>
          )}
        </div>

        {/* Organization */}
        {organization && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Organization</h2>
            </div>
            <p className="text-gray-700">{organization.name}</p>
          </div>
        )}

        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Personal Information</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#c87533] focus:border-[#c87533] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#c87533] focus:border-[#c87533] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#c87533] focus:border-[#c87533] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              Job Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#c87533] focus:border-[#c87533] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#c87533] focus:border-[#c87533] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Address</h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Street</label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({...formData, street: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#c87533] focus:border-[#c87533] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label>
            <input
              type="text"
              value={formData.address2}
              onChange={(e) => setFormData({...formData, address2: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#c87533] focus:border-[#c87533] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#c87533] focus:border-[#c87533] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                maxLength={2}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#c87533] focus:border-[#c87533] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ZIP Code</label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-[#c87533] focus:border-[#c87533] outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#c87533] text-white rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
            className="w-full bg-white text-gray-700 border border-gray-200 rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}