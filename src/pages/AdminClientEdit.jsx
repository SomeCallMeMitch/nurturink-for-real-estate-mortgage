import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function AdminClientEdit() {
  const navigate = useNavigate();
  
  // Get client ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = window.location.pathname.split('/').pop();
  const isNew = clientId === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (!isNew) {
        setLoading(true);
        const clients = await base44.entities.Client.filter({ id: clientId });
        
        if (clients.length === 0) {
          setError('Client not found');
          return;
        }
        
        const client = clients[0];
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
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('First name and last name are required');
      return;
    }
    
    if (!formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
      alert('Address fields (street, city, state, ZIP) are required');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const clientData = {
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        orgId: user.orgId,
        ownerId: user.id
      };
      
      if (isNew) {
        await base44.entities.Client.create(clientData);
      } else {
        await base44.entities.Client.update(clientId, clientData);
      }
      
      navigate(createPageUrl('AdminClients'));
    } catch (err) {
      console.error('Failed to save client:', err);
      setError('Failed to save client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error && !isNew) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate(createPageUrl('AdminClients'))}>
              Back to Clients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('AdminClients'))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Create Client' : 'Edit Client'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Smith"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="ABC Roofing Co"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-gray-900 mb-4">Mailing Address</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street">
                      Street Address <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => handleChange('street', e.target.value)}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address2">Address Line 2</Label>
                    <Input
                      id="address2"
                      value={formData.address2}
                      onChange={(e) => handleChange('address2', e.target.value)}
                      placeholder="Apt, Suite, Unit, etc."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="city">
                        City <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="Denver"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">
                        State <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                        placeholder="CO"
                        maxLength={2}
                        required
                      />
                    </div>
                  </div>

                  <div className="w-1/3">
                    <Label htmlFor="zipCode">
                      ZIP Code <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleChange('zipCode', e.target.value)}
                      placeholder="80202"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl('AdminClients'))}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}