# NurturInk Testing Guide

## Overview

This guide provides comprehensive testing procedures for all NurturInk backend functions. Tests are organized by function and include unit tests, integration tests, and edge cases.

---

## Test Environment Setup

### Prerequisites

- Base44 project deployed with all functions
- Test database with seed data
- Scribe API test credentials
- Test user account

### Test Data

Create test data before running tests:

```javascript
// Test client
{
  "name": "Test Client",
  "email": "test@example.com",
  "birthday": "1990-05-15",
  "renewal_date": "2025-06-30",
  "company": "Test Company",
  "street_address": "123 Test St",
  "city": "Test City",
  "state": "TS",
  "zip_code": "12345"
}

// Test automation rule (already created by seed function)
// Test template (already created by seed function)
```

---

## Function Testing

### 1. checkAndSendAutomatedCards

**Purpose:** Main automation engine that evaluates triggers and sends cards.

#### Test 1.1: Happy Path - Birthday Trigger

**Setup:**
- Create client with birthday = today
- Verify automation rule exists for birthday trigger

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/checkAndSendAutomatedCards
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Automation check completed",
  "summary": {
    "processed": 1,
    "sent": 1,
    "skipped": 0,
    "errors": 0
  },
  "results": [
    {
      "ruleId": "uuid",
      "triggerType": "Birthday",
      "cardsSent": 1,
      "scribeBatchId": "batch_123"
    }
  ]
}
```

**Verification:**
- [ ] AutomationHistory record created with status "sent"
- [ ] scribeBatchId matches Scribe API response
- [ ] Client record updated with last_automation_trigger

#### Test 1.2: No Eligible Clients

**Setup:**
- No clients with today's birthday

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/checkAndSendAutomatedCards
```

**Expected Result:**
```json
{
  "success": true,
  "summary": {
    "processed": 0,
    "sent": 0,
    "skipped": 1,
    "errors": 0
  }
}
```

#### Test 1.3: Frequency Cap - Already Sent This Year

**Setup:**
- Client with birthday today
- AutomationHistory record from earlier this year with status "sent"
- frequencyCap = "annually"

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/checkAndSendAutomatedCards
```

**Expected Result:**
```json
{
  "success": true,
  "summary": {
    "processed": 1,
    "sent": 0,
    "skipped": 0,
    "errors": 0
  }
}
```

**Verification:**
- [ ] No new AutomationHistory record created
- [ ] Card not sent to Scribe API

#### Test 1.4: Scribe API Failure

**Setup:**
- Mock Scribe API to return error
- Client with today's birthday

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/checkAndSendAutomatedCards
```

**Expected Result:**
```json
{
  "success": true,
  "summary": {
    "processed": 1,
    "sent": 0,
    "skipped": 0,
    "errors": 1
  }
}
```

**Verification:**
- [ ] AutomationHistory record created with status "failed"
- [ ] errorMessage contains Scribe API error details
- [ ] Function continues processing other rules

#### Test 1.5: Multiple Triggers

**Setup:**
- 3 active automation rules (birthday, new_client_welcome, renewal_reminder)
- Clients matching each trigger

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/checkAndSendAutomatedCards
```

**Expected Result:**
```json
{
  "success": true,
  "summary": {
    "processed": 3,
    "sent": 3,
    "skipped": 0,
    "errors": 0
  },
  "results": [
    { "triggerType": "Birthday", "cardsSent": 1 },
    { "triggerType": "New Client Welcome", "cardsSent": 1 },
    { "triggerType": "Renewal Reminder", "cardsSent": 1 }
  ]
}
```

---

### 2. getUpcomingAutomatedCampaigns

**Purpose:** Dashboard preview of upcoming automated card sends.

#### Test 2.1: Happy Path - Next 30 Days

**Setup:**
- Create clients with birthdays in next 30 days
- Verify automation rules are active

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getUpcomingAutomatedCampaigns?days=30"
```

**Expected Result:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": "rule_uuid_client_uuid",
      "ruleId": "uuid",
      "triggerType": "birthday",
      "triggerName": "Birthday",
      "clientId": "uuid",
      "clientName": "Test Client",
      "scheduledDate": "2025-01-20",
      "reason": "Birthday on Jan 20"
    }
  ],
  "summary": {
    "totalCampaigns": 1,
    "totalClients": 1,
    "byTriggerType": {
      "birthday": 1
    }
  }
}
```

#### Test 2.2: Filter by Trigger Type

**Setup:**
- Multiple trigger types with upcoming campaigns

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getUpcomingAutomatedCampaigns?days=30&triggerType=birthday"
```

**Expected Result:**
- Only birthday campaigns returned
- Other trigger types filtered out

#### Test 2.3: Filter by Rule ID

**Setup:**
- Multiple automation rules

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getUpcomingAutomatedCampaigns?days=30&ruleId=<specific-rule-id>"
```

**Expected Result:**
- Only campaigns for specified rule returned

#### Test 2.4: Date Range Validation

**Setup:**
- None

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getUpcomingAutomatedCampaigns?days=400"
```

**Expected Result:**
- Days capped at 365
- No error, just limited to 365 days

#### Test 2.5: No Upcoming Campaigns

**Setup:**
- No clients with upcoming events

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getUpcomingAutomatedCampaigns?days=30"
```

**Expected Result:**
```json
{
  "success": true,
  "campaigns": [],
  "summary": {
    "totalCampaigns": 0,
    "totalClients": 0,
    "byTriggerType": {}
  }
}
```

---

### 3. addClientFromZapier

**Purpose:** External integration for Zapier to add clients.

#### Test 3.1: Happy Path - Add Client

**Setup:**
- None

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/addClientFromZapier \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Client",
    "email": "new@example.com",
    "phone": "555-1234",
    "company": "New Company",
    "birthday": "1990-05-15"
  }'
```

**Expected Result:**
```json
{
  "success": true,
  "clientId": "uuid",
  "clientName": "New Client",
  "clientEmail": "new@example.com",
  "automationTriggered": false,
  "message": "Client added successfully"
}
```

**Verification:**
- [ ] Client record created in database
- [ ] created_by matches current user

#### Test 3.2: Add Client with Trigger

**Setup:**
- Automation rule exists for new_client_welcome

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/addClientFromZapier \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Client",
    "email": "new@example.com",
    "trigger": "new_client_welcome"
  }'
```

**Expected Result:**
```json
{
  "success": true,
  "clientId": "uuid",
  "automationTriggered": true,
  "message": "Client added and automation triggered"
}
```

**Verification:**
- [ ] Client created
- [ ] AutomationHistory record created with status "pending"

#### Test 3.3: Missing Required Fields

**Setup:**
- None

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/addClientFromZapier \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Client"
  }'
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Missing required fields",
  "details": "name and email are required"
}
```

#### Test 3.4: Invalid Email Format

**Setup:**
- None

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/addClientFromZapier \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Client",
    "email": "invalid-email"
  }'
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Invalid email format"
}
```

#### Test 3.5: Duplicate Client (Same Email)

**Setup:**
- Client already exists with email "existing@example.com"

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/addClientFromZapier \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate Client",
    "email": "existing@example.com"
  }'
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Client already exists",
  "clientId": "existing-uuid",
  "message": "A client with this email address already exists"
}
```

#### Test 3.6: Invalid Date Format

**Setup:**
- None

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/addClientFromZapier \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Client",
    "email": "new@example.com",
    "birthday": "05/15/1990"
  }'
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Invalid birthday format",
  "details": "birthday must be in YYYY-MM-DD format"
}
```

---

### 4. getClientAutomationHistory

**Purpose:** Audit trail of all automated cards sent to a client.

#### Test 4.1: Happy Path - Get History

**Setup:**
- Client with 5 AutomationHistory records

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getClientAutomationHistory?clientId=<client-id>"
```

**Expected Result:**
```json
{
  "success": true,
  "clientId": "uuid",
  "clientName": "Test Client",
  "clientEmail": "test@example.com",
  "history": [
    {
      "id": "uuid",
      "sentDate": "2025-01-15T10:30:00Z",
      "status": "sent",
      "triggerType": "birthday",
      "templateName": "Birthday - Default",
      "cardDesign": "Thank you - Plain White",
      "noteStyle": "casual",
      "scribeBatchId": "batch_123"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Test 4.2: Filter by Date Range

**Setup:**
- Client with history from multiple months

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getClientAutomationHistory?clientId=<client-id>&startDate=2025-01-01&endDate=2025-01-31"
```

**Expected Result:**
- Only history records from January returned

#### Test 4.3: Filter by Trigger Type

**Setup:**
- Client with history from multiple trigger types

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getClientAutomationHistory?clientId=<client-id>&triggerType=birthday"
```

**Expected Result:**
- Only birthday trigger history returned

#### Test 4.4: Filter by Status

**Setup:**
- Client with history of sent, failed, and pending records

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getClientAutomationHistory?clientId=<client-id>&status=failed"
```

**Expected Result:**
- Only failed records returned

#### Test 4.5: Pagination

**Setup:**
- Client with 50 history records

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getClientAutomationHistory?clientId=<client-id>&limit=10&offset=0"
```

**Expected Result:**
```json
{
  "pagination": {
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  },
  "history": [/* 10 records */]
}
```

#### Test 4.6: Client Not Found

**Setup:**
- None

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getClientAutomationHistory?clientId=invalid-uuid"
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Client not found"
}
```

#### Test 4.7: Missing Required Parameter

**Setup:**
- None

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getClientAutomationHistory"
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Missing required parameter",
  "details": "clientId is required"
}
```

---

### 5. updateAutomationRule

**Purpose:** Allow users to modify automation rule settings.

#### Test 5.1: Happy Path - Update daysBefore

**Setup:**
- Automation rule exists

**Test:**
```bash
curl -X PUT https://your-base44-instance/functions/updateAutomationRule \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "<rule-id>",
    "daysBefore": 7
  }'
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Automation rule updated successfully",
  "ruleId": "uuid",
  "updates": {
    "daysBefore": 7
  }
}
```

#### Test 5.2: Update Multiple Fields

**Setup:**
- Automation rule exists

**Test:**
```bash
curl -X PUT https://your-base44-instance/functions/updateAutomationRule \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "<rule-id>",
    "daysBefore": 7,
    "frequencyCap": "monthly",
    "isActive": false
  }'
```

**Expected Result:**
- All three fields updated
- Pending cards cancelled

#### Test 5.3: Invalid daysBefore Value

**Setup:**
- None

**Test:**
```bash
curl -X PUT https://your-base44-instance/functions/updateAutomationRule \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "<rule-id>",
    "daysBefore": 400
  }'
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["daysBefore must be a number between 0 and 365"]
}
```

#### Test 5.4: Invalid frequencyCap Value

**Setup:**
- None

**Test:**
```bash
curl -X PUT https://your-base44-instance/functions/updateAutomationRule \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "<rule-id>",
    "frequencyCap": "invalid"
  }'
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["frequencyCap must be one of: once, annually, monthly, per_event"]
}
```

#### Test 5.5: Rule Not Found

**Setup:**
- None

**Test:**
```bash
curl -X PUT https://your-base44-instance/functions/updateAutomationRule \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "invalid-uuid",
    "daysBefore": 7
  }'
```

**Expected Result:**
```json
{
  "success": false,
  "error": "Automation rule not found"
}
```

---

### 6. pauseAutomationRule

**Purpose:** Temporarily disable an automation rule.

#### Test 6.1: Happy Path - Pause Active Rule

**Setup:**
- Active automation rule

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/pauseAutomationRule \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "<rule-id>"
  }'
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Automation rule paused successfully",
  "ruleId": "uuid",
  "isActive": false
}
```

#### Test 6.2: Pause Already Paused Rule

**Setup:**
- Already paused automation rule

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/pauseAutomationRule \
  -H "Content-Type: application/json" \
  -d '{
    "ruleId": "<rule-id>"
  }'
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Automation rule is already paused"
}
```

---

### 7. getAutomationRuleStats

**Purpose:** Analytics dashboard showing automation performance.

#### Test 7.1: Happy Path - Get Stats

**Setup:**
- Multiple AutomationHistory records

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getAutomationRuleStats"
```

**Expected Result:**
```json
{
  "success": true,
  "stats": {
    "totalCardsSent": 150,
    "totalCardsFailed": 3,
    "totalCardsPending": 2,
    "byTriggerType": {
      "birthday": 80,
      "new_client_welcome": 50,
      "renewal_reminder": 20
    },
    "successRate": 0.9804,
    "failureRate": 0.0196,
    "monthlyTrend": [
      { "month": "2024-12", "sent": 100 },
      { "month": "2025-01", "sent": 50 }
    ]
  }
}
```

#### Test 7.2: Filter by Date Range

**Setup:**
- Multiple AutomationHistory records from different months

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getAutomationRuleStats?startDate=2025-01-01&endDate=2025-01-31"
```

**Expected Result:**
- Only January statistics returned

---

### 8. getAutomationRuleDetails

**Purpose:** Fetch complete rule details for configuration UI.

#### Test 8.1: Happy Path - Get Rule Details

**Setup:**
- Automation rule with history

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getAutomationRuleDetails?ruleId=<rule-id>"
```

**Expected Result:**
```json
{
  "success": true,
  "details": {
    "id": "uuid",
    "triggerType": {
      "id": "uuid",
      "name": "Birthday",
      "key": "birthday"
    },
    "template": {
      "id": "uuid",
      "name": "Birthday - Default",
      "content": "Happy Birthday {{clientName}}!"
    },
    "daysBefore": 7,
    "daysAfter": 0,
    "frequencyCap": "annually",
    "isActive": true,
    "recentHistory": [/* last 5 sends */],
    "stats": {
      "totalSent": 45,
      "totalFailed": 1,
      "totalPending": 0
    }
  }
}
```

---

## Integration Tests

### Test Suite 1: Complete Birthday Workflow

**Objective:** Test complete birthday automation from client creation to card send.

**Steps:**
1. Add client with birthday = today
2. Verify client created
3. Run checkAndSendAutomatedCards
4. Verify AutomationHistory record created
5. Verify Scribe API was called
6. Get client history
7. Verify history shows sent card

**Expected Result:** All steps succeed, card sent successfully.

### Test Suite 2: Frequency Cap Enforcement

**Objective:** Verify frequency caps prevent duplicate sends.

**Steps:**
1. Add client with birthday = today
2. Run checkAndSendAutomatedCards (first time)
3. Verify card sent
4. Run checkAndSendAutomatedCards (second time, same day)
5. Verify no new card sent
6. Wait 1 year (simulate)
7. Run checkAndSendAutomatedCards
8. Verify card sent again

**Expected Result:** Card sent only once per year.

### Test Suite 3: Zapier Integration

**Objective:** Test Zapier integration for adding clients and triggering automations.

**Steps:**
1. Call addClientFromZapier with trigger
2. Verify client created
3. Verify automation triggered
4. Check AutomationHistory
5. Verify card sent to Scribe

**Expected Result:** Client added and automation triggered successfully.

---

## Performance Tests

### Test 1: Large Client Count

**Objective:** Verify system handles many clients efficiently.

**Setup:**
- Create 1000 test clients with birthdays in next 30 days

**Test:**
```bash
curl -X POST https://your-base44-instance/functions/checkAndSendAutomatedCards
```

**Expected Result:**
- Execution time < 5 minutes
- All 1000 clients processed
- All cards sent successfully

### Test 2: Large History Pagination

**Objective:** Verify pagination handles large result sets.

**Setup:**
- Create 10,000 AutomationHistory records for a client

**Test:**
```bash
curl -X GET "https://your-base44-instance/functions/getClientAutomationHistory?clientId=<client-id>&limit=100&offset=0"
```

**Expected Result:**
- Query time < 1 second
- Correct pagination info returned
- All fields properly populated

---

## Test Reporting

### Test Report Template

```markdown
# Test Report - [Date]

## Summary
- Total Tests: X
- Passed: X
- Failed: X
- Skipped: X

## Results by Function
- checkAndSendAutomatedCards: X/X passed
- getUpcomingAutomatedCampaigns: X/X passed
- addClientFromZapier: X/X passed
- getClientAutomationHistory: X/X passed
- updateAutomationRule: X/X passed
- pauseAutomationRule: X/X passed
- getAutomationRuleStats: X/X passed
- getAutomationRuleDetails: X/X passed

## Failed Tests
[List any failures with details]

## Performance Results
- Avg execution time: X ms
- Max execution time: X ms
- P95 latency: X ms

## Recommendations
[Any improvements needed]
```

---

## Conclusion

This testing guide provides comprehensive coverage of all NurturInk backend functions. Follow these procedures to ensure quality and reliability before production deployment.

