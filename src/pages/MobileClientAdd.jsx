import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function MobileClientAdd() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Load whitelabel settings for logo
  const [user, setUser] = React.useState(null);
  
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const settings = await base44.entities.WhitelabelSettings.filter({});
        if (settings.length > 0) {
          setWhitelabelSettings(settings[0]);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);
  
  // Check if we should return to MobileSend or MobileClients
  const urlParams = new URLSearchParams(location.search);
  const returnTo = urlParams.get('returnTo') || 'MobileClients';
  
  const [saving, setSaving] = useState(false);
  const [whitelabelSettings, setWhitelabelSettings] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    street: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });

  const handleAdd = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: 'Missing information',
        description: 'First and last name are required',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: 'Missing address',
        description: 'Complete address is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      
      const currentUser = user || await base44.auth.me();
      
      await base44.entities.Client.create({
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`,
        orgId: currentUser.orgId,
        source: 'manual'
      });

      toast({
        title: 'Success',
        description: 'Client added successfully'
      });

      navigate(createPageUrl(returnTo));
    } catch (error) {
      console.error('Failed to add client:', error);
      toast({
        title: 'Error',
        description: 'Failed to add client',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Fixed Header with Logo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-1.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(createPageUrl(returnTo))}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          {whitelabelSettings?.logoUrl ? (
            <img 
              src={whitelabelSettings.logoUrl} 
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
          ) : (
            <div className="w-10 h-10 bg-[#c87533] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">RS</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">Add Client</h1>
            <p className="text-sm text-gray-500">Create a new client</p>
          </div>
        </div>
      </div>

      {/* Form - Padding for fixed header */}
      <div className="pt-[76px] px-4">
        <div className="space-y-4">
          {/* Personal Information Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                  placeholder="Company Name"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Address</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apt, Suite, etc.
                </label>
                <input
                  type="text"
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                  placeholder="Apt 4B"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                  placeholder="New York"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    maxLength={2}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533] uppercase"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c87533] resize-none"
              placeholder="Add any notes about this client..."
            />
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            disabled={saving}
            className="w-full bg-[#c87533] text-white rounded-xl py-3.5 font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#b5682e] active:bg-[#a55a28] transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Client
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}