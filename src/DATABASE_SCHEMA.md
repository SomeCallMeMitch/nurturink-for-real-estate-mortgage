# NurturInk Database Schema — Canonical Reference

> **Last updated:** 2026-03-17 — Sprint 3 (System B migration complete)

---

## Architecture Overview

NurturInk uses **System B** as the canonical campaign architecture.

| Concept | System A (DEPRECATED) | System B (CURRENT) |
|---|---|---|
| Campaign type definition | `TriggerType` entity | `CampaignType` entity |
| Per-user rule config | `AutomationRule` entity | `Campaign` + `CampaignStep` entities |
| Seeder function | `seedDefaultTriggerTypes` | `seedCampaignTypes` |
| Scheduler | — | `runDailyScheduler` |
| Processor | — | `processPendingSends` |

**System A entities (`TriggerType`, `AutomationRule`) and their seed functions (`seedDefaultTriggerTypes`, `seedDefaultAutomationRules`) are deprecated. Existing records are preserved for audit but no new records should be created.**

---

## Core Entities

### Client
Client/contact information used for campaign targeting and card personalization.

| Field | Type | Required | Description |
|---|---|---|---|
| birthday | string/date | â€” | Client birthday for birthday automation |
| home_anniversary_date | string/date | â€” | Home purchase anniversary for recurring home anniversary automation |
| close_date | string/date | â€” | Deal close date for one-time post-close automation |
| loan_anniversary_date | string/date | â€” | Loan or mortgage anniversary for recurring loan anniversary automation |
| renewal_date | string/date | â€” | Legacy renewal date if still supported by imported data |
| automation_status | enum: active, paused, opted_out | â€” | Canonical automation eligibility flag. Missing/null is treated as active for legacy clients. |

`automationEnabled` is legacy only. New backend eligibility checks should use `automation_status`.

### CampaignType
Database-driven campaign type definitions. Managed via the Admin Campaign Types page.

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Display name (e.g., "Birthday") |
| slug | string | Yes | Lowercase unique key (e.g., "birthday"). Immutable after creation. |
| triggerField | string | No | Client field holding the trigger date (e.g., `birthday`, `home_anniversary_date`, `close_date`, `loan_anniversary_date`). Nullable for manual campaign types. |
| triggerMode | enum: recurring, one_time, manual | Yes | Whether the trigger repeats annually, fires once, or requires manual scheduling |
| timingDirection | enum: before, after | Yes | Whether cards send before or after the trigger date |
| defaultTimingDays | number | Yes | Default days shown in the wizard (e.g., 10) |
| maxSteps | number | Yes | Maximum cards in a sequence (1–3) |
| icon | string | — | Lucide icon name for UI |
| color | string | — | Tailwind classes for icon background |
| selectedColor | string | — | Tailwind classes for selected state |
| isActive | boolean | Yes | Whether visible in the campaign wizard |
| scope | enum: platform, org | Yes | Visibility scope |
| orgId | string | — | Only set when scope is "org" |
| timingLabel | string | — | Override timing label; null = auto-generated |
| description | string | — | Short description shown in type selector |
| sortOrder | number | — | Display order in the wizard |

### Campaign
User-created campaign configuration. The `type` field stores the CampaignType slug.

| Field | Type | Required | Description |
|---|---|---|---|
| orgId | string | Yes | Organization that owns this campaign |
| ownerId | string | Yes | User ID of the rep who owns this campaign |
| createdBy | string | Yes | User ID who created this campaign (immutable) |
| name | string | Yes | User-friendly campaign name |
| type | string | Yes | CampaignType slug (e.g., "birthday"). No enum restriction — accepts any valid slug. |
| status | enum: active, paused, draft | — | Campaign status (default: draft) |
| enrollmentMode | enum: opt_in, opt_out | Yes | How recipients are enrolled |
| triggerField | string | No | Which client date field triggers this campaign. Supported seeded values include `birthday`, `home_anniversary_date`, `close_date`, and `loan_anniversary_date`; legacy/imported values may include `renewal_date` or `policy_start_date`. Nullable for draft manual campaigns such as `soi_quarterly`. |
| requiresApproval | boolean | — | If true, sends go to approval queue (default: false) |
| returnAddressMode | enum: company, rep, none | — | Return address mode (default: company) |
| description | string | — | Optional description |

Manual/null-trigger campaigns may save as drafts, but activation is blocked until manual scheduling is implemented. Activation attempts return a structured 400 with: `Activation blocked: Campaign Type requires manual scheduling which is not yet implemented.`

`triggerField` is canonical. `dateField` is transitional backwards-compatibility debt and should mirror `triggerField` while legacy reads are removed.

### CampaignStep
Individual card steps within a campaign sequence.

| Field | Type | Required | Description |
|---|---|---|---|
| campaignId | string | Yes | Parent campaign ID |
| stepOrder | number | Yes | Position in the sequence (1-based) |
| cardDesignId | string | Yes | Card design to use |
| templateId | string | — | Message template ID (if using template) |
| messageText | string | — | Custom message text (if not using template) |
| timingDays | number | Yes | Days relative to trigger date (negative = before, positive = after) |
| timingReference | string | — | Reference point for timing (default: "trigger_date") |
| isEnabled | boolean | — | Whether this step is active (default: true) |

### CampaignEnrollment
Tracks which clients are enrolled in which campaigns.

| Field | Type | Required | Description |
|---|---|---|---|
| orgId | string | â€” | Organization that owns this enrollment |
| campaignId | string | Yes | Campaign the client is enrolled in |
| clientId | string | Yes | Enrolled client ID |
| status | enum: enrolled, excluded, completed, paused | — | Enrollment status (default: enrolled) |
| enrolledAt | datetime | Yes | When the client was enrolled |
| lastSentDate | date | — | Last date a card was sent |
| lastSentStep | integer | — | Last step number that was sent |
| processedWelcome | boolean | — | Whether a welcome send has been scheduled |

Transition debt: `CampaignEnrollment.orgId` is optional until existing rows are backfilled. New writes should include `orgId`, but legacy rows may temporarily be missing it. CampaignEnrollment orgId-based RLS is deferred until a one-time backfill populates missing `orgId` values. `CampaignEnrollment.status` value `active` exists in legacy data; new writes should use `enrolled`. `runDailyScheduler`, campaign details, and default enrollment lists temporarily accept both `enrolled` and legacy `active`, and must not treat `excluded`, `paused`, or `completed` as enrolled. A future one-time backfill should convert `active` to `enrolled` and populate missing `orgId`.

### ScheduledSend
Individual send events generated by the daily scheduler.

| Field | Type | Required | Description |
|---|---|---|---|
| campaignId | string | Yes | Source campaign |
| campaignStepId | string | Yes | Source campaign step |
| clientId | string | Yes | Target client |
| orgId | string | Yes | Organization |
| ownerId | string | Yes | Owning rep |
| scheduledDate | date | Yes | When this send should be processed |
| status | string | Yes | Processing status |
| timingDays | number | — | Days offset used |

---

## Deprecated Entities (System A)

> **Do not create new records.** Existing records preserved for audit.

### TriggerType (DEPRECATED)
Replaced by `CampaignType`. See `entities/TriggerType.json`.

### AutomationRule (DEPRECATED)
Replaced by `Campaign` + `CampaignStep`. See `entities/AutomationRule.json`.

---

## Backend Functions

### Active (System B)
| Function | Purpose |
|---|---|
| `seedCampaignTypes` | Seeds default CampaignType records |
| `createCampaign` | Creates a new Campaign with steps and optional auto-enrollment |
| `updateCampaign` | Updates campaign properties, steps, and status |
| `runDailyScheduler` | Daily cron — evaluates campaigns and creates ScheduledSend records |
| `processPendingSends` | Processes pending ScheduledSend records into mailings |

### Deprecated (System A)
| Function | Status |
|---|---|
| `seedDefaultTriggerTypes` | DEPRECATED — replaced by `seedCampaignTypes` |
| `seedDefaultAutomationRules` | DEPRECATED — replaced by Campaign wizard |
