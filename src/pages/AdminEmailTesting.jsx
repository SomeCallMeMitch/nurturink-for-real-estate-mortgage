import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Mail, 
  Send, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Users,
  CreditCard,
  Package,
  Palette,
  Shield,
  Bell
} from "lucide-react";

// Email configuration for all email types
const EMAIL_CATEGORIES = {
  authentication: {
    label: "Authentication & Onboarding",
    icon: Shield,
    color: "bg-orange-500",
    emails: [
      {
        id: "welcome",
        name: "Welcome Email",
        function: "sendWelcomeEmail",
        description: "Sent when user completes signup",
        testData: (email, name) => ({
          user_firstName: name.split(" ")[0],
          user_email: email,
          dashboard_url: `${window.location.origin}/Home`,
          send_note_url: `${window.location.origin}/FindClients`,
          templates_url: `${window.location.origin}/Templates`,
          support_url: `${window.location.origin}/support`
        })
      },
      {
        id: "team-invitation",
        name: "Team Invitation",
        function: "sendTeamInvitationEmail",
        description: "Sent when admin invites team member",
        testData: (email, name) => ({
          invitee_email: email,
          inviter_firstName: "John",
          inviter_fullName: "John Smith",
          organization_name: "Test Company",
          role: "sales_rep",
          role_display: "Sales Representative",
          invitation_token: "test-token-123",
          accept_url: `${window.location.origin}/accept?token=test-token-123`,
          invitation_expires: "7 days"
        })
      },
      {
        id: "invitation-accepted",
        name: "Invitation Accepted",
        function: "sendInvitationAcceptedEmail",
        description: "Sent to admins when invitation is accepted",
        testData: (email, name) => ({
          admin_email: email,
          admin_firstName: name.split(" ")[0],
          new_member_fullName: "Jane Doe",
          new_member_email: "jane@example.com",
          new_member_role: "sales_rep",
          new_member_role_display: "Sales Representative",
          organization_name: "Test Company",
          joined_timestamp: new Date().toLocaleString(),
          team_management_url: `${window.location.origin}/TeamManagement`
        })
      },
      {
        id: "password-reset",
        name: "Password Reset",
        function: "sendPasswordResetEmail",
        description: "Sent when user requests password reset",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          reset_token: "test-reset-token",
          reset_url: `${window.location.origin}/reset?token=test-reset-token`,
          expires_in: "1 hour",
          expiry_timestamp: new Date(Date.now() + 3600000).toLocaleString()
        })
      }
    ]
  },
  credits: {
    label: "Credit Transactions",
    icon: CreditCard,
    color: "bg-orange-500",
    emails: [
      {
        id: "personal-receipt",
        name: "Personal Credit Receipt",
        function: "sendPersonalCreditPurchaseReceipt",
        description: "Sent after personal credit purchase",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          order_number: "RS-TEST-001",
          transaction_id: "txn_test123",
          purchase_date: new Date().toLocaleString(),
          credits_purchased: 50,
          price_paid: 4997,
          original_price: 4997,
          discount_amount: 0,
          payment_method: "4242",
          new_balance: 75
        })
      },
      {
        id: "org-receipt",
        name: "Organization Credit Receipt",
        function: "sendOrgCreditPurchaseReceipt",
        description: "Sent after org credit purchase",
        testData: (email, name) => ({
          admin_email: email,
          admin_firstName: name.split(" ")[0],
          organization_name: "Test Company",
          order_number: "RS-ORG-001",
          transaction_id: "txn_org123",
          purchase_date: new Date().toLocaleString(),
          credits_purchased: 100,
          price_paid: 8997,
          original_price: 8997,
          discount_amount: 0,
          payment_method: "4242",
          new_org_pool_balance: 150,
          team_size: 5
        })
      },
      {
        id: "org-purchase-notif",
        name: "Org Purchase Notification",
        function: "sendOrgCreditPurchaseNotification",
        description: "Sent to other admins after org purchase",
        testData: (email, name) => ({
          other_admins_emails: [email],
          admin_firstName: name.split(" ")[0],
          purchasing_admin_name: "John Smith",
          organization_name: "Test Company",
          credits_purchased: 100,
          purchase_date: new Date().toLocaleString(),
          new_org_pool_balance: 150
        })
      },
      {
        id: "credits-allocated",
        name: "Credits Allocated",
        function: "sendCreditsAllocatedEmail",
        description: "Sent to member when credits allocated",
        testData: (email, name) => ({
          member_email: email,
          member_firstName: name.split(" ")[0],
          admin_name: "John Smith",
          credits_allocated: 25,
          allocation_date: new Date().toLocaleString(),
          new_personal_balance: 30,
          org_pool_available: 50
        })
      },
      {
        id: "allocation-team-notif",
        name: "Allocation Team Notification",
        function: "sendCreditAllocationTeamNotif",
        description: "Sent to admins after credit allocation",
        testData: (email, name) => ({
          other_admins_emails: [email],
          admin_firstNames: [name.split(" ")[0]],
          allocating_admin_name: "John Smith",
          organization_name: "Test Company",
          allocations: [
            { member_name: "Jane Doe", credits_allocated: 25 },
            { member_name: "Bob Wilson", credits_allocated: 15 }
          ],
          remaining_org_pool: 60
        })
      },
      {
        id: "low-personal-credit",
        name: "Low Personal Credit Warning",
        function: "sendLowPersonalCreditWarning",
        description: "Sent when personal balance is low",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          current_personal_balance: 3,
          org_pool_available: 10,
          is_first_warning: true,
          last_note_sent: new Date().toLocaleDateString(),
          is_org_member: true
        })
      },
      {
        id: "low-org-pool",
        name: "Low Org Pool Warning",
        function: "sendLowOrgPoolWarning",
        description: "Sent when org pool is low",
        testData: (email, name) => ({
          admin_emails: [email],
          admin_firstName: name.split(" ")[0],
          organization_name: "Test Company",
          current_org_pool_balance: 15,
          team_size: 5,
          average_weekly_usage: 20,
          estimated_days_remaining: 5,
          is_first_warning: true
        })
      },
      {
        id: "payment-failed",
        name: "Payment Failed",
        function: "sendPaymentFailedEmail",
        description: "Sent when payment fails",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          is_org_purchase: false,
          credits_attempted: 50,
          amount_attempted: 4997,
          failure_reason: "Your card was declined",
          failure_code: "card_declined",
          payment_method: "4242",
          attempt_timestamp: new Date().toLocaleString()
        })
      },
      {
        id: "auto-refill",
        name: "Auto-Refill Confirmation",
        function: "sendAutoRefillConfirmationEmail",
        description: "Sent after auto-refill triggers",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          organization_name: "Test Company",
          credits_purchased: 50,
          price_paid: 4997,
          trigger_balance: 10,
          new_balance: 60,
          transaction_id: "txn_auto123",
          refill_date: new Date().toLocaleString()
        })
      },
      {
        id: "account-deactivated",
        name: "Account Deactivated",
        function: "sendAccountDeactivatedEmail",
        description: "Sent when account is deactivated",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          deactivation_date: new Date().toLocaleDateString(),
          reason: "Account inactive for 90 days",
          remaining_credits: 25
        })
      }
    ]
  },
  team: {
    label: "Team Management",
    icon: Users,
    color: "bg-blue-500",
    emails: [
      {
        id: "role-changed",
        name: "Role Changed",
        function: "sendRoleChangedEmail",
        description: "Sent when member's role is updated",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          new_role_display: "Organization Admin",
          old_role_display: "Sales Representative",
          isPromotion: true,
          changed_by_name: "John Smith",
          org_name: "Test Company"
        })
      },
      {
        id: "removed-from-org",
        name: "Removed from Organization",
        function: "sendRemovedFromOrgEmail",
        description: "Sent to removed member",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          removed_by_name: "John Smith",
          removal_date: new Date().toLocaleDateString(),
          org_name: "Test Company",
          reason: "Team restructuring"
        })
      },
      {
        id: "member-removal-notif",
        name: "Member Removal Notification",
        function: "sendMemberRemovalNotification",
        description: "Sent to other admins when member removed",
        testData: (email, name) => ({
          other_admins_emails: [email],
          admin_firstName: name.split(" ")[0],
          user_fullName: "Jane Doe",
          user_email: "jane@example.com",
          previous_role_display: "Sales Representative",
          removed_by_name: "John Smith",
          removal_date: new Date().toLocaleDateString(),
          org_name: "Test Company"
        })
      }
    ]
  },
  orders: {
    label: "Mailing & Orders",
    icon: Package,
    color: "bg-green-500",
    emails: [
      {
        id: "order-received",
        name: "Order Received",
        function: "sendOrderReceivedEmail",
        description: "Sent when order is submitted",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          order_id: "ORD-TEST-001",
          order_date: new Date().toLocaleDateString(),
          number_of_notes: 25,
          price_display: "25 credits",
          print_estimated_date: "2-3 business days",
          estimated_delivery_window: "7-10 business days"
        })
      },
      {
        id: "order-printed",
        name: "Order Printed",
        function: "sendOrderPrintedEmail",
        description: "Sent when order is printed",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          order_id: "ORD-TEST-001",
          printed_date: new Date().toLocaleDateString(),
          number_of_notes: 25,
          estimated_shipping_date: "1-2 business days"
        })
      },
      {
        id: "order-shipped",
        name: "Order Shipped",
        function: "sendOrderShippedEmail",
        description: "Sent when order ships",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          order_id: "ORD-TEST-001",
          shipping_date: new Date().toLocaleDateString(),
          tracking_number: "1Z999AA10123456784",
          tracking_url: "https://www.ups.com/track?tracknum=1Z999AA10123456784",
          estimated_delivery_date: "5-7 business days",
          number_of_notes: 25
        })
      },
      {
        id: "expected-delivery",
        name: "Expected Delivery",
        function: "sendExpectedDeliveryEmail",
        description: "Sent 7 days after shipment",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          order_id: "ORD-TEST-001",
          shipping_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          expected_delivery_start: new Date().toLocaleDateString(),
          expected_delivery_end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          number_of_notes: 25
        })
      }
    ]
  },
  designs: {
    label: "Templates & Designs",
    icon: Palette,
    color: "bg-purple-500",
    emails: [
      {
        id: "design-request-received",
        name: "Design Request Received",
        function: "sendDesignRequestReceivedEmail",
        description: "Sent when design request submitted",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          design_request_id: "DR-TEST-001",
          request_date: new Date().toLocaleDateString(),
          design_description: "Custom card design with company logo and brand colors",
          estimated_review_time: "2-3 business days"
        })
      },
      {
        id: "design-request-notif",
        name: "Design Request Notification",
        function: "sendDesignRequestNotification",
        description: "Sent to admin when design requested",
        testData: (email, name) => ({
          admin_email: email,
          admin_firstName: name.split(" ")[0],
          requester_fullName: "Jane Doe",
          requester_email: "jane@example.com",
          design_request_id: "DR-TEST-001",
          request_date: new Date().toLocaleDateString(),
          design_description: "Custom card design with company logo and brand colors"
        })
      },
      {
        id: "design-ready",
        name: "Design Ready for Review",
        function: "sendDesignReadyForReviewEmail",
        description: "Sent when design mockup is ready",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          design_request_id: "DR-TEST-001",
          design_name: "Custom Company Card",
          uploaded_date: new Date().toLocaleDateString(),
          review_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
        })
      },
      {
        id: "design-approved",
        name: "Design Approved Notification",
        function: "sendDesignApprovedNotification",
        description: "Sent to admin when user approves design",
        testData: (email, name) => ({
          admin_email: email,
          admin_firstName: name.split(" ")[0],
          requester_fullName: "Jane Doe",
          design_request_id: "DR-TEST-001",
          design_name: "Custom Company Card",
          approved_date: new Date().toLocaleDateString(),
          next_steps: "Design will be added to the user's library within 24 hours."
        })
      },
      {
        id: "design-changes",
        name: "Design Changes Requested",
        function: "sendDesignChangesRequestedEmail",
        description: "Sent to admin when user requests changes",
        testData: (email, name) => ({
          admin_email: email,
          admin_firstName: name.split(" ")[0],
          requester_fullName: "Jane Doe",
          design_request_id: "DR-TEST-001",
          design_name: "Custom Company Card",
          change_comments: "Could you make the logo slightly larger and change the accent color to a deeper blue?",
          requested_date: new Date().toLocaleDateString()
        })
      },
      {
        id: "template-approved",
        name: "Template Approved",
        function: "sendTemplateApprovedEmail",
        description: "Sent when user's template is approved",
        testData: (email, name) => ({
          creator_email: email,
          creator_firstName: name.split(" ")[0],
          template_name: "Thank You - Home Purchase",
          template_id: "TPL-TEST-001",
          approval_date: new Date().toLocaleDateString()
        })
      },
      {
        id: "template-rejected",
        name: "Template Rejected",
        function: "sendTemplateRejectedEmail",
        description: "Sent when user's template is not approved",
        testData: (email, name) => ({
          creator_email: email,
          creator_firstName: name.split(" ")[0],
          template_name: "Thank You - Home Purchase",
          template_id: "TPL-TEST-001",
          rejected_date: new Date().toLocaleDateString(),
          rejection_reason: "The template contains placeholder text that needs to be replaced with actual content. Please also ensure the greeting is personalized."
        })
      },
      {
        id: "new-designs",
        name: "New Designs Available",
        function: "sendNewDesignsAvailableEmail",
        description: "Broadcast when new designs are released",
        testData: (email, name) => ({
          user_emails: [email],
          user_firstNames: [name.split(" ")[0]],
          release_date: new Date().toLocaleDateString(),
          featured_designs: [
            {
              name: "Spring Collection",
              description: "Fresh floral designs perfect for spring outreach",
              preview_url: "",
              design_url: `${window.location.origin}/SelectDesign`
            }
          ]
        })
      }
    ]
  },
  misc: {
    label: "Miscellaneous",
    icon: Bell,
    color: "bg-gray-500",
    emails: [
      {
        id: "weekly-digest",
        name: "Weekly Digest",
        function: "sendWeeklyDigestEmail",
        description: "Weekly activity summary",
        testData: (email, name) => ({
          user_email: email,
          user_firstName: name.split(" ")[0],
          week_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          week_end: new Date().toLocaleDateString(),
          notes_sent: 12,
          credits_used: 12,
          credits_remaining: 38,
          top_template: "Thank You Note",
          top_design: "Professional Blue",
          team_notes_sent: 45
        })
      }
    ]
  }
};

export default function AdminEmailTesting() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("");
  const [sendingStates, setSendingStates] = useState({});
  const [results, setResults] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        setTestEmail(u.email || "");
        setTestName(u.full_name || "Test User");
      } catch (e) {
        console.error("Failed to load user:", e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const sendTestEmail = async (emailConfig) => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive"
      });
      return;
    }

    setSendingStates(prev => ({ ...prev, [emailConfig.id]: true }));
    setResults(prev => ({ ...prev, [emailConfig.id]: null }));

    try {
      const testData = emailConfig.testData(testEmail, testName);
      const response = await base44.functions.invoke(emailConfig.function, testData);
      
      setResults(prev => ({ 
        ...prev, 
        [emailConfig.id]: { success: true, message: response.data?.message || "Email sent successfully" } 
      }));
      
      toast({
        title: "Success",
        description: `${emailConfig.name} sent to ${testEmail}`,
      });
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [emailConfig.id]: { success: false, message: error.message } 
      }));
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSendingStates(prev => ({ ...prev, [emailConfig.id]: false }));
    }
  };

  const sendAllInCategory = async (categoryKey) => {
    const category = EMAIL_CATEGORIES[categoryKey];
    for (const email of category.emails) {
      await sendTestEmail(email);
      // Small delay between emails
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is super_admin
  if (user?.appRole !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Shield className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">This page is only accessible to super administrators.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Mail className="w-7 h-7 text-primary" />
          Email Testing Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Send test emails for all {Object.values(EMAIL_CATEGORIES).reduce((sum, cat) => sum + cat.emails.length, 0)} email templates
        </p>
      </div>

      {/* Test Email Configuration */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Test Configuration</CardTitle>
          <CardDescription>All test emails will be sent to this address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-email">Recipient Email</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="test-name">Recipient Name</Label>
              <Input
                id="test-name"
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Test User"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Categories Tabs */}
      <Tabs defaultValue="authentication" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          {Object.entries(EMAIL_CATEGORIES).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{category.label.split(" ")[0]}</span>
                <Badge variant="secondary" className="ml-1">{category.emails.length}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(EMAIL_CATEGORIES).map(([categoryKey, category]) => {
          const Icon = category.icon;
          return (
            <TabsContent key={categoryKey} value={categoryKey}>
              <div className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{category.label}</h2>
                      <p className="text-sm text-muted-foreground">{category.emails.length} email templates</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => sendAllInCategory(categoryKey)}
                    disabled={Object.values(sendingStates).some(Boolean)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send All
                  </Button>
                </div>

                {/* Email Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.emails.map((emailConfig) => (
                    <Card key={emailConfig.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{emailConfig.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {emailConfig.description}
                            </CardDescription>
                          </div>
                          {results[emailConfig.id] && (
                            results[emailConfig.id].success ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="flex items-center justify-between">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {emailConfig.function}
                          </code>
                          <Button
                            size="sm"
                            onClick={() => sendTestEmail(emailConfig)}
                            disabled={sendingStates[emailConfig.id]}
                          >
                            {sendingStates[emailConfig.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3 h-3 mr-1" />
                                Send
                              </>
                            )}
                          </Button>
                        </div>
                        {results[emailConfig.id] && !results[emailConfig.id].success && (
                          <p className="text-xs text-red-500 mt-2 truncate">
                            {results[emailConfig.id].message}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}