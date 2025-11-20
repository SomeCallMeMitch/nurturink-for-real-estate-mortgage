import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function TestEmailPage() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSending(true);
    setResult(null);
    setError(null);

    try {
      const response = await base44.functions.invoke('sendTestEmail');
      
      setResult(response.data);
      
      toast({
        title: 'Test Email Sent! ✅',
        description: `Check your inbox at ${user.email}`,
        className: 'bg-green-50 border-green-200 text-green-900'
      });

    } catch (err) {
      console.error('Failed to send test email:', err);
      setError(err.response?.data?.error || err.message || 'Failed to send test email');
      
      toast({
        title: 'Email Failed',
        description: err.response?.data?.error || 'Could not send test email',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto pt-12">
        <Card className="shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-orange-600" />
              <div>
                <CardTitle className="text-2xl">Test Resend Email</CardTitle>
                <CardDescription className="text-base mt-1">
                  Verify your email integration is working correctly
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* User Info */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">Test email will be sent to:</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{user.email}</p>
              </div>
            )}

            {/* Test Button */}
            <Button
              onClick={handleSendTestEmail}
              disabled={isSending || !user}
              className="w-full h-14 text-lg font-semibold bg-orange-600 hover:bg-orange-700 gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Test Email...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Test Email
                </>
              )}
            </Button>

            {/* Success Result */}
            {result && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 text-lg mb-2">
                      Email Sent Successfully!
                    </h3>
                    <div className="space-y-1 text-sm text-green-800">
                      <p><strong>Sent to:</strong> {result.sentTo}</p>
                      <p><strong>Email ID:</strong> {result.emailId}</p>
                      <p className="mt-3 text-green-700">
                        Check your inbox (and spam folder) for the test email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Result */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 text-lg mb-2">
                      Failed to Send Email
                    </h3>
                    <p className="text-sm text-red-800">{error}</p>
                    <p className="text-xs text-red-700 mt-3">
                      Check that your RESEND_API_KEY is properly configured in environment variables.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-2">How it works:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Click the button to send a test email to your account</li>
                <li>Check your inbox (and spam folder) for the test message</li>
                <li>If successful, your Resend integration is working correctly</li>
                <li>If it fails, check your RESEND_API_KEY environment variable</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}