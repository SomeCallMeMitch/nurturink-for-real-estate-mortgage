# NurturInk Automated Campaigns V1 - Quick Start Guide for Manus Max

**Purpose:** This guide provides a quick overview for Manus Max to start implementation.

---

## What You're Building

An automated campaign system for NurturInk that sends handwritten cards on birthdays, policy start dates (welcome), and renewal dates. Insurance agents (NYL office pilot) need this to automate their client touchpoints.

---

## Key Documents

1. **TECHNICAL_SPEC.md** - Complete technical specification (data model, UI, backend functions, jobs)
2. **IMPLEMENTATION_ROADMAP.md** - 6-phase implementation plan with detailed tasks
3. This guide - Quick reference

---

## Architecture Overview

```
User creates campaign → Clients enrolled → Daily Scheduler creates ScheduledSends 
→ Send Processor executes sends → Cards mailed via Scribe API
```

**Key Components:**
- **Campaign** - Configuration (type, enrollment mode, steps)
- **CampaignStep** - Individual cards in sequence (design, message, timing)
- **CampaignEnrollment** - Who's enrolled in each campaign
- **ScheduledSend** - Pre-scheduled sends for visibility
- **Background Jobs** - Daily Scheduler (creates sends) + Send Processor (executes sends)

---

## What Already Exists

✅ **Partial automation infrastructure:**
- `Client.birthday` and `Client.renewal_date` fields
- `AutomationRule`, `TriggerType`, `AutomationHistory` entities
- QuickSend infrastructure (card sending, design selection, templates)
- Credit system

❌ **What's missing:**
- `Client.policy_start_date` field
- Campaign entities (Campaign, CampaignStep, CampaignEnrollment, ScheduledSend)
- Campaign management UI
- Background jobs for scheduling and sending

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Add `policy_start_date` to Client entity
- Create 4 new entities (Campaign, CampaignStep, CampaignEnrollment, ScheduledSend)
- Create backend CRUD functions (createCampaign, getCampaignDetails, updateCampaign, deleteCampaign)
- Update client import/edit to support date fields

**Deliverable:** Can create campaigns via backend, clients have date fields

---

### Phase 2: Campaign Setup UI (Week 2-3)
- Build Campaigns list page
- Build 4-step campaign setup wizard:
  1. Choose type (Birthday/Welcome/Renewal)
  2. Choose enrollment mode (Opt-in/Opt-out)
  3. Configure cards (design, message, timing)
  4. Review and activate
- Add Campaigns to navigation

**Deliverable:** User can create campaigns through UI

---

### Phase 3: Enrollment Management (Week 3-4)
- Create backend enrollment functions (enrollClient, excludeClient, bulkEnrollClients, getEnrolledClients)
- Build Campaign Detail page (config summary, enrolled clients list, upcoming sends, send history)
- Update Recipient List page (bulk add to campaign)
- Update Recipient Detail page (show campaigns, exclude action)

**Deliverable:** User can manage who's in each campaign

---

### Phase 4: Automation Engine (Week 4-6) ⚠️ Most Complex
- Create `scheduleCampaignSends` function (date calculations, create ScheduledSend records)
- Create `processSend` function (execute send, integrate with QuickSend, deduct credit)
- Create Daily Scheduler job (runs at 2am, creates ScheduledSends for next 14 days)
- Create Send Processor job (runs every 2 hours 6am-6pm, executes today's sends)
- Configure jobs in Base44

**Deliverable:** Cards send automatically

---

### Phase 5: Polish & Notifications (Week 6-7)
- Create dashboard widget (upcoming sends next 7 days)
- Create Notification job (daily summary email)
- Add low credit warning banner
- Add send history to Campaign Detail and Client Detail pages

**Deliverable:** User knows what's happening

---

### Phase 6: Testing & Launch (Week 7)
- Comprehensive testing (unit, integration, edge cases)
- Bug fixes and polish
- Documentation (user guide, admin guide)
- NYL pilot setup

**Deliverable:** Ready for production

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Timezone | Org timezone | Simpler for V1, client timezone in V2 |
| Campaign edits | Only affect future sends | Less surprising, simpler |
| Client date changes | Don't auto-reschedule | Simpler, next scheduler run picks up |
| Send time | Every 2 hours, 6am-6pm | Spreads load, allows credit purchases |
| Look-ahead window | 14 days | Good visibility, not too much stale data |
| Calendar view | Defer to V2 | Nice-to-have, not essential |
| Approve mode | Inform-only for V1 | Simpler, approve mode in V2 |
| Credit reservation | No reservation for V1 | Just warn if low, V2 can add |

---

## Critical Implementation Details

### Date Calculations

**Birthday (recurring):**
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

**Welcome (one-time sequence):**
```typescript
// Step 1: relative to policy_start_date
const scheduledDate = addDays(client.policy_start_date, step.timingDays); // positive for "after"

// Step 2: relative to step 1 scheduled date
const step1ScheduledDate = await getScheduledSendDate(campaignId, clientId, step1.id);
const scheduledDate = addDays(step1ScheduledDate, step.timingDays);
```

**Renewal (recurring):**
```typescript
// Same logic as Birthday, but using renewal_date
```

### Idempotency

**Always check before creating ScheduledSend:**
```typescript
const existing = await base44.entities.ScheduledSend.filter({
  campaignId: campaignId,
  clientId: clientId,
  campaignStepId: stepId,
  scheduledDate: scheduledDate
});
if (existing.length > 0) {
  return; // Skip, already scheduled
}
```

### Recurring Logic

**After send completes (birthday/renewal):**
```typescript
if (campaign.type === 'birthday' || campaign.type === 'renewal') {
  const nextYearTriggerDate = addYears(triggerDate, 1);
  const nextYearScheduledDate = addDays(nextYearTriggerDate, step.timingDays);
  
  await base44.entities.ScheduledSend.create({
    campaignId: campaignId,
    campaignStepId: stepId,
    clientId: clientId,
    scheduledDate: nextYearScheduledDate,
    status: 'pending'
  });
}
```

### QuickSend Integration

**Reuse existing QuickSend logic in processSend:**
```typescript
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

---

## Base44 Platform Constraints

**Remember:**
- Backend functions: Use JavaScript (not TypeScript), inline all helpers (no imports)
- Frontend: Can use TypeScript, push to GitHub for auto-sync
- Pages: Must be flat (no subfolders in `pages/`)
- Components: Can have subfolders
- Entities: JSON schema format
- Jobs: Configure via Base44 dashboard (cron expressions)

---

## Reusable Components

**From QuickSend:**
- Card design picker (`SelectDesign.jsx`)
- Message template picker (`Templates.jsx`)
- Card preview (`ReviewAndSend.jsx`)
- Recipient search/filter (`FindClients.jsx`)
- Send execution logic (functions in `ReviewAndSend.jsx`)
- Credit deduction logic (functions in `Credits.jsx`)

**New to Build:**
- `CampaignTypeSelector` - Choose campaign type
- `EnrollmentModeSelector` - Choose opt-in/opt-out
- `CampaignStepForm` - Configure step (timing, design, message)
- `CampaignSequenceBuilder` - Multi-step configuration
- `CampaignReviewSummary` - Review before activation
- `EnrolledClientsList` - Searchable list with add/exclude
- `UpcomingSendsWidget` - Next 30 days preview

---

## Success Criteria

**User should be able to:**
1. Create a Birthday campaign in under 5 minutes
2. Create a Welcome sequence (2 cards) in under 10 minutes
3. Create a Renewal reminder in under 5 minutes
4. See all upcoming sends across all campaigns
5. Easily add/exclude recipients from campaigns
6. Import recipients with date fields via CSV
7. Get notified of upcoming sends and low credits

**System should:**
1. Automatically schedule sends based on recipient dates
2. Process sends daily without manual intervention
3. Handle new recipients added after campaign creation
4. Prevent sends when credits are depleted
5. Maintain send history for reporting

---

## Testing Checklist

**Unit Tests:**
- Date calculations (especially edge cases: birthday today, leap years)
- Enrollment logic
- Credit checks
- Message rendering

**Integration Tests:**
- Create campaign → auto-enroll → schedule sends → execute sends
- Exclude client → verify sends deleted
- Low credits → verify sends fail
- Recurring campaigns → verify next year scheduled

**Edge Cases:**
- Client with birthday today
- Client with no trigger date
- Campaign with 0 enrolled clients
- Org with 0 credits
- Duplicate scheduling attempts
- Job failures and retries

---

## Common Pitfalls to Avoid

1. **Date calculations:** Test thoroughly, especially edge cases (leap years, timezones)
2. **Timezone handling:** Be consistent (use org timezone)
3. **Duplicate prevention:** Always check before creating ScheduledSend
4. **Credit checks:** Verify before every send
5. **Error handling:** Don't let one failure stop entire batch
6. **Idempotency:** Jobs should be safe to run multiple times
7. **Backend functions:** Inline all helpers (no imports from shared files)
8. **Message formatting:** Line breaks at 52 characters (Scribe API requirement)

---

## Questions? Decisions Needed?

All major decisions have been made (see Technical Spec). If you encounter edge cases or need clarification:

1. Check TECHNICAL_SPEC.md for detailed specs
2. Check IMPLEMENTATION_ROADMAP.md for task details
3. Ask the user for clarification
4. Document any new decisions made during implementation

---

## Ready to Start?

**Recommended approach:**
1. Read TECHNICAL_SPEC.md fully (understand data model, UI, backend)
2. Review IMPLEMENTATION_ROADMAP.md (understand phases and tasks)
3. Start with Phase 1 (foundation - entities and CRUD)
4. Test each phase thoroughly before moving to next
5. Commit to GitHub frequently
6. Ask user for approval before pushing major changes

**Good luck! This is a well-defined project with clear specs. You've got this! 🚀**
