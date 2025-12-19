import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Send, Loader2 } from "lucide-react";

/**
 * CreditStatusBanner
 * 
 * Displays credit status as either an error banner (insufficient credits)
 * or a success banner (ready to send). Used in ReviewAndSend page.
 * 
 * @param {object} creditCheckResult - Result from credit check: { available, creditsNeeded, totalAvailable }
 * @param {object} creditSummary - Summary of credits: { sufficient, total, companyCredits, personalCredits, hasCompanyPool }
 * @param {number} clientCount - Number of clients/recipients
 * @param {function} onPurchaseCredits - Callback to navigate to credits page
 * @param {function} onRefresh - Callback to refresh credit balance
 * @param {boolean} checking - Whether credit check is in progress
 */
export function CreditStatusBanner({
  creditCheckResult,
  creditSummary,
  clientCount,
  onPurchaseCredits,
  onRefresh,
  checking = false
}) {
  const recipientText = clientCount === 1 ? 'recipient' : 'recipients';

  // Show insufficient credits warning
  if (creditCheckResult && !creditCheckResult.available) {
    return (
      <Card className="mb-6 border-red-300 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Insufficient Credits</h3>
              <p className="text-sm text-red-800 mb-3">
                You need {creditCheckResult.creditsNeeded} credits to send to {clientCount} {recipientText}, 
                but you only have {creditCheckResult.totalAvailable} credits available.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={onPurchaseCredits}
                  size="sm"
                  className="bg-destructive hover:bg-red-700"
                >
                  Purchase Credits
                </Button>
                <Button
                  onClick={onRefresh}
                  size="sm"
                  variant="outline"
                  disabled={checking}
                >
                  {checking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Refresh Balance'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show success banner when sufficient credits
  if (creditSummary && creditSummary.sufficient) {
    return (
      <Card className="mb-6 border-green-300 bg-green-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900">
                  Ready to send to {clientCount} {recipientText}
                </p>
                <p className="text-xs text-green-700">
                  {creditSummary.hasCompanyPool ? (
                    <>
                      Using {Math.min(clientCount, creditSummary.companyCredits)} from company pool
                      {clientCount > creditSummary.companyCredits && 
                        ` + ${clientCount - creditSummary.companyCredits} personal credits`
                      }
                    </>
                  ) : (
                    `Using ${clientCount} of your ${creditSummary.personalCredits} personal credits`
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-700">
                {creditSummary.total - clientCount}
              </p>
              <p className="text-xs text-green-600">Credits remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Return null if no banner should be shown
  return null;
}

export default CreditStatusBanner;