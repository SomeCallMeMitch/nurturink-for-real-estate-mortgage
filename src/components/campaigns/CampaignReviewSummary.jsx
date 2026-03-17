import React from 'react';
import { Cake, Gift, RefreshCw, Users, UserPlus, ShieldCheck, ShieldOff, Clock, AlertTriangle, Building2, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * CampaignReviewSummary Component
 * Step 5 of Campaign Setup Wizard - Review and finalize
 * 
 * @param {Object} campaignData - Campaign configuration: { type, enrollmentMode, requiresApproval, returnAddressMode, steps }
 * @param {string} campaignName - Current campaign name
 * @param {Function} onNameChange - Callback when name changes: (name: string) => void
 * @param {number} eligibleClientCount - Number of eligible clients
 * @param {Array} designs - Array of CardDesign objects (for displaying step designs)
 * @param {Array} templates - Array of Template objects (for displaying step templates)
 * @param {number} currentCredits - User's current credit balance (optional, for warning)
 */

const CAMPAIGN_TYPE_CONFIG = {
  birthday: { label: 'Birthday', icon: Cake, color: 'bg-pink-100 text-pink-700' },
  welcome: { label: 'Welcome', icon: Gift, color: 'bg-blue-100 text-blue-700' },
  renewal: { label: 'Renewal', icon: RefreshCw, color: 'bg-green-100 text-green-700' }
};

const RETURN_ADDRESS_CONFIG = {
  company: { label: 'Company', icon: Building2, color: 'bg-blue-100 text-blue-700' },
  rep: { label: 'Sales Rep', icon: User, color: 'bg-purple-100 text-purple-700' },
  none: { label: 'None', icon: X, color: 'bg-gray-100 text-gray-700' }
};

export default function CampaignReviewSummary({
  campaignData,
  campaignName,
  onNameChange,
  eligibleClientCount,
  designs = [],
  templates = [],
  currentCredits,
  campaignTypeRecord // Sprint 3 Step 08: CampaignType entity record (canonical source)
}) {
  // Sprint 3 Step 09: Use campaignTypeRecord name if available, fall back to hardcoded config
  const typeConfig = CAMPAIGN_TYPE_CONFIG[campaignData.type] || {
    label: campaignTypeRecord?.name || campaignData.type || 'Campaign',
    icon: Cake,
    color: 'bg-gray-100 text-gray-700'
  };
  const TypeIcon = typeConfig.icon;

  const returnConfig = RETURN_ADDRESS_CONFIG[campaignData.returnAddressMode] || RETURN_ADDRESS_CONFIG.company;
  const ReturnIcon = returnConfig.icon;

  // Get design by ID
  const getDesign = (designId) => designs.find(d => d.id === designId);
  
  // Get template by ID
  const getTemplate = (templateId) => templates.find(t => t.id === templateId);

  // Calculate estimated monthly credits
  const estimatedMonthlyCredits = (() => {
    if (campaignData.enrollmentMode === 'opt_in') {
      return 0; // Manual enrollment, can't estimate
    }
    const stepsCount = campaignData.steps?.length || 1;
    // Sprint 3 Step 09: Use triggerMode from CampaignType record to determine factor
    const isRecurring = campaignTypeRecord ? campaignTypeRecord.triggerMode === 'recurring' : (campaignData.type !== 'welcome');
    const monthlyFactor = isRecurring ? (1 / 12) : 0.2;
    return Math.ceil(eligibleClientCount * stepsCount * monthlyFactor);
  })();

  // Check if credits are low
  const isLowCredits = currentCredits !== undefined && estimatedMonthlyCredits > currentCredits;

  // Sprint 3 Step 09: Data-driven timing description from CampaignType record
  const formatTiming = (step, index) => {
    const days = Math.abs(step.timingDays || 0);
    if (campaignTypeRecord) {
      const direction = campaignTypeRecord.timingDirection || 'before';
      if (campaignTypeRecord.timingLabel) {
        return `${days} ${campaignTypeRecord.timingLabel}`;
      }
      const dateName = campaignTypeRecord.name?.toLowerCase() || 'trigger';
      if (days === 0 && direction === 'after') return 'Immediately';
      return `${days} days ${direction} ${dateName} date`;
    }
    // Legacy fallback for campaigns without a campaignTypeRecord
    if (campaignData.type === 'birthday') {
      return `${days} days before birthday`;
    } else if (campaignData.type === 'renewal') {
      return `${days} days before renewal`;
    } else if (campaignData.type === 'welcome') {
      if (index === 0) {
        return days === 0 ? 'Immediately' : `${days} days after start`;
      }
      return `${days} days after previous card`;
    }
    return `${days} days`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">Review Your Campaign</h2>
        <p className="text-muted-foreground mt-2">
          Confirm your settings and give your campaign a name
        </p>
      </div>

      {/* Campaign Name Input */}
      <div className="space-y-2">
        <Label htmlFor="campaign-name" className="text-base font-semibold">
          Campaign Name
        </Label>
        <Input
          id="campaign-name"
          value={campaignName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={`My ${typeConfig.label} Campaign`}
          className="text-lg"
        />
        <p className="text-sm text-muted-foreground">
          Choose a name that helps you identify this campaign
        </p>
      </div>

      {/* Summary Cards - now 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Campaign Type */}
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${typeConfig.color}`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Type</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{typeConfig.label}</p>
        </div>

        {/* Enrollment Mode */}
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              campaignData.enrollmentMode === 'opt_out' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {campaignData.enrollmentMode === 'opt_out' ? (
                <Users className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
            </div>
            <span className="text-sm font-medium text-muted-foreground">Enrollment</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {campaignData.enrollmentMode === 'opt_out' 
              ? `${eligibleClientCount} clients`
              : 'Manual'
            }
          </p>
        </div>

        {/* Approval Setting */}
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              campaignData.requiresApproval 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {campaignData.requiresApproval ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <ShieldOff className="w-5 h-5" />
              )}
            </div>
            <span className="text-sm font-medium text-muted-foreground">Approval</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {campaignData.requiresApproval ? 'Required' : 'Not required'}
          </p>
        </div>

        {/* Return Address - NEW */}
        <div className="bg-muted/50 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${returnConfig.color}`}>
              <ReturnIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Return Addr</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{returnConfig.label}</p>
        </div>
      </div>

      {/* Card Steps */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">Cards in Sequence</h3>
        <div className="space-y-3">
          {(campaignData.steps || []).map((step, index) => {
            const design = getDesign(step.cardDesignId);
            const template = getTemplate(step.templateId);
            const messagePreview = step.messageText || template?.content || 'No message';

            return (
              <div 
                key={step.stepOrder || index} 
                className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg"
              >
                {/* Step Number */}
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>

                {/* Card Design Thumbnail */}
                <div className="flex-shrink-0">
                  {design ? (
                    <img
                      src={design.frontImageUrl || design.outsideImageUrl || design.imageUrl}
                      alt={design.name}
                      className="w-16 h-12 object-cover rounded border border-border"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-muted rounded border border-border flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No design</span>
                    </div>
                  )}
                </div>

                {/* Step Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {formatTiming(step, index)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {messagePreview.substring(0, 100)}
                    {messagePreview.length > 100 ? '...' : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estimated Credits - FIX15+16: Show monthly AND annual, always visible */}
      <div className="bg-muted/50 rounded-xl p-5 border border-border">
        <h3 className="text-base font-semibold text-foreground mb-3">Estimated Credit Usage</h3>
        <div className="flex items-end gap-6">
          <div>
            <p className="text-2xl font-bold text-primary">
              ~{estimatedMonthlyCredits}
            </p>
            <p className="text-sm text-muted-foreground">credits / month</p>
          </div>
          {/* Sprint 3 Step 09: Show annual estimate for recurring campaign types */}
        {(campaignTypeRecord ? campaignTypeRecord.triggerMode === 'recurring' : campaignData.type !== 'welcome') && (
            <div>
              <p className="text-2xl font-bold text-foreground">
                ~{estimatedMonthlyCredits * 12}
              </p>
              <p className="text-sm text-muted-foreground">credits / year</p>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Based on {eligibleClientCount} enrolled client{eligibleClientCount !== 1 ? 's' : ''} &times; {campaignData.steps?.length || 1} card{(campaignData.steps?.length || 1) > 1 ? 's' : ''} per sequence.
          {campaignData.enrollmentMode === 'opt_in' ? ' Actual usage depends on manual enrollments.' : ''}
        </p>
        {currentCredits !== undefined && (
          <p className="text-xs mt-1 font-medium" style={{ color: isLowCredits ? 'var(--destructive)' : 'var(--muted-foreground)' }}>
            Your current balance: {currentCredits} credit{currentCredits !== 1 ? 's' : ''}
            {isLowCredits ? ' — this may not cover the first month.' : ''}
          </p>
        )}
      </div>

      {/* Low Credits Warning - FIX15: Only show when credits are actually low */}
      {isLowCredits && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your current credit balance ({currentCredits}) is below the estimated monthly usage of ~{estimatedMonthlyCredits} credits.
            Cards will be queued as &quot;insufficient credits&quot; until you top up.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}