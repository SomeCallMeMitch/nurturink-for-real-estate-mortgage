import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SettingsLayout from "@/components/settings/SettingsLayout";
import RequireAuth from "@/components/auth/RequireAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, AlertCircle, Building2 } from "lucide-react";

export default function SettingsOrganization() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const currentUser = await base44.auth.me();
      console.log('🔍 SettingsOrganization - Current user:', currentUser);
      console.log('🔍 SettingsOrganization - appRole:', currentUser.appRole);
      console.log('🔍 SettingsOrganization - isOrgOwner:', currentUser.isOrgOwner);
      
      setUser(currentUser);
      
      // Check if user is organization owner (check both appRole and isOrgOwner flag)
      const isOrgOwner = currentUser.appRole === 'organization_owner' || currentUser.isOrgOwner === true;
      
      console.log('🔍 SettingsOrganization - isOrgOwner check result:', isOrgOwner);
      
      if (!isOrgOwner) {
        console.error('❌ SettingsOrganization - Access denied: User is not an organization owner');
        setError('Only organization owners can manage organization settings.');
        setLoading(false);
        return;
      }
      
      // Check if user has an organization
      if (!currentUser.orgId) {
        console.error('❌ SettingsOrganization - User does not have orgId');
        setError('You are not associated with an organization.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 SettingsOrganization - Loading organization:', currentUser.orgId);
      
      // Load organization data
      const orgList = await base44.entities.Organization.filter({ 
        id: currentUser.orgId 
      });
      
      console.log('🔍 SettingsOrganization - Organization query result:', orgList);
      
      if (orgList && orgList.length > 0) {
        const org = orgList[0];
        console.log('✅ SettingsOrganization - Organization loaded:', org);
        setOrganization(org);
        setFormData({
          name: org.name || '',
          website: org.website || '',
          email: org.email || '',
          phone: org.phone || ''
        });
      } else {
        console.error('❌ SettingsOrganization - Organization not found');
        setError('Organization not found.');
      }
    } catch (err) {
      console.error('❌ SettingsOrganization - Failed to load organization:', err);
      setError('Failed to load organization data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Organization name is required');
      return;
    }

    try {
      setSaving(true);
      setSuccessMessage('');
      setError('');

      console.log('💾 SettingsOrganization - Saving organization:', organization.id, formData);

      await base44.entities.Organization.update(organization.id, {
        name: formData.name,
        website: formData.website,
        email: formData.email,
        phone: formData.phone
      });

      console.log('✅ SettingsOrganization - Organization updated successfully');

      setSuccessMessage('Organization settings updated successfully!');
      
      // Reload organization data
      await loadData();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('❌ SettingsOrganization - Failed to update organization:', err);
      setError('Failed to update organization settings. Please try again.');
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

  // Show error if user doesn't have permission
  if (error && !organization) {
    return (
      <SettingsLayout>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">{error}</p>
                <p className="text-sm text-red-700 mt-1">
                  Contact your organization owner if you need to update organization settings.
                </p>
                <div className="mt-3 text-xs text-red-600">
                  <p>Debug info:</p>
                  <p>appRole: {user?.appRole || 'not set'}</p>
                  <p>isOrgOwner: {user?.isOrgOwner ? 'true' : 'false'}</p>
                  <p>orgId: {user?.orgId || 'not set'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </SettingsLayout>
    );
  }

  return (
    <RequireAuth>
      <SettingsLayout>
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle>Organization Settings</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your organization's basic information
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Organization Name */}
            <div>
              <Label htmlFor="name">
                Organization Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="RoofScribe Inc"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in placeholders like {`{{org.name}}`}
              </p>
            </div>

            {/* Website */}
            <div>
              <Label htmlFor="website">Organization Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in placeholders like {`{{org.website}}`}
              </p>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Organization Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in placeholders like {`{{org.email}}`}
              </p>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Organization Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in placeholders like {`{{org.phone}}`}
              </p>
            </div>

            {/* Organization ID Display */}
            {organization && (
              <div>
                <Label>Organization ID</Label>
                <div className="mt-1">
                  <code className="inline-block px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded font-mono">
                    {organization.id}
                  </code>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Internal reference ID for this organization
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-900">{error}</p>
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
  );
}