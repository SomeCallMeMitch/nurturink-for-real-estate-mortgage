import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, ArrowRight } from "lucide-react";

/**
 * Modal shown when user tries to send notes but doesn't have enough credits
 * 
 * @param {boolean} open - Whether modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {object} creditInfo - Credit availability information
 * @param {number} creditInfo.creditsNeeded - Number of credits needed
 * @param {number} creditInfo.totalAvailable - Total credits available
 * @param {number} creditInfo.companyPoolCredits - Credits in company pool
 * @param {number} creditInfo.personalCredits - Personal credits
 * @param {number} creditInfo.deficit - Number of additional credits needed
 */
export default function NotEnoughCreditsModal({ open, onClose, creditInfo }) {
  const navigate = useNavigate();
  
  const handlePurchaseCredits = () => {
    onClose();
    navigate(createPageUrl('Credits'));
  };
  
  const {
    creditsNeeded = 0,
    totalAvailable = 0,
    companyPoolCredits = 0,
    personalCredits = 0,
    deficit = 0
  } = creditInfo || {};
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-50 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-2xl">Not Enough Credits</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            You don't have enough credits to complete this action.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Credit Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Credits Needed:</span>
              <span className="text-lg font-bold text-gray-900">{creditsNeeded}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Company Pool:</span>
                <span className="font-semibold text-gray-900">{companyPoolCredits}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Personal Balance:</span>
                <span className="font-semibold text-gray-900">{personalCredits}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Available:</span>
                <span className="text-lg font-bold text-gray-900">{totalAvailable}</span>
              </div>
            </div>
          </div>
          
          {/* Deficit Alert */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-800">
              <span className="font-semibold">You need {deficit} more credit{deficit === 1 ? '' : 's'}</span> to complete this action.
            </p>
          </div>
          
          {/* Help Text */}
          <p className="text-sm text-gray-600">
            Purchase more credits to continue sending handwritten notes to your clients.
          </p>
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePurchaseCredits}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Purchase Credits
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}