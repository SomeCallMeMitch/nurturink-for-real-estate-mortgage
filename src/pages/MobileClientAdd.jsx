import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * MobileClientAdd
 * 
 * Add new client or edit existing on mobile
 * Routes:
 * - /MobileClients/add (new client)
 * - /MobileClients/{id}/edit (edit client)
 * 
 * Features:
 * - Mobile-optimized form
 * - Compact spacing
 * - Validation
 * - Submit to database
 */

export default function MobileClientAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isNew = !id || id === 'add';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    street: '',
    address2: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // If editing, load existing client
      if (!isNew && id) {
        const clients = await base44.entities.Client.filter({ id });
        if (clients.length === 0) {
          toast({
            title: 'Client Not Found',
            variant: 'destructive'
          });
          navigate('/MobileClients');
          return;
        }

        const clientData = clients[0];
        setClient(clientData);

        setFormData({
          firstName: clientData.firstName || '',
          lastName: clientData.lastName || '',
          company: clientData.company || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          street: clientData.street || '',
          address2: clientData.address2 || '',
          city: clientData.city || '',
          state: clientData.state || '',
          zipCode: clientData.zipCode || ''
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Failed to load',
        variant: 'destructive'
      });
      navigate('/MobileClients');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name required';
    }
    if (!formData.street.trim()) {
      newErrors.street = 'Street required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);

      const clientData = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        orgId: user.organizationId,
        ownerId: user.id
      };

      if (isNew) {
        await base44.entities.Client.create(clientData);
        toast({
          title: 'Client created successfully',
          className: 'bg-green-50 border-green-200'
        });
      } else {
        await base44.entities.Client.update(id, clientData);
        toast({
          title: 'Client updated successfully',
          className: 'bg-green-50 border-green-200'
        });
      }

      navigate('/MobileClients');
    } catch (error) {
      console.error('Failed to save client:', error);
      toast({
        title: 'Failed to save client',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#c87533] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/MobileClients')}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">
            {isNew ? 'Add Client' : 'Edit Client'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 pt-4 space-y-3">
        {/* Basic Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Basic Information</h2>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="John"
                className={`w-full px-2.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533] ${
                  errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.firstName && (
                <p className="text-xs text-red-600 mt-0.5">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Smith"
                className={`w-full px-2.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533] ${
                  errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.lastName && (
                <p className="text-xs text-red-600 mt-0.5">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="ABC Roofing"
              className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
                className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
              />
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Address</h2>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => handleChange('street', e.target.value)}
              placeholder="123 Main Street"
              className={`w-full px-2.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533] ${
                errors.street ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.street && (
              <p className="text-xs text-red-600 mt-0.5">{errors.street}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Address Line 2</label>
            <input
              type="text"
              value={formData.address2}
              onChange={(e) => handleChange('address2', e.target.value)}
              placeholder="Apt, Suite, Unit (optional)"
              className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Denver"
                className={`w-full px-2.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533] ${
                  errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.city && (
                <p className="text-xs text-red-600 mt-0.5">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                placeholder="CO"
                maxLength={2}
                className={`w-full px-2.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533] uppercase ${
                  errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.state && (
                <p className="text-xs text-red-600 mt-0.5">{errors.state}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              ZIP Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="80202"
              className={`w-full px-2.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533] ${
                errors.zipCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.zipCode && (
              <p className="text-xs text-red-600 mt-0.5">{errors.zipCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
        <button
          onClick={() => navigate('/MobileClients')}
          className="flex-1 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-4 py-2.5 bg-[#c87533] text-white rounded-lg font-medium text-sm hover:bg-[#b5682e] active:bg-[#a55a28] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Client
            </>
          )}
        </button>
      </div>
    </div>
  );
}