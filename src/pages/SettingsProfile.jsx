import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SettingsLayout from "@/components/settings/SettingsLayout";
import RequireAuth from "@/components/auth/RequireAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function SettingsProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    full_name: '',
    email: '',
    title: '',
    phone: '',
    companyName: '',
    isOrgOwner: false,
    orgId: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        full_name: currentUser.fullName || currentUser.full_name || '',
        email: currentUser.email || '',
        title: currentUser.title || '',
        phone: currentUser.phone || '',
        companyName: currentUser.companyName || '',
        isOrgOwner: currentUser.isOrgOwner || false,
        orgId: currentUser.orgId || ''
      });
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      alert('Full Name is required');
      return;
    }

    try {
      setSaving(true);
      setSuccessMessage('');

      await base44.auth.updateMe({
        firstName: formData.firstName,
        lastName: formData.lastName,
        full_name: formData.full_name,
        fullName: formData.full_name,  // custom field that actually persists in sidebar
        title: formData.title,
        phone: formData.phone,
        companyName: formData.companyName,
        isOrgOwner: formData.isOrgOwner,
        orgId: formData.orgId
      });

      setSuccessMessage('Profile updated! Refreshing...');

      // Reload the page so MainLayout re-fetches the user and the sidebar updates
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
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
    <RequireAuth>
      <SettingsLayout>
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Manage your basic account information
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used in placeholders like {'{{me.firstName}}'}
                </p>
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Smith"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used in placeholders like {'{{me.lastName}}'}
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <Label htmlFor="full_name">
                Full Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Smith"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in placeholders like {'{{me.fullName}}'}
              </p>
            </div>

            {/* Job Title */}
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Senior Advisor"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in placeholders like {'{{me.title}}'}
              </p>
            </div>

            {/* Company Name */}
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Smith Roofing"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in placeholders like {'{{me.companyName}}'}
              </p>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in placeholders like {'{{me.phone}}'}
              </p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={formData.email}
                readOnly
                disabled
                className="bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email address cannot be changed
              </p>
            </div>

            {/* User Role Display */}
            {user?.appRole && (
              <div>
                <Label>Account Type</Label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {user.appRole === 'super_admin' && 'Super Admin'}
                    {user.appRole === 'organization_owner' && 'Organization Owner'}
                    {user.appRole === 'sales_rep' && 'Sales Representative'}
                  </span>
                </div>
              </div>
            )}

            {/* Super Admin Dev Tools */}
            {user?.appRole === 'super_admin' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-4">
                <p className="text-sm font-medium text-yellow-800">Dev/Testing Tools (Super Admin Only)</p>
                
                {/* Org ID Input */}
                <div>
                  <Label htmlFor="orgId">Organization ID</Label>
                  <Input
                    id="orgId"
                    value={formData.orgId}
                    onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
                    placeholder="Enter organization ID"
                    className="mt-1"
                  />
                  <p className="text-xs text-yellow-700 mt-1">
                    Assigns you to an organization for testing org-level features
                  </p>
                </div>
                
                {/* Is Org Owner Checkbox */}
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="isOrgOwner"
                    checked={formData.isOrgOwner}
                    onCheckedChange={(checked) => setFormData({ ...formData, isOrgOwner: checked })}
                  />
                  <div>
                    <Label htmlFor="isOrgOwner" className="font-medium cursor-pointer">
                      Is Organization Owner
                    </Label>
                    <p className="text-xs text-yellow-700 mt-1">
                      Enables org owner permission checks while keeping super_admin role
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                {successMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
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
    </SettingsLayout>
    </RequireAuth>
  );
}