import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone, Laptop } from 'lucide-react';

export default function MobileOnboardingModal({ onClose }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Welcome to NurturInk!</DialogTitle>
          <DialogDescription className="text-center pt-2">
            You're all set up! Here's a quick guide for using NurturInk on mobile.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex items-start gap-4">
                <Smartphone className="w-8 h-8 text-orange-600 mt-1" />
                <div>
                    <h3 className="font-semibold">On Mobile: Use QuickSend</h3>
                    <p className="text-sm text-gray-600">Quickly send pre-configured cards to your clients on the go. It's fast and easy.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <Laptop className="w-8 h-8 text-orange-600 mt-1" />
                <div>
                    <h3 className="font-semibold">On Desktop: Full Power</h3>
                    <p className="text-sm text-gray-600">For the best experience, use a desktop to manage clients, create new templates, and access all features.</p>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">Got It, Take Me to the App</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}