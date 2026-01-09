import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Shield,
  Zap,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

// Email template options for testing
const EMAIL_TEMPLATES = [
  { id: 'connection_test', name: 'Connection Test', description: 'Simple test to verify Resend API connection' },
  { id: 'welcome', name: 'Welcome Email', description: 'New user welcome message' },
  { id: 'team_invitation', name: 'Team Invitation', description: 'Invite a team member' },
  { id: 'order_received', name: 'Order Received', description: 'Order confirmation email' },
  { id: 'low_credits', name: 'Low Credits Warning', description: 'Credit balance alert' },
  { id: 'custom', name: 'Custom Email', description: 'Send a custom test email' }
];

export default function AdminTestEmails() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Form state
  const [recipientEmail, setRecipientEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('connection_test');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  
  // Results state
  const [sendHistory, setSendHistory] = useState([]);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Only allow admins (Mitch & Aatman)
        if (currentUser?.role !== 'admin') {
          setAccessDenied(true);
        } else {
          setRecipientEmail(currentUser.email || '');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    };
    
    checkAccess();
  }, []);

  const handleSendTestEmail = async () => {
    if (!recipientEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter a recipient email address.',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    const startTime = Date.now();

    try {
      let response;
      
      if (selectedTemplate === 'connection_test') {
        // Use our dedicated test function
        response = await base44.functions.invoke('testResendConnection', {
          toEmail: recipientEmail
        });
      } else if (selectedTemplate === 'custom') {
        // Send custom email via testResendConnection with custom content
        response = await base44.functions.invoke('testResendConnection', {
          toEmail: recipientEmail,
          subject: customSubject || 'NurturInk Custom Test Email',
          htmlContent: customBody || '<p>This is a custom test email from NurturInk.</p>'
        });
      } else {
        // For other templates, use the connection test for now
        response = await base44.functions.invoke('testResendConnection', {
          toEmail: recipientEmail
        });
      }

      const duration = Date.now() - startTime;
      const result = {
        id: Date.now(),
        template: EMAIL_TEMPLATES.find(t => t.id === selectedTemplate)?.name,
        recipient: recipientEmail,
        status: response.data?.success ? 'success' : 'failed',
        message: response.data?.message || response.data?.error,
        emailId: response.data?.emailId,
        duration,
        timestamp: new Date().toISOString()
      };

      setSendHistory(prev => [result, ...prev].slice(0, 10));

      if (response.data?.success) {
        toast({
          title: 'Email Sent!',
          description: `Test email delivered to ${recipientEmail}`,
        });
      } else {
        toast({
          title: 'Send Failed',
          description: response.data?.error || 'Unknown error occurred',
          variant: 'destructive'
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const result = {
        id: Date.now(),
        template: EMAIL_TEMPLATES.find(t => t.id === selectedTemplate)?.name,
        recipient: recipientEmail,
        status: 'error',
        message: error.message,
        duration,
        timestamp: new Date().toISOString()
      };
      
      setSendHistory(prev => [result, ...prev].slice(0, 10));
      
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Access denied state
  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
              <p className="text-slate-600">
                This dashboard is restricted to administrators only.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Email Test Dashboard</h1>
                <p className="text-sm text-slate-500">Resend API Integration Testing</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-700">API Connected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Form - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl shadow-slate-200/50 border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    Send Test Email
                  </CardTitle>
                  <CardDescription>
                    Test your Resend integration by sending emails to any address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Recipient Email */}
                  <div className="space-y-2">
                    <Label htmlFor="recipient" className="text-sm font-medium">
                      Recipient Email
                    </Label>
                    <Input
                      id="recipient"
                      type="email"
                      placeholder="mitch@nurturink.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMAIL_TEMPLATES.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{template.name}</span>
                              <span className="text-xs text-slate-500">{template.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Email Fields */}
                  {selectedTemplate === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-2"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-medium">
                          Subject Line
                        </Label>
                        <Input
                          id="subject"
                          placeholder="Your email subject..."
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="body" className="text-sm font-medium">
                          Email Body (HTML supported)
                        </Label>
                        <Textarea
                          id="body"
                          placeholder="<p>Your email content here...</p>"
                          value={customBody}
                          onChange={(e) => setCustomBody(e.target.value)}
                          className="min-h-[120px] font-mono text-sm"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Send Button */}
                  <Button
                    onClick={handleSendTestEmail}
                    disabled={sending || !recipientEmail}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* History Panel - 2 columns */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="shadow-xl shadow-slate-200/50 border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-slate-400" />
                    Send History
                  </CardTitle>
                  <CardDescription>
                    Recent test email attempts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sendHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500">No emails sent yet</p>
                      <p className="text-xs text-slate-400 mt-1">Send a test email to see results here</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {sendHistory.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3 rounded-lg border ${
                            item.status === 'success' 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {item.status === 'success' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {item.recipient}
                              </p>
                              <p className="text-xs text-slate-600 mt-0.5">
                                {item.template} • {item.duration}ms
                              </p>
                              {item.emailId && (
                                <p className="text-xs text-slate-400 mt-1 font-mono truncate">
                                  ID: {item.emailId}
                                </p>
                              )}
                              {item.status !== 'success' && item.message && (
                                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  {item.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}