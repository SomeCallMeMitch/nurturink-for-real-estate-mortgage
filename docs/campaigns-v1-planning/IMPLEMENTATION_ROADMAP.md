# NurturInk Automated Campaigns V1 - Implementation Roadmap

**Version:** 1.0  
**Date:** January 26, 2026  
**Estimated Timeline:** 6-7 weeks  
**Target:** Insurance agents (NYL office pilot)

---

## Overview

This roadmap breaks down the Automated Campaigns V1 implementation into 6 phases, each with clear deliverables and acceptance criteria. The phases are designed to build incrementally, allowing for testing and validation at each stage.

---

## Phase Summary

| Phase | Focus | Duration | Deliverable |
|-------|-------|----------|-------------|
| **Phase 1** | Foundation | 1-2 weeks | Data model in place, basic CRUD working |
| **Phase 2** | Campaign Setup UI | 1-2 weeks | User can create campaigns through wizard |
| **Phase 3** | Enrollment Management | 1 week | User can manage who's in each campaign |
| **Phase 4** | Automation Engine | 2-3 weeks | Cards send automatically |
| **Phase 5** | Polish & Notifications | 1 week | User knows what's happening |
| **Phase 6** | Testing & Launch | 1 week | Ready for NYL pilot |

**Total:** 7-10 weeks

---

## Phase 1: Foundation (Week 1-2)

### Goal
Data model in place, basic campaign CRUD working, clients have date fields.

### Tasks

#### 1.1 Update Client Entity
**File:** `entities/Client.json`

**Action:** Add `policy_start_date` field

```json
{
  "policy_start_date": {
    "type": "string",
    "format": "date",
    "description": "Client's policy start date (YYYY-MM-DD) for welcome automation",
    "required": false
  }
}
```

**Acceptance:**
- Field appears in B44 entity schema
- Existing clients work without this field (nullable)

---

#### 1.2 Create Campaign Entity
**File:** `entities/Campaign.json`

**Action:** Create new entity (see Technical Spec for full schema)

**Key Fields:**
- `orgId`, `createdBy`, `name`, `type`, `status`
- `enrollmentMode`, `triggerField`, `description`

**Acceptance:**
- Entity created in B44
- Can create Campaign records via B44 data tab

---

#### 1.3 Create CampaignStep Entity
**File:** `entities/CampaignStep.json`

**Action:** Create new entity (see Technical Spec for full schema)

**Key Fields:**
- `campaignId`, `stepOrder`, `cardDesignId`, `templateId`
- `messageText`, `timingDays`, `timingReference`, `isEnabled`

**Acceptance:**
- Entity created in B44
- Can create CampaignStep records linked to Campaign

---

#### 1.4 Create CampaignEnrollment Entity
**File:** `entities/CampaignEnrollment.json`

**Action:** Create new entity (see Technical Spec for full schema)

**Key Fields:**
- `campaignId`, `clientId`, `status`, `enrolledAt`
- `excludedAt`, `completedAt`, `lastSentDate`, `lastSentStep`

**Acceptance:**
- Entity created in B44
- Unique constraint: one enrollment per client per campaign

---

#### 1.5 Create ScheduledSend Entity
**File:** `entities/ScheduledSend.json`

**Action:** Create new entity (see Technical Spec for full schema)

**Key Fields:**
- `campaignId`, `campaignStepId`, `clientId`, `scheduledDate`
- `status`, `failureReason`, `queuedAt`, `sentAt`, `automationHistoryId`

**Acceptance:**
- Entity created in B44
- Unique constraint: campaignId + clientId + campaignStepId

---

#### 1.6 Create Backend Function: createCampaign
**File:** `functions/createCampaign.ts`

**Purpose:** Create a new campaign with steps

**Input:**
```typescript
{
  name: string,
  type: 'birthday' | 'welcome' | 'renewal',
  enrollmentMode: 'opt_in' | 'opt_out',
  steps: Array<{
    stepOrder: number,
    cardDesignId: string,
    templateId?: string,
    messageText?: string,
    timingDays: number,
    timingReference: 'trigger_date' | 'previous_step'
  }>
}
```

**Process:**
1. Validate user is org owner or manager
2. Create Campaign record (status: 'draft')
3. Create CampaignStep records for each step
4. If enrollmentMode = 'opt_out', auto-enroll eligible clients
5. Return campaign ID and enrolled count

**Acceptance:**
- Function creates Campaign + CampaignStep records
- Opt-out mode auto-enrolls clients with valid trigger dates
- Returns success response with campaignId

---

#### 1.7 Create Backend Function: getCampaignDetails
**File:** `functions/getCampaignDetails.ts`

**Purpose:** Get full campaign details with steps and enrollment

**Input:**
```typescript
{
  campaignId: string
}
```

**Output:**
```typescript
{
  campaign: Campaign,
  steps: CampaignStep[],
  enrolledCount: number,
  upcomingSends: ScheduledSend[] // next 30 days
}
```

**Acceptance:**
- Returns campaign with all related data
- Includes enrollment count
- Includes upcoming sends (next 30 days)

---

#### 1.8 Create Backend Function: updateCampaign
**File:** `functions/updateCampaign.ts`

**Purpose:** Update campaign configuration

**Input:**
```typescript
{
  campaignId: string,
  updates: {
    name?: string,
    status?: 'active' | 'paused' | 'draft',
    steps?: Array<...> // full step replacement
  }
}
```

**Process:**
1. Validate ownership
2. Update Campaign record
3. If steps changed:
   - Delete old CampaignStep records
   - Create new CampaignStep records
   - Delete pending ScheduledSend records
4. If status changed to 'active', trigger scheduler

**Acceptance:**
- Updates campaign successfully
- Step changes replace old steps
- Pending sends are rescheduled

---

#### 1.9 Create Backend Function: deleteCampaign
**File:** `functions/deleteCampaign.ts`

**Purpose:** Delete a campaign and all related data

**Process:**
1. Validate ownership
2. Delete all CampaignStep records
3. Delete all CampaignEnrollment records
4. Delete all pending ScheduledSend records
5. Delete Campaign record

**Acceptance:**
- Deletes campaign and all related data
- No orphaned records remain

---

#### 1.10 Update Client Import to Support Date Fields
**File:** Modify existing client import function

**Action:** Add support for `birthday`, `policy_start_date`, `renewal_date` columns in CSV

**Process:**
- Detect columns in CSV
- Validate date format (YYYY-MM-DD)
- Map to Client entity fields

**Acceptance:**
- CSV import works with new date fields
- Invalid dates show clear error messages

---

#### 1.11 Update Client Edit Form
**File:** Modify existing client edit page/component

**Action:** Add date input fields for:
- Birthday
- Policy Start Date
- Renewal Date

**Acceptance:**
- Date fields appear in client edit form
- Date picker UI works correctly
- Saves dates to Client entity

---

### Phase 1 Deliverables

✅ **Data Model Complete:**
- Campaign, CampaignStep, CampaignEnrollment, ScheduledSend entities exist
- Client entity has policy_start_date field

✅ **Basic CRUD Working:**
- Can create campaigns via backend function
- Can retrieve campaign details
- Can update/delete campaigns

✅ **Client Date Support:**
- Can import clients with date fields
- Can edit client dates in UI

### Phase 1 Testing

**Manual Tests:**
1. Create Campaign record via B44 function
2. Create CampaignStep records linked to campaign
3. Import CSV with birthday, policy_start_date, renewal_date
4. Edit client and add date fields
5. Retrieve campaign details via function

**Acceptance Criteria:**
- All entities created successfully
- CRUD functions work without errors
- Date fields save and load correctly

---

## Phase 2: Campaign Setup UI (Week 2-3)

### Goal
User can create and configure campaigns through the wizard UI.

### Tasks

#### 2.1 Create Campaigns List Page
**File:** `src/pages/Campaigns.jsx`

**Purpose:** Overview of all campaigns

**Features:**
- List all campaigns for organization
- Show: name, type icon, status badge, enrollment count, next send
- Filter by type and status
- Actions: Create New, Edit, Pause/Resume, Delete
- Click campaign to go to detail page

**Components:**
- `CampaignCard` - Individual campaign display
- `CampaignFilters` - Type and status filters
- `CreateCampaignButton` - Opens wizard

**Acceptance:**
- Page displays list of campaigns
- Filters work correctly
- Create button opens wizard
- Click campaign navigates to detail page

---

#### 2.2 Create Campaign Type Selector Component
**File:** `src/components/campaigns/CampaignTypeSelector.jsx`

**Purpose:** Step 1 of wizard - choose campaign type

**Features:**
- Three options: Birthday, Welcome, Renewal
- Visual cards with icons and descriptions
- Select button for each type

**Acceptance:**
- Displays three campaign type options
- Selection updates wizard state
- Proceeds to next step on selection

---

#### 2.3 Create Enrollment Mode Selector Component
**File:** `src/components/campaigns/EnrollmentModeSelector.jsx`

**Purpose:** Step 2 of wizard - choose enrollment mode

**Features:**
- Two options: Opt-Out (recommended), Opt-In
- Shows eligible client count for opt-out
- Clear descriptions of each mode

**Acceptance:**
- Displays two enrollment options
- Shows eligible client count
- Selection updates wizard state

---

#### 2.4 Create Card Configuration Form Component
**File:** `src/components/campaigns/CardConfigurationForm.jsx`

**Purpose:** Step 3 of wizard - configure card(s)

**Features:**
- For Birthday: Single card configuration
  - Timing selector (days before)
  - Card design picker (reuse existing)
  - Message template picker (reuse existing)
  - Preview
- For Welcome/Renewal: 1 or 2 card sequence
  - Card count selector
  - Per-card configuration (timing, design, message)
  - Preview for each card

**Reuse:**
- Card design picker from `SelectDesign.jsx`
- Message template picker from `Templates.jsx`
- Card preview from `ReviewAndSend.jsx`

**Acceptance:**
- Birthday: Single card configuration works
- Welcome/Renewal: 1 or 2 card configuration works
- Design and template pickers work
- Preview displays correctly

---

#### 2.5 Create Campaign Review Summary Component
**File:** `src/components/campaigns/CampaignReviewSummary.jsx`

**Purpose:** Step 4 of wizard - review before activation

**Features:**
- Campaign name input
- Summary of all configuration
- Upcoming sends preview (next 30 days)
- Estimated credit usage
- Credit balance check
- Save as Draft or Activate buttons

**Acceptance:**
- Displays complete configuration summary
- Shows upcoming sends accurately
- Shows credit estimate
- Warns if low credits
- Save/Activate buttons work

---

#### 2.6 Create Campaign Setup Wizard Page
**File:** `src/pages/CampaignSetupWizard.jsx`

**Purpose:** Multi-step wizard container

**Features:**
- Progress indicator (Step 1 of 4)
- Step navigation (Back/Next)
- State management for wizard data
- Calls `createCampaign` function on completion

**Components:**
- Uses all components from 2.2-2.5
- `WizardNavigation` - Back/Next buttons

**Acceptance:**
- Wizard flows through all 4 steps
- Back/Next navigation works
- State persists across steps
- Completion calls createCampaign function
- Success redirects to campaign detail page

---

#### 2.7 Add Campaigns to Navigation
**File:** `src/components/layout/AppSidebar.jsx` or `LeftSidebar.jsx`

**Action:** Add "Campaigns" menu item

**Placement:** Between "Team" and "Credits"

**Icon:** `Calendar` or `Zap` (from lucide-react)

**Acceptance:**
- Campaigns menu item appears in sidebar
- Clicking navigates to Campaigns list page
- Visible to owners and managers

---

### Phase 2 Deliverables

✅ **Campaigns List Page:**
- Displays all campaigns
- Filters and actions work

✅ **Campaign Setup Wizard:**
- 4-step wizard complete
- All campaign types supported
- Creates campaign successfully

✅ **Navigation:**
- Campaigns menu item in sidebar

### Phase 2 Testing

**Manual Tests:**
1. Navigate to Campaigns page
2. Click "Create Campaign"
3. Complete wizard for Birthday campaign (opt-out)
4. Complete wizard for Welcome campaign (2 cards, opt-in)
5. Complete wizard for Renewal campaign (1 card, opt-out)
6. Verify campaigns appear in list
7. Verify enrolled counts are correct

**Acceptance Criteria:**
- All 3 campaign types can be created
- Wizard is intuitive and error-free
- Campaigns display correctly in list

---

## Phase 3: Enrollment Management (Week 3-4)

### Goal
User can manage who's enrolled in each campaign.

### Tasks

#### 3.1 Create Backend Function: enrollClient
**File:** `functions/enrollClient.ts`

**Purpose:** Manually enroll a client in a campaign

**Input:**
```typescript
{
  campaignId: string,
  clientId: string
}
```

**Process:**
1. Validate campaign exists and is active
2. Check if client already enrolled
3. Create CampaignEnrollment record (status: 'enrolled')
4. Trigger scheduler to create ScheduledSend records

**Acceptance:**
- Creates enrollment record
- Prevents duplicate enrollments
- Triggers scheduling

---

#### 3.2 Create Backend Function: excludeClient
**File:** `functions/excludeClient.ts`

**Purpose:** Exclude a client from a campaign

**Input:**
```typescript
{
  campaignId: string,
  clientId: string
}
```

**Process:**
1. Find CampaignEnrollment record
2. Update status to 'excluded', set excludedAt
3. Delete any pending ScheduledSend records for this client/campaign

**Acceptance:**
- Updates enrollment status
- Deletes pending sends
- Client no longer receives cards

---

#### 3.3 Create Backend Function: bulkEnrollClients
**File:** `functions/bulkEnrollClients.ts`

**Purpose:** Enroll multiple clients at once

**Input:**
```typescript
{
  campaignId: string,
  clientIds: string[]
}
```

**Process:**
- Loop through clientIds, call enrollClient for each
- Return success/failure count

**Acceptance:**
- Enrolls multiple clients
- Returns count of successes/failures

---

#### 3.4 Create Backend Function: getEnrolledClients
**File:** `functions/getEnrolledClients.ts`

**Purpose:** Get list of enrolled clients for a campaign

**Input:**
```typescript
{
  campaignId: string,
  status?: 'enrolled' | 'excluded' | 'completed',
  search?: string,
  limit?: number,
  skip?: number
}
```

**Output:**
```typescript
{
  enrollments: Array<{
    enrollment: CampaignEnrollment,
    client: Client,
    nextSend?: ScheduledSend
  }>,
  total: number
}
```

**Acceptance:**
- Returns enrolled clients with pagination
- Search works on client name/email
- Status filter works
- Includes next send date

---

#### 3.5 Create Campaign Detail Page
**File:** `src/pages/CampaignDetail.jsx`

**Purpose:** Manage a specific campaign

**Features:**
- Campaign header (name, status, actions)
- Configuration summary
- Enrolled clients list (searchable, filterable)
- Add/exclude client actions
- Upcoming sends widget (next 30 days)
- Send history list

**Components:**
- `CampaignHeader` - Title, status, Edit/Pause/Delete buttons
- `CampaignConfigSummary` - Configuration display
- `EnrolledClientsList` - Searchable, filterable list
- `UpcomingSendsWidget` - Next 30 days preview
- `SendHistoryList` - Past sends

**Acceptance:**
- Page displays campaign details
- Enrolled clients list loads
- Search and filter work
- Add/exclude actions work
- Upcoming sends display correctly

---

#### 3.6 Create Enrolled Clients List Component
**File:** `src/components/campaigns/EnrolledClientsList.jsx`

**Purpose:** Display and manage enrolled clients

**Features:**
- Search by name/email
- Filter by status (enrolled/excluded/completed)
- Pagination (15 per page)
- Per-client actions: Exclude (if enrolled), Re-enroll (if excluded)
- Bulk actions: Exclude selected, Re-enroll selected
- Shows next send date per client

**Acceptance:**
- List displays enrolled clients
- Search works
- Filter works
- Pagination works
- Exclude/Re-enroll actions work

---

#### 3.7 Update Recipient List Page - Add Bulk Actions
**File:** Modify existing `AdminClients.jsx` or similar

**Action:** Add bulk actions for campaign enrollment

**Features:**
- Select multiple clients (checkboxes)
- Bulk action dropdown: "Add to Campaign"
- Modal to select campaign
- Calls bulkEnrollClients function

**Acceptance:**
- Can select multiple clients
- Bulk action opens campaign selector
- Enrolls selected clients in campaign

---

#### 3.8 Update Recipient Detail Page - Show Campaigns
**File:** Modify existing client detail page

**Action:** Add campaign enrollment section

**Features:**
- List campaigns client is enrolled in
- Show status (enrolled/excluded/completed)
- Show next send date
- Action to exclude from campaign

**Acceptance:**
- Displays client's campaigns
- Shows accurate status and next send
- Exclude action works

---

### Phase 3 Deliverables

✅ **Campaign Detail Page:**
- Displays campaign configuration
- Shows enrolled clients
- Add/exclude actions work

✅ **Enrollment Management:**
- Can enroll/exclude individual clients
- Can bulk enroll from recipient list
- Can view client's campaigns on client detail

### Phase 3 Testing

**Manual Tests:**
1. Open campaign detail page
2. Search for client in enrolled list
3. Exclude a client
4. Re-enroll an excluded client
5. Go to recipient list, select multiple, bulk add to campaign
6. Go to client detail, view campaigns, exclude from one

**Acceptance Criteria:**
- All enrollment actions work correctly
- Excluded clients don't receive cards
- Re-enrolled clients resume receiving cards

---

## Phase 4: Automation Engine (Week 4-6)

### Goal
Cards send automatically based on campaign configuration.

**⚠️ Most Complex Phase**

### Tasks

#### 4.1 Create Backend Function: scheduleCampaignSends
**File:** `functions/scheduleCampaignSends.ts`

**Purpose:** Create ScheduledSend records for a campaign (called by Daily Scheduler)

**Input:**
```typescript
{
  campaignId: string,
  lookAheadDays: number // default: 14
}
```

**Process:**
1. Load campaign and steps
2. Load enrolled clients (status: 'enrolled')
3. For each client:
   - Calculate trigger date from client's date field
   - For each step:
     - Calculate scheduled_date based on timingDays and timingReference
     - Check if scheduled_date is within lookAheadDays
     - Check if ScheduledSend already exists (prevent duplicates)
     - Create ScheduledSend record (status: 'pending')
4. Return count of scheduled sends created

**Date Calculation Logic:**

**Birthday:**
```typescript
// Get next birthday from today
const today = new Date();
const birthday = new Date(client.birthday);
let nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
if (nextBirthday < today) {
  nextBirthday = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
}
const scheduledDate = addDays(nextBirthday, step.timingDays); // timingDays is negative for "before"
```

**Renewal:**
```typescript
// Get next renewal from today
const today = new Date();
const renewal = new Date(client.renewal_date);
let nextRenewal = new Date(today.getFullYear(), renewal.getMonth(), renewal.getDate());
if (nextRenewal < today) {
  nextRenewal = new Date(today.getFullYear() + 1, renewal.getMonth(), renewal.getDate());
}
const scheduledDate = addDays(nextRenewal, step.timingDays); // timingDays is negative for "before"
```

**Welcome:**
```typescript
// For step 1: relative to policy_start_date
const triggerDate = new Date(client.policy_start_date);
const scheduledDate = addDays(triggerDate, step.timingDays); // timingDays is positive for "after"

// For step 2: relative to step 1 scheduled date
const step1ScheduledDate = await getScheduledSendDate(campaignId, clientId, step1.id);
const scheduledDate = addDays(step1ScheduledDate, step.timingDays);
```

**Idempotency:**
```typescript
// Before creating ScheduledSend, check if one exists
const existing = await base44.entities.ScheduledSend.filter({
  campaignId: campaignId,
  clientId: clientId,
  campaignStepId: stepId,
  scheduledDate: scheduledDate
});
if (existing.length > 0) {
  continue; // Skip, already scheduled
}
```

**Acceptance:**
- Creates ScheduledSend records correctly
- Date calculations are accurate
- Prevents duplicate scheduling
- Returns count of sends created

---

#### 4.2 Create Backend Function: processSend
**File:** `functions/processSend.ts`

**Purpose:** Execute a scheduled send (called by Send Processor)

**Input:**
```typescript
{
  scheduledSendId: string
}
```

**Process:**
1. Load ScheduledSend record
2. Verify status is 'pending' or 'queued'
3. Load campaign, step, client
4. Check enrollment status (skip if excluded)
5. Check credit availability
6. If credits available:
   - Call QuickSend infrastructure to create card
   - Create AutomationHistory record
   - Update ScheduledSend: status='sent', sentAt=now, automationHistoryId
   - Deduct credit
   - Update CampaignEnrollment: lastSentDate, lastSentStep
   - If all steps sent, mark enrollment as 'completed'
   - For recurring campaigns (birthday/renewal), schedule next year
7. If no credits:
   - Update ScheduledSend: status='failed', failureReason='Insufficient credits'
8. If client excluded:
   - Update ScheduledSend: status='skipped', failureReason='Client excluded'

**QuickSend Integration:**
```typescript
// Reuse existing QuickSend logic
const cardData = {
  recipientName: client.name,
  recipientAddress: {
    street: client.street_address,
    city: client.city,
    state: client.state,
    zip: client.zip_code
  },
  cardDesignId: step.cardDesignId,
  message: renderMessage(step.templateId || step.messageText, client),
  // ... other QuickSend params
};

const result = await sendCard(cardData); // Existing QuickSend function
```

**Recurring Logic:**
```typescript
// For birthday/renewal, after send completes, schedule next year
if (campaign.type === 'birthday' || campaign.type === 'renewal') {
  const nextYearTriggerDate = addYears(triggerDate, 1);
  const nextYearScheduledDate = addDays(nextYearTriggerDate, step.timingDays);
  
  // Create ScheduledSend for next year
  await base44.entities.ScheduledSend.create({
    campaignId: campaignId,
    campaignStepId: stepId,
    clientId: clientId,
    scheduledDate: nextYearScheduledDate,
    status: 'pending'
  });
}
```

**Acceptance:**
- Sends card successfully
- Creates AutomationHistory record
- Deducts credit
- Updates ScheduledSend status
- Handles failures gracefully
- Schedules next year for recurring campaigns

---

#### 4.3 Create Daily Scheduler Job
**File:** `functions/jobs/dailyScheduler.ts`

**Purpose:** Create ScheduledSend records for upcoming triggers

**Frequency:** Once daily (e.g., 2:00 AM in org timezone)

**Process:**
```typescript
export default async function dailyScheduler(request) {
  console.log('[Daily Scheduler] START');
  
  // Find all active campaigns
  const campaigns = await base44.entities.Campaign.filter({
    status: 'active'
  });
  
  let totalScheduled = 0;
  let totalAutoEnrolled = 0;
  
  for (const campaign of campaigns) {
    try {
      // Schedule sends for this campaign
      const result = await scheduleCampaignSends({
        campaignId: campaign.id,
        lookAheadDays: 14
      });
      totalScheduled += result.count;
      
      // For opt-out campaigns, auto-enroll new clients
      if (campaign.enrollmentMode === 'opt_out') {
        const newClients = await findNewEligibleClients(campaign);
        for (const client of newClients) {
          await enrollClient({
            campaignId: campaign.id,
            clientId: client.id
          });
          totalAutoEnrolled++;
        }
      }
    } catch (error) {
      console.error(`[Daily Scheduler] Error processing campaign ${campaign.id}:`, error);
      // Continue with other campaigns
    }
  }
  
  console.log(`[Daily Scheduler] COMPLETE - ${campaigns.length} campaigns, ${totalScheduled} sends scheduled, ${totalAutoEnrolled} clients auto-enrolled`);
  
  return Response.json({ success: true, scheduled: totalScheduled, enrolled: totalAutoEnrolled });
}
```

**Helper Function:**
```typescript
async function findNewEligibleClients(campaign) {
  // Find clients with valid trigger date who aren't enrolled yet
  const allClients = await base44.entities.Client.filter({
    orgId: campaign.orgId,
    [campaign.triggerField]: { $exists: true, $ne: null }
  });
  
  const enrolledClientIds = await base44.entities.CampaignEnrollment
    .filter({ campaignId: campaign.id })
    .then(enrollments => enrollments.map(e => e.clientId));
  
  return allClients.filter(client => !enrolledClientIds.includes(client.id));
}
```

**Acceptance:**
- Runs daily at 2:00 AM
- Processes all active campaigns
- Creates ScheduledSend records
- Auto-enrolls new clients (opt-out mode)
- Logs execution summary

---

#### 4.4 Create Send Processor Job
**File:** `functions/jobs/sendProcessor.ts`

**Purpose:** Execute scheduled sends for today

**Frequency:** Every 2 hours from 6am-6pm (e.g., 6am, 8am, 10am, 12pm, 2pm, 4pm, 6pm)

**Process:**
```typescript
export default async function sendProcessor(request) {
  console.log('[Send Processor] START');
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Find pending sends for today
  const pendingSends = await base44.entities.ScheduledSend.filter({
    scheduledDate: today,
    status: 'pending'
  });
  
  console.log(`[Send Processor] Found ${pendingSends.length} pending sends for ${today}`);
  
  let sentCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  
  for (const scheduledSend of pendingSends) {
    try {
      // Update status to 'queued' to prevent duplicate processing
      await base44.entities.ScheduledSend.update(scheduledSend.id, { status: 'queued' });
      
      // Process the send
      const result = await processSend({ scheduledSendId: scheduledSend.id });
      
      if (result.status === 'sent') sentCount++;
      else if (result.status === 'failed') failedCount++;
      else if (result.status === 'skipped') skippedCount++;
      
    } catch (error) {
      console.error(`[Send Processor] Error processing send ${scheduledSend.id}:`, error);
      
      // Mark as failed
      await base44.entities.ScheduledSend.update(scheduledSend.id, {
        status: 'failed',
        failureReason: error.message
      });
      failedCount++;
    }
  }
  
  console.log(`[Send Processor] COMPLETE - ${sentCount} sent, ${failedCount} failed, ${skippedCount} skipped`);
  
  // If many failures, send alert email
  if (failedCount > 5) {
    await sendAlertEmail({
      subject: 'NurturInk: High failure rate in Send Processor',
      body: `${failedCount} sends failed today. Please investigate.`
    });
  }
  
  return Response.json({ success: true, sent: sentCount, failed: failedCount, skipped: skippedCount });
}
```

**Acceptance:**
- Runs every 2 hours during business hours
- Processes all pending sends for today
- Updates send statuses
- Handles failures gracefully
- Sends alert if high failure rate

---

#### 4.5 Configure Scheduled Jobs in Base44
**Action:** Set up automation schedules

**Daily Scheduler:**
- Trigger: Cron expression `0 0 2 * * *` (2:00 AM daily)
- Function: `dailyScheduler`

**Send Processor:**
- Trigger: Cron expression `0 0 6,8,10,12,14,16,18 * * *` (every 2 hours, 6am-6pm)
- Function: `sendProcessor`

**Acceptance:**
- Jobs are scheduled in Base44
- Jobs run at correct times
- Logs show execution

---

#### 4.6 Create Helper Function: renderMessage
**File:** `functions/helpers/renderMessage.ts`

**Purpose:** Render message template with placeholders

**Input:**
```typescript
{
  templateId?: string,
  messageText?: string,
  client: Client,
  user: User
}
```

**Process:**
1. Load template if templateId provided
2. Use messageText if no template
3. Replace placeholders:
   - `{{client.firstName}}` → Extract first name from client.name
   - `{{client.name}}` → client.name
   - `{{user.firstName}}` → Extract first name from user.full_name
   - `{{user.fullName}}` → user.full_name
4. Format with line breaks at 52 characters (per Scribe API requirements)

**Acceptance:**
- Placeholders are replaced correctly
- Line breaks at 52 characters
- Returns formatted message

---

### Phase 4 Deliverables

✅ **Scheduling Engine:**
- Daily Scheduler creates ScheduledSend records
- Date calculations are accurate
- Idempotency prevents duplicates

✅ **Send Processor:**
- Executes scheduled sends
- Integrates with QuickSend
- Deducts credits
- Handles failures

✅ **Automation Jobs:**
- Jobs run on schedule
- Logs execution
- Sends alerts on failures

### Phase 4 Testing

**Manual Tests:**
1. Create a birthday campaign with client birthday = tomorrow
2. Wait for Daily Scheduler to run (or trigger manually)
3. Verify ScheduledSend record created
4. Wait for Send Processor to run (or trigger manually)
5. Verify card sent, credit deducted, AutomationHistory created
6. Check ScheduledSend status = 'sent'

**Edge Case Tests:**
1. Client with birthday today → scheduled for next year
2. Client with no credits → send marked 'failed'
3. Client excluded after scheduling → send marked 'skipped'
4. Duplicate scheduling → only one ScheduledSend created

**Acceptance Criteria:**
- Cards send automatically on scheduled date
- No duplicate sends
- Failures are handled gracefully
- Recurring campaigns schedule next year

---

## Phase 5: Polish & Notifications (Week 6-7)

### Goal
User knows what's happening - dashboard widget, email notifications, low credit warnings.

### Tasks

#### 5.1 Create Backend Function: getUpcomingSends
**File:** `functions/getUpcomingSends.ts`

**Purpose:** Get upcoming sends across all campaigns

**Input:**
```typescript
{
  orgId: string,
  days: number // default: 7
}
```

**Output:**
```typescript
{
  sends: Array<{
    scheduledSend: ScheduledSend,
    campaign: Campaign,
    client: Client,
    step: CampaignStep
  }>,
  groupedByDate: {
    '2026-01-27': [...],
    '2026-01-28': [...]
  }
}
```

**Acceptance:**
- Returns upcoming sends for next N days
- Groups by date
- Includes campaign and client details

---

#### 5.2 Create Dashboard Widget: Upcoming Campaign Sends
**File:** Modify `src/pages/Home.jsx` or create `src/components/dashboard/UpcomingCampaignSends.jsx`

**Purpose:** Show upcoming sends on dashboard

**Features:**
- Shows next 7 days of sends
- Groups by date
- Shows campaign name, client name
- Low credit warning if credits < sends
- Link to "View All Campaigns"

**Layout:**
```
┌─ Upcoming Campaign Sends (Next 7 Days) ─────────────────┐
│ Tomorrow (Jan 27):                                       │
│ • Birthday Wishes: John Smith                            │
│                                                          │
│ Jan 28:                                                  │
│ • Birthday Wishes: Mary Johnson, Robert Williams         │
│ • New Client Welcome: Sarah Davis                        │
│                                                          │
│ Jan 30:                                                  │
│ • Renewal Reminder: Michael Brown                        │
│                                                          │
│ ⚠️ Low Credits: 15 remaining, 8 sends scheduled         │
│                                    [View All Campaigns]  │
└──────────────────────────────────────────────────────────┘
```

**Acceptance:**
- Widget displays on dashboard
- Shows accurate upcoming sends
- Low credit warning appears when needed
- Link navigates to Campaigns page

---

#### 5.3 Create Notification Job
**File:** `functions/jobs/notificationJob.ts`

**Purpose:** Send daily summary emails to users

**Frequency:** Once daily (e.g., 8:00 AM in org timezone)

**Process:**
```typescript
export default async function notificationJob(request) {
  console.log('[Notification Job] START');
  
  // Get all orgs with active campaigns
  const orgs = await getOrgsWithActiveCampaigns();
  
  for (const org of orgs) {
    try {
      // Get today's sends
      const todaySends = await getTodaySends(org.id);
      
      // Get upcoming sends (next 7 days)
      const upcomingSends = await getUpcomingSends({ orgId: org.id, days: 7 });
      
      // Check credit balance
      const creditBalance = await getCreditBalance(org.id);
      const upcomingCount = upcomingSends.sends.length;
      const lowCredits = creditBalance < upcomingCount;
      
      // If sends today OR low credits, send email
      if (todaySends.length > 0 || lowCredits) {
        await sendDailySummaryEmail({
          org: org,
          todaySends: todaySends,
          upcomingSends: upcomingSends,
          creditBalance: creditBalance,
          lowCredits: lowCredits
        });
      }
    } catch (error) {
      console.error(`[Notification Job] Error for org ${org.id}:`, error);
    }
  }
  
  console.log('[Notification Job] COMPLETE');
  return Response.json({ success: true });
}
```

**Email Template:**
```
Subject: NurturInk Campaign Summary - [Date]

Hi [Owner Name],

Here's your daily campaign summary:

Cards Sent Today:
• Birthday Wishes: John Smith, Mary Johnson (2 cards)
• New Client Welcome: Sarah Davis (1 card)

Upcoming This Week:
• Tomorrow: 3 cards scheduled
• Jan 30: 2 cards scheduled
• Feb 2: 1 card scheduled

Credit Status:
⚠️ Low Credits: 15 remaining, 8 sends scheduled this week
[Purchase Credits]

[View All Campaigns]

---
NurturInk - Automated Handwritten Cards
```

**Acceptance:**
- Sends email daily at 8am
- Includes today's sends
- Includes upcoming sends
- Warns if low credits
- Email is well-formatted

---

#### 5.4 Configure Notification Job in Base44
**Action:** Set up notification schedule

**Notification Job:**
- Trigger: Cron expression `0 0 8 * * *` (8:00 AM daily)
- Function: `notificationJob`

**Acceptance:**
- Job runs daily at 8am
- Emails are sent to org owners/managers

---

#### 5.5 Add Low Credit Warning Banner
**File:** Modify `src/components/layout/MainLayout.jsx` or create `src/components/alerts/LowCreditBanner.jsx`

**Purpose:** Show in-app warning when credits are low

**Features:**
- Appears at top of all pages
- Shows when credits < estimated 7-day need
- Dismissible (but reappears next session)
- Link to purchase credits

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Low Credits: 15 remaining, 8 sends scheduled this    │
│ week. [Purchase Credits] [Dismiss]                      │
└─────────────────────────────────────────────────────────┘
```

**Acceptance:**
- Banner appears when credits are low
- Dismissible
- Link navigates to credits purchase page

---

#### 5.6 Add Send History to Campaign Detail Page
**File:** Modify `src/pages/CampaignDetail.jsx`

**Purpose:** Show past sends for a campaign

**Features:**
- List of sent cards (from AutomationHistory)
- Shows: date, client name, status
- Pagination (15 per page)
- Filter by date range

**Acceptance:**
- Send history displays correctly
- Shows accurate data
- Pagination works

---

#### 5.7 Add Send History to Client Detail Page
**File:** Modify existing client detail page

**Purpose:** Show campaign sends for a client

**Features:**
- List of cards sent to this client via campaigns
- Shows: date, campaign name, status
- Link to campaign detail

**Acceptance:**
- Send history displays correctly
- Shows accurate data
- Link navigates to campaign

---

### Phase 5 Deliverables

✅ **Dashboard Widget:**
- Shows upcoming sends (next 7 days)
- Low credit warning

✅ **Email Notifications:**
- Daily summary email
- Low credit alert email

✅ **In-App Alerts:**
- Low credit banner

✅ **Send History:**
- On campaign detail page
- On client detail page

### Phase 5 Testing

**Manual Tests:**
1. View dashboard, verify upcoming sends widget
2. Trigger notification job, verify email received
3. Reduce credits below threshold, verify banner appears
4. View campaign detail, verify send history
5. View client detail, verify send history

**Acceptance Criteria:**
- Users are informed of upcoming sends
- Users are warned of low credits
- Send history is accessible

---

## Phase 6: Testing & Launch (Week 7)

### Goal
Comprehensive testing, bug fixes, ready for NYL pilot.

### Tasks

#### 6.1 Comprehensive Testing

**Unit Tests:**
- Date calculation functions
- Enrollment logic
- Credit checks
- Message rendering

**Integration Tests:**
- Create campaign → auto-enroll → schedule sends → execute sends
- Exclude client → verify sends deleted
- Low credits → verify sends fail
- Recurring campaigns → verify next year scheduled

**Edge Case Tests:**
- Client with birthday today
- Client with no trigger date
- Campaign with 0 enrolled clients
- Org with 0 credits
- Duplicate scheduling attempts
- Job failures and retries

**User Acceptance Tests:**
- Complete all user flows from success criteria
- Test on multiple browsers
- Test on mobile (if applicable)

**Acceptance:**
- All tests pass
- No critical bugs
- Performance is acceptable

---

#### 6.2 Bug Fixes & Polish

**Action:** Fix any bugs found during testing

**Focus Areas:**
- Date calculations (especially leap years, timezones)
- Credit deduction accuracy
- Duplicate prevention
- Error handling
- UI polish (loading states, error messages)

**Acceptance:**
- All critical bugs fixed
- UI is polished and intuitive

---

#### 6.3 Documentation

**Create User Guide:**
- How to create a campaign
- How to manage enrollment
- How to monitor sends
- How to interpret notifications

**Create Admin Guide:**
- How jobs work
- How to monitor job logs
- How to troubleshoot issues

**Acceptance:**
- Documentation is clear and complete

---

#### 6.4 NYL Pilot Setup

**Action:** Set up NYL office for pilot

**Tasks:**
1. Create org account for NYL
2. Import their client list with dates
3. Create sample campaigns (Birthday, Welcome, Renewal)
4. Train them on system
5. Monitor first week closely

**Acceptance:**
- NYL is set up and trained
- First campaigns are running

---

#### 6.5 Monitoring & Feedback

**Action:** Monitor pilot closely

**Metrics to Track:**
- Campaigns created
- Sends executed
- Send success rate
- User feedback
- Bug reports

**Acceptance:**
- Monitoring is in place
- Feedback is collected

---

### Phase 6 Deliverables

✅ **Testing Complete:**
- All tests pass
- Bugs fixed

✅ **Documentation:**
- User guide
- Admin guide

✅ **NYL Pilot:**
- Set up and running
- Monitored closely

### Phase 6 Testing

**Final Acceptance Tests:**
1. Create all 3 campaign types
2. Enroll clients
3. Wait for sends to execute
4. Verify cards sent correctly
5. Verify credits deducted
6. Verify notifications sent
7. Verify send history accurate

**Acceptance Criteria:**
- System works end-to-end
- NYL pilot is successful
- Ready for broader rollout

---

## Implementation Notes

### Development Workflow

1. **Phase-by-phase:** Complete each phase fully before moving to next
2. **Test as you go:** Don't wait until Phase 6 to test
3. **Commit frequently:** Push to GitHub after each major task
4. **Document decisions:** Update this roadmap if plans change

### Base44 Platform Considerations

**Entity Creation:**
- Create entities in B44 dashboard first
- Test CRUD operations before building UI

**Backend Functions:**
- Inline all helpers (no imports from shared files)
- Use JavaScript (not TypeScript) for B44 paste
- Test functions in B44 before integrating with UI

**Scheduled Jobs:**
- Test manually first (call function directly)
- Then configure schedule
- Monitor logs closely after deployment

**Frontend:**
- Push to GitHub, let B44 sync automatically
- Test in B44 preview environment

### Common Pitfalls to Avoid

1. **Date calculations:** Test thoroughly, especially edge cases
2. **Timezone handling:** Be consistent (use org timezone)
3. **Duplicate prevention:** Always check before creating ScheduledSend
4. **Credit checks:** Verify before every send
5. **Error handling:** Don't let one failure stop entire batch
6. **Idempotency:** Jobs should be safe to run multiple times

---

## Risk Management

### High-Risk Areas

| Risk | Mitigation |
|------|------------|
| Date calculations incorrect | Extensive testing, unit tests |
| Duplicate sends | Unique constraints, idempotency checks |
| Jobs fail silently | Logging, monitoring, alerts |
| Credit deduction errors | Use existing tested logic, verify |
| Poor performance at scale | Indexes, batching, optimization |

### Rollback Plan

If critical issues arise:
1. Pause all campaigns (set status to 'paused')
2. Stop scheduled jobs
3. Fix issue
4. Test fix thoroughly
5. Resume campaigns and jobs

---

## Success Metrics

### V1 Launch Success

- ✅ 50% of NYL users create at least 1 campaign within 30 days
- ✅ 30% increase in cards sent per org (automation vs. manual)
- ✅ 90%+ send success rate (sent vs. failed)
- ✅ <5% user-reported issues with scheduling accuracy
- ✅ Positive feedback from NYL pilot

### Post-Launch Monitoring

**Week 1:**
- Monitor job logs daily
- Respond to issues within 1 hour
- Collect user feedback

**Week 2-4:**
- Monitor job logs weekly
- Track success metrics
- Plan V2 features based on feedback

---

## V2 Planning (Future)

Based on V1 feedback, consider:
- Calendar view
- Approve mode (user approves sends before execution)
- Credit reservation system
- More campaign types (anniversary, post-claim, win-back)
- A/B testing of messages
- Client timezone support
- Campaign analytics dashboard
- Migration tool for old AutomationRule system

---

**End of Implementation Roadmap**
