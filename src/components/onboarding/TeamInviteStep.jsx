import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, UserPlus, ArrowLeft, Users } from 'lucide-react';
import ContextPanel from './ContextPanel';

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
    /* Phase 2: Two-column layout with ContextPanel + Back button in footer */
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

      {/* Step form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Invite Your Team (Optional)</CardTitle>
            <CardDescription>Add team members now, or do it later from your settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="p-4 border rounded-md space-y-4">
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
              <Button onClick={handleAddInvite} className="w-full" disabled={!currentInvite.email || !currentInvite.firstName}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
              </Button>
            </div>

            {invites.length > 0 && (
              <div className="space-y-2">
                <Label>Pending Invitations</Label>
                <ul className="space-y-2">
                  {invites.map((invite, index) => (
                    <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                      <div>
                        <p className="font-semibold">{invite.firstName} ({invite.email})</p>
                        <p className="text-sm text-gray-500">{invite.role === 'sales_rep' ? 'Member' : 'Admin'}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveInvite(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Phase 2: Footer with Back + Skip + Complete */}
            <div className="flex items-center gap-4 pt-4">
              {onBack && (
                <Button variant="outline" onClick={onBack} className="gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              )}
              <Button variant="outline" className="flex-1" onClick={onSkip}>Skip for Now</Button>
              <Button className="flex-1" onClick={() => onComplete(invites)}>Complete Setup</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}