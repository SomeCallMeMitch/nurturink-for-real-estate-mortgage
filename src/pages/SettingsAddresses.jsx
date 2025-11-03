import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Save, MapPin } from "lucide-react";

export default function SettingsAddresses() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [returnAddressPreference, setReturnAddressPreference] = useState('company');
  
  const [personalAddress, setPersonalAddress] = useState({
    street: '',
    address2: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [companyAddress, setCompanyAddress] = useState({
    orgStreet: '',
    orgAddress2: '',
    orgCity: '',
    orgState: '',
    orgZipCode: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      setReturnAddressPreference(currentUser.returnAddressPreference || 'company');
      
      setPersonalAddress({
        street: currentUser.street || '',
        address2: currentUser.address2 || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        zipCode: currentUser.zipCode || ''
      });

      setCompanyAddress({
        orgStreet: currentUser.orgStreet || '',
        orgAddress2: currentUser.orgAddress2 || '',
        orgCity: currentUser.orgCity || '',
        orgState: currentUser.orgState || '',
        orgZipCode: currentUser.orgZipCode || ''
      });
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSuccessMessage('');

      await base44.auth.updateMe({
        returnAddressPreference,
        ...personalAddress,
        ...companyAddress
      });

      setSuccessMessage('Address settings saved successfully!');
      
      await loadUser();

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to update addresses:', error);
      alert('Failed to save addresses. Please try again.');
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
      <form onSubmit={handleSave} className="space-y-6">
        {/* Return Address Preference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Return Address Preference
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Choose which address to use on envelopes
            </p>
          </CardHeader>
          <CardContent>
            <RadioGroup value={returnAddressPreference} onValueChange={setReturnAddressPreference}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="personal" id="personal" />
                <label htmlFor="personal" className="text-sm font-medium cursor-pointer">
                  Use my Personal Return Address
                </label>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="company" id="company" />
                <label htmlFor="company" className="text-sm font-medium cursor-pointer">
                  Use the Company Return Address
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <label htmlFor="none" className="text-sm font-medium cursor-pointer">
                  Do not include a return address
                </label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Personal Return Address */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Return Address</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Your personal address for envelope return addresses
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="street">
                Street Address <span className="text-red-600">*</span>
              </Label>
              <Input
                id="street"
                value={personalAddress.street}
                onChange={(e) => setPersonalAddress({ ...personalAddress, street: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <Label htmlFor="address2">Address Line 2</Label>
              <Input
                id="address2"
                value={personalAddress.address2}
                onChange={(e) => setPersonalAddress({ ...personalAddress, address2: e.target.value })}
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
                  value={personalAddress.city}
                  onChange={(e) => setPersonalAddress({ ...personalAddress, city: e.target.value })}
                  placeholder="Denver"
                />
              </div>
              <div>
                <Label htmlFor="state">
                  State <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="state"
                  value={personalAddress.state}
                  onChange={(e) => setPersonalAddress({ ...personalAddress, state: e.target.value.toUpperCase() })}
                  placeholder="CO"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="w-1/3">
              <Label htmlFor="zipCode">
                ZIP Code <span className="text-red-600">*</span>
              </Label>
              <Input
                id="zipCode"
                value={personalAddress.zipCode}
                onChange={(e) => setPersonalAddress({ ...personalAddress, zipCode: e.target.value })}
                placeholder="80202"
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Return Address */}
        <Card>
          <CardHeader>
            <CardTitle>Company Return Address</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Company address shared by your organization
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orgStreet">
                Street Address <span className="text-red-600">*</span>
              </Label>
              <Input
                id="orgStreet"
                value={companyAddress.orgStreet}
                onChange={(e) => setCompanyAddress({ ...companyAddress, orgStreet: e.target.value })}
                placeholder="456 Business Blvd"
              />
            </div>

            <div>
              <Label htmlFor="orgAddress2">Address Line 2</Label>
              <Input
                id="orgAddress2"
                value={companyAddress.orgAddress2}
                onChange={(e) => setCompanyAddress({ ...companyAddress, orgAddress2: e.target.value })}
                placeholder="Suite 100"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="orgCity">
                  City <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="orgCity"
                  value={companyAddress.orgCity}
                  onChange={(e) => setCompanyAddress({ ...companyAddress, orgCity: e.target.value })}
                  placeholder="Denver"
                />
              </div>
              <div>
                <Label htmlFor="orgState">
                  State <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="orgState"
                  value={companyAddress.orgState}
                  onChange={(e) => setCompanyAddress({ ...companyAddress, orgState: e.target.value.toUpperCase() })}
                  placeholder="CO"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="w-1/3">
              <Label htmlFor="orgZipCode">
                ZIP Code <span className="text-red-600">*</span>
              </Label>
              <Input
                id="orgZipCode"
                value={companyAddress.orgZipCode}
                onChange={(e) => setCompanyAddress({ ...companyAddress, orgZipCode: e.target.value })}
                placeholder="80202"
              />
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {successMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
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
      </form>
    </SettingsLayout>
  );
}