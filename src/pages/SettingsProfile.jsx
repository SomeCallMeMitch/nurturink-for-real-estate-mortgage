import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

export default function SettingsProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
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
        full_name: currentUser.full_name || '',
        email: currentUser.email || ''
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
      alert('Name is required');
      return;
    }

    try {
      setSaving(true);
      setSuccessMessage('');

      await base44.auth.updateMe({
        full_name: formData.full_name
      });

      setSuccessMessage('Profile updated successfully!');
      
      // Reload user data
      await loadUser();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
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