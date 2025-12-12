import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { 
  ChevronLeft, 
  Star, 
  Loader2, 
  Save, 
  Trash2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * MobileClientDetail
 * 
 * View/edit individual client on mobile
 * Route: /MobileClients/{id}
 * 
 * Features:
 * - View all client details
 * - Edit client information with validation
 * - Add/remove favorites
 * - Delete client
 * - Mobile-optimized form
 */

export default function MobileClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

      // Load client
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

      // Load favorite status
      const favorites = await base44.entities.FavoriteClient.filter({
        userId: currentUser.id,
        clientId: id
      });
      setIsFavorited(favorites.length > 0);
    } catch (error) {
      console.error('Failed to load client:', error);
      toast({
        title: 'Failed to load client',
        variant: 'destructive'
      });
      navigate('/MobileClients');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) {
        const favorites = await base44.entities.FavoriteClient.filter({
          userId: user.id,
          clientId: id
        });
        if (favorites.length > 0) {
          await base44.entities.FavoriteClient.delete(favorites[0].id);
        }
      } else {
        await base44.entities.FavoriteClient.create({
          userId: user.id,
          clientId: id
        });
      }
      setIsFavorited(!isFavorited);
      toast({
        title: isFavorited ? 'Removed from Favorites' : 'Added to Favorites',
        className: !isFavorited ? 'bg-green-50 border-green-200' : ''
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast({
        title: 'Failed to update favorite',
        variant: 'destructive'
      });
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

      await base44.entities.Client.update(id, clientData);

      setClient(clientData);
      setIsEditing(false);
      setErrors({});

      toast({
        title: 'Client saved successfully',
        className: 'bg-green-50 border-green-200'
      });
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

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await base44.entities.Client.delete(id);
      
      toast({
        title: 'Client deleted',
        className: 'bg-green-50 border-green-200'
      });
      
      navigate('/MobileClients');
    } catch (error) {
      console.error('Failed to delete client:', error);
      toast({
        title: 'Failed to delete client',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#c87533] animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Client not found</p>
        </div>
      </div>
    );
  }

  const displayName = `${formData.firstName} ${formData.lastName}`.trim();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/MobileClients')}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1 ml-2 truncate">
          {displayName || 'Client'}
        </h1>
        <button
          onClick={handleToggleFavorite}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Star 
            className={`w-5 h-5 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 space-y-3">
        {/* Display Mode */}
        {!isEditing ? (
          <>
            {/* Client Info Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Name</p>
                <p className="text-sm font-semibold text-gray-900">{displayName}</p>
              </div>

              {formData.company && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Company</p>
                  <p className="text-sm text-gray-700">{formData.company}</p>
                </div>
              )}

              {formData.email && (
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Email</p>
                    <p className="text-sm text-gray-700 break-all">{formData.email}</p>
                  </div>
                </div>
              )}

              {formData.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                    <p className="text-sm text-gray-700">{formData.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Address Card */}
            {(formData.street || formData.city) && (
              <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {formData.street}
                      {formData.address2 && <>{', '}{formData.address2}</>}
                      <br />
                      {formData.city && `${formData.city}, `}
                      {formData.state} {formData.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Edit Mode */
          <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
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
                  className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Address</p>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Street <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                    className={`w-full px-2.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533] ${
                      errors.street ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.street && (
                    <p className="text-xs text-red-600 mt-0.5">{errors.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={formData.address2}
                    onChange={(e) => handleChange('address2', e.target.value)}
                    className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className={`w-full px-2.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533] ${
                        errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                      maxLength={2}
                      className={`w-full px-2.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c87533] ${
                        errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.state && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    ZIP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
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
          </div>
        )}
      </div>

      {/* Sticky Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
        {!isEditing ? (
          <>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex-shrink-0 w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 px-4 py-2.5 bg-[#c87533] text-white rounded-lg font-medium text-sm hover:bg-[#b5682e] active:bg-[#a55a28] transition-colors"
            >
              Edit Client
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setIsEditing(false);
                setErrors({});
                setFormData({
                  firstName: client.firstName || '',
                  lastName: client.lastName || '',
                  company: client.company || '',
                  email: client.email || '',
                  phone: client.phone || '',
                  street: client.street || '',
                  address2: client.address2 || '',
                  city: client.city || '',
                  state: client.state || '',
                  zipCode: client.zipCode || ''
                });
              }}
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
                  Save
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-sm mx-4 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {displayName} from your clients. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}