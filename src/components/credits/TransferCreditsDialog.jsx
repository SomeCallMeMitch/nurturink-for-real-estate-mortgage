import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export function TransferCreditsDialog({ 
  user, 
  onSuccess, 
  triggerButton 
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // ========== DIAGNOSTIC LOGGING ==========
  // Log the user object whenever it changes
  useEffect(() => {
    console.log('=== TransferCreditsDialog DEBUG ===');
    console.log('User prop received:', user);
    console.log('User ID:', user?.id);
    console.log('User email:', user?.email);
    console.log('personalPurchasedCredits:', user?.personalPurchasedCredits);
    console.log('companyAllocatedCredits:', user?.companyAllocatedCredits);
    console.log('creditBalance (legacy):', user?.creditBalance);
    console.log('All user keys:', user ? Object.keys(user) : 'user is null/undefined');
    console.log('=== END DEBUG ===');
  }, [user]);

  // Log when dialog opens
  useEffect(() => {
    if (open) {
      console.log('=== Dialog OPENED ===');
      console.log('Current user state:', user);
      console.log('maxCredits will be:', user?.personalPurchasedCredits || 0);
    }
  }, [open, user]);
  // ========== END DIAGNOSTIC LOGGING ==========

  const maxCredits = user?.personalPurchasedCredits || 0;

  const handleTransfer = async (e) => {
    e.preventDefault();
    const transferAmount = parseInt(amount, 10);

    // ========== DIAGNOSTIC LOGGING ==========
    console.log('=== Transfer SUBMITTED ===');
    console.log('Transfer amount entered:', amount);
    console.log('Parsed transfer amount:', transferAmount);
    console.log('maxCredits at submit time:', maxCredits);
    console.log('User object at submit time:', user);
    // ========== END DIAGNOSTIC LOGGING ==========

    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a positive whole number.",
        variant: "destructive",
      });
      return;
    }

    if (transferAmount > maxCredits) {
      toast({
        title: "Insufficient Credits",
        description: `You only have ${maxCredits} personal credits available.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // ========== DIAGNOSTIC LOGGING ==========
      console.log('=== Calling transferCreditsToPool function ===');
      console.log('Payload:', { amount: transferAmount });
      // ========== END DIAGNOSTIC LOGGING ==========

      const response = await base44.functions.invoke("transferCreditsToPool", {
        amount: transferAmount,
      });

      // ========== DIAGNOSTIC LOGGING ==========
      console.log('=== Function Response ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      // ========== END DIAGNOSTIC LOGGING ==========

      if (response.data.success) {
        toast({
          title: "Transfer Successful",
          description: `Moved ${transferAmount} credits to the company pool.`,
          className: "bg-green-50 border-green-200 text-green-900",
        });
        setOpen(false);
        setAmount("");
        if (onSuccess) onSuccess();
      } else {
        throw new Error(response.data.error || "Transfer failed");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      console.error("Error response:", error.response);
      toast({
        title: "Transfer Failed",
        description: error.response?.data?.error || error.message || "Could not transfer credits.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm" className="gap-2">
            Transfer to Pool <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transfer Credits to Organization</DialogTitle>
          <DialogDescription>
            Move credits from your personal balance to the shared organization pool. 
            These credits will be available for all team members to use.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleTransfer} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3">
              <Input
                id="amount"
                type="number"
                min="1"
                max={maxCredits}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="col-span-3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {maxCredits} credits (personalPurchasedCredits)
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={loading || maxCredits <= 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Transfer Credits
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}