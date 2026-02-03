import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  AlertTriangle, 
  Users, 
  CreditCard, 
  Send, 
  CalendarDays,
  UserPlus,
  Building,
  Trophy,
  Zap
} from 'lucide-react';
import ApprovalQueueWidget from '@/components/dashboard/ApprovalQueueWidget';
import CampaignActivityWidget from '@/components/dashboard/CampaignActivityWidget';
import UpcomingSendsWidget from '@/components/dashboard/UpcomingSendsWidget';
import { useCredits } from '@/components/context/CreditContext';
import moment from 'moment';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Global credit state from context
  const { totalCredits, creditBreakdown, loading: creditsLoading } = useCredits();
  
  // Local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [clientsCount, setClientsCount] = useState(0);
  const [notesSentAllTime, setNotesSentAllTime] = useState(0);
  const [notesSentThisMonth, setNotesSentThisMonth] = useState(0);
  const [recentSends, setRecentSends] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [cardDesignsMap, setCardDesignsMap] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        base44.auth.redirectToLogin();
        return;
      }

      setUser(currentUser);

      // Load organization if user has orgId
      let orgData = null;
      if (currentUser.orgId) {
        const orgList = await base44.entities.Organization.filter({ id: currentUser.orgId });
        if (orgList && orgList.length > 0) {
          orgData = orgList[0];
          setOrganization(orgData);
        }
      }

      // Fetch all card designs for thumbnails
      const designs = await base44.entities.CardDesign.list();
      const designsById = designs.reduce((acc, design) => {
        acc[design.id] = design;
        return acc;
      }, {});
      setCardDesignsMap(designsById);

      // Fetch clients count
      const clients = await base44.entities.Client.filter({ orgId: currentUser.orgId });
      setClientsCount(clients.length);

      // Fetch notes sent by this user (all time)
      const allNotes = await base44.entities.Note.filter({ senderUserId: currentUser.id });
      setNotesSentAllTime(allNotes.length);

      // Fetch notes sent this month
      const startOfMonth = moment().startOf('month').toISOString();
      const endOfMonth = moment().endOf('month').toISOString();
      const notesThisMonth = allNotes.filter(note => {
        const noteDate = moment(note.created_date);
        return noteDate.isSameOrAfter(startOfMonth) && noteDate.isSameOrBefore(endOfMonth);
      });
      setNotesSentThisMonth(notesThisMonth.length);

      // Fetch recent sends (last 10)
      const recentNotes = await base44.entities.Note.filter(
        { senderUserId: currentUser.id },
        '-created_date',
        10
      );

      // Fetch client details for recent sends
      if (recentNotes.length > 0) {
        const clientIds = [...new Set(recentNotes.map(note => note.clientId).filter(Boolean))];
        if (clientIds.length > 0) {
          const recentClients = await base44.entities.Client.filter({ id: { $in: clientIds } });
          const clientsById = recentClients.reduce((acc, client) => {
            acc[client.id] = client;
            return acc;
          }, {});
          
          setRecentSends(recentNotes.map(note => ({
            ...note,
            client: clientsById[note.clientId] || null
          })));
        } else {
          setRecentSends(recentNotes.map(note => ({ ...note, client: null })));
        }
      }

      // Fetch team stats for organization owners
      if (currentUser.appRole === 'organization_owner' && orgData) {
        const teamMembers = await base44.entities.User.filter({ orgId: currentUser.orgId });
        
        // For each team member, count their notes
        const teamStatsData = await Promise.all(
          teamMembers.map(async (member) => {
            const memberNotes = await base44.entities.Note.filter({ senderUserId: member.id });
            const memberNotesThisMonth = memberNotes.filter(note => {
              const noteDate = moment(note.created_date);
              return noteDate.isSameOrAfter(startOfMonth) && noteDate.isSameOrBefore(endOfMonth);
            });
            
            return {
              id: member.id,
              name: member.full_name || member.email,
              cardsSentAllTime: memberNotes.length,
              cardsSentThisMonth: memberNotesThisMonth.length,
            };
          })
        );

        // Sort by cards sent this month (descending)
        teamStatsData.sort((a, b) => b.cardsSentThisMonth - a.cardsSentThisMonth);
        setTeamStats(teamStatsData);
      }

    } catch (err) {
      console.error('Dashboard: Failed to load data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading || creditsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadDashboardData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.full_name || 'User'}
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Credits Available */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Available</CardTitle>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCredits}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Personal: {creditBreakdown?.personalPurchased || 0} | Pool: {creditBreakdown?.companyPool || 0}
              </p>
            </CardContent>
          </Card>

          {/* Total Recipients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{clientsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Clients in your database</p>
            </CardContent>
          </Card>

          {/* Cards Sent (All Time) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cards Sent (All Time)</CardTitle>
              <Send className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{notesSentAllTime}</div>
              <p className="text-xs text-muted-foreground mt-1">Total notes sent</p>
            </CardContent>
          </Card>

          {/* Cards Sent (This Month) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cards Sent (This Month)</CardTitle>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{notesSentThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">{moment().format('MMMM YYYY')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Widgets Row */}
        {user?.orgId && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Approval Queue Widget */}
            <ApprovalQueueWidget orgId={user.orgId} />
            
            {/* Upcoming Sends Widget */}
            <UpcomingSendsWidget orgId={user.orgId} />
            
            {/* Campaign Activity Widget - spans 1 column on this row */}
            <CampaignActivityWidget orgId={user.orgId} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button 
            onClick={() => navigate(createPageUrl('FindClients'))} 
            size="lg"
            className="h-14 text-lg gap-3"
          >
            <Send className="w-5 h-5" />
            Send a Card
          </Button>
          <Button 
            onClick={() => navigate(createPageUrl('AdminClients'))} 
            variant="outline"
            size="lg"
            className="h-14 text-lg gap-3"
          >
            <UserPlus className="w-5 h-5" />
            Add Recipients
          </Button>
        </div>

        {/* Account Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {organization ? (
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium text-foreground">{organization.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Account type: {organization.accountType === 'whitelabel_partner' ? 'Whitelabel Partner' : 'Company'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Personal account (Pay as you go)</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Sends Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Sends</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSends.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">#</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Recipient</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Address</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Template</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Design</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Sent Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentSends.map((note, index) => {
                      const design = cardDesignsMap[note.cardDesignId];
                      return (
                        <tr key={note.id} className="hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-muted-foreground">{index + 1}</td>
                          <td className="py-3 px-4 font-medium text-foreground">
                            {note.client?.fullName || note.recipientName || 'Unknown'}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">
                            {note.client ? (
                              <span>{note.client.street}, {note.client.city}, {note.client.state} {note.client.zipCode}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">
                            {note.templateName || 'Custom'}
                          </td>
                          <td className="py-3 px-4">
                            {design?.frontImageUrl ? (
                              <img
                                src={design.frontImageUrl}
                                alt={design.name || 'Card Design'}
                                className="w-16 h-auto object-contain rounded border border-border"
                              />
                            ) : design?.outsideImageUrl || design?.imageUrl ? (
                              <img
                                src={design.outsideImageUrl || design.imageUrl}
                                alt={design.name || 'Card Design'}
                                className="w-16 h-auto object-contain rounded border border-border"
                              />
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">
                            {moment(note.created_date).format('MMM D, YYYY')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No cards sent yet</p>
                <Button 
                  onClick={() => navigate(createPageUrl('FindClients'))} 
                  variant="outline" 
                  className="mt-4"
                >
                  Send Your First Card
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Stats (Organization Owners Only) */}
        {user?.appRole === 'organization_owner' && teamStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Team Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Rep Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Cards Sent (This Month)</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Cards Sent (All Time)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {teamStats.map((member, index) => (
                      <tr 
                        key={member.id} 
                        className={`hover:bg-muted/50 transition-colors ${member.id === user.id ? 'bg-primary/5' : ''}`}
                      >
                        <td className="py-3 px-4">
                          {index === 0 && <span className="text-amber-500 font-bold">🥇</span>}
                          {index === 1 && <span className="text-gray-400 font-bold">🥈</span>}
                          {index === 2 && <span className="text-amber-700 font-bold">🥉</span>}
                          {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {member.name}
                          {member.id === user.id && (
                            <span className="ml-2 text-xs text-primary">(You)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-foreground font-semibold">
                          {member.cardsSentThisMonth}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {member.cardsSentAllTime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}