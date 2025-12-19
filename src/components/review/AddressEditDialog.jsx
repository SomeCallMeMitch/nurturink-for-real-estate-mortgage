import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * AddressEditDialog
 * 
 * Reusable dialog for editing Company or Rep return addresses.
 * Consolidates the duplicate dialog code from ReviewAndSend.jsx
 * 
 * @param {boolean} open - Whether dialog is open
 * @param {function} onOpenChange - Callback when open state changes
 * @param {string} type - "company" or "rep"
 * @param {object} initialAddress - Initial address values
 * @param {function} onSave - Callback when save is clicked, receives address object
 * @param {boolean} saving - Whether save is in progress
 * @param {string} userName - User's name (for rep dialog title)
 */
export function AddressEditDialog({
  open,
  onOpenChange,
  type = "company",
  initialAddress = {},
  onSave,
  saving = false,
  userName = ""
}) {
  const [address, setAddress] = useState({
    companyName: '',
    returnAddressName: '',
    street: '',
    address2: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Reset form when dialog opens with new initial values
  useEffect(() => {
    if (open && initialAddress) {
      setAddress({
        companyName: initialAddress.companyName || '',
        returnAddressName: initialAddress.returnAddressName || initialAddress.full_name || '',
        street: initialAddress.street || '',
        address2: initialAddress.address2 || '',
        city: initialAddress.city || '',
        state: initialAddress.state || '',
        zipCode: initialAddress.zipCode || initialAddress.zip || ''
      });
    }
  }, [open, initialAddress]);

  const handleChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(address);
  };

  const isValid = address.street && address.city && address.state && address.zipCode;

  const isCompany = type === "company";
  const title = isCompany ? "Edit Company Return Address" : "Edit Your Return Address";
  const description = isCompany 
    ? "This address will be used when \"Company\" is selected as the return address"
    : "This address will be used when \"Rep\" is selected as the return address";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name field - different label for company vs rep */}
          <div>
            <Label htmlFor={`${type}-name-edit`}>
              {isCompany ? "Company Name" : "Name *"}
            </Label>
            <Input
              id={`${type}-name-edit`}
              value={isCompany ? address.companyName : address.returnAddressName}
              onChange={(e) => handleChange(
                isCompany ? 'companyName' : 'returnAddressName',
                e.target.value
              )}
              placeholder={isCompany ? "Acme Corporation" : "John Smith"}
            />
          </div>

          <div>
            <Label htmlFor={`${type}-street-edit`}>Street Address *</Label>
            <Input
              id={`${type}-street-edit`}
              value={address.street}
              onChange={(e) => handleChange('street', e.target.value)}
              placeholder={isCompany ? "123 Business Ave" : "123 Main Street"}
            />
          </div>

          <div>
            <Label htmlFor={`${type}-address2-edit`}>Address Line 2</Label>
            <Input
              id={`${type}-address2-edit`}
              value={address.address2}
              onChange={(e) => handleChange('address2', e.target.value)}
              placeholder={isCompany ? "Suite 100" : "Apt 4B"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`${type}-city-edit`}>City *</Label>
              <Input
                id={`${type}-city-edit`}
                value={address.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Denver"
              />
            </div>
            <div>
              <Label htmlFor={`${type}-state-edit`}>State *</Label>
              <Input
                id={`${type}-state-edit`}
                value={address.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="CO"
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`${type}-zip-edit`}>ZIP Code *</Label>
            <Input
              id={`${type}-zip-edit`}
              value={address.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="80202"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave}
              disabled={saving || !isValid}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Address'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddressEditDialog;