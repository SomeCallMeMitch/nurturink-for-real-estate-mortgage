import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Loader2,
  Send,
  Calendar,
  CreditCard,
  Mail,
  TrendingUp,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  User,
  Zap
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function TeamMemberDetailsModal({ open, onOpenChange, member, onUpdate }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  
  // Credit allocation state
  const [creditsToAllocate, setCreditsToAllocate] = useState('');
  const [allocating, setAllocating] = useState(false);
  
  // Pool access state
  const [poolAccess, setPoolAccess] = useState(false);
  const [updatingPoolAccess, setUpdatingPoolAccess] = useState(false);

  useEffect(() => {
    if (open && member?.userId) {
      loadMemberDetails();
    }
  }, [open, member]);

  useEffect(() => {
    if (member?.canAccessCompanyPool !== undefined) {
      setPoolAccess(member.canAccessCompanyPool);
    }
  }, [member?.canAccessCompanyPool]);

  const loadMemberDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch notes sent by this member
      const notes = await base44.entities.Note.filter({
        userId: member.userId
      });
      
      // Sort by sent date, most recent first
      const sortedNotes = notes
        .filter(n => n.status !== 'draft')
        .sort((a, b) => new Date(b.sentDate || b.createdAt) - new Date(a.sentDate || a.createdAt))
        .slice(0, 10); // Get last 10 notes
      
      setRecentNotes(sortedNotes);
      
      // Fetch transactions to calculate company credits used
      const transactions = await base44.entities.Transaction.filter({
        userId: member.userId,
        type: 'deduction'
      });
      
      // Calculate company credits used (from companyAllocatedCredits)
      const companyCreditsUsed = transactions
        .filter(t => t.metadata?.creditType === 'companyAllocatedCredits')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      // Compile stats
      setStats({
        notesSent: sortedNotes.length,
        lastNoteSent: sortedNotes.length > 0 ? sortedNotes[0].sentDate || sortedNotes[0].createdAt : null,
        companyCreditsUsed: companyCreditsUsed,
        currentBalance: member.credits || 0
      });
      
    } catch (error) {
      console.error('Failed to load member details:', error);
      toast({
        title: 'Failed to Load Details',
        description: 'Could not fetch member activity data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateCredits = async () => {
    const amount = parseInt(creditsToAllocate, 10);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid number of credits',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setAllocating(true);
      
      const response = await base44.functions.invoke('allocateCredits', {
        allocations: {
          [member.userId]: amount
        }
      });
      
      toast({
        title: 'Credits Allocated',
        description: `Successfully allocated ${amount} credits to ${member.name}`,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
      setCreditsToAllocate('');
      if (response.data.allocations && response.data.allocations.length > 0) {
        const updatedUser = response.data.allocations[0].updatedUser;
        if (onUpdate) onUpdate(updatedUser);
      }
      
    } catch (error) {
      console.error('Failed to allocate credits:', error);
      toast({
        title: 'Allocation Failed',
        description: error.response?.data?.error || 'Failed to allocate credits',
        variant: 'destructive'
      });
    } finally {
      setAllocating(false);
    }
  };

  const handleTogglePoolAccess = async () => {
    try {
      setUpdatingPoolAccess(true);
      
      const response = await base44.functions.invoke('updateUserPoolAccess', {
        userId: member.userId,
        canAccessCompanyPool: !poolAccess
      });
      
      setPoolAccess(!poolAccess);
      
      toast({
        title: 'Pool Access Updated',
        description: `${member.name} ${!poolAccess ? 'can now' : 'can no longer'} draw from the company credit pool`,
        className: 'bg-green-50 border-green-200 text-green-900'
      });
      
      if (onUpdate) onUpdate(response.data.user);
      
    } catch (error) {
      console.error('Failed to update pool access:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update pool access setting',
        variant: 'destructive'
      });
    } finally {
      setUpdatingPoolAccess(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
              {member?.initials || <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-xl">{member?.name}</div>
              <div className="text-sm text-gray-500 font-normal">{member?.email}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            View activity, manage credits, and configure pool access for this team member
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Send className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Notes Sent</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.notesSent || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Sent</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(stats?.lastNoteSent)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Company Credits Used</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.companyCreditsUsed || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Credit Management Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Credit Management
              </h3>
              
              <div className="space-y-4">
                {/* Current Balance Display */}
                <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700 mb-1">Current Credit Balance</p>
                        <p className="text-3xl font-bold text-indigo-900">{member?.credits || 0}</p>
                      </div>
                      <div className="p-3 bg-indigo-200 rounded-lg">
                        <DollarSign className="w-8 h-8 text-indigo-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Allocate Credits */}
                <div className="space-y-2">
                  <Label htmlFor="credits-amount">Allocate Credits to {member?.name}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="credits-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={creditsToAllocate}
                      onChange={(e) => setCreditsToAllocate(e.target.value)}
                      min="1"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAllocateCredits}
                      disabled={allocating || !creditsToAllocate}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {allocating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Allocating...
                        </>
                      ) : (
                        'Allocate'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Credits will be added to this member's company-allocated balance
                  </p>
                </div>

                {/* Pool Access Toggle */}
                <Card className={`transition-colors ${poolAccess ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${poolAccess ? 'bg-green-200' : 'bg-gray-200'}`}>
                          <Zap className={`w-5 h-5 ${poolAccess ? 'text-green-700' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Company Credit Pool Access</p>
                          <p className="text-sm text-gray-600">
                            {poolAccess 
                              ? 'Can draw from company pool when allocated credits run out' 
                              : 'Can only use allocated and personal credits'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleTogglePoolAccess}
                        disabled={updatingPoolAccess}
                        className={`w-16 h-10 transition-colors ${
                          poolAccess 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      >
                        {updatingPoolAccess ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : poolAccess ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Recent Notes Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Recent Notes Sent ({recentNotes.length})
              </h3>
              
              {recentNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Send className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No notes sent yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentNotes.map((note) => (
                    <Card key={note.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-gray-900">{note.recipientName}</p>
                              <Badge variant="outline" className="text-xs">
                                {note.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{note.message}</p>
                            {note.outcomeDetails && (
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs font-semibold text-blue-900 mb-1">Rep Notes:</p>
                                <p className="text-xs text-blue-800">{note.outcomeDetails}</p>
                              </div>
                            )}
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <p>{formatDate(note.sentDate || note.createdAt)}</p>
                            {note.outcome && (
                              <Badge className="mt-1 text-xs" variant="secondary">
                                {note.outcome.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}