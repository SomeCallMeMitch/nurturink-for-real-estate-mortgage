import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  Download, 
  Mail, 
  FileText,
  Home,
  Send
} from 'lucide-react';
import WorkflowSteps from '@/components/mailing/WorkflowSteps';
import { Pill } from '@/components/ui/Pill';

export default function MailingConfirmation() {
  const navigate = useNavigate();
  
  // Get mailingBatchId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const mailingBatchId = urlParams.get('mailingBatchId') || urlParams.get('mailingbatchid');
  
  // State
  const [mailingBatch, setMailingBatch] = useState(null);
  const [clients, setClients] = useState([]);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [templates, setTemplates] = useState({});
  const [cardDesigns, setCardDesigns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mailingBatchId) {
      loadData();
    } else {
      setError('No mailing batch ID provided');
      setLoading(false);
    }
  }, [mailingBatchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load organization
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (orgList.length > 0) {
          setOrganization(orgList[0]);
        }
      }
      
      // Load mailing batch
      const batches = await base44.entities.MailingBatch.filter({ id: mailingBatchId });
      if (!batches || batches.length === 0) {
        throw new Error('Mailing batch not found');
      }
      
      const batch = batches[0];
      setMailingBatch(batch);
      
      // Load clients
      const clientList = await base44.entities.Client.filter({
        id: { $in: batch.selectedClientIds }
      });
      setClients(clientList);
      
      // Load card designs (batch global + any overrides)
      const designIds = new Set();
      if (batch.selectedCardDesignId) {
        designIds.add(batch.selectedCardDesignId);
      }
      if (batch.cardDesignOverrides) {
        Object.values(batch.cardDesignOverrides).forEach(id => designIds.add(id));
      }
      
      if (designIds.size > 0) {
        const designList = await base44.entities.CardDesign.filter({
          id: { $in: Array.from(designIds) }
        });
        
        const designMap = {};
        designList.forEach(d => {
          designMap[d.id] = d;
        });
        setCardDesigns(designMap);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load mailing confirmation data');
      setLoading(false);
    }
  };

  // Helper to get the effective card design for a client
  const getClientDesign = (clientId) => {
    const designId = mailingBatch?.cardDesignOverrides?.[clientId] || mailingBatch?.selectedCardDesignId;
    return designId ? cardDesigns[designId] : null;
  };

  // Helper to get the effective return address mode for a client
  const getClientReturnAddressMode = (clientId) => {
    return mailingBatch?.returnAddressModeOverrides?.[clientId] || mailingBatch?.returnAddressModeGlobal || 'company';
  };

  // Helper to format return address mode for display
  const formatReturnAddressMode = (mode) => {
    const modeMap = {
      'company': 'Company',
      'rep': 'Rep',
      'none': 'None'
    };
    return modeMap[mode] || mode;
  };

  // Handle download placeholders - UPDATED
  const handleDownloadCSV = async () => {
    try {
      const response = await base44.functions.invoke('exportMailingBatchCSV', {
        mailingBatchId: mailingBatchId
      });
      
      // Create blob from response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mailing-batch-${mailingBatchId.slice(0, 8)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Failed to download CSV:', error);
      alert('Failed to download CSV. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await base44.functions.invoke('exportMailingBatchPDF', {
        mailingBatchId: mailingBatchId
      });
      
      // Create blob from response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mailing-batch-${mailingBatchId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleEmailSummary = async () => {
    try {
      const response = await base44.functions.invoke('emailMailingSummary', {
        mailingBatchId: mailingBatchId
      });
      
      alert(`Email summary sent to ${user?.email || 'your inbox'}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email summary. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Confirmation</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate(createPageUrl('Home'))}>
                Go Home
              </Button>
              <Button onClick={() => navigate(createPageUrl('FindClients'))} variant="outline">
                Start New Mailing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Workflow Steps Header */}
      <WorkflowSteps currentStep={4} creditsLeft={user?.creditBalance || 0} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Top Section - Two Column Split */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Left Column - Success Message */}
          <div className="col-span-7">
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                {/* Success Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                {/* Title */}
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  Your Notes are On The Way!
                </h1>
                
                {/* Details */}
                <p className="text-lg text-foreground mb-2">
                  <span className="font-semibold">{clients.length} card{clients.length !== 1 ? 's' : ''}</span> {clients.length !== 1 ? 'have' : 'has'} been sent.
                </p>
                <p className="text-muted-foreground">
                  Expect them to be delivered in <span className="font-medium">5-10 business days</span>.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - What Happens Next (Sticky) */}
          <div className="col-span-5">
            <div className="sticky top-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">?</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">What Happens Next</h3>
                  </div>
                  
                  <ul className="space-y-3 mb-6 text-sm text-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Your cards are being printed with your custom message right now</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Each card will be hand-addressed and handwritten by our team</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Recipients should receive them in 5-10 business days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>A confirmation email with this summary has been sent to your inbox</span>
                    </li>
                  </ul>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => navigate(createPageUrl('FindClients'))}
                      className="w-full bg-orange-500 hover:bg-orange-600 gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send More Cards
                    </Button>
                    <Button
                      onClick={() => navigate(createPageUrl('Home'))}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Home className="w-4 h-4" />
                      Return to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mailing Details Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Mailing Details</h2>
              
              {/* Export Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCSV}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailSummary}
                  className="gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email Summary
                </Button>
              </div>
            </div>

            {/* Mailing Details Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Address
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Template
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Design
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Return Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clients.map((client, index) => {
                    const design = getClientDesign(client.id);
                    const returnMode = getClientReturnAddressMode(client.id);
                    const hasCustomMessage = mailingBatch?.contentOverrides?.[client.id];
                    
                    return (
                      <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {index + 1}.
                            </span>
                            <span className="font-medium text-foreground">
                              {client.fullName || 'Unnamed Client'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-foreground">
                            <div>{client.street}</div>
                            {client.address2 && <div>{client.address2}</div>}
                            <div>{client.city}, {client.state} {client.zipCode}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-foreground">
                            {hasCustomMessage ? (
                              <span className="italic text-muted-foreground">Custom Message</span>
                            ) : (
                              <span>Global Message</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {design ? (
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-12 rounded border border-border overflow-hidden flex-shrink-0">
                                <img
                                  src={design.insideImageUrl || design.imageUrl}
                                  alt={design.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-sm text-foreground">{design.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">No design</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Pill 
                            variant={returnMode === 'company' ? 'color1' : returnMode === 'rep' ? 'success' : 'muted'} 
                            size="sm"
                          >
                            {formatReturnAddressMode(returnMode)}
                          </Pill>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {clients.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No recipients found in this batch</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}