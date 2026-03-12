import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, UserPlus, ArrowLeft, Users, PartyPopper } from 'lucide-react';
import ContextPanel from './ContextPanel';

/**
 * Phase 3: Added animated invite list items (enter/exit), orange accent CTA,
 * and a celebratory icon on the Complete button.
 */
export default function TeamInviteStep({ onComplete, onSkip, onBack }) {
  const [invites, setInvites] = useState([]);
  const [currentInvite, setCurrentInvite] = useState({ firstName: '', email: '', role: 'sales_rep' });

  const handleAddInvite = () => {
    if (currentInvite.email && currentInvite.firstName) {
      setInvites([...invites, currentInvite]);
      setCurrentInvite({ firstName: '', email: '', role: 'sales_rep' });
    }
  };

  const handleRemoveInvite = (index) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  return (
    <div className="flex gap-8 items-start">
      <ContextPanel
        icon={Users}
        heading="Team collaboration"
        bullets={[
          'Each member gets their own login & dashboard',
          'Assign clients to specific team members',
          'Track individual note-sending activity',
        ]}
        note="You can always invite more people from Team Settings."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-1 max-w-lg mx-auto"
      >
        <Card className="shadow-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl">Invite Your Team (Optional)</CardTitle>
            <CardDescription>Add team members now, or do it later from your settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="p-4 border rounded-lg bg-gray-50/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={currentInvite.firstName} onChange={(e) => setCurrentInvite({ ...currentInvite, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={currentInvite.email} onChange={(e) => setCurrentInvite({ ...currentInvite, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={currentInvite.role} onValueChange={(role) => setCurrentInvite({ ...currentInvite, role })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_rep">Member</SelectItem>
                    <SelectItem value="organization_owner">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={handleAddInvite}
                className="w-full gap-2"
                disabled={!currentInvite.email || !currentInvite.firstName}
                style={{
                  borderColor: (currentInvite.email && currentInvite.firstName) ? 'var(--onboarding-primary)' : undefined,
                  color: (currentInvite.email && currentInvite.firstName) ? 'var(--onboarding-primary)' : undefined,
                }}
              >
                <UserPlus className="h-4 w-4" /> Add Team Member
              </Button>
            </div>

            {/* Phase 3: Animated pending invitations list */}
            {invites.length > 0 && (
              <div className="space-y-2">
                <Label>Pending Invitations ({invites.length})</Label>
                <ul className="space-y-2">
                  <AnimatePresence>
                    {invites.map((invite, index) => (
                      <motion.li
                        key={invite.email}
                        className="flex items-center justify-between p-3 border rounded-lg bg-white"
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div>
                          <p className="font-semibold text-sm">{invite.firstName}</p>
                          <p className="text-xs text-gray-500">{invite.email} &middot; {invite.role === 'sales_rep' ? 'Member' : 'Admin'}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveInvite(index)} className="h-7 w-7">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            )}

            {/* Phase 3: Orange accent footer with celebratory Complete button */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              {onBack && (
                <Button variant="outline" onClick={onBack} className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              )}
              <Button variant="outline" className="flex-1" onClick={onSkip}>Skip for Now</Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => onComplete(invites)}
                style={{ backgroundColor: 'var(--onboarding-primary)', color: '#fff' }}
              >
                <PartyPopper className="w-4 h-4" /> Complete Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}