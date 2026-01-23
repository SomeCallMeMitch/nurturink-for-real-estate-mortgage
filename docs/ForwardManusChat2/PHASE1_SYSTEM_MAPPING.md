# Phase 1: System Mapping & Architecture

This document outlines the foundational structure of the NurturInk application, including its entities, functions, pages, and integrations. Its purpose is to provide a high-level overview of the system as it currently exists.

## 2. Entity Inventory

The following table lists all the entities defined in the `/entities/` directory, their purpose, and key fields.

| Entity | Purpose | Key Fields |
|---|---|---|
| `AutomationHistory` | Tracks the history of all automated card sends. | `automationRuleId`, `clientId`, `sentDate`, `status` |
| `AutomationRule` | Defines the rules for automated card sending based on triggers. | `triggerTypeId`, `templateId`, `daysBefore`, `daysAfter` |
| `CardDesign` | Stores information about available card designs. | `name`, `imageUrl`, `status` |
| `Client` | Stores client/contact information for automation and sending. | `name`, `email`, `street_address`, `city`, `state`, `zip_code`, `birthday` |
| `Invitation` | Manages invitations for new users to join an organization. | `email`, `organizationId`, `status` |
| `NoteStyleProfile` | Defines the writing style for handwritten notes. | `name`, `style_description`, `example_text` |
| `Template` | Stores templates for handwritten notes. | `name`, `content`, `category` |
| `TriggerType` | Defines the types of triggers for automations (e.g., birthday, new client). | `name`, `description` |

## 3. Function Inventory

The `/functions/` directory contains 92 TypeScript files, each representing a backend function. These can be broadly categorized as follows:

| Category | Count | Purpose | Example Functions |
|---|---|---|---|
| **Data Seeding** | 10 | Initializes the database with default or test data. | `seedInitialData`, `seedTemplates`, `seedTestData` |
| **Email Notifications** | 29 | Sends various transactional emails to users and admins. | `sendWelcomeEmail`, `sendOrderShippedEmail`, `sendPasswordResetEmail` |
| **ScribeNurture Integration** | 6 | Interacts with the ScribeNurture API for card creation and testing. | `submitBatchToScribe`, `scribeTestSuite`, `processMailingBatch` |
| **Credit Management** | 10 | Handles user credit allocation, purchasing, and validation. | `allocateCredits`, `checkCreditAvailability`, `createCheckoutSession`, `handleStripeWebhook` |
| **User & Team Management** | 9 | Manages user roles, invitations, and team structures. | `processInvitation`, `removeTeamMember`, `updateTeamMemberRole` |
| **Client & Automation** | 8 | Manages client data and automation rule processing. | `uploadClients`, `checkAndSendAutomatedCards`, `pauseAutomationRule` |
| **Core App Logic** | 13 | Contains miscellaneous business logic for the application. | `updateInstanceSettings`, `saveAsMyStyle`, `getCreateContentLayoutSettings` |
| **Migration & Testing** | 7 | Utility functions for data migration and testing integrations. | `migrateUserCredits`, `testResendConnection`, `scribeMinimalTest` |

## 4. Page/Workflow Inventory

The `/src/pages/` directory contains the React components for each page of the application. The key user workflows are as follows:

| Workflow | Pages Involved | Purpose |
|---|---|---|
| **Onboarding & Authentication** | `Landing.jsx`, `AcceptInvitation.jsx`, `Onboarding.jsx`, `Welcome.jsx` | Guides new users through account creation and setup. |
| **Core Application** | `Home.jsx`, `FindClients.jsx`, `CreateContent.jsx`, `ReviewAndSend.jsx` | The main user flow for creating and sending handwritten notes. |
| **Administration** | `AdminClients.jsx`, `AdminSends.jsx`, `AdminPricing.jsx`, `SuperAdminDashboard.jsx` | Provides administrative control over users, sends, and system settings. |
| **Settings** | `SettingsProfile.jsx`, `SettingsOrganization.jsx`, `SettingsWritingStyle.jsx` | Allows users to manage their personal and organizational settings. |
| **Mobile Experience** | `MobileHome.jsx`, `MobileClients.jsx`, `MobileSend.jsx` | Provides a simplified interface for sending notes from mobile devices. |

## 5. Integration Audit

The NurturInk application relies on several key external integrations:

| Integration | Purpose | Key Functions |
|---|---|---|
| **ScribeNurture** | The core integration for handwritten note production and mailing. | `submitBatchToScribe`, `scribeTestSuite`, `processMailingBatch` |
| **Resend** | Used for sending transactional emails and potentially for receiving inbound emails. | `sendTestEmail`, `processInboundEmail`, `testResendConnection` |
| **Stripe** | Handles payments for credit purchases. | `createCheckoutSession`, `handleStripeWebhook` |

## 6. Key Questions & Initial Observations

Based on the initial system mapping, here are the answers to the key questions for Phase 1.

### What are the 5 most critical workflows?

1.  **Manual Card Sending:** The end-to-end process of a user selecting a client, creating content, and sending a one-off card. This is the core value proposition of the application.
2.  **Automated Card Sending:** The background process that checks for triggers (like birthdays or renewal dates) and automatically sends cards based on predefined rules.
3.  **Client Management:** The ability for users to add, edit, and import clients, as they are the recipients of all communications.
4.  **Credit Purchase and Management:** The workflow for users to purchase credits via Stripe and for the system to track and allocate those credits.
5.  **User Onboarding and Team Management:** The process of inviting new users to the platform and managing their roles and permissions within an organization.

### What entities are most frequently accessed?

Based on their roles in the critical workflows, the following entities are likely the most frequently accessed:

*   **`Client`**: This entity is central to nearly every action, from manual sending to automation.
*   **`User`**: Accessed for authentication, permissions, and tracking ownership of created items.
*   **`AutomationRule`**: Constantly queried by the automation engine to determine which cards to send.
*   **`Template`**: Read frequently during the card creation process.
*   **`AutomationHistory`**: Written to every time an automated card is sent, making it a high-traffic write entity.

### Where are the main integration points?

The primary integration points with external services are concentrated in the backend functions:

*   **ScribeNurture (Card Production):** All interactions are funneled through a few key functions, primarily `submitBatchToScribe`, `processMailingBatch`, and several testing-related functions (`scribeTestSuite`, `scribeMinimalTest`).
*   **Stripe (Payments):** Payment processing is handled by `createCheckoutSession` (to initiate a purchase) and `handleStripeWebhook` (to process the payment confirmation from Stripe).
*   **Resend (Email):** A large number of functions (`sendWelcomeEmail`, `sendOrderShippedEmail`, etc.) use the Resend API to send transactional emails. The `processInboundEmail` function is designed to handle incoming emails via Resend webhooks.

### Are there any obvious gaps in functionality?

While a deeper analysis is required in later phases, some initial potential gaps are apparent from the file structure:

*   **Centralized Dashboard:** There does not appear to be a single, user-facing dashboard that provides an at-a-glance summary of key metrics like credits remaining, recent activity, or upcoming automated sends. `Home.jsx` may serve this role, but its functionality is not immediately clear from its name alone.
*   **Bulk Management:** The system has pages for managing lists (like clients and sends), but it's unclear if there is functionality for bulk actions, such as bulk-editing clients, bulk-pausing automations, or bulk-approving sends.
*   **Detailed Analytics:** The audit prompt specifically calls out a lack of reporting and analytics. The current file structure does not show any dedicated pages or components for detailed reporting beyond simple lists of sends or clients.
