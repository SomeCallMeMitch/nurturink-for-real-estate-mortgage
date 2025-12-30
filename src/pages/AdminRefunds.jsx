import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pill } from '@/components/ui/Pill';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  User,
  Building,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import SuperAdminLayout from '@/components/sa/SuperAdminLayout';

function getStatusPillVariant(status) {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    processed: 'success'
  };
  return map[status] || 'muted';
}

export default function AdminRefunds() {
  const { toast } = useToast();
  
  const [refundRequests, setRefundRequests] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  
  // Dialog state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [refundTo, setRefundTo] = useState('personal');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const requests = await base44.entities.RefundRequest.filter({});
      
      // Sort: pending first, then by date
      requests.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        return new Date(b.created_date) - new Date(a.created_date);
      });
      
      setRefundRequests(requests);
      
      // Load users
      const userIds = [...new Set([
        ...requests.map(r => r.userId),
        ...requests.map(r => r.requestedBy),
        ...requests.map(r => r.processedBy)
      ].filter(Boolean))];
      
      if (userIds.length > 0) {
        const userList = await base44.entities.User.filter({ id: { $in: userIds } });
        const userMap = {};
        userList.forEach(u => { userMap[u.id] = u; });
        setUsers(userMap);
      }
      
    } catch (error) {
      console.error('Failed to load refund requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load refund requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const openProcessDialog = (request) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setRefundTo(request.refundTo || 'personal');
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    try {
      setProcessing(true);
      const currentUser = await base44.auth.me();
      
      // Apply the refund
      if (refundTo === 'personal') {
        const userToRefund = users[selectedRequest.userId];
        if (userToRefund) {
          // Update user's personal purchased credits
          const currentCredits = userToRefund.personalPurchasedCredits || 0;
          await base44.entities.User.update(selectedRequest.userId, {
            personalPurchasedCredits: currentCredits + selectedRequest.creditsRequested
          });
        }
      } else if (refundTo === 'organization' && selectedRequest.organizationId) {
        const orgList = await base44.entities.Organization.filter({ id: selectedRequest.organizationId });
        if (orgList.length > 0) {
          const org = orgList[0];
          await base44.entities.Organization.update(selectedRequest.organizationId, {
            creditBalance: (org.creditBalance || 0) + selectedRequest.creditsRequested
          });
        }
      }
      
      // Update the refund request
      await base44.entities.RefundRequest.update(selectedRequest.id, {
        status: 'processed',
        processedBy: currentUser.id,
        processedAt: new Date().toISOString(),
        adminNotes: adminNotes || null,
        refundTo: refundTo
      });
      
      toast({
        title: 'Refund Approved',
        description: `${selectedRequest.creditsRequested} credits refunded to ${refundTo === 'personal' ? 'user' : 'organization'}.`,
        duration: 5000,
        className: 'bg-green-50 border-green-200'
      });
      
      setDialogOpen(false);
      loadData();
      
    } catch (error) {
      console.error('Failed to approve refund:', error);
      toast({
        title: 'Error',
        description: 'Failed to process refund',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    if (!adminNotes.trim()) {
      toast({
        title: 'Notes Required',
        description: 'Please provide a reason for rejecting this refund request.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setProcessing(true);
      const currentUser = await base44.auth.me();
      
      await base44.entities.RefundRequest.update(selectedRequest.id, {
        status: 'rejected',
        processedBy: currentUser.id,
        processedAt: new Date().toISOString(),
        adminNotes: adminNotes
      });
      
      toast({
        title: 'Refund Rejected',
        description: 'The refund request has been rejected.',
        duration: 5000
      });
      
      setDialogOpen(false);
      loadData();
      
    } catch (error) {
      console.error('Failed to reject refund:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject refund request',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Filter requests
  const filteredRequests = statusFilter === 'all' 
    ? refundRequests 
    : refundRequests.filter(r => r.status === statusFilter);

  const pendingCount = refundRequests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Credit Refunds</h1>
            <p className="text-muted-foreground">
              Review and process credit refund requests
            </p>
          </div>
          <Button variant="outline" onClick={loadData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Pending Alert */}
        {pendingCount > 0 && (
          <Card className="border-2 border-amber-400 bg-amber-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-full">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">
                    {pendingCount} Refund Request{pendingCount > 1 ? 's' : ''} Pending
                  </h3>
                  <p className="text-sm text-amber-700">
                    Review and approve or reject these refund requests.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processed">Approved/Processed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <DollarSign className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No refund requests
              </h3>
              <p className="text-muted-foreground">
                {statusFilter === 'pending' 
                  ? 'No pending refund requests to review.'
                  : 'No refund requests found.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => {
              const recipient = users[request.userId];
              const requestedBy = users[request.requestedBy];
              const processedBy = users[request.processedBy];
              const isPending = request.status === 'pending';
              
              return (
                <Card 
                  key={request.id}
                  className={`${isPending ? 'border-2 border-amber-400' : 'border border-subtle'}`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={`p-2 rounded-full ${isPending ? 'bg-amber-100' : 'bg-surface-1'}`}>
                          <DollarSign className={`w-5 h-5 ${isPending ? 'text-amber-600' : 'text-gray-500'}`} />
                        </div>
                        
                        {/* Info */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-lg">
                              {request.creditsRequested} Credits
                            </span>
                            <Pill variant={getStatusPillVariant(request.status)} size="sm">
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Pill>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              To: {recipient?.full_name || recipient?.email || 'Unknown'}
                            </span>
                            
                            <span className="flex items-center gap-1">
                              {request.refundTo === 'organization' ? (
                                <Building className="w-3.5 h-3.5" />
                              ) : (
                                <User className="w-3.5 h-3.5" />
                              )}
                              {request.refundTo === 'organization' ? 'Org Pool' : 'Personal'}
                            </span>
                            
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(request.created_date), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          
                          {request.rejectionReason && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Batch rejected: "{request.rejectionReason}"
                            </p>
                          )}
                          
                          {request.status !== 'pending' && processedBy && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {request.status === 'processed' ? 'Approved' : 'Rejected'} by {processedBy.full_name || processedBy.email}
                              {request.processedAt && ` on ${format(new Date(request.processedAt), 'MMM d')}`}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      {isPending && (
                        <Button onClick={() => openProcessDialog(request)}>
                          Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Process Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Process Refund Request</DialogTitle>
              <DialogDescription>
                Review and approve or reject this credit refund.
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="p-4 bg-surface-1 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits:</span>
                    <span className="font-semibold">{selectedRequest.creditsRequested}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipient:</span>
                    <span>{users[selectedRequest.userId]?.full_name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reason:</span>
                    <span className="text-right max-w-48 truncate">
                      {selectedRequest.rejectionReason || 'None'}
                    </span>
                  </div>
                </div>
                
                {/* Refund Destination */}
                <div className="space-y-2">
                  <Label>Refund Credits To</Label>
                  <Select value={refundTo} onValueChange={setRefundTo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Personal Credits
                        </span>
                      </SelectItem>
                      {selectedRequest.organizationId && (
                        <SelectItem value="organization">
                          <span className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Organization Pool
                          </span>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Admin Notes */}
                <div className="space-y-2">
                  <Label>Admin Notes (required for rejection)</Label>
                  <Textarea
                    placeholder="Add notes about this refund decision..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button 
                variant="outline"
                onClick={handleReject}
                disabled={processing}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Reject
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Approve & Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}