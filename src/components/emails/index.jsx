/**
 * NurturInk Email Templates Index
 * 
 * All email templates organized by category.
 * Each template exports both a React component (for HTML rendering)
 * and a plain text version function.
 * 
 * Anti-Spam Best Practices Implemented:
 * - Clean HTML structure with proper meta tags
 * - Physical address in footer (CAN-SPAM compliance)
 * - Unsubscribe links where appropriate
 * - Clear sender identification (NurturInk branding)
 * - Preheader text for better inbox preview
 * - Text-to-image ratio optimized (mostly text)
 * - No misleading subject lines
 * - Consistent From address (use verified domain)
 */

// Shared Components
export { default as EmailWrapper, BRAND_COLORS, buttonStyles } from './shared/EmailWrapper';
export { default as EmailHeader, emailHeaderPlainText } from './shared/EmailHeader';
export { default as EmailFooter, emailFooterPlainText } from './shared/EmailFooter';
export { default as EmailButton, EmailButtonGroup } from './shared/EmailButton';
export { InfoBox, ChecklistItem, ProgressStep, StatBox, Divider, textStyles } from './shared/EmailComponents';

// Welcome & Onboarding
export { default as WelcomeEmail, welcomeEmailPlainText } from './welcome/WelcomeEmail';
export { default as OnboardingCompleteEmail, onboardingCompleteEmailPlainText } from './welcome/OnboardingCompleteEmail';

// Team & Collaboration
export { default as TeamInvitationEmail, teamInvitationEmailPlainText } from './team/TeamInvitationEmail';
export { default as TeamJoinedEmail, teamJoinedEmailPlainText } from './team/TeamJoinedEmail';
export { default as RoleChangedEmail, roleChangedEmailPlainText } from './team/RoleChangedEmail';

// Note Status
export { default as NoteQueuedEmail, noteQueuedEmailPlainText } from './notes/NoteQueuedEmail';
export { default as NoteDeliveredEmail, noteDeliveredEmailPlainText } from './notes/NoteDeliveredEmail';
export { default as NoteFailedEmail, noteFailedEmailPlainText } from './notes/NoteFailedEmail';
export { default as BatchStartedEmail, batchStartedEmailPlainText } from './notes/BatchStartedEmail';
export { default as BatchCompletedEmail, batchCompletedEmailPlainText } from './notes/BatchCompletedEmail';

// Credit & Billing
export { default as LowCreditWarningEmail, lowCreditWarningEmailPlainText } from './credits/LowCreditWarningEmail';
export { default as CriticalCreditAlertEmail, criticalCreditAlertEmailPlainText } from './credits/CriticalCreditAlertEmail';
export { default as CreditsDepletedEmail, creditsDepletedEmailPlainText } from './credits/CreditsDepletedEmail';
export { default as CreditPurchaseReceiptEmail, creditPurchaseReceiptEmailPlainText } from './credits/CreditPurchaseReceiptEmail';
export { default as AutoRefillSuccessEmail, autoRefillSuccessEmailPlainText } from './credits/AutoRefillSuccessEmail';
export { default as AutoRefillFailedEmail, autoRefillFailedEmailPlainText } from './credits/AutoRefillFailedEmail';

// Authentication & Security
export { default as PasswordResetEmail, passwordResetEmailPlainText } from './auth/PasswordResetEmail';
export { default as EmailVerificationEmail, emailVerificationEmailPlainText } from './auth/EmailVerificationEmail';
export { default as AccountSettingsChangedEmail, accountSettingsChangedEmailPlainText } from './auth/AccountSettingsChangedEmail';

// Engagement & Retention
export { default as FirstNoteSentEmail, firstNoteSentEmailPlainText } from './engagement/FirstNoteSentEmail';
export { default as MilestoneEmail, milestoneEmailPlainText } from './engagement/MilestoneEmail';
export { default as MonthlyUsageSummaryEmail, monthlyUsageSummaryEmailPlainText } from './engagement/MonthlyUsageSummaryEmail';
export { default as InactiveUserEmail, inactiveUserEmailPlainText } from './engagement/InactiveUserEmail';
export { default as AnniversaryEmail, anniversaryEmailPlainText } from './engagement/AnniversaryEmail';

// Support
export { default as SupportRequestReceivedEmail, supportRequestReceivedEmailPlainText } from './support/SupportRequestReceivedEmail';
export { default as SupportRequestResolvedEmail, supportRequestResolvedEmailPlainText } from './support/SupportRequestResolvedEmail';

/**
 * Email Subject Line Templates
 * Use these with the corresponding email component
 */
export const EMAIL_SUBJECTS = {
  // Welcome & Onboarding
  welcome: 'Welcome to NurturInk - Let\'s Make Meaningful Connections',
  onboardingComplete: 'You\'re All Set! Time to Send Your First Note',
  
  // Team
  teamInvitation: (inviterName, orgName) => `${inviterName} invited you to join ${orgName} on NurturInk`,
  teamJoined: (orgName) => `Welcome to ${orgName}'s NurturInk Team!`,
  roleChanged: (orgName) => `Your role in ${orgName} has been updated`,
  
  // Notes
  noteQueued: (clientName) => `Your note to ${clientName} is on its way`,
  noteDelivered: (clientName) => `Your note to ${clientName} was delivered`,
  noteFailed: (clientName) => `Action Required: Issue with note to ${clientName}`,
  batchStarted: (count) => `Your batch mailing of ${count} notes has started`,
  batchCompleted: (count) => `Your batch of ${count} notes is complete`,
  
  // Credits
  lowCreditWarning: (balance) => `Running Low: Only ${balance} credits remaining`,
  criticalCreditAlert: (balance) => `Almost Out: ${balance} credits left`,
  creditsDepleted: 'No Credits Remaining - Refill to Continue',
  creditPurchaseReceipt: (credits) => `Receipt: ${credits} credits added to your account`,
  autoRefillSuccess: (credits) => `Auto-refill successful: ${credits} credits added`,
  autoRefillFailed: 'Auto-refill failed - Action required',
  
  // Auth
  passwordReset: 'Reset your NurturInk password',
  emailVerification: 'Verify your email for NurturInk',
  accountSettingsChanged: 'Your NurturInk account settings were updated',
  
  // Engagement
  firstNoteSent: 'You sent your first note!',
  milestone: (count) => `Milestone reached: ${count} notes sent!`,
  monthlyUsageSummary: (monthYear) => `Your NurturInk monthly report - ${monthYear}`,
  inactiveUser: 'We miss you! Here\'s what\'s new at NurturInk',
  anniversary: (years) => `Happy Anniversary! ${years === 1 ? 'One year' : `${years} years`} with NurturInk`,
  
  // Support
  supportRequestReceived: (ticketNumber) => `We received your message - Ticket #${ticketNumber}`,
  supportRequestResolved: (ticketNumber) => `Resolved: Ticket #${ticketNumber}`,
};