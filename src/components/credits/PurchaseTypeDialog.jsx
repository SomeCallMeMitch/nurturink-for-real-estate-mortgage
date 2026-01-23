import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Building2, User, Loader2 } from "lucide-react";

/**
 * PurchaseTypeDialog - Allows org owners/managers to choose where purchased credits go
 * 
 * Props:
 * - open: boolean - Controls dialog visibility
 * - onOpenChange: (open: boolean) => void - Called when dialog open state changes
 * - onConfirm: (purchaseType: 'company' | 'personal') => void - Called when user confirms selection
 * - loading: boolean - Shows loading state on confirm button
 * - tierName: string - Name of the pricing tier being purchased (for display)
 * - creditAmount: number - Number of credits being purchased (for display)
 */
export function PurchaseTypeDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  loading = false,
  tierName = "Credits",
  creditAmount = 0
}) {
  const [purchaseType, setPurchaseType] = useState("company");

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(purchaseType);
    }
  };

  const handleCancel = () => {
    setPurchaseType("company"); // Reset to default
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Where should these credits go?</DialogTitle>
          <DialogDescription>
            You're purchasing <strong>{creditAmount} credits</strong> ({tierName}). 
            Choose whether to add them to your company pool or your personal balance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup 
            value={purchaseType} 
            onValueChange={setPurchaseType}
            className="grid gap-4"
          >
            {/* Company Pool Option */}
            <div className="relative">
              <RadioGroupItem 
                value="company" 
                id="company" 
                className="peer sr-only" 
              />
              <Label
                htmlFor="company"
                className="flex items-start gap-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Building2 className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Company Pool
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Credits will be added to your organization's shared pool. 
                    All team members with pool access can use these credits.
                  </p>
                </div>
              </Label>
            </div>

            {/* Personal Balance Option */}
            <div className="relative">
              <RadioGroupItem 
                value="personal" 
                id="personal" 
                className="peer sr-only" 
              />
              <Label
                htmlFor="personal"
                className="flex items-start gap-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <User className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Personal Balance
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Credits will be added to your personal balance. 
                    Only you can use these credits, separate from company business.
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue to Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PurchaseTypeDialog;
