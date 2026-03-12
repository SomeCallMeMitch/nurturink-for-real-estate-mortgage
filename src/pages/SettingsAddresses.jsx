import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SettingsLayout from '@/components/settings/SettingsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsAddresses() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Local form state
  const [returnAddressPreference, setReturnAddressPreference] = useState('company');
  const [personalAddress, setPersonalAddress] = useState({
    returnAddressName: '',
    street: '',
    address2: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [companyAddress, setCompanyAddress] = useState({
    companyName: '',
    street: '',
    address2: '',
    city: '',
    state: '',
    zip: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      console.log('DEBUG loadData: currentUser =', JSON.stringify(currentUser));
      setUser(currentUser);
      
      // Load organization if user has one
      console.log('DEBUG loadData: currentUser.orgId =', currentUser.orgId);
      if (currentUser.orgId) {
        const orgs = await base44.entities.Organization.filter({ id: currentUser.orgId });
        console.log('DEBUG loadData: orgs count =', orgs.length);
        if (orgs.length > 0) {
          console.log('DEBUG loadData: org[0] full object =', JSON.stringify(orgs[0]));
          console.log('DEBUG loadData: org[0].companyReturnAddress =', JSON.stringify(orgs[0].companyReturnAddress));
          setOrganization(orgs[0]);
          
          // Initialize company address from organization
          const cra = orgs[0].companyReturnAddress || {};
          console.log('DEBUG loadData: cra after fallback =', JSON.stringify(cra));
          const newCompanyAddress = {
            companyName: cra.companyName || orgs[0].name || '',
            street: cra.street || '',
            address2: cra.address2 || '',
            city: cra.city || '',
            state: cra.state || '',
            zip: cra.zip || ''
          };
          console.log('DEBUG loadData: setting companyAddress to =', JSON.stringify(newCompanyAddress));
          setCompanyAddress(newCompanyAddress);
        }
      } else {
        console.log('DEBUG loadData: NO orgId on user, skipping org load');
      }
      
      // Initialize personal address from user
      const newPersonalAddress = {
        returnAddressName: currentUser.returnAddressName || currentUser.fullName || currentUser.full_name || '',
        street: currentUser.street || '',
        address2: currentUser.address2 || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        zipCode: currentUser.zipCode || ''
      };
      console.log('DEBUG loadData: setting personalAddress to =', JSON.stringify(newPersonalAddress));
      setPersonalAddress(newPersonalAddress);
      
      setReturnAddressPreference(currentUser.returnAddressPreference || 'company');
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load address settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update user's personal address and preference
      await base44.auth.updateMe({
        returnAddressName: personalAddress.returnAddressName,
        street: personalAddress.street,
        address2: personalAddress.address2,
        city: personalAddress.city,
        state: personalAddress.state,
        zipCode: personalAddress.zipCode,
        returnAddressPreference: returnAddressPreference
      });
      
      // Update organization's company address if user has permission
      if (organization && (user.isOrgOwner || user.appRole === 'organization_owner' || user.appRole === 'super_admin')) {
        await base44.entities.Organization.update(organization.id, {
          companyReturnAddress: {
            companyName: companyAddress.companyName,
            street: companyAddress.street,
            address2: companyAddress.address2,
            city: companyAddress.city,
            state: companyAddress.state,
            zip: companyAddress.zip
          }
        });
      }
      
      toast({
        title: 'Addresses saved',
        description: 'Your return address settings have been updated',
        duration: 3000
      });
      
      // Reload data
      await loadData();
      
    } catch (error) {
      console.error('Failed to save addresses:', error);
      toast({
        title: 'Save failed',
        description: error.message || 'Failed to save address settings',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Addresses</h1>
          <p className="text-gray-600 mt-1">Manage your account preferences and information</p>
        </div>

        {/* Return Address Preference */}
        <Card>
          <CardHeader>
            <CardTitle>Return Address Preference</CardTitle>
            <CardDescription>Choose which address to use on envelopes</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={returnAddressPreference} onValueChange={setReturnAddressPreference}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="cursor-pointer">Use my Personal Return Address</Label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company" className="cursor-pointer">Use the Company Return Address</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="cursor-pointer">Do not include a return address</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Personal Return Address */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Return Address</CardTitle>
            <CardDescription>Your personal address for envelope return addresses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="personal-name">Name *</Label>
              <Input
                id="personal-name"
                value={personalAddress.returnAddressName}
                onChange={(e) => setPersonalAddress({ ...personalAddress, returnAddressName: e.target.value })}
                placeholder="John Smith"
              />
            </div>

            <div>
              <Label htmlFor="personal-street">Street Address *</Label>
              <Input
                id="personal-street"
                value={personalAddress.street}
                onChange={(e) => setPersonalAddress({ ...personalAddress, street: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <Label htmlFor="personal-address2">Address Line 2</Label>
              <Input
                id="personal-address2"
                value={personalAddress.address2}
                onChange={(e) => setPersonalAddress({ ...personalAddress, address2: e.target.value })}
                placeholder="Apt 4B, Suite 100, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="personal-city">City *</Label>
                <Input
                  id="personal-city"
                  value={personalAddress.city}
                  onChange={(e) => setPersonalAddress({ ...personalAddress, city: e.target.value })}
                  placeholder="San Francisco"
                />
              </div>
              <div>
                <Label htmlFor="personal-state">State *</Label>
                <Input
                  id="personal-state"
                  value={personalAddress.state}
                  onChange={(e) => setPersonalAddress({ ...personalAddress, state: e.target.value })}
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="personal-zip">ZIP Code *</Label>
              <Input
                id="personal-zip"
                value={personalAddress.zipCode}
                onChange={(e) => setPersonalAddress({ ...personalAddress, zipCode: e.target.value })}
                placeholder="94102"
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Return Address */}
        <Card>
          <CardHeader>
            <CardTitle>Company Return Address</CardTitle>
            <CardDescription>Company address shared by your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyAddress.companyName}
                onChange={(e) => setCompanyAddress({ ...companyAddress, companyName: e.target.value })}
                placeholder="Acme Corporation"
              />
            </div>

            <div>
              <Label htmlFor="company-street">Street Address *</Label>
              <Input
                id="company-street"
                value={companyAddress.street}
                onChange={(e) => setCompanyAddress({ ...companyAddress, street: e.target.value })}
                placeholder="456 Business Ave"
              />
            </div>

            <div>
              <Label htmlFor="company-address2">Address Line 2</Label>
              <Input
                id="company-address2"
                value={companyAddress.address2}
                onChange={(e) => setCompanyAddress({ ...companyAddress, address2: e.target.value })}
                placeholder="Suite 200, Floor 3, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-city">City *</Label>
                <Input
                  id="company-city"
                  value={companyAddress.city}
                  onChange={(e) => setCompanyAddress({ ...companyAddress, city: e.target.value })}
                  placeholder="Denver"
                />
              </div>
              <div>
                <Label htmlFor="company-state">State *</Label>
                <Input
                  id="company-state"
                  value={companyAddress.state}
                  onChange={(e) => setCompanyAddress({ ...companyAddress, state: e.target.value })}
                  placeholder="CO"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company-zip">ZIP Code *</Label>
              <Input
                id="company-zip"
                value={companyAddress.zip}
                onChange={(e) => setCompanyAddress({ ...companyAddress, zip: e.target.value })}
                placeholder="80202"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
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
                Save Addresses
              </>
            )}
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
}