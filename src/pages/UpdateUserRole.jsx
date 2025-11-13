import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UpdateUserRole() {
  const { toast } = useToast();
  const [email] = useState('aatman.base44@gmail.com');
  const [role] = useState('super_admin');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setResult(null);

      const response = await base44.functions.invoke('updateUserRole', {
        email,
        appRole: role
      });

      setResult(response.data);
      
      toast({
        title: 'Success!',
        description: response.data.message,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
    } catch (error) {
      console.error('Failed to update role:', error);
      const errorMsg = error.response?.data?.error || 'Failed to update user role';
      
      setResult({
        success: false,
        message: errorMsg
      });
      
      toast({
        title: 'Update Failed',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger on mount
  React.useEffect(() => {
    handleUpdate();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Update User Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input value={email} disabled />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Role
                </label>
                <Input value={role} disabled />
              </div>
            </div>

            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Role...
                </>
              ) : (
                'Update Role to Super Admin'
              )}
            </Button>

            {result && (
              <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                {result.success ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.success ? 'Success!' : 'Error'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                  {result.userId && (
                    <p className="text-xs text-gray-500 mt-2">
                      User ID: {result.userId}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}