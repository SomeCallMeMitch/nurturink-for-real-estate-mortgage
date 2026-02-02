# NurturInk Automated Campaigns V1 - Technical Specification

**Version:** 1.0  
**Date:** January 26, 2026  
**Status:** Planning Phase  
**Target:** Insurance agents (NYL office pilot)

---

## Executive Summary

This document specifies the technical implementation of Automated Campaigns for NurturInk - a feature that allows users to set up recurring, date-triggered handwritten card campaigns. The system is designed to be simple for V1 but architected for future expansion.

**Key Business Driver:** Automation increases card volume → increases revenue. Insurance agents need birthday, welcome, and renewal reminder automation.

---

## Current State Analysis

### ✅ Existing Infrastructure

NurturInk already has partial automation infrastructure:

| Component | Status | Notes |
|-----------|--------|-------|
| `Client.birthday` | ✅ Exists | Date field for birthday automation |
| `Client.renewal_date` | ✅ Exists | Date field for renewal automation |
| `AutomationRule` entity | ✅ Exists | Defines automation configurations |
| `TriggerType` entity | ✅ Exists | Defines trigger types (birthday, renewal, etc.) |
| `AutomationHistory` entity | ✅ Exists | Tracks sent cards |
| `Client.automation_status` | ✅ Exists | active/paused/opted_out |
| QuickSend infrastructure | ✅ Exists | Card sending, design selection, templates |
| Credit system | ✅ Exists | User and org credit management |

### ❌ Missing Components

| Component | Needed For |
|-----------|------------|
| `Client.policy_start_date` | Welcome campaign trigger |
| Campaign sequence support | Multi-step campaigns (Welcome, Renewal) |
| `CampaignStep` entity | Defining multi-step sequences |
| `CampaignEnrollment` entity | Managing who's enrolled in each campaign |
| `ScheduledSend` entity | Pre-scheduling sends for visibility |
| Background jobs | Daily scheduler + send processor |
| Campaign management UI | Setup wizard, list, detail pages |
| Enrollment management UI | Add/exclude recipients |

### 🔄 Needs Evolution

The existing `AutomationRule` system is simpler than the spec requires:

**Current System:**
- Single-step automations only
- Basic trigger + template model
- No enrollment management
- No UI for configuration

**New System (V1 Spec):**
- Multi-step sequences (1-2 cards)
- Campaign-based model with steps
- Enrollment management (opt-in/opt-out)
- Full UI for setup and management

**Migration Strategy:** Build new Campaign system alongside existing AutomationRule system. Phase out AutomationRule in V2.

---

## Architecture Overview

### Design Principles

1. **Generic Campaign Engine** - Not hardcoded for specific campaign types
2. **Template-Based** - Pre-built configurations users activate
3. **Flexible Triggers** - Support before/after date triggers
4. **Sequence Support** - 1-N steps per campaign
5. **Enrollment Rules** - Opt-in vs opt-out with exclusions
6. **Separation of Concerns** - Planning (ScheduledSend) separate from execution (actual send)

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER LAYER                          │
│  Campaign Setup Wizard → Campaign List → Campaign Detail   │
│  Recipient Management → Dashboard Widget                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      DATA LAYER                             │
│  Campaign → CampaignStep → CampaignEnrollment              │
│  ScheduledSend → Client → AutomationHistory                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   AUTOMATION LAYER                          │
│  Daily Scheduler Job → Send Processor Job                  │
│  Notification Job                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  EXECUTION LAYER                            │
│  QuickSend Infrastructure → Scribe API → Credit System     │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model Specification

### New Entities

#### 1. Campaign

**Purpose:** Defines an automated campaign configuration

```json
{
  "name": "Campaign",
  "description": "Automated card sending campaign configuration",
  "properties": {
    "orgId": {
      "type": "string",
      "description": "Organization that owns this campaign",
      "required": true
    },
    "createdBy": {
      "type": "string",
      "description": "User who created this campaign",
      "required": true
    },
    "name": {
      "type": "string",
      "description": "User-friendly campaign name",
      "required": true
    },
    "type": {
      "type": "string",
      "enum": ["birthday", "welcome", "renewal"],
      "description": "Campaign type",
      "required": true
    },
    "status": {
      "type": "string",
      "enum": ["active", "paused", "draft"],
      "description": "Campaign status",
      "required": true,
      "default": "draft"
    },
    "enrollmentMode": {
      "type": "string",
      "enum": ["opt_in", "opt_out"],
      "description": "How recipients are enrolled",
      "required": true
    },
    "triggerField": {
      "type": "string",
      "enum": ["birthday", "policy_start_date", "renewal_date"],
      "description": "Which client date field triggers this campaign",
      "required": true
    },
    "description": {
      "type": "string",
      "description": "Optional description",
      "required": false
    }
  }
}
```

**Indexes:**
- `orgId` + `type` (for listing campaigns by org and type)
- `status` (for finding active campaigns)

#### 2. CampaignStep

**Purpose:** Defines individual steps in a campaign sequence

```json
{
  "name": "CampaignStep",
  "description": "Individual step in a campaign sequence",
  "properties": {
    "campaignId": {
      "type": "string",
      "description": "Parent campaign",
      "required": true
    },
    "stepOrder": {
      "type": "integer",
      "description": "Step sequence (1, 2, etc.)",
      "required": true
    },
    "cardDesignId": {
      "type": "string",
      "description": "Card design to use",
      "required": true
    },
    "templateId": {
      "type": "string",
      "description": "Message template to use",
      "required": false
    },
    "messageText": {
      "type": "string",
      "description": "Custom message (if not using template)",
      "required": false
    },
    "timingDays": {
      "type": "integer",
      "description": "Days before (-) or after (+) reference",
      "required": true
    },
    "timingReference": {
      "type": "string",
      "enum": ["trigger_date", "previous_step"],
      "description": "What this step's timing is relative to",
      "required": true,
      "default": "trigger_date"
    },
    "isEnabled": {
      "type": "boolean",
      "description": "Whether this step is active",
      "required": true,
      "default": true
    }
  }
}
```

**Indexes:**
- `campaignId` + `stepOrder` (for retrieving steps in order)

**Timing Examples:**
- Birthday card 7 days before: `timingDays: -7`, `timingReference: "trigger_date"`
- Welcome card 1: `timingDays: 3`, `timingReference: "trigger_date"` (3 days after policy_start_date)
- Welcome card 2: `timingDays: 14`, `timingReference: "previous_step"` (14 days after card 1)

#### 3. CampaignEnrollment

**Purpose:** Tracks which clients are enrolled in which campaigns

```json
{
  "name": "CampaignEnrollment",
  "description": "Client enrollment in campaigns",
  "properties": {
    "campaignId": {
      "type": "string",
      "description": "Campaign the client is enrolled in",
      "required": true
    },
    "clientId": {
      "type": "string",
      "description": "Enrolled client",
      "required": true
    },
    "status": {
      "type": "string",
      "enum": ["enrolled", "excluded", "completed", "paused"],
      "description": "Enrollment status",
      "required": true,
      "default": "enrolled"
    },
    "enrolledAt": {
      "type": "string",
      "format": "date-time",
      "description": "When enrolled",
      "required": true
    },
    "excludedAt": {
      "type": "string",
      "format": "date-time",
      "description": "When excluded (if status=excluded)",
      "required": false
    },
    "completedAt": {
      "type": "string",
      "format": "date-time",
      "description": "When sequence completed (if status=completed)",
      "required": false
    },
    "lastSentDate": {
      "type": "string",
      "format": "date",
      "description": "Last date a card was sent for this enrollment",
      "required": false
    },
    "lastSentStep": {
      "type": "integer",
      "description": "Last step that was sent",
      "required": false
    }
  }
}
```

**Indexes:**
- `campaignId` + `status` (for listing enrolled clients)
- `clientId` (for showing client's campaigns)
- `campaignId` + `clientId` (unique constraint - one enrollment per client per campaign)

**Enrollment Logic:**

**Opt-Out Mode:**
- All clients with valid trigger date are auto-enrolled when campaign activates
- New clients with valid trigger date are auto-enrolled when added
- User can manually exclude individuals (status = 'excluded')

**Opt-In Mode:**
- No auto-enrollment
- User manually adds clients (status = 'enrolled')

#### 4. ScheduledSend

**Purpose:** Pre-scheduled card sends for visibility and processing

```json
{
  "name": "ScheduledSend",
  "description": "Pre-scheduled card send",
  "properties": {
    "campaignId": {
      "type": "string",
      "description": "Campaign this send belongs to",
      "required": true
    },
    "campaignStepId": {
      "type": "string",
      "description": "Specific step being sent",
      "required": true
    },
    "clientId": {
      "type": "string",
      "description": "Recipient client",
      "required": true
    },
    "scheduledDate": {
      "type": "string",
      "format": "date",
      "description": "Date to send (YYYY-MM-DD)",
      "required": true
    },
    "status": {
      "type": "string",
      "enum": ["pending", "queued", "sent", "skipped", "failed"],
      "description": "Send status",
      "required": true,
      "default": "pending"
    },
    "failureReason": {
      "type": "string",
      "description": "Why send failed",
      "required": false
    },
    "queuedAt": {
      "type": "string",
      "format": "date-time",
      "description": "When queued for processing",
      "required": false
    },
    "sentAt": {
      "type": "string",
      "format": "date-time",
      "description": "When actually sent",
      "required": false
    },
    "automationHistoryId": {
      "type": "string",
      "description": "Link to AutomationHistory record after send",
      "required": false
    }
  }
}
```

**Indexes:**
- `scheduledDate` + `status` (for daily send processor)
- `campaignId` + `scheduledDate` (for campaign calendar view)
- `clientId` + `scheduledDate` (for client upcoming sends)
- `campaignId` + `clientId` + `campaignStepId` (prevent duplicates)

**Status Flow:**
```
pending → queued → sent
pending → queued → failed
pending → skipped (if client excluded or credits depleted)
```

### Modified Entities

#### Client Entity - Add Field

Add `policy_start_date` field:

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

**Migration:** Add field to existing Client entity schema. No data migration needed (nullable field).

---

## Campaign Type Specifications

### 1. Birthday Campaign

**Trigger:** `Client.birthday`  
**Frequency:** Annual (recurring)  
**Steps:** 1 card  
**Default Timing:** 7 days before birthday  
**Enrollment:** User choice (opt-in or opt-out)

**Configuration:**
```javascript
{
  type: 'birthday',
  triggerField: 'birthday',
  steps: [
    {
      stepOrder: 1,
      timingDays: -7,  // 7 days before
      timingReference: 'trigger_date',
      cardDesignId: '[user selects]',
      templateId: '[user selects]'
    }
  ]
}
```

**Scheduling Logic:**
- Calculate next birthday from today
- If birthday already passed this year, use next year's date
- Create ScheduledSend for (birthday - 7 days)
- After send completes, schedule next year automatically

### 2. Welcome Campaign

**Trigger:** `Client.policy_start_date` OR manual enrollment  
**Frequency:** One-time sequence  
**Steps:** 1 or 2 cards (user choice)  
**Default Timing:**
- Card 1: 3 days after policy start
- Card 2: 14 days after Card 1 (if 2-card selected)

**Enrollment:** User choice (opt-in or opt-out)

**Configuration (2-card example):**
```javascript
{
  type: 'welcome',
  triggerField: 'policy_start_date',
  steps: [
    {
      stepOrder: 1,
      timingDays: 3,  // 3 days after
      timingReference: 'trigger_date',
      cardDesignId: '[user selects]',
      templateId: '[user selects]'
    },
    {
      stepOrder: 2,
      timingDays: 14,  // 14 days after step 1
      timingReference: 'previous_step',
      cardDesignId: '[user selects]',
      templateId: '[user selects]'
    }
  ]
}
```

**Scheduling Logic:**
- Create ScheduledSend for step 1: (policy_start_date + 3 days)
- Create ScheduledSend for step 2: (step 1 scheduled_date + 14 days)
- Mark enrollment as 'completed' after all steps sent

**Manual Enrollment:**
- If client has no policy_start_date, user can manually enroll
- System uses enrollment date as trigger date

### 3. Renewal Reminder Campaign

**Trigger:** `Client.renewal_date`  
**Frequency:** Annual (recurring)  
**Steps:** 1 or 2 cards (user choice)  
**Default Timing:**
- Single card: 30 days before (options: 30/60/90)
- Two cards:
  - Card 1: 90 days before (options: 60/90)
  - Card 2: 30 days before (options: 30/45/60)

**Enrollment:** User choice (opt-in or opt-out)

**Configuration (2-card example):**
```javascript
{
  type: 'renewal',
  triggerField: 'renewal_date',
  steps: [
    {
      stepOrder: 1,
      timingDays: -90,  // 90 days before
      timingReference: 'trigger_date',
      cardDesignId: '[user selects]',
      templateId: '[user selects]'
    },
    {
      stepOrder: 2,
      timingDays: -30,  // 30 days before (NOT relative to step 1)
      timingReference: 'trigger_date',
      cardDesignId: '[user selects]',
      templateId: '[user selects]'
    }
  ]
}
```

**Scheduling Logic:**
- Calculate next renewal from today
- If renewal already passed this year, use next year's date
- Create ScheduledSend for each step relative to renewal_date
- After all steps sent, schedule next year automatically

---

## User Interface Specification

### New Pages

#### 1. Campaigns List (`/campaigns`)

**Purpose:** Overview of all campaigns

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Campaigns                          [+ Create Campaign]  │
├─────────────────────────────────────────────────────────┤
│ Filters: [All Types ▼] [All Status ▼]                  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🎂 Birthday Wishes              [Active]   [Edit]   │ │
│ │ Birthday • 42 enrolled • Next send: Jan 28          │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 👋 New Client Welcome           [Active]   [Edit]   │ │
│ │ Welcome • 2-card sequence • 15 enrolled             │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔄 Renewal Reminders            [Paused]  [Edit]    │ │
│ │ Renewal • 1 card • 38 enrolled                      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- List all campaigns for organization
- Show: name, type icon, status badge, enrollment count, next send
- Filter by type and status
- Actions: Create New, Edit, Pause/Resume, Delete
- Click campaign to go to detail page

**Components to Build:**
- `CampaignCard` - Individual campaign display
- `CampaignFilters` - Type and status filters
- `CreateCampaignButton` - Opens wizard

#### 2. Campaign Setup Wizard (`/campaigns/new`, `/campaigns/[id]/edit`)

**Purpose:** Multi-step wizard to create/edit campaigns

**Step 1: Choose Campaign Type**
```
┌─────────────────────────────────────────────────────────┐
│ Create Campaign - Choose Type                           │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┐  ┌─────────────────┐  ┌──────────┐ │
│ │  🎂 Birthday    │  │  👋 Welcome     │  │ 🔄 Renew │ │
│ │  Send cards on  │  │  Welcome new    │  │ Remind   │ │
│ │  birthdays      │  │  clients        │  │ before   │ │
│ │  [Select]       │  │  [Select]       │  │ renewal  │ │
│ └─────────────────┘  └─────────────────┘  │ [Select] │ │
│                                            └──────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Step 2: Configure Enrollment**
```
┌─────────────────────────────────────────────────────────┐
│ Create Campaign - Enrollment                            │
├─────────────────────────────────────────────────────────┤
│ How should clients be enrolled?                         │
│                                                          │
│ ○ Opt-Out (Recommended)                                 │
│   All clients with birthdays will be automatically      │
│   enrolled. You can exclude individuals later.          │
│   → 42 clients eligible                                 │
│                                                          │
│ ○ Opt-In                                                │
│   No clients enrolled automatically. You'll manually    │
│   add clients after setup.                              │
│                                                          │
│                              [Back]  [Next: Cards →]    │
└─────────────────────────────────────────────────────────┘
```

**Step 3: Configure Cards**

For Birthday (1 card):
```
┌─────────────────────────────────────────────────────────┐
│ Create Campaign - Card Configuration                    │
├─────────────────────────────────────────────────────────┤
│ When to send:                                           │
│ [7] days before birthday                                │
│                                                          │
│ Card Design:                                            │
│ [Select Design ▼] [Preview]                            │
│                                                          │
│ Message:                                                │
│ [Select Template ▼] or [Create Custom]                 │
│                                                          │
│ Preview:                                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Card preview renders here]                         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│                              [Back]  [Next: Review →]   │
└─────────────────────────────────────────────────────────┘
```

For Welcome/Renewal (1 or 2 cards):
```
┌─────────────────────────────────────────────────────────┐
│ Create Campaign - Card Sequence                         │
├─────────────────────────────────────────────────────────┤
│ How many cards?  ○ 1 card  ● 2 cards                   │
│                                                          │
│ ┌─ Card 1 ─────────────────────────────────────────────┐│
│ │ When: [3] days after policy start                    ││
│ │ Design: [Select ▼]  Message: [Select ▼]             ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ ┌─ Card 2 ─────────────────────────────────────────────┐│
│ │ When: [14] days after Card 1                         ││
│ │ Design: [Select ▼]  Message: [Select ▼]             ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│                              [Back]  [Next: Review →]   │
└─────────────────────────────────────────────────────────┘
```

**Step 4: Review & Activate**
```
┌─────────────────────────────────────────────────────────┐
│ Create Campaign - Review                                │
├─────────────────────────────────────────────────────────┤
│ Campaign Name: [Birthday Wishes                      ]  │
│                                                          │
│ Summary:                                                │
│ • Type: Birthday                                        │
│ • Enrollment: Opt-out (42 clients eligible)            │
│ • Timing: 7 days before birthday                        │
│ • Card: "Thank You - Floral"                           │
│ • Message: "Birthday Wishes Template"                   │
│                                                          │
│ Upcoming Sends (Next 30 Days):                          │
│ • Jan 28: John Smith, Mary Johnson (2 cards)           │
│ • Feb 3: Robert Williams (1 card)                       │
│ • Feb 10: Sarah Davis, Michael Brown (2 cards)         │
│                                                          │
│ Estimated Credits: ~5 cards/month = 5 credits/month    │
│ Current Balance: 150 credits ✓                          │
│                                                          │
│                    [Save as Draft]  [Activate Campaign] │
└─────────────────────────────────────────────────────────┘
```

**Components to Build:**
- `CampaignTypeSelector` - Step 1
- `EnrollmentModeSelector` - Step 2
- `CardConfigurationForm` - Step 3 (reuse design/template pickers)
- `CampaignReviewSummary` - Step 4
- `WizardNavigation` - Back/Next buttons with progress indicator

#### 3. Campaign Detail Page (`/campaigns/[id]`)

**Purpose:** Manage a specific campaign

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 🎂 Birthday Wishes                    [Edit] [Pause]    │
├─────────────────────────────────────────────────────────┤
│ Status: Active • Type: Birthday • Enrollment: Opt-out   │
│                                                          │
│ ┌─ Configuration ────────────────────────────────────┐  │
│ │ Timing: 7 days before birthday                     │  │
│ │ Card: "Thank You - Floral"                         │  │
│ │ Message: "Birthday Wishes Template"                │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ Enrolled Clients (42) ────────────────────────────┐  │
│ │ [Search...] [Filter ▼] [+ Add Client] [Bulk ▼]    │  │
│ │ ┌──────────────────────────────────────────────────┐│ │
│ │ │ John Smith • john@example.com                    ││ │
│ │ │ Birthday: Mar 15 • Next send: Mar 8              ││ │
│ │ │                                    [Exclude]     ││ │
│ │ └──────────────────────────────────────────────────┘│ │
│ │ ┌──────────────────────────────────────────────────┐│ │
│ │ │ Mary Johnson • mary@example.com                  ││ │
│ │ │ Birthday: Apr 2 • Next send: Mar 26              ││ │
│ │ │                                    [Exclude]     ││ │
│ │ └──────────────────────────────────────────────────┘│ │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ Upcoming Sends (Next 30 Days) ────────────────────┐  │
│ │ Jan 28: John Smith, Mary Johnson (2 cards)         │  │
│ │ Feb 3: Robert Williams (1 card)                    │  │
│ │ Feb 10: Sarah Davis, Michael Brown (2 cards)       │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ Send History ─────────────────────────────────────┐  │
│ │ Jan 15: Sent to Alice Cooper ✓                     │  │
│ │ Jan 8: Sent to Bob Dylan ✓                         │  │
│ │ Dec 28: Sent to Carol King ✓                       │  │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Campaign overview (type, status, enrollment mode)
- Card configuration summary
- Enrolled clients list with search/filter
- Add/exclude clients
- Upcoming sends (next 30 days)
- Send history
- Edit/Pause/Delete actions

**Components to Build:**
- `CampaignHeader` - Title, status, actions
- `CampaignConfigSummary` - Configuration display
- `EnrolledClientsList` - Searchable, filterable list
- `UpcomingSendsWidget` - Next 30 days preview
- `SendHistoryList` - Past sends

#### 4. Campaign Calendar View (`/campaigns/calendar`) - OPTIONAL V1

**Purpose:** Monthly calendar view of all scheduled sends

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Campaign Calendar                    [← January 2026 →] │
├─────────────────────────────────────────────────────────┤
│  Sun    Mon    Tue    Wed    Thu    Fri    Sat         │
│         1      2      3      4      5      6            │
│                                                          │
│  7      8      9      10     11     12     13           │
│         🎂x2                                             │
│                                                          │
│  14     15     16     17     18     19     20           │
│         🎂x1   👋x1                                      │
│                                                          │
│  21     22     23     24     25     26     27           │
│                       🔄x3                               │
│                                                          │
│  28     29     30     31                                │
│  🎂x2                                                    │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Monthly calendar view
- Color-coded by campaign type
- Shows send count per day
- Click day to see details

**Decision:** Defer to V2 unless time permits. Nice-to-have, not essential.

### Modified Pages

#### Recipient Detail Page (Client Detail)

**Add Section:**
```
┌─ Automation Dates ──────────────────────────────────────┐
│ Birthday: [MM/DD/YYYY]                                   │
│ Policy Start: [MM/DD/YYYY]                               │
│ Renewal Date: [MM/DD/YYYY]                               │
└──────────────────────────────────────────────────────────┘

┌─ Campaign Enrollment ───────────────────────────────────┐
│ • Birthday Wishes (Active) - Next send: Mar 8            │
│ • New Client Welcome (Completed)                         │
│ • Renewal Reminders (Enrolled) - Next send: Jun 15       │
└──────────────────────────────────────────────────────────┘

┌─ Upcoming Automated Sends ──────────────────────────────┐
│ Mar 8: Birthday Wishes                                   │
│ Jun 15: Renewal Reminder (Card 1)                        │
│ Jul 15: Renewal Reminder (Card 2)                        │
└──────────────────────────────────────────────────────────┘
```

#### Recipient List Page (Client List)

**Add:**
- Birthday, Policy Start, Renewal Date columns (optional display)
- Bulk action: "Add to Campaign" (for opt-in campaigns)
- Bulk action: "Exclude from Campaign" (for opt-out campaigns)

#### Recipient Import (CSV Import)

**Add:**
- Support for `birthday`, `policy_start_date`, `renewal_date` columns
- Column mapping UI for new date fields
- Date format validation (YYYY-MM-DD)

#### Dashboard (Home Page)

**Add Widget:**
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

---

## Backend Functions Specification

### Campaign Management Functions

#### 1. `createCampaign`

**Purpose:** Create a new campaign with steps

**Input:**
```javascript
{
  name: string,
  type: 'birthday' | 'welcome' | 'renewal',
  enrollmentMode: 'opt_in' | 'opt_out',
  steps: [
    {
      stepOrder: number,
      cardDesignId: string,
      templateId?: string,
      messageText?: string,
      timingDays: number,
      timingReference: 'trigger_date' | 'previous_step'
    }
  ]
}
```

**Process:**
1. Validate user is org owner or manager
2. Create Campaign record (status: 'draft')
3. Create CampaignStep records for each step
4. If enrollmentMode = 'opt_out', auto-enroll eligible clients
5. Return campaign ID

**Output:**
```javascript
{
  success: true,
  campaignId: string,
  enrolledCount: number
}
```

#### 2. `updateCampaign`

**Purpose:** Update campaign configuration

**Input:**
```javascript
{
  campaignId: string,
  updates: {
    name?: string,
    status?: 'active' | 'paused' | 'draft',
    steps?: [...] // full step replacement
  }
}
```

**Process:**
1. Validate ownership
2. Update Campaign record
3. If steps changed:
   - Delete old CampaignStep records
   - Create new CampaignStep records
   - **Decision:** Delete pending ScheduledSend records? (Yes for V1 simplicity)
4. If status changed to 'active', trigger scheduler

**Output:**
```javascript
{
  success: true
}
```

#### 3. `deleteCampaign`

**Purpose:** Delete a campaign

**Process:**
1. Validate ownership
2. Delete all CampaignStep records
3. Delete all CampaignEnrollment records
4. Delete all pending ScheduledSend records
5. Delete Campaign record

#### 4. `getCampaignDetails`

**Purpose:** Get full campaign details with steps and enrollment

**Input:**
```javascript
{
  campaignId: string
}
```

**Output:**
```javascript
{
  campaign: Campaign,
  steps: CampaignStep[],
  enrolledCount: number,
  upcomingSends: ScheduledSend[] // next 30 days
}
```

### Enrollment Management Functions

#### 5. `enrollClient`

**Purpose:** Manually enroll a client in a campaign

**Input:**
```javascript
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

#### 6. `excludeClient`

**Purpose:** Exclude a client from a campaign

**Input:**
```javascript
{
  campaignId: string,
  clientId: string
}
```

**Process:**
1. Find CampaignEnrollment record
2. Update status to 'excluded', set excludedAt
3. Delete any pending ScheduledSend records for this client/campaign

#### 7. `bulkEnrollClients`

**Purpose:** Enroll multiple clients at once

**Input:**
```javascript
{
  campaignId: string,
  clientIds: string[]
}
```

**Process:**
- Loop through clientIds, call enrollClient for each
- Return success/failure count

#### 8. `getEnrolledClients`

**Purpose:** Get list of enrolled clients for a campaign

**Input:**
```javascript
{
  campaignId: string,
  status?: 'enrolled' | 'excluded' | 'completed',
  search?: string,
  limit?: number,
  skip?: number
}
```

**Output:**
```javascript
{
  enrollments: [
    {
      enrollment: CampaignEnrollment,
      client: Client,
      nextSend?: ScheduledSend
    }
  ],
  total: number
}
```

### Scheduling Functions

#### 9. `scheduleCampaignSends` (Internal - called by Daily Scheduler Job)

**Purpose:** Create ScheduledSend records for a campaign

**Input:**
```javascript
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

**Idempotency:** Check for existing ScheduledSend with same campaignId + clientId + campaignStepId before creating.

**Recurring Logic:**
- For birthday/renewal (annual): After send completes, calculate next year's date and schedule
- For welcome (one-time): Mark enrollment as 'completed' after all steps sent

#### 10. `processSend` (Internal - called by Send Processor Job)

**Purpose:** Execute a scheduled send

**Input:**
```javascript
{
  scheduledSendId: string
}
```

**Process:**
1. Load ScheduledSend record
2. Verify status is 'pending' or 'queued'
3. Load campaign, step, client
4. Check credit availability
5. If credits available:
   - Call QuickSend infrastructure to create card
   - Create AutomationHistory record
   - Update ScheduledSend: status='sent', sentAt=now, automationHistoryId
   - Deduct credit
   - Update CampaignEnrollment: lastSentDate, lastSentStep
6. If no credits:
   - Update ScheduledSend: status='failed', failureReason='Insufficient credits'
7. If client excluded:
   - Update ScheduledSend: status='skipped', failureReason='Client excluded'

**Output:**
```javascript
{
  success: boolean,
  status: 'sent' | 'failed' | 'skipped',
  reason?: string
}
```

### Utility Functions

#### 11. `getCampaignStats`

**Purpose:** Get statistics for a campaign

**Input:**
```javascript
{
  campaignId: string
}
```

**Output:**
```javascript
{
  enrolledCount: number,
  excludedCount: number,
  completedCount: number,
  totalSent: number,
  upcomingSends30Days: number,
  lastSentDate?: Date
}
```

#### 12. `getClientCampaigns`

**Purpose:** Get all campaigns a client is enrolled in

**Input:**
```javascript
{
  clientId: string
}
```

**Output:**
```javascript
{
  enrollments: [
    {
      campaign: Campaign,
      enrollment: CampaignEnrollment,
      nextSend?: ScheduledSend
    }
  ]
}
```

#### 13. `getUpcomingSends`

**Purpose:** Get upcoming sends across all campaigns

**Input:**
```javascript
{
  orgId: string,
  days: number // default: 7
}
```

**Output:**
```javascript
{
  sends: [
    {
      scheduledSend: ScheduledSend,
      campaign: Campaign,
      client: Client,
      step: CampaignStep
    }
  ],
  groupedByDate: {
    '2026-01-27': [...],
    '2026-01-28': [...]
  }
}
```

---

## Background Jobs Specification

### Job 1: Daily Scheduler

**Purpose:** Create ScheduledSend records for upcoming triggers

**Frequency:** Once daily (e.g., 2:00 AM in org timezone)

**Process:**
```
1. Find all active campaigns (status='active')
2. For each campaign:
   - Call scheduleCampaignSends(campaignId, lookAheadDays=14)
3. For opt-out campaigns:
   - Find new clients with valid trigger dates
   - Auto-enroll them (create CampaignEnrollment)
4. Log summary: campaigns processed, sends scheduled
```

**Idempotency:** scheduleCampaignSends checks for existing ScheduledSend records before creating.

**Error Handling:**
- If one campaign fails, continue with others
- Log errors for admin review
- Send alert email if multiple campaigns fail

**Implementation:** Base44 scheduled function (cron-style)

### Job 2: Send Processor

**Purpose:** Execute scheduled sends for today

**Frequency:** Multiple times daily (e.g., every 2 hours from 6am-6pm)

**Process:**
```
1. Find ScheduledSend records where:
   - scheduledDate = today
   - status = 'pending'
2. For each ScheduledSend:
   - Update status to 'queued'
   - Call processSend(scheduledSendId)
3. Log summary: sends processed, successes, failures
```

**Credit Handling:**
- Check org credit balance before processing batch
- If credits < send count, process what's possible
- Mark remaining as 'failed' with reason 'Insufficient credits'
- Send low credit alert email

**Error Handling:**
- If one send fails, continue with others
- Log individual failures
- Retry failed sends once (after 1 hour)

**Implementation:** Base44 scheduled function (interval-style)

### Job 3: Notification Job

**Purpose:** Send daily summary emails to users

**Frequency:** Once daily (e.g., 8:00 AM in org timezone)

**Process:**
```
1. For each org with active campaigns:
   - Get today's sends (status='sent')
   - Get upcoming sends (next 7 days)
   - Check credit balance vs. upcoming needs
   - If sends today OR low credits:
     - Send email to org owner/managers
```

**Email Content:**
```
Subject: NurturInk Campaign Summary - [Date]

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
```

**Implementation:** Base44 scheduled function

---

## Credit Management

### Credit Estimation

**Formula:**
```
estimatedMonthlyCredits = enrolledCount * cardsPerYear / 12
```

**Examples:**
- Birthday campaign, 50 clients, 1 card/year: 50 * 1 / 12 = ~4 credits/month
- Renewal campaign, 30 clients, 2 cards/year: 30 * 2 / 12 = 5 credits/month

**Display:**
- Show estimated monthly credit usage in campaign setup wizard
- Show total estimated usage across all campaigns on dashboard

### Credit Warnings

**Thresholds:**
- **Warning:** Credits < estimated 30-day need
- **Critical:** Credits < estimated 7-day need
- **Block:** Credits = 0

**Warning Display:**
- In-app banner on dashboard
- Email notification (daily, if warning persists)
- Warning badge on Campaigns page

**Send Blocking:**
- If credits = 0, Send Processor marks sends as 'failed'
- Email notification to org owner: "Campaign sends blocked - no credits"

### Credit Deduction

**Process:**
1. Send Processor checks credit balance before processing
2. If sufficient, deduct 1 credit per card
3. Use existing credit deduction logic from QuickSend
4. Create Transaction record (type: 'deduction', description: 'Automated campaign send')

---

## Reusable Components

### From QuickSend

| Component | Location | Reuse For |
|-----------|----------|-----------|
| Card Design Picker | `SelectDesign.jsx` | Campaign step configuration |
| Message Template Picker | `Templates.jsx` | Campaign step configuration |
| Card Preview | `ReviewAndSend.jsx` | Campaign wizard preview |
| Recipient Search/Filter | `FindClients.jsx` | Enrollment management |
| Send Execution Logic | `ReviewAndSend.jsx` functions | Send Processor job |
| Credit Deduction Logic | `Credits.jsx` functions | Send Processor job |

### New Components to Build

| Component | Purpose |
|-----------|---------|
| `CampaignTypeSelector` | Choose campaign type (birthday/welcome/renewal) |
| `EnrollmentModeSelector` | Choose opt-in vs opt-out |
| `CampaignStepForm` | Configure individual step (timing, design, message) |
| `CampaignSequenceBuilder` | Multi-step sequence configuration |
| `CampaignReviewSummary` | Review before activation |
| `EnrolledClientsList` | Searchable list with add/exclude actions |
| `UpcomingSendsWidget` | Next 30 days preview |
| `CampaignStatsCard` | Campaign statistics display |
| `DateFieldInput` | Date picker for birthday/policy_start/renewal |

---

## Implementation Considerations

### Timezone Handling

**Decision for V1:** Use organization timezone for all date calculations.

**Rationale:**
- Simpler implementation
- Most orgs serve clients in same timezone
- Individual client timezones can be added in V2

**Implementation:**
- Store org timezone in Organization entity (or default to user's timezone)
- All date calculations use org timezone
- ScheduledSend.scheduledDate is date-only (no time), processed in org timezone

### Campaign Modifications

**Decision for V1:** Campaign edits only affect future scheduled sends.

**Behavior:**
- If user edits campaign (changes message, design, timing):
  - Delete all pending ScheduledSend records
  - Re-run scheduler to create new ScheduledSend records with updated config
- Already sent cards (status='sent') are not affected
- Queued sends (status='queued') are cancelled and rescheduled

**Alternative (V2):** Allow user to choose whether to update pending sends.

### Client Date Changes

**Decision for V1:** Date changes don't automatically reschedule.

**Behavior:**
- If client's birthday/renewal_date/policy_start_date changes:
  - Existing ScheduledSend records are NOT updated
  - Next Daily Scheduler run will create new ScheduledSend records based on new date
- This means a send might be scheduled for the old date and the new date
- **Mitigation:** Daily Scheduler checks for duplicates before creating ScheduledSend

**Alternative (V2):** Detect date changes and reschedule automatically.

### Send Time

**Decision for V1:** Sends are processed in batches throughout the day.

**Schedule:**
- Send Processor runs every 2 hours from 6am-6pm (org timezone)
- Example: 6am, 8am, 10am, 12pm, 2pm, 4pm, 6pm
- Cards processed in morning batches get into mail stream same day

**Rationale:**
- Spreads load throughout the day
- Allows time for credit purchases if balance is low
- Multiple chances to process if one batch fails

### Look-Ahead Window

**Decision for V1:** Schedule 14 days in advance.

**Rationale:**
- Provides good visibility (2 weeks)
- Not too much data (reduces stale data risk)
- Allows time for user to exclude clients or purchase credits

**Implementation:**
- Daily Scheduler creates ScheduledSend records for next 14 days
- If a send is already scheduled, skip (idempotency)

### Duplicate Prevention

**Strategy:**
- Unique constraint on ScheduledSend: `campaignId + clientId + campaignStepId + scheduledDate`
- Before creating ScheduledSend, check if one exists
- If exists, skip creation

**Edge Case:** Birthday/renewal recurring sends
- After a send completes, calculate next year's date
- Create new ScheduledSend for next year
- Unique constraint prevents duplicates

---

## Testing Strategy

### Unit Tests

**Entities:**
- Campaign creation with steps
- CampaignEnrollment status transitions
- ScheduledSend status flow

**Functions:**
- `scheduleCampaignSends` - date calculations
- `processSend` - credit checks, status updates
- `enrollClient` / `excludeClient` - enrollment logic

**Date Calculations:**
- Birthday: next occurrence, leap year handling
- Renewal: next occurrence
- Welcome: relative to policy_start_date
- Step chaining: step 2 relative to step 1

### Integration Tests

**Workflows:**
1. Create birthday campaign (opt-out) → verify auto-enrollment
2. Create welcome campaign (opt-in) → manually enroll → verify scheduled sends
3. Exclude client → verify scheduled sends deleted
4. Process send → verify card created, credit deducted, history recorded
5. Low credits → verify sends marked failed

**Jobs:**
- Daily Scheduler: verify ScheduledSend records created correctly
- Send Processor: verify sends executed, statuses updated
- Notification Job: verify emails sent

### Manual Testing

**User Flows:**
1. Complete campaign setup wizard (all 4 steps)
2. View campaign detail page
3. Add/exclude clients from campaign
4. Import clients with date fields
5. View dashboard widget
6. Receive notification email

**Edge Cases:**
- Client with no birthday → not enrolled in birthday campaign
- Client with birthday today → scheduled send created for next year
- Campaign with 0 enrolled clients → no sends scheduled
- Org with 0 credits → sends marked failed

---

## Migration Strategy

### Existing AutomationRule System

**Current State:**
- Some users may have AutomationRule records
- AutomationHistory tracks past sends

**Migration Plan:**

**Option A: Parallel Systems (Recommended for V1)**
- Keep AutomationRule system running
- Build new Campaign system alongside
- Don't migrate existing AutomationRule → Campaign
- In V2, provide migration tool for users to convert

**Option B: Migrate Immediately**
- Create Campaign records from existing AutomationRule records
- Create CampaignStep records
- Create CampaignEnrollment for all clients
- Deprecate AutomationRule system

**Recommendation:** Option A for V1 simplicity. Option B for V2 after Campaign system is proven.

### Database Changes

**New Entities:**
- Campaign
- CampaignStep
- CampaignEnrollment
- ScheduledSend

**Modified Entities:**
- Client: Add `policy_start_date` field

**No Breaking Changes:**
- All changes are additive
- Existing Client records work without policy_start_date (nullable)

---

## Performance Considerations

### Daily Scheduler Job

**Potential Load:**
- 1000 clients * 3 campaigns = 3000 enrollments
- 3000 enrollments * 2 steps avg = 6000 potential ScheduledSend records
- With 14-day look-ahead, ~600 ScheduledSend records created per day

**Optimization:**
- Process campaigns in batches
- Use database indexes on date fields
- Cache campaign/step data during processing

### Send Processor Job

**Potential Load:**
- 100 sends per day = 12-14 sends per batch (7 batches/day)
- Each send calls QuickSend infrastructure

**Optimization:**
- Process sends in parallel (up to 10 concurrent)
- Batch credit checks
- Cache card design/template data

### Database Indexes

**Critical Indexes:**
- `Campaign.orgId + Campaign.status`
- `CampaignEnrollment.campaignId + CampaignEnrollment.status`
- `ScheduledSend.scheduledDate + ScheduledSend.status`
- `Client.birthday`, `Client.renewal_date`, `Client.policy_start_date`

---

## Security Considerations

### Authorization

**Campaign Management:**
- Only org owners and managers can create/edit/delete campaigns
- Members can view campaigns but not modify

**Enrollment Management:**
- Only org owners and managers can enroll/exclude clients
- Members can view enrollment but not modify

**Client Data:**
- All campaign operations respect org boundaries
- Users can only access campaigns/clients in their org

### Data Privacy

**Client Dates:**
- Birthday, policy_start_date, renewal_date are sensitive
- Only visible to users in same org
- Not exposed in public APIs

**Send History:**
- AutomationHistory records are org-scoped
- Only org members can view send history

---

## Monitoring & Logging

### Key Metrics

**Campaign Health:**
- Active campaigns count
- Enrolled clients count per campaign
- Sends per day (actual vs. scheduled)
- Failed sends count and reasons

**Credit Usage:**
- Credits used by campaigns vs. manual sends
- Orgs with low credits
- Blocked sends due to no credits

**Job Performance:**
- Daily Scheduler: execution time, records created
- Send Processor: execution time, success rate
- Notification Job: emails sent

### Logging

**Daily Scheduler:**
```
[2026-01-26 02:00:00] Daily Scheduler START
[2026-01-26 02:00:01] Processing campaign: Birthday Wishes (id: abc123)
[2026-01-26 02:00:02] Created 15 scheduled sends for campaign abc123
[2026-01-26 02:00:03] Auto-enrolled 3 new clients in campaign abc123
[2026-01-26 02:00:10] Daily Scheduler COMPLETE - 3 campaigns, 42 sends scheduled
```

**Send Processor:**
```
[2026-01-26 06:00:00] Send Processor START
[2026-01-26 06:00:01] Found 12 pending sends for today
[2026-01-26 06:00:02] Processing send: ScheduledSend xyz789
[2026-01-26 06:00:03] Send SUCCESS: Card sent to John Smith
[2026-01-26 06:00:04] Send FAILED: Insufficient credits (ScheduledSend xyz790)
[2026-01-26 06:01:00] Send Processor COMPLETE - 11 sent, 1 failed
```

### Alerts

**Email Alerts:**
- Daily Scheduler fails for 2+ days
- Send Processor fails for 3+ batches
- Org has 0 credits with pending sends
- Campaign has 10+ failed sends

**In-App Alerts:**
- Low credit warning (banner)
- Failed sends notification (badge)

---

## Open Questions & Decisions Needed

### 1. Timezone Strategy

**Question:** Use org timezone or client timezone for date calculations?

**Recommendation:** Org timezone for V1 (simpler). Client timezone in V2.

**User Decision:** ✅ Approved

---

### 2. Campaign Modification Behavior

**Question:** When user edits campaign, update pending sends or only future sends?

**Options:**
- A) Only future sends (simpler, less surprising)
- B) All pending sends (more powerful, but complex)

**Recommendation:** Option A for V1.

**User Decision:** ✅ Approved

---

### 3. Client Date Change Handling

**Question:** When client's birthday/renewal_date changes, reschedule automatically?

**Options:**
- A) Don't reschedule, next Daily Scheduler run picks up new date
- B) Detect change and reschedule immediately

**Recommendation:** Option A for V1.

**User Decision:** ✅ Approved

---

### 4. Send Time

**Question:** What time(s) should Send Processor run?

**Recommendation:** Every 2 hours from 6am-6pm (org timezone).

**User Decision:** ✅ Approved

---

### 5. Look-Ahead Window

**Question:** How far in advance should Daily Scheduler create ScheduledSend records?

**Options:**
- 7 days (less visibility, more frequent updates)
- 14 days (good balance)
- 30 days (more visibility, more stale data risk)

**Recommendation:** 14 days.

**User Decision:** ✅ Approved

---

### 6. Calendar View Priority

**Question:** Include calendar view in V1 or defer to V2?

**Recommendation:** Defer to V2 (nice-to-have, not essential).

**User Decision:** Pending

---

### 7. Approve Mode

**Question:** Should users approve sends before they go out, or just get notified?

**Recommendation:** Inform-only for V1 (simpler). Approve mode in V2.

**User Decision:** ✅ Approved (Inform-only)

---

### 8. Credit Reservation

**Question:** Should credits be "reserved" when sends are scheduled?

**Recommendation:** No reservation for V1. Just warn if low. V2 can add reservation.

**User Decision:** ✅ Approved (No reservation)

---

### 9. Migration of Existing AutomationRule

**Question:** Migrate existing AutomationRule records to new Campaign system?

**Recommendation:** Run parallel systems in V1. Provide migration tool in V2.

**User Decision:** Pending

---

## Success Criteria

### User Experience

A user should be able to:
1. ✅ Create a Birthday campaign in under 5 minutes
2. ✅ Create a Welcome sequence (2 cards) in under 10 minutes
3. ✅ Create a Renewal reminder in under 5 minutes
4. ✅ See all upcoming sends across all campaigns
5. ✅ Easily add/exclude recipients from campaigns
6. ✅ Import recipients with date fields via CSV
7. ✅ Get notified of upcoming sends and low credits

### System Reliability

The system should:
1. ✅ Automatically schedule sends based on recipient dates
2. ✅ Process sends daily without manual intervention
3. ✅ Handle new recipients added after campaign creation
4. ✅ Prevent sends when credits are depleted
5. ✅ Maintain send history for reporting
6. ✅ Handle job failures gracefully (retry, alert)
7. ✅ Prevent duplicate sends (idempotency)

### Business Metrics

Success indicators:
- 50% of active orgs create at least 1 campaign within 30 days
- 30% increase in cards sent per org (automation vs. manual)
- 90%+ send success rate (sent vs. failed)
- <5% user-reported issues with scheduling accuracy

---

## Next Steps

1. **Review & Approval** - User reviews this spec, approves decisions
2. **Create Implementation Roadmap** - Break down into phases and tasks
3. **Assign to Manus Max** - Provide spec + roadmap for execution
4. **Phase 1: Foundation** - Data model, entities, basic CRUD
5. **Phase 2: UI** - Campaign setup wizard, list, detail pages
6. **Phase 3: Enrollment** - Add/exclude clients, bulk actions
7. **Phase 4: Automation** - Background jobs, scheduling, sending
8. **Phase 5: Polish** - Notifications, dashboard widget, testing
9. **Launch & Monitor** - Deploy to NYL pilot, gather feedback
10. **V2 Planning** - Calendar view, approve mode, more campaign types

---

**End of Technical Specification**
